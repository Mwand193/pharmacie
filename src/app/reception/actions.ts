
// app/reception/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { generateMouvementHash ,createMouvementHash} from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';
import { blockchainService } from '@/lib/blockchain';
import { initBlockchainContract } from '@/lib/blockchain-init';

export async function getTransfertsEnAttente(distributeurId?: string, distributeurNom?: string) {
  const supabase = await createClient();
  
  // Récupérer tous les transferts
  let query = supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (
        *,
        medicament:medicament_id (*)
      ),
      source:source_id (
        id,
        matricule,
        username,
        role,
        nom_entite,
        ethereum_address,
        ganache_account_index
      ),
      destination:destination_id (
        id,
        matricule,
        username,
        role,
        nom_entite,
        ethereum_address,
        ganache_account_index
      )
    `)
    .eq('type_mouvement', 'transfert')
    .order('created_at', { ascending: false });

  // Filtrer par distributeur si l'ID est fourni
  if (distributeurId) {
    query = query.eq('destination_id', distributeurId);
  }

  const { data: transferts, error: transfertsError } = await query;

  if (transfertsError) {
    console.error('Erreur chargement transferts:', transfertsError);
    throw transfertsError;
  }

  console.log('Transferts trouvés:', transferts?.length || 0);
  if (transferts && transferts.length > 0) {
    console.log('Premier transfert:', {
      id: transferts[0].id,
      destination: transferts[0].destination,
      source: transferts[0].source
    });
  }

  // Pour chaque transfert, vérifier s'il a déjà une réception
  const transfertsAvecStatut = await Promise.all(
    (transferts || []).map(async (transfert) => {
      // Pour la réception, on cherche avec les IDs inversés car la réception a :
      // source_id = destination du transfert (distributeur)
      // destination_id = source du transfert (fabricant)
      const { data: receptions } = await supabase
        .from('mouvements')
        .select('*')
        .eq('type_mouvement', 'reception')
        .eq('lot_id', transfert.lot_id)
        .eq('source_id', transfert.destination_id)  // Le distributeur est la source de la réception
        .eq('destination_id', transfert.source_id)   // Le fabricant est la destination de la réception
        .order('created_at', { ascending: false });

      const hasReception = receptions && receptions.length > 0 && 
                          !receptions.some(r => r.commentaire?.includes('REJETÉ'));
      const isRejete = receptions?.some(r => r.commentaire?.includes('REJETÉ'));

      return {
        ...transfert,
        hasReception,
        isRejete,
        reception: hasReception ? receptions[0] : null
      };
    })
  );

  return transfertsAvecStatut;
}


export async function rejeterReception(
  transfertId: number, 
  raison: string,
  userId?: string,
  nomEntite?: string,
  ganacheAccountIndex?: number
) {
  const supabase = await createClient();
  
  // 1. Récupérer le transfert
  const { data: transfert, error: transfertError } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (*),
      source:source_id (
        id,
        nom_entite,
        username,
        role,
        ethereum_address,
        ganache_account_index
      ),
      destination:destination_id (
        id,
        nom_entite,
        username,
        role,
        ethereum_address,
        ganache_account_index
      )
    `)
    .eq('id', transfertId)
    .eq('type_mouvement', 'transfert')
    .single();

  if (transfertError || !transfert) {
    throw new Error('Transfert non trouvé');
  }

  // Vérifier que l'utilisateur connecté est bien le distributeur destinataire
  if (userId && transfert.destination_id !== userId) {
    throw new Error('Ce transfert n\'est pas destiné à votre entité');
  }

  // Récupérer l'index Ganache du distributeur
  let accountIndex = ganacheAccountIndex;
  
  if (accountIndex === undefined || accountIndex === null) {
    // Essayer de récupérer depuis la destination du transfert
    if (transfert.destination?.ganache_account_index !== undefined && 
        transfert.destination?.ganache_account_index !== null) {
      accountIndex = transfert.destination.ganache_account_index;
    } else {
      // Chercher dans la table users
      const { data: userData } = await supabase
        .from('users')
        .select('ganache_account_index, ethereum_address')
        .eq('id', userId)
        .single();
      
      if (userData?.ganache_account_index !== undefined && 
          userData?.ganache_account_index !== null) {
        accountIndex = userData.ganache_account_index;
      }
    }
  }

  const nomDistributeur = nomEntite || 
                          transfert.destination?.nom_entite || 
                          transfert.destination?.username || 
                          'Distributeur';

  // 2. Générer le hash pour le rejet
  // const hash_rejet = generateMouvementHash({
  //   lot_id: transfert.lot_id,
  //   source_id: transfert.destination_id,  // Distributeur
  //   destination_id: transfert.source_id,   // Fabricant
  //   raison,
  //   type: 'reception_rejet',
  //   timestamp: new Date().toISOString(),
  //   user_id: userId,
  // });
 const commentaire = `REJETÉ: ${raison} (Transfert #${transfertId}) par ${nomDistributeur}`;
  const hash_rejet = createMouvementHash({
  type: 'reception_rejet',
  lot_id: transfert.lot_id,
  quantite: transfert.quantite,
  source_id: transfert.destination_id,    // distributeur
  destination_id: transfert.source_id,     // fabricant
  raison: raison,
});

  // 3. Créer un mouvement de réception rejeté dans PostgreSQL
  const { data: rejet, error: rejetError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfert.lot_id,
      type_mouvement: 'reception',
      source_id: transfert.destination_id,  // Le distributeur
      destination_id: transfert.source_id,   // Le fabricant
      quantite: transfert.quantite,
      type_unite: transfert.type_unite || 'boite',
      statut_avant: 'en_attente',
      statut_apres: 'rejete',
      commentaire: commentaire,
      hash_mouvement: hash_rejet,
      created_by: nomDistributeur,
    }])
    .select()
    .single();

  if (rejetError) {
    console.error('Erreur rejet réception:', rejetError);
    throw new Error('Erreur lors du rejet de la réception');
  }

  // 4. Enregistrer le rejet sur la blockchain
  let blockchainTxHash: string | null = null;
  
  if (accountIndex !== undefined && accountIndex !== null && transfert.lot?.blockchain_lot_id) {
    try {
      const isContractReady = await initBlockchainContract();
      
      if (!isContractReady) {
        console.warn('⚠️ Contrat blockchain non disponible - rejet créé en DB seulement');
      } else {
        console.log('🔗 Enregistrement du rejet sur la blockchain...');
        console.log(`   Compte distributeur: [${accountIndex}]`);
        console.log(`   Blockchain Lot ID: ${transfert.lot.blockchain_lot_id}`);
        
        const blockchainResult = await blockchainService.addMouvementOnBlockchain(
          accountIndex,
          {
            blockchainLotId: transfert.lot.blockchain_lot_id,
            type_mouvement: 'reception_rejet',
            quantite: transfert.quantite,
            hash_mouvement: hash_rejet,
            commentaire: commentaire,
          }
        );
        
        blockchainTxHash = blockchainResult.transactionHash;
        
        console.log('✅ Rejet enregistré sur blockchain !');
        console.log(`   Transaction: ${blockchainTxHash}`);
        
        // Mettre à jour le mouvement avec le hash de la transaction
        await supabase
          .from('mouvements')
          .update({
            transaction_hash: blockchainTxHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', rejet.id);
      }
    } catch (blockchainError: any) {
      console.error('⚠️ Erreur blockchain rejet (mouvement créé en DB quand même):', blockchainError.message);
    }
  } else {
    console.log('ℹ️ Rejet créé sans blockchain (pas de blockchain_lot_id ou pas de compte assigné)');
  }

  revalidatePath('/reception');
  revalidatePath('/mouvements');
  
  return {
    ...rejet,
    blockchain_transaction_hash: blockchainTxHash,
  };
}

export async function getReceptions(distributeurId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (
        *,
        medicament:medicament_id (*)
      ),
      source:source_id (
        id,
        matricule,
        username,
        nom_entite,
        role,
        ethereum_address,
        ganache_account_index
      ),
      destination:destination_id (
        id,
        matricule,
        username,
        nom_entite,
        role,
        ethereum_address,
        ganache_account_index
      )
    `)
    .eq('type_mouvement', 'reception')
    .order('created_at', { ascending: false });

  // Filtrer par distributeur si l'ID est fourni
  // Pour la réception, le distributeur est dans source_id
  if (distributeurId) {
    query = query.eq('source_id', distributeurId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur chargement réceptions:', error);
    throw error;
  }
  
  console.log('Réceptions trouvées:', data?.length || 0);
  
  return data || [];
}


export async function validerReception(
  transfertId: number, 
  userId?: string, 
  distributeurNom?: string,
  ganacheAccountIndex?: number
) {
  const supabase = await createClient();
  
  // 1. Récupérer le transfert avec les informations de destination
  const { data: transfert, error: transfertError } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (*),
      source:source_id (
        id,
        nom_entite,
        username,
        role,
        ethereum_address,
        ganache_account_index
      ),
      destination:destination_id (
        id,
        nom_entite,
        username,
        role,
        ethereum_address,
        ganache_account_index
      )
    `)
    .eq('id', transfertId)
    .eq('type_mouvement', 'transfert')
    .single();

  if (transfertError || !transfert) {
    console.error('Erreur récupération transfert:', transfertError);
    throw new Error('Transfert non trouvé');
  }

  // Vérifier que la destination est bien un distributeur
  if (transfert.destination?.role !== 'distributeur') {
    throw new Error('Ce transfert n\'est pas destiné à un distributeur');
  }

  // Vérifier que l'utilisateur connecté est bien le distributeur destinataire
  if (userId && transfert.destination_id !== userId) {
    throw new Error('Ce transfert n\'est pas destiné à votre entité');
  }

  // 2. Vérifier si une réception existe déjà
  const { data: existingReception } = await supabase
    .from('mouvements')
    .select('id')
    .eq('type_mouvement', 'reception')
    .eq('lot_id', transfert.lot_id)
    .eq('source_id', transfert.destination_id)
    .eq('destination_id', transfert.source_id)
    .single();

  if (existingReception) {
    throw new Error('Ce transfert a déjà été réceptionné');
  }

  // 3. Récupérer l'index Ganache du distributeur connecté
  let accountIndex = ganacheAccountIndex;
  
  if (accountIndex === undefined || accountIndex === null) {
    // Essayer de récupérer depuis la destination du transfert
    if (transfert.destination?.ganache_account_index !== undefined && 
        transfert.destination?.ganache_account_index !== null) {
      accountIndex = transfert.destination.ganache_account_index;
      console.log('✅ Index Ganache récupéré depuis la destination du transfert:', accountIndex);
    } else {
      // Chercher dans la table users avec l'ID utilisateur
      const { data: userData } = await supabase
        .from('users')
        .select('ganache_account_index, ethereum_address')
        .eq('id', userId)
        .single();
      
      if (userData?.ganache_account_index !== undefined && 
          userData?.ganache_account_index !== null) {
        accountIndex = userData.ganache_account_index;
        console.log('✅ Index Ganache récupéré depuis la DB users:', accountIndex);
      }
    }
  }

  // 4. Vérifier que le distributeur a bien un compte blockchain
  if (accountIndex === undefined || accountIndex === null) {
    console.warn('⚠️ Aucun compte blockchain assigné au distributeur');
  } else {
    console.log(`🔑 Compte blockchain du distributeur: [${accountIndex}]`);
    const distributeurAddress = blockchainService.getAccount(accountIndex);
    console.log(`   Adresse: ${distributeurAddress}`);
  }

  // 5. Déterminer le nom du distributeur à utiliser
  const nomDistributeur = distributeurNom || 
                          transfert.destination?.nom_entite || 
                          transfert.destination?.username || 
                          'Distributeur';
const typeUnite = transfert.type_unite || 'boite'; 

  // 6. Générer le hash pour la réception
  // const hash_reception = generateMouvementHash({
  //   lot_id: transfert.lot_id,
  //   source_id: transfert.destination_id,
  //   destination_id: transfert.source_id,
  //   quantite: transfert.quantite,
  //   type: 'reception',
  //   timestamp: new Date().toISOString(),
  //   user_id: userId,
  //   entite: nomDistributeur,
  // });
   const commentaire = `Réception du transfert #${transfertId} - ${transfert.quantite} ${typeUnite}(s) par ${nomDistributeur}`;

  const hash_reception = createMouvementHash({
  type: 'reception',
  lot_id: transfert.lot_id,
  quantite: transfert.quantite,
  source_id: transfert.destination_id,    // distributeur
  destination_id: transfert.source_id,     // fabricant
});

  console.log('📝 Hash réception généré:', hash_reception);

  // 7. Créer le mouvement de réception dans PostgreSQL
  const { data: reception, error: receptionError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfert.lot_id,
      type_mouvement: 'reception',
      source_id: transfert.destination_id,
      destination_id: transfert.source_id,
      quantite: transfert.quantite,
      type_unite: transfert.type_unite || 'boite',
      statut_avant: 'en_attente',
      statut_apres: 'receptionne',
       commentaire: commentaire,
      hash_mouvement: hash_reception,
      created_by: nomDistributeur,
    }])
    .select(`
      *,
      source:source_id (
        id,
        matricule,
        username,
        nom_entite,
        role
      ),
      destination:destination_id (
        id,
        matricule,
        username,
        nom_entite,
        role
      )
    `)
    .single();

  if (receptionError) {
    console.error('Erreur création réception:', receptionError);
    throw new Error('Erreur lors de la validation de la réception');
  }

  console.log('✅ Réception créée en DB:', {
    id: reception.id,
    source: reception.source?.nom_entite,
    destination: reception.destination?.nom_entite,
    created_by: reception.created_by
  });

  // 8. Enregistrer la réception sur la blockchain
  let blockchainTxHash: string | null = null;
  let blockchainSuccess = false;
  
  if (accountIndex !== undefined && accountIndex !== null && transfert.lot?.blockchain_lot_id) {
    try {
      // Initialiser le contrat blockchain
      const isContractReady = await initBlockchainContract();
      
      if (!isContractReady) {
        console.warn('⚠️ Contrat blockchain non disponible - réception créée en DB seulement');
      } else {
        console.log('🔗 Enregistrement de la réception sur la blockchain...');
        console.log(`   Compte distributeur: [${accountIndex}]`);
        console.log(`   Adresse: ${blockchainService.getAccount(accountIndex)}`);
        console.log(`   Blockchain Lot ID: ${transfert.lot.blockchain_lot_id}`);
        console.log(`   Type: reception`);
        console.log(`   Quantité: ${transfert.quantite}`);
        console.log(`   Hash: ${hash_reception}`);
        
        // Appeler la fonction addMouvement du smart contract
        // C'est LE DISTRIBUTEUR qui signe la transaction
        const blockchainResult = await blockchainService.addMouvementOnBlockchain(
          accountIndex,  // Index du compte Ganache du distributeur
          {
            blockchainLotId: transfert.lot.blockchain_lot_id,
            type_mouvement: 'reception',
            quantite: transfert.quantite,
            hash_mouvement: hash_reception,
    commentaire: commentaire,          }
        );
        
        blockchainTxHash = blockchainResult.transactionHash;
        blockchainSuccess = true;
        
        console.log('✅ Réception enregistrée sur blockchain !');
        console.log(`   Transaction: ${blockchainTxHash}`);
        console.log(`   Block: ${blockchainResult.blockNumber}`);
        console.log(`   Gas utilisé: ${blockchainResult.gasUsed}`);
        
        // Mettre à jour le mouvement avec le hash de la transaction blockchain
        await supabase
          .from('mouvements')
          .update({
            transaction_hash: blockchainTxHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', reception.id);
        
        console.log('✅ Mouvement mis à jour avec le hash de transaction');
      }
    } catch (blockchainError: any) {
      console.error('⚠️ Erreur blockchain réception (mouvement créé en DB quand même):', blockchainError.message);
      // On continue, le mouvement existe déjà dans la DB
    }
  } else {
    if (!transfert.lot?.blockchain_lot_id) {
      console.log('ℹ️ Ce lot n\'a pas d\'ID blockchain (créé avant l\'activation de la blockchain)');
    } else {
      console.log('ℹ️ Réception créée sans blockchain (pas de compte assigné au distributeur)');
    }
  }

  revalidatePath('/reception');
  revalidatePath('/mouvements');
  
  return {
    ...reception,
    blockchain_enregistre: blockchainSuccess,
    blockchain_transaction_hash: blockchainTxHash,
  };
}