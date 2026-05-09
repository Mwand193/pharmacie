// app/transfert-pharmacie/actions.ts
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

// =============================================
// RÉCUPÉRER LES LOTS RÉCEPTIONNÉS PAR LE DISTRIBUTEUR
// =============================================
export async function getLotsReceptionnes(distributeurId: string) {
  const supabase = await createClient();

  // Récupérer les réceptions du distributeur
  const { data: receptions, error: receptionsError } = await supabase
    .from('mouvements')
    .select('lot_id, quantite')
    .eq('type_mouvement', 'reception')
    .eq('source_id', distributeurId)
    .not('commentaire', 'ilike', '%REJETÉ%');

  if (receptionsError) {
    console.error('Erreur chargement réceptions:', receptionsError);
    throw receptionsError;
  }

  if (!receptions || receptions.length === 0) {
    return [];
  }

  // Récupérer les lots correspondants
  const lotIds = [...new Set(receptions.map(r => r.lot_id))];

  const { data: lots, error: lotsError } = await supabase
    .from('lots')
    .select(`*, medicament:medicament_id (*)`)
    .in('id', lotIds)
    .order('created_at', { ascending: false });

  if (lotsError) {
    console.error('Erreur chargement lots:', lotsError);
    throw lotsError;
  }

  // Calculer la quantité disponible pour chaque lot
  const lotsAvecDisponibilite = await Promise.all((lots || []).map(async (lot) => {
    const { data: mouvements } = await supabase
      .from('mouvements')
      .select('type_mouvement, quantite')
      .eq('lot_id', lot.id);
const quantiteRecue = mouvements
  ?.filter((m: any) => m.type_mouvement === 'reception' && !m.commentaire?.includes('REJETÉ'))
  .reduce((sum: number, m: any) => sum + (m.quantite || 0), 0) || 0;
    // const quantiteRecue = mouvements
    //   ?.filter(m => m.type_mouvement === 'reception' && !m.commentaire?.includes('REJETÉ'))
    //   .reduce((sum, m) => sum + (m.quantite || 0), 0) || 0;

    const quantiteDistribuee = mouvements
      ?.filter(m => ['distribution', 'vente_pharmacie', 'retrait_defectueux'].includes(m.type_mouvement))
      .reduce((sum, m) => sum + (m.quantite || 0), 0) || 0;

    const quantiteDisponible = quantiteRecue - quantiteDistribuee;

    return {
      ...lot,
      quantite_disponible: quantiteDisponible,
      quantite_recue: quantiteRecue,
      quantite_distribuee: quantiteDistribuee,
    };
  }));

  return lotsAvecDisponibilite.filter(lot => lot.quantite_disponible > 0);
}

// =============================================
// RÉCUPÉRER LES PHARMACIENS
// =============================================
export async function getPharmaciens() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, matricule, username, nom_entite, ethereum_address, ganache_account_index')
    .eq('role', 'pharmacie')
    .order('nom_entite', { ascending: true });

  if (error) {
    console.error('Erreur chargement pharmaciens:', error);
    throw error;
  }

  return data || [];
}

// =============================================
// TRANSFÉRER VERS PHARMACIE (DISTRIBUTION)
// =============================================
export async function transfererVersPharmacie(data: {
  lot_id: number;
  destination_id: number;
  quantite: number;
  commentaire?: string;
  currentUser: User;
}) {
  const supabase = await createClient();
  const { currentUser, ...transfertData } = data;

  // Vérifier que l'utilisateur est un distributeur
  if (currentUser.role !== 'distributeur' && currentUser.role !== 'admin') {
    throw new Error('Seuls les distributeurs peuvent distribuer aux pharmacies');
  }

  // 1. Vérifier que le lot existe
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('*, medicament:medicament_id (*)')
    .eq('id', transfertData.lot_id)
    .single();

  if (lotError || !lot) {
    throw new Error('Lot non trouvé');
  }

  // 2. Vérifier que le distributeur a bien réceptionné ce lot
  const { data: reception } = await supabase
    .from('mouvements')
    .select('id, quantite')
    .eq('type_mouvement', 'reception')
    .eq('lot_id', lot.id)
    .eq('source_id', currentUser.id)
    .not('commentaire', 'ilike', '%REJETÉ%')
    .single();

  if (!reception) {
    throw new Error('Vous n\'avez pas réceptionné ce lot');
  }

  // 3. Calculer la quantité disponible
  const { data: mouvements } = await supabase
    .from('mouvements')
    .select('type_mouvement, quantite')
    .eq('lot_id', lot.id);
const quantiteRecue = mouvements
  ?.filter((m: any) => m.type_mouvement === 'reception' && !m.commentaire?.includes('REJETÉ'))
  .reduce((sum: number, m: any) => sum + (m.quantite || 0), 0) || 0;
  // const quantiteRecue = mouvements
  //   ?.filter(m => m.type_mouvement === 'reception' && !m.commentaire?.includes('REJETÉ'))
  //   .reduce((sum, m) => sum + (m.quantite || 0), 0) || 0;

  const quantiteDejaDistribuee = mouvements
    ?.filter(m => ['distribution', 'vente_pharmacie', 'retrait_defectueux'].includes(m.type_mouvement))
    .reduce((sum, m) => sum + (m.quantite || 0), 0) || 0;

  const quantiteDisponible = quantiteRecue - quantiteDejaDistribuee;

  console.log('📦 Vérification stock distribution:');
  console.log(`   Reçu: ${quantiteRecue}`);
  console.log(`   Déjà distribué: ${quantiteDejaDistribuee}`);
  console.log(`   Disponible: ${quantiteDisponible}`);

  if (quantiteDisponible < transfertData.quantite) {
    throw new Error(`Quantité insuffisante. Disponible: ${quantiteDisponible}, Demandé: ${transfertData.quantite}`);
  }

  // 4. Vérifier que la destination est une pharmacie
  const { data: destination, error: destError } = await supabase
    .from('users')
    .select('*')
    .eq('id', transfertData.destination_id)
    .eq('role', 'pharmacie')
    .single();

  if (destError || !destination) {
    throw new Error('La destination doit être une pharmacie');
  }

  // 5. Récupérer l'index Ganache
  let accountIndex = currentUser.ganache_account_index;

  if (accountIndex === undefined || accountIndex === null) {
    const { data: freshUser } = await supabase
      .from('users')
      .select('ganache_account_index, ethereum_address')
      .eq('id', currentUser.id)
      .single();

    if (freshUser?.ganache_account_index !== undefined && freshUser?.ganache_account_index !== null) {
      accountIndex = freshUser.ganache_account_index;
    }
  }

  // 6. Construire le commentaire UNE SEULE FOIS
  const commentaire = transfertData.commentaire ||
    `Distribution de ${transfertData.quantite} unités de ${currentUser.nom_entite} vers ${destination.nom_entite}`;

  // 7. Créer le hash
  const hash_mouvement = createMouvementHash({
    type: 'distribution',
    lot_id: transfertData.lot_id,
    quantite: transfertData.quantite,
    source_id: currentUser.id,
    destination_id: transfertData.destination_id,
  });

  console.log('🔐 Hash distribution généré:', hash_mouvement.substring(0, 40) + '...');

  // 8. Créer le mouvement dans PostgreSQL
  const { data: mouvement, error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfertData.lot_id,
      type_mouvement: 'distribution',
      source_id: currentUser.id,
      destination_id: transfertData.destination_id,
      quantite: transfertData.quantite,
      type_unite: 'boite',
      commentaire: commentaire,
      hash_mouvement: hash_mouvement,
      created_by: currentUser.nom_entite,
    }])
    .select()
    .single();

  if (mouvementError) {
    console.error('Erreur création mouvement:', mouvementError);
    throw new Error(`Erreur lors de la création du mouvement: ${mouvementError.message}`);
  }

  console.log('✅ Distribution créée en DB');

  // 9. Enregistrer sur la blockchain
  let blockchainTxHash: string | null = null;
  let blockchainSuccess = false;

  if (accountIndex !== undefined && accountIndex !== null && lot.blockchain_lot_id) {
    try {
      const isContractReady = await initBlockchainContract();

      if (isContractReady) {
        console.log('🔗 Enregistrement de la distribution sur la blockchain...');

        const blockchainResult = await blockchainService.addMouvementOnBlockchain(
          accountIndex,
          {
            blockchainLotId: lot.blockchain_lot_id,
            type_mouvement: 'distribution',
            quantite: transfertData.quantite,
            hash_mouvement: hash_mouvement,
            commentaire: commentaire,
          }
        );

        blockchainTxHash = blockchainResult.transactionHash;
        blockchainSuccess = true;

        console.log('✅ Distribution enregistrée sur blockchain !');
        console.log(`   Transaction: ${blockchainTxHash}`);

        await supabase
          .from('mouvements')
          .update({
            transaction_hash: blockchainTxHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', mouvement.id);
      }
    } catch (blockchainError: any) {
      console.error('⚠️ Erreur blockchain distribution:', blockchainError.message);
    }
  }

  revalidatePath('/transfert-pharmacie');
  revalidatePath('/mouvements');
  revalidatePath('/lots');

  return {
    ...mouvement,
    quantite_restante: quantiteDisponible - transfertData.quantite,
    quantite_totale_originale: lot.quantite_totale,
    blockchain_enregistre: blockchainSuccess,
    blockchain_transaction_hash: blockchainTxHash,
  };
}

// =============================================
// HISTORIQUE DES DISTRIBUTIONS
// =============================================
export async function getHistoriqueDistributions(distributeurId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (*, medicament:medicament_id (*)),
      source:source_id (id, matricule, username, nom_entite, role),
      destination:destination_id (id, matricule, username, nom_entite, role)
    `)
    .in('type_mouvement', ['distribution', 'vente_pharmacie'])
    .order('created_at', { ascending: false });

  if (distributeurId) {
    query = query.eq('source_id', distributeurId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur chargement historique:', error);
    throw error;
  }

  return data || [];
}