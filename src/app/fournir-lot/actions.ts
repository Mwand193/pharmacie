
'use server';

import { createClient } from '@/lib/supabase/server';
import { generateMouvementHash, createMouvementHash } from '@/lib/utils/crypto';
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

export async function transfererLot(data: {
  lot_id: number;
  destination_id: number;
  quantite: number;
  commentaire?: string;
  currentUser: User;
}) {
  const supabase = await createClient();
  const { currentUser, ...transfertData } = data;
  
  // Vérifier que l'utilisateur est un fabricant ou admin
  if (currentUser.role !== 'fabricant' && currentUser.role !== 'admin') {
    throw new Error('Seuls les fabricants peuvent transférer des lots');
  }
  
  // 1. Vérifier que le lot appartient bien au fabricant
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('*')
    .eq('id', transfertData.lot_id)
    .single();
    
  if (lotError || !lot) {
    throw new Error('Lot non trouvé');
  }
  
  // Vérifier que le lot appartient au fabricant connecté
  if (lot.fabricant_id !== currentUser.id && currentUser.role !== 'admin') {
    throw new Error('Vous ne pouvez transférer que vos propres lots');
  }
  
  // 2. Calculer la quantité restante (ne pas toucher à quantite_totale)
  const { data: transferMouvements } = await supabase
    .from('mouvements')
    .select('quantite')
    .eq('lot_id', lot.id)
    .in('type_mouvement', ['transfert', 'transfert_distributeur', 'transfert_pharmacie']);
  
  const quantiteDejaTransferée = transferMouvements?.reduce((sum, m) => sum + m.quantite, 0) || 0;
  const quantiteRestante = lot.quantite_totale - quantiteDejaTransferée;
  
  console.log('📦 Vérification stock:');
  console.log(`   Total original: ${lot.quantite_totale}`);
  console.log(`   Déjà transféré: ${quantiteDejaTransferée}`);
  console.log(`   Restant: ${quantiteRestante}`);
  
  // Vérifier la quantité disponible
  if (quantiteRestante < transfertData.quantite) {
    throw new Error(`Quantité insuffisante. Disponible: ${quantiteRestante}, Demandé: ${transfertData.quantite}`);
  }
  
  // Vérifier que la destination est un distributeur
  const { data: destination, error: destError } = await supabase
    .from('users')
    .select('*')
    .eq('id', transfertData.destination_id)
    .eq('role', 'distributeur')
    .single();
    
  if (destError || !destination) {
    throw new Error('La destination doit être un distributeur');
  }
  
  // =============================================
  // SECTION HASH - CRÉER LE HASH CORRECTEMENT
  // =============================================
  
  // Créer le timestamp pour le hash (au format ISO string)
  const timestamp = new Date().toISOString();
  const commentaire = transfertData.commentaire || 
  `Transfert de ${transfertData.quantite} unités de ${currentUser.nom_entite} vers ${destination.nom_entite}`;

  // Utiliser generateMouvementHash pour créer un hash cohérent
  // qui pourra être vérifié correctement par la fonction verifyLotAuthenticity
 const hash_mouvement = createMouvementHash({
  type: 'transfert',
  lot_id: transfertData.lot_id,
  quantite: transfertData.quantite,
  source_id: currentUser.id,
  destination_id: transfertData.destination_id,
  commentaire: transfertData.commentaire ,
  transfert_id: null,
});
  
console.log('🔐 Hash mouvement généré (createMouvementHash):', hash_mouvement.substring(0, 40) + '...');
console.log('   Données utilisées:', {
  lot_id: lot.id,
  type: 'transfert',
  quantite: transfertData.quantite,
  source_id: currentUser.id,
  destination_id: transfertData.destination_id,
  commentaire: commentaire,
});
  // =============================================
  // SECTION BLOCKCHAIN
  // =============================================
  
  // Récupérer l'index Ganache de l'utilisateur
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
      console.warn('⚠️ Aucun compte blockchain assigné - le transfert sera fait sans blockchain');
    }
  }
  
  // Données blockchain du mouvement
  let blockchainTxHash: string | null = null;
  let blockchainMouvementSuccess = false;

  // 4. Créer le mouvement dans PostgreSQL (SANS toucher quantite_totale du lot)
  const { data: mouvement, error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfertData.lot_id,
      type_mouvement: 'transfert',
      source_id: currentUser.id,
      destination_id: transfertData.destination_id,
      quantite: transfertData.quantite,
      type_unite: 'boite',
      commentaire: transfertData.commentaire || `Transfert de ${transfertData.quantite} unités de ${currentUser.nom_entite} vers ${destination.nom_entite}`,
      hash_mouvement: hash_mouvement,
      created_by: currentUser.nom_entite,
      // Stocker le timestamp utilisé pour le hash
      // created_at: timestamp,
    }])
    .select()
    .single();

  if (mouvementError) {
    console.error('Erreur création mouvement:', mouvementError);
    throw new Error(`Erreur lors de la création du mouvement: ${mouvementError.message}`);
  }

  console.log('✅ Mouvement créé (sans modifier quantite_totale du lot)');
  console.log(`   Quantité restante après transfert: ${quantiteRestante - transfertData.quantite}`);

  // =============================================
  // ENREGISTRER SUR LA BLOCKCHAIN
  // =============================================
  
  if (accountIndex !== undefined && accountIndex !== null && lot.blockchain_lot_id) {
    try {
      const isContractReady = await initBlockchainContract();
      
      if (!isContractReady) {
        console.warn('⚠️ Contrat blockchain non disponible - mouvement créé dans la DB seulement');
      } else {
        console.log('🔗 Enregistrement du mouvement sur la blockchain...');
        
        const blockchainResult = await blockchainService.addMouvementOnBlockchain(
          accountIndex,
          {
            blockchainLotId: lot.blockchain_lot_id,
            type_mouvement: 'transfert',
            quantite: transfertData.quantite,
            hash_mouvement: hash_mouvement,
            commentaire: transfertData.commentaire || `Transfert de ${transfertData.quantite} unités de ${currentUser.nom_entite} vers ${destination.nom_entite}`
          }
        );
        
        blockchainTxHash = blockchainResult.transactionHash;
        blockchainMouvementSuccess = true;
        
        console.log('✅ Mouvement enregistré sur blockchain !');
        console.log(`   Transaction: ${blockchainTxHash}`);
        
        // Mettre à jour le mouvement avec le hash de la transaction blockchain
        await supabase
          .from('mouvements')
          .update({
            transaction_hash: blockchainTxHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', mouvement.id);
      }
    } catch (blockchainError: any) {
      console.error('⚠️ Erreur blockchain mouvement:', blockchainError.message);
    }
  }

  revalidatePath('/fournir-lot');
  revalidatePath('/mouvements');
  revalidatePath('/lots');
  
  return {
    ...mouvement,
    quantite_restante: quantiteRestante - transfertData.quantite,
    quantite_totale_originale: lot.quantite_totale,
    blockchain_mouvement_enregistre: blockchainMouvementSuccess,
    blockchain_transaction_hash: blockchainTxHash,
  };
}