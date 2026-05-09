//lots/actions.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { generateLotNumber, generateLotHash,createMouvementHash, generateMouvementHash } from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';
import { blockchainService } from '@/lib/blockchain';
import { initBlockchainContract } from '@/lib/blockchain-init';

type User = {
  id: string;
  matricule: string;
  username: string;
  role: string;
  nom_entite: string;
  ethereum_address?: string;
  ganache_account_index?: number;
  first_login: boolean;
  genre?: 'M' | 'F';
};



// ... reste des fonctions
export async function getLotById(id: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lots')
    .select(`
      *,
      medicament:medicament_id (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// export async function getLots() {
//   const supabase = await createClient();
  
//   const { data, error } = await supabase
//     .from('lots')
//     .select(`
//       *,
//       medicament:medicament_id (*)
//     `)
//     .order('created_at', { ascending: false });

//   if (error) throw error;
  
//   const lotsWithStatus = await Promise.all(data.map(async (lot) => {
//     const { data: mouvements } = await supabase
//       .from('mouvements')
//       .select('id')
//       .eq('lot_id', lot.id);
    
//     const totalMovements = mouvements?.length || 0;
//     const { data: transfertsOnly } = await supabase
//       .from('mouvements')
//       .select('id')
//       .eq('lot_id', lot.id)
//       .in('type_mouvement', ['transfert', 'transfert_pharmacie', 'transfert_distributeur']);
    
//     const hasTransferts = transfertsOnly && transfertsOnly.length > 0;
//     const isDeletable = totalMovements <= 1;
    
//     let statut = 'disponible';
//     if (new Date(lot.date_expiration) < new Date()) {
//       statut = 'expire';
//     } else if (lot.quantite_totale === 0) {
//       statut = 'epuise';
//     } else if (hasTransferts) {
//       statut = 'partiel';
//     }
    
//     return {
//       ...lot,
//       statut,
//       hasMovements: totalMovements > 1,
//       isDeletable
//     };
//   }));
  
//   return lotsWithStatus;
// }

export async function deleteLotWithoutMovements(lotId: number) {
  const supabase = await createClient();
  
  try {
    const { data: mouvements, error: mouvementError } = await supabase
      .from('mouvements')
      .select('id')
      .eq('lot_id', lotId);
    
    if (mouvementError) {
      throw new Error('Erreur lors de la vérification des mouvements');
    }
    
    if (mouvements && mouvements.length > 0) {
      throw new Error('Ce lot a des mouvements associés et ne peut pas être supprimé');
    }
    
    const { error: deleteError } = await supabase
      .from('lots')
      .delete()
      .eq('id', lotId);
    
    if (deleteError) {
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    revalidatePath('/lots');
    return { success: true, message: 'Lot supprimé avec succès' };
    
  } catch (error) {
    console.error('Erreur suppression lot:', error);
    throw error;
  }
}

export async function getMouvementsByLot(lot_id: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mouvements')
    .select(`
      *,
      destination:destination_id (id, username, nom_entite, role)
    `)
    .eq('lot_id', lot_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function checkLotMovements(lotId: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mouvements')
    .select('id')
    .eq('lot_id', lotId)
    .not('type_mouvement', 'eq', 'creation_lot');
    
  if (error) throw error;
  
  return {
    hasMovements: data && data.length > 0,
    movementsCount: data?.length || 0
  };
}




export async function createLot(data: {
  medicament_id: number;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
  currentUser: User;
}) {
  const supabase = await createClient();
  
  const { currentUser, ...lotData } = data;
  
  if (currentUser.role !== 'fabricant' && currentUser.role !== 'admin') {
    throw new Error('Seuls les fabricants peuvent créer des lots');
  }

  let accountIndex = currentUser.ganache_account_index;
  
  if (accountIndex === undefined || accountIndex === null) {
    const { data: freshUser } = await supabase
      .from('users')
      .select('ganache_account_index, ethereum_address')
      .eq('id', currentUser.id)
      .single();
    
    if (freshUser?.ganache_account_index !== undefined && freshUser?.ganache_account_index !== null) {
      accountIndex = freshUser.ganache_account_index;
      console.log('✅ Index Ganache récupéré depuis la DB:', accountIndex);
    } else {
      console.warn('⚠️ Aucun compte blockchain assigné - le lot sera créé sans blockchain');
    }
  }
  
  const numero_lot = generateLotNumber();
  const code_unique = `LOT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  // const hash_lot = generateLotHash(lotData.medicament_id, numero_lot, lotData.date_fabrication);
  const hash_lot = generateLotHash({
  medicament_id: lotData.medicament_id,
  numero_lot,
  code_unique,
  date_fabrication: lotData.date_fabrication,
  date_expiration: lotData.date_expiration,
  quantite_totale: lotData.quantite_totale,
});
  const { data: medicament } = await supabase
    .from('medicaments')
    .select('code_cis, nom')
    .eq('id', lotData.medicament_id)
    .single();
  
  const qrData = {
    numero_lot,
    code_unique,
    hash_lot,
    medicament_id: lotData.medicament_id,
    medicament_nom: medicament?.nom,
    code_cis: medicament?.code_cis,
    date_fabrication: lotData.date_fabrication,
    date_expiration: lotData.date_expiration,
    quantite: lotData.quantite_totale,
    created_by: currentUser.nom_entite,
  };
  
  const qr_content = JSON.stringify(qrData);

  // Variables blockchain
  let blockchainLotId: string | null = null;
  let blockchainCreationTxHash: string | null = null;
  let blockchainMouvementTxHash: string | null = null;

  try {
    // 1️⃣ Créer le lot dans PostgreSQL
    const { data: lot, error: lotError } = await supabase
      .from('lots')
      .insert([{
        medicament_id: lotData.medicament_id,
        numero_lot,
        code_unique,
        hash_lot,
        qr_content,
        date_fabrication: lotData.date_fabrication,
        date_expiration: lotData.date_expiration,
        quantite_totale: lotData.quantite_totale,
        created_by: currentUser.nom_entite,
        fabricant_id: currentUser.id,
      }])
      .select()
      .single();

    if (lotError) {
      console.error('Erreur création lot:', lotError);
      throw new Error(`Erreur création lot: ${lotError.message}`);
    }

    console.log('✅ Lot créé en DB, ID:', lot.id);

    // 2️⃣ Créer le lot sur la BLOCKCHAIN
    if (accountIndex !== undefined && accountIndex !== null) {
      try {
        // ✅ initBlockchainContract() appelle déjà blockchainService.init() en interne
        const isContractReady = await initBlockchainContract();
        
        if (!isContractReady) {
          console.warn('⚠️ Contrat blockchain non disponible - lot créé en DB seulement');
        } else {
          console.log('🔗 Création du lot sur blockchain...');
          
          const blockchainData = await blockchainService.createLotOnBlockchain(
            accountIndex,
            {
              numero_lot,
              code_unique,
              medicament_code: medicament?.code_cis || `MED-${lotData.medicament_id}`,
              quantite_totale: lotData.quantite_totale,
              date_fabrication: lotData.date_fabrication,
              date_expiration: lotData.date_expiration,
               hash_lot: hash_lot 
            }
          );
          
          blockchainLotId = blockchainData.blockchainLotId;
          blockchainCreationTxHash = blockchainData.transactionHash;
          
          console.log('✅ Lot créé sur blockchain!');
          console.log('   Blockchain Lot ID:', blockchainLotId);
          console.log('   Transaction:', blockchainCreationTxHash);
          
          // ✅ Mettre à jour le lot avec les infos blockchain
          await supabase
            .from('lots')
            .update({
              blockchain_lot_id: blockchainLotId,
              transaction_hash: blockchainCreationTxHash,
              updated_at: new Date().toISOString()
            })
            .eq('id', lot.id);
        }
      } catch (blockchainError: any) {
        console.error('⚠️ Erreur blockchain création lot:', blockchainError.message);
        // Réinitialiser pour éviter les problèmes de nonce
        blockchainLotId = null;
        blockchainCreationTxHash = null;
      }
    }

   
    const commentaire = `Création du lot ${numero_lot} par ${currentUser.nom_entite}`;

    const hash_mouvement = createMouvementHash({
  lot_id: lot.id,
  type: 'creation_lot',
  quantite: lotData.quantite_totale,
  source_id: currentUser.id,
  commentaire: commentaire,
  created_by: currentUser.nom_entite,
  // timestamp: new Date(),
});

    console.log('📝 Création du mouvement en DB...');
    console.log('   Hash mouvement:', hash_mouvement);
console.log('   Commentaire utilisé:', commentaire);


    const { data: mouvement, error: mouvementError } = await supabase
      .from('mouvements')
      .insert([{
        lot_id: lot.id,
        type_mouvement: 'creation_lot',
        source_id: currentUser.id,
        quantite: lotData.quantite_totale,
        type_unite: 'boite',
        commentaire: commentaire,
        hash_mouvement,
        created_by: currentUser.nom_entite,
        transaction_hash: blockchainCreationTxHash,
      }])
      .select()
      .single();

    if (mouvementError) {
      console.error('❌ Erreur création mouvement:', mouvementError);
    } else {
      console.log('✅ Mouvement créé en DB, ID:', mouvement?.id);
    }

    // 4️⃣ Ajouter le mouvement sur la BLOCKCHAIN
    if (blockchainLotId && accountIndex !== undefined && accountIndex !== null) {
      try {
        console.log('🔗 Ajout du mouvement sur blockchain...');
        console.log('   Blockchain Lot ID:', blockchainLotId);
        console.log('   Hash mouvement:', hash_mouvement);
        
        const blockchainMvtResult = await blockchainService.addMouvementOnBlockchain(
          accountIndex,
          {
            blockchainLotId: blockchainLotId,
            type_mouvement: 'creation_lot',
            quantite: lotData.quantite_totale,
            commentaire: `Création du lot ${numero_lot} par ${currentUser.nom_entite}`,
            hash_mouvement: hash_mouvement
          }
        );
        
        blockchainMouvementTxHash = blockchainMvtResult.transactionHash;
        
        console.log('✅ Mouvement enregistré sur blockchain!');
        console.log('   Transaction:', blockchainMouvementTxHash);
        
        // ✅ Mettre à jour le mouvement avec le hash de la transaction
        if (mouvement?.id) {
          await supabase
            .from('mouvements')
            .update({
              transaction_hash: blockchainMouvementTxHash,
              updated_at: new Date().toISOString()
            })
            .eq('id', mouvement.id);
          
          console.log('✅ Mouvement mis à jour avec tx hash');
        }
      } catch (mvtBlockchainError: any) {
        console.error('⚠️ Erreur blockchain mouvement:', mvtBlockchainError.message);
      }
    } else {
      console.log('ℹ️ Mouvement créé sans blockchain (pas de blockchain_lot_id)');
    }

    revalidatePath('/lots');
    revalidatePath('/mouvements');
    
    return {
      ...lot,
      blockchain_lot_id: blockchainLotId,
      transaction_hash: blockchainCreationTxHash,
      mouvement_id: mouvement?.id,
      mouvement_blockchain_tx: blockchainMouvementTxHash,
    };
    
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    throw error;
  }
}






// export async function getLots() {
//   const supabase = await createClient();
  
//   const { data, error } = await supabase
//     .from('lots')
//     .select(`
//       *,
//       medicament:medicament_id (*)
//     `)
//     .order('created_at', { ascending: false });

//   if (error) throw error;
  
//   const lotsWithStats = await Promise.all(data.map(async (lot) => {
//     // Récupérer TOUS les mouvements
//     const { data: mouvements } = await supabase
//       .from('mouvements')
//       .select('*')
//       .eq('lot_id', lot.id);
    
//     const totalMovements = mouvements?.length || 0;
    
//     // Filtrer les mouvements de transfert ET retrait défectueux
//     const mouvementsConsommation = mouvements?.filter(m => 
//       ['transfert', 'transfert_pharmacie', 'transfert_distributeur', 'retrait_defectueux', 'vente_pharmacie', 'vente_patient'].includes(m.type_mouvement)
//     ) || [];
    
//     // Calculer la quantité consommée (transférée + retirée)
//     const quantiteConsommee = mouvementsConsommation.reduce((sum, m) => sum + (m.quantite || 0), 0);
    
//     // Calculer la quantité restante
//     const quantiteRestante = lot.quantite_totale - quantiteConsommee;
    
//     const hasConsommation = mouvementsConsommation.length > 0;
//     const isDeletable = totalMovements <= 1 && mouvementsConsommation.length === 0;
    
//     // Vérifier s'il y a des retraits défectueux spécifiquement
//     const retraitsDefectueux = mouvements?.filter(m => 
//       m.type_mouvement === 'retrait_defectueux'
//     ) || [];
    
//     const quantiteRetiree = retraitsDefectueux.reduce((sum, m) => sum + (m.quantite || 0), 0);
    
//     // Déterminer le statut
//     let statut = 'disponible';
//     if (new Date(lot.date_expiration) < new Date()) {
//       statut = 'expire';
//     } else if (quantiteRestante === 0) {
//       statut = 'epuise';
//     } else if (hasConsommation) {
//       statut = 'partiel';
//     }
    
//     return {
//       ...lot,
//       quantite_transferee: quantiteConsommee, // Total consommé (transferts + retraits)
//       quantite_restante: quantiteRestante,
//       quantite_retiree: quantiteRetiree, // Spécifiquement les retraits
//       nombre_retraits: retraitsDefectueux.length, // Nombre de retraits
//       statut,
//       hasMovements: totalMovements > 1,
//       isDeletable,
//       // Détail des mouvements si nécessaire
//       mouvementsDetail: {
//         total: totalMovements,
//         retraits: retraitsDefectueux.length,
//         transferts: mouvementsConsommation.filter(m => m.type_mouvement !== 'retrait_defectueux').length
//       }
//     };
//   }));
  
//   return lotsWithStats;
// }


// app/lots/actions.ts - Fonction getLots modifiée

export async function getLots() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lots')
    .select(`
      *,
      medicament:medicament_id (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const lotsWithStats = await Promise.all(data.map(async (lot) => {
    // Récupérer TOUS les mouvements
    const { data: mouvements } = await supabase
      .from('mouvements')
      .select('*')
      .eq('lot_id', lot.id);
    
    const totalMovements = mouvements?.length || 0;
    
    // Catégoriser les mouvements
    const mouvementsTransfert = mouvements?.filter(m => 
      ['transfert', 'transfert_pharmacie', 'transfert_distributeur'].includes(m.type_mouvement)
    ) || [];
    
    const mouvementsDistribution = mouvements?.filter(m => 
      ['distribution', 'vente_pharmacie'].includes(m.type_mouvement)
    ) || [];
    
    const mouvementsRetrait = mouvements?.filter(m => 
      m.type_mouvement === 'retrait_defectueux'
    ) || [];
    
    // Calculer les quantités par type
    const quantiteTransfert = mouvementsTransfert.reduce((sum, m) => sum + (m.quantite || 0), 0);
    const quantiteDistribution = mouvementsDistribution.reduce((sum, m) => sum + (m.quantite || 0), 0);
    const quantiteRetiree = mouvementsRetrait.reduce((sum, m) => sum + (m.quantite || 0), 0);
    
    // Quantité totale consommée
    const quantiteConsommee = quantiteTransfert + quantiteDistribution + quantiteRetiree;
    
    // Quantité restante
    const quantiteRestante = lot.quantite_totale - quantiteConsommee;
    
    // Vérifier si le lot est supprimable
    const mouvementsSansCreation = mouvements?.filter(m => 
      m.type_mouvement !== 'creation_lot'
    ) || [];
    
    const isDeletable = mouvementsSansCreation.length === 0;
    
    // Déterminer le statut
    let statut = 'disponible';
    if (new Date(lot.date_expiration) < new Date()) {
      statut = 'expire';
    } else if (quantiteRestante <= 0) {
      statut = 'epuise';
    } else if (quantiteConsommee > 0) {
      statut = 'partiel';
    }
    
    return {
      ...lot,
      quantite_transferee: quantiteTransfert,
      quantite_distribuee: quantiteDistribution,
      quantite_retiree: quantiteRetiree,
      quantite_restante: quantiteRestante,
      nombre_retraits: mouvementsRetrait.length,
      nombre_distributions: mouvementsDistribution.length,
      statut,
      hasMovements: totalMovements > 1,
      isDeletable,
      mouvementsDetail: {
        total: totalMovements,
        retraits: mouvementsRetrait.length,
        transferts: mouvementsTransfert.length,
        distributions: mouvementsDistribution.length,
      }
    };
  }));
  
  return lotsWithStats;
}