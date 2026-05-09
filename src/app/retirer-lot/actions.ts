
// app/retirer-lot/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createMouvementHash } from '@/lib/utils/crypto';
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

export async function retirerLotDefectueux(data: {
  lot_id: number;
  quantite: number;
  raison: string;
  currentUser: User;
}) {
  const supabase = await createClient();
  const { currentUser, ...retraitData } = data;
  
  console.log('🚀 Début retrait lot défectueux');
  console.log('   Utilisateur:', currentUser.nom_entite, '(Role:', currentUser.role, ')');
  console.log('   Lot ID:', retraitData.lot_id);
  console.log('   Quantité à retirer:', retraitData.quantite);
  console.log('   Raison:', retraitData.raison);
  
  // 1. Vérifier que le lot existe
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select(`
      *,
      medicament:medicament_id (*)
    `)
    .eq('id', retraitData.lot_id)
    .single();
    
  if (lotError || !lot) {
    throw new Error('Lot non trouvé');
  }
  
  console.log('✅ Lot trouvé:', lot.numero_lot, '| Médicament:', lot.medicament?.nom);
  console.log('   Quantité totale originale:', lot.quantite_totale);
  console.log('   Blockchain Lot ID:', lot.blockchain_lot_id || 'N/A');
  
  // 2. Calculer la quantité disponible (comme dans transfererLot)
  const { data: tousMouvements } = await supabase
    .from('mouvements')
    .select('type_mouvement, quantite')
    .eq('lot_id', retraitData.lot_id);
  
  // Quantité créée (normalement = quantite_totale)
  const quantiteCreee = tousMouvements
    ?.filter(m => m.type_mouvement === 'creation_lot')
    .reduce((sum, m) => sum + (m.quantite || 0), 0) || lot.quantite_totale;
  
  // Quantité transférée/retirée
  const quantiteConsommee = tousMouvements
    ?.filter(m => ['transfert', 'transfert_pharmacie', 'transfert_distributeur', 'retrait_defectueux', 'vente_pharmacie', 'vente_patient'].includes(m.type_mouvement))
    .reduce((sum, m) => sum + (m.quantite || 0), 0) || 0;
  
  const quantiteDisponible = quantiteCreee - quantiteConsommee;
  
  console.log('📦 Vérification stock:');
  console.log(`   Quantité créée: ${quantiteCreee}`);
  console.log(`   Quantité déjà consommée: ${quantiteConsommee}`);
  console.log(`   Quantité disponible: ${quantiteDisponible}`);
  
  // Vérifier la quantité disponible
  if (quantiteDisponible < retraitData.quantite) {
    throw new Error(`Quantité insuffisante. Disponible: ${quantiteDisponible}, Demandé: ${retraitData.quantite}`);
  }
  
  // 3. Vérifier les droits selon le rôle
  if (currentUser.role === 'fabricant') {
    if (lot.fabricant_id !== currentUser.id) {
      throw new Error('Vous ne pouvez retirer que vos propres lots');
    }
  } else if (currentUser.role === 'distributeur') {
    // Vérifier que le distributeur a bien réceptionné ce lot
    const { data: reception } = await supabase
      .from('mouvements')
      .select('id')
      .eq('type_mouvement', 'reception')
      .eq('lot_id', retraitData.lot_id)
      .eq('source_id', currentUser.id)
      .single();
    
    if (!reception) {
      throw new Error('Vous n\'avez pas réceptionné ce lot');
    }
  } else if (currentUser.role === 'pharmacie') {
    // Vérifier que la pharmacie a bien reçu ce lot
    const { data: achat } = await supabase
      .from('mouvements')
      .select('id')
      .eq('type_mouvement', 'vente_pharmacie')
      .eq('lot_id', retraitData.lot_id)
      .eq('destination_id', currentUser.id)
      .single();
    
    if (!achat) {
      throw new Error('Vous n\'avez pas reçu ce lot');
    }
  }
  
  // 4. Récupérer l'index Ganache de l'utilisateur connecté
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
      console.warn('⚠️ Aucun compte blockchain assigné - retrait créé sans blockchain');
    }
  }
  
  if (accountIndex !== undefined && accountIndex !== null) {
    console.log(`🔑 Compte blockchain: [${accountIndex}] ${blockchainService.getAccount(accountIndex)}`);
  }
  
  // 5. Générer le hash du mouvement avec createMouvementHash
  const commentaire = `Retrait lot défectueux - ${retraitData.raison}. Lot #${lot.numero_lot} - ${lot.medicament?.nom || 'Médicament'}`;
  
  const hash_mouvement = createMouvementHash({
    lot_id: retraitData.lot_id,
    type: 'retrait_defectueux',
    quantite: retraitData.quantite,
    source_id: currentUser.id,
    raison: retraitData.raison,
     commentaire: commentaire,
  });

  console.log('📝 Hash mouvement généré (createMouvementHash):', hash_mouvement.substring(0, 40) + '...');
  console.log('   Données utilisées:', {
    lot_id: retraitData.lot_id,
    type: 'retrait_defectueux',
    quantite: retraitData.quantite,
    source_id: currentUser.id,
     commentaire: commentaire,
    raison: retraitData.raison,
  });

  // 6. Créer le mouvement de retrait dans PostgreSQL (SANS toucher quantite_totale du lot)
  // ⚠️ On n'insère PAS le champ 'raison' car il n'existe pas dans la table mouvements
  const { data: mouvement, error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: retraitData.lot_id,
      type_mouvement: 'retrait_defectueux',
      source_id: currentUser.id,
      destination_id: null,
      quantite: retraitData.quantite,
      type_unite: 'boite',
      commentaire: commentaire, // La raison est incluse dans le commentaire
      hash_mouvement,
      created_by: currentUser.nom_entite,
    }])
    .select()
    .single();

  if (mouvementError) {
    console.error('❌ Erreur création mouvement:', mouvementError);
    throw new Error(`Erreur lors de la création du mouvement: ${mouvementError.message}`);
  }

  console.log('✅ Mouvement créé en DB, ID:', mouvement.id);
  console.log(`   ⚠️ quantite_totale du lot NON modifiée (reste à ${lot.quantite_totale})`);
  console.log(`   Quantité restante après retrait: ${quantiteDisponible - retraitData.quantite}`);

  // =============================================
  // ENREGISTRER SUR LA BLOCKCHAIN
  // =============================================
  
  let blockchainTxHash: string | null = null;
  let blockchainSuccess = false;

  if (accountIndex !== undefined && accountIndex !== null && lot.blockchain_lot_id) {
    try {
      const isContractReady = await initBlockchainContract();
      
      if (!isContractReady) {
        console.warn('⚠️ Contrat blockchain non disponible - retrait créé en DB seulement');
      } else {
        console.log('🔗 Enregistrement du retrait sur la blockchain...');
        console.log(`   Compte: [${accountIndex}] ${blockchainService.getAccount(accountIndex)}`);
        console.log(`   Blockchain Lot ID: ${lot.blockchain_lot_id}`);
        console.log(`   Type: retrait_defectueux`);
        console.log(`   Quantité: ${retraitData.quantite}`);
        console.log(`   Hash mouvement: ${hash_mouvement}`);
        
        const blockchainResult = await blockchainService.addMouvementOnBlockchain(
          accountIndex,
          {
            blockchainLotId: lot.blockchain_lot_id,
            type_mouvement: 'retrait_defectueux',
            quantite: retraitData.quantite,
            hash_mouvement: hash_mouvement,
            commentaire: commentaire
          }
        );
        
        blockchainTxHash = blockchainResult.transactionHash;
        blockchainSuccess = true;
        
        console.log('✅ Retrait enregistré sur blockchain !');
        console.log(`   Transaction: ${blockchainTxHash}`);
        console.log(`   Block: ${blockchainResult.blockNumber}`);
        console.log(`   Gas utilisé: ${blockchainResult.gasUsed}`);
        
        // Mettre à jour le mouvement avec le hash de la transaction blockchain
        await supabase
          .from('mouvements')
          .update({
            transaction_hash: blockchainTxHash,
            blockchain_tx: blockchainTxHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', mouvement.id);
        
        console.log('✅ Mouvement mis à jour avec le hash de transaction');
      }
    } catch (blockchainError: any) {
      console.error('⚠️ Erreur blockchain retrait (mouvement créé en DB quand même):', blockchainError.message);
    }
  } else {
    if (!lot.blockchain_lot_id) {
      console.log('ℹ️ Ce lot n\'a pas d\'ID blockchain (créé avant l\'activation de la blockchain)');
    } else {
      console.log('ℹ️ Retrait créé sans blockchain (pas de compte assigné)');
    }
  }

  revalidatePath('/retirer-lot');
  revalidatePath('/mouvements');
  revalidatePath('/lots');
  
  return {
    ...mouvement,
    quantite_restante: quantiteDisponible - retraitData.quantite,
    quantite_totale_originale: lot.quantite_totale,
    blockchain_enregistre: blockchainSuccess,
    blockchain_transaction_hash: blockchainTxHash,
  };
}




export async function getLotsDisponibles(userId: string, userRole: string, userName?: string) {
  const supabase = await createClient();
  
  console.log('Chargement lots pour:', { userId, userRole, userName });
  
  let query = supabase
    .from('lots')
    .select(`
      *,
      medicament:medicament_id (*)
    `)
    .gt('quantite_totale', 0)
    .order('created_at', { ascending: false });

  // Filtrer selon le rôle
  if (userRole === 'fabricant') {
    query = query.eq('fabricant_id', userId);
    
  } else if (userRole === 'distributeur') {
    const { data: receptions } = await supabase
      .from('mouvements')
      .select('lot_id')
      .eq('type_mouvement', 'reception')
      .eq('source_id', userId);

    if (receptions && receptions.length > 0) {
      const lotIds = [...new Set(receptions.map(r => r.lot_id))];
      console.log('Lots réceptionnés par le distributeur:', lotIds);
      query = query.in('id', lotIds);
    } else {
      console.log('Aucune réception trouvée pour ce distributeur');
      return [];
    }
    
  } else if (userRole === 'pharmacie') {
    const { data: achats } = await supabase
      .from('mouvements')
      .select('lot_id')
      .in('type_mouvement', ['vente_pharmacie', 'vente_patient'])
      .eq('destination_id', userId);

    if (achats && achats.length > 0) {
      const lotIds = [...new Set(achats.map(a => a.lot_id))];
      query = query.in('id', lotIds);
    } else {
      return [];
    }
    
  } else if (userRole === 'admin') {
    console.log('Admin - accès à tous les lots');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur chargement lots:', error);
    throw error;
  }

  // Calculer la quantité disponible réelle pour chaque lot
  const lotsAvecDisponibilite = await Promise.all((data || []).map(async (lot) => {
    const { data: mouvements } = await supabase
      .from('mouvements')
      .select('type_mouvement, quantite')
      .eq('lot_id', lot.id);
    
    const quantiteCreee = mouvements
      ?.filter(m => m.type_mouvement === 'creation_lot')
      .reduce((sum, m) => sum + (m.quantite || 0), 0) || lot.quantite_totale;
    
    const quantiteConsommee = mouvements
      ?.filter(m => ['transfert', 'transfert_pharmacie', 'transfert_distributeur', 'retrait_defectueux', 'vente_pharmacie', 'vente_patient'].includes(m.type_mouvement))
      .reduce((sum, m) => sum + (m.quantite || 0), 0) || 0;
    
    const quantiteDisponible = quantiteCreee - quantiteConsommee;
    
    return {
      ...lot,
      quantite_disponible: quantiteDisponible
    };
  }));

  // Filtrer pour ne garder que les lots avec une quantité disponible > 0
  const lotsDisponibles = lotsAvecDisponibilite.filter(lot => lot.quantite_disponible > 0);

  console.log('Lots trouvés:', lotsDisponibles.length);
  console.log('Détails des quantités disponibles:', lotsDisponibles.map(l => ({
    id: l.id,
    numero: l.numero_lot,
    disponible: l.quantite_disponible,
    totale: l.quantite_totale
  })));

  return lotsDisponibles;
}