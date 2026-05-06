
// app/transfert-pharmacie/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { generateMouvementHash } from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';

type User = {
  id: string;
  matricule: string;
  username: string;
  role: string;
  nom_entite: string;
};

// export async function getLotsReceptionnes(distributeurId: string) {
//   const supabase = await createClient();
  
//   // Récupérer les réceptions du distributeur (filtrer par statut_apres = 'receptionne')
//   const { data: receptions, error: receptionsError } = await supabase
//     .from('mouvements')
//     .select(`
//       id,
//       lot_id,
//       quantite,
//       created_at,
//       statut_apres,
//       lot:lot_id (
//         *,
//         medicament:medicament_id (*)
//       ),
//       source:source_id (id, nom_entite, username)
//     `)
//     .eq('type_mouvement', 'reception')
//     .eq('destination_id', distributeurId)
//     .eq('statut_apres', 'receptionne')
//     .order('created_at', { ascending: false });

//   if (receptionsError) {
//     console.error('Erreur chargement réceptions:', receptionsError);
//     throw receptionsError;
//   }

//   // Calculer la quantité disponible pour distribution
//   const lotsAvecDisponibilite = await Promise.all(
//     (receptions || []).map(async (reception) => {
//       // Calculer le total déjà distribué pour ce lot (vente_pharmacie)
//       const { data: distributions } = await supabase
//         .from('mouvements')
//         .select('quantite')
//         .eq('lot_id', reception.lot_id)
//         .eq('type_mouvement', 'vente_pharmacie')
//         .eq('source_id', distributeurId);

//       const quantiteDistribuee = distributions?.reduce((sum, d) => sum + (d.quantite || 0), 0) || 0;
//       const quantiteDisponible = reception.quantite - quantiteDistribuee;

//       return {
//         ...reception,
//         quantite_recue: reception.quantite,
//         quantite_distribuee: quantiteDistribuee,
//         quantite_disponible: quantiteDisponible,
//         lot: reception.lot,
//         source: reception.source
//       };
//     })
//   );

//   // Filtrer pour ne garder que les lots avec quantité disponible > 0
//   return lotsAvecDisponibilite.filter(l => l.quantite_disponible > 0);
// }

export async function getPharmaciens() {
  const supabase = await createClient();
  
  const { data: pharmaciens, error } = await supabase
    .from('users')
    .select('id, username, nom_entite, matricule')
    .eq('role', 'pharmacie')
    .order('nom_entite');

  if (error) {
    console.error('Erreur chargement pharmaciens:', error);
    throw error;
  }

  return pharmaciens || [];
}

// export async function transfererVersPharmacie(data: {
//   lot_id: number;
//   pharmacien_id: string;
//   quantite: number;
//   commentaire?: string;
//   currentUser: User;
// }) {
//   const supabase = await createClient();
//   const { currentUser, ...transfertData } = data;
  
//   if (currentUser.role !== 'distributeur' && currentUser.role !== 'admin') {
//     throw new Error('Seuls les distributeurs peuvent distribuer aux pharmacies');
//   }
  
//   // 1. Vérifier que le lot a bien été réceptionné par ce distributeur
//   const { data: reception, error: receptionError } = await supabase
//     .from('mouvements')
//     .select('*')
//     .eq('type_mouvement', 'reception')
//     .eq('lot_id', transfertData.lot_id)
//     .eq('destination_id', currentUser.id)
//     .eq('statut_apres', 'receptionne')
//     .single();
    
//   if (receptionError || !reception) {
//     throw new Error('Ce lot n\'a pas été réceptionné par votre entité');
//   }
  
//   // 2. Calculer la quantité déjà distribuée (vente_pharmacie)
//   const { data: distributions } = await supabase
//     .from('mouvements')
//     .select('quantite')
//     .eq('lot_id', transfertData.lot_id)
//     .eq('type_mouvement', 'vente_pharmacie')
//     .eq('source_id', currentUser.id);
    
//   const quantiteDistribuee = distributions?.reduce((sum, d) => sum + (d.quantite || 0), 0) || 0;
//   const quantiteDisponible = reception.quantite - quantiteDistribuee;
  
//   if (transfertData.quantite > quantiteDisponible) {
//     throw new Error(`Quantité insuffisante. Disponible: ${quantiteDisponible} unités`);
//   }
  
//   // 3. Vérifier le pharmacien
//   const { data: pharmacien, error: pharmaError } = await supabase
//     .from('users')
//     .select('*')
//     .eq('id', transfertData.pharmacien_id)
//     .eq('role', 'pharmacie')
//     .single();
    
//   if (pharmaError || !pharmacien) {
//     throw new Error('Pharmacien non trouvé');
//   }
  
//   // 4. Récupérer les infos du lot pour le hash
//   const { data: lot } = await supabase
//     .from('lots')
//     .select('*, medicament:medicament_id (*)')
//     .eq('id', transfertData.lot_id)
//     .single();
  
//   // 5. Générer le hash du mouvement
//   const hash_mouvement = generateMouvementHash({
//     lot_id: transfertData.lot_id,
//     type: 'vente_pharmacie',
//     source_id: currentUser.id,
//     destination_id: transfertData.pharmacien_id,
//     quantite: transfertData.quantite,
//     timestamp: new Date().toISOString(),
//     created_by: currentUser.nom_entite,
//     medicament: lot?.medicament?.nom,
//     numero_lot: lot?.numero_lot,
//   });

//   // 6. Créer le mouvement de type 'vente_pharmacie'
//   const { data: mouvement, error: mouvementError } = await supabase
//     .from('mouvements')
//     .insert([{
//       lot_id: transfertData.lot_id,
//       type_mouvement: 'vente_pharmacie',
//       source_id: currentUser.id,
//       destination_id: transfertData.pharmacien_id,
//       quantite: transfertData.quantite,
//       type_unite: 'boite',
//       statut_avant: 'receptionne',
//       statut_apres: 'distribue_pharmacie',
//       commentaire: transfertData.commentaire || `Distribution de ${transfertData.quantite} unités du lot ${lot?.numero_lot} par ${currentUser.nom_entite} vers ${pharmacien.nom_entite}`,
//       hash_mouvement: hash_mouvement,
//       created_by: currentUser.nom_entite,
//     }])
//     .select()
//     .single();

//   if (mouvementError) {
//     console.error('Erreur création mouvement:', mouvementError);
//     throw new Error(`Erreur lors de la distribution: ${mouvementError.message}`);
//   }

//   revalidatePath('/transfert-pharmacie');
//   revalidatePath('/mouvements');
//   revalidatePath('/reception');
  
//   return {
//     success: true,
//     mouvement,
//     quantite_restante: quantiteDisponible - transfertData.quantite,
//     lot: lot
//   };
// }

export async function getHistoriqueDistributions(distributeurId: string) {
  const supabase = await createClient();
  
  const { data: transferts, error } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (
        *,
        medicament:medicament_id (*)
      ),
      source:source_id (id, username, nom_entite, role),
      destination:destination_id (id, username, nom_entite, role)
    `)
    .eq('type_mouvement', 'vente_pharmacie')
    .eq('source_id', distributeurId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur historique:', error);
    throw error;
  }

  return transferts || [];
}


// app/transfert-pharmacie/actions.ts
export async function getLotsReceptionnes(distributeurId: string) {
  const supabase = await createClient();
  
  // CORRECTION: Le distributeur est dans source_id pour les réceptions
  const { data: receptions, error: receptionsError } = await supabase
    .from('mouvements')
    .select(`
      id,
      lot_id,
      quantite,
      created_at,
      statut_apres,
      lot:lot_id (
        *,
        medicament:medicament_id (*)
      ),
      destination:destination_id (id, nom_entite, username)
    `)
    .eq('type_mouvement', 'reception')
    .eq('source_id', distributeurId)  // CHANGÉ: destination_id -> source_id
    .eq('statut_apres', 'receptionne')
    .order('created_at', { ascending: false });

  if (receptionsError) {
    console.error('Erreur chargement réceptions:', receptionsError);
    throw receptionsError;
  }

  // Le reste de la fonction reste inchangé
  const lotsAvecDisponibilite = await Promise.all(
    (receptions || []).map(async (reception) => {
      const { data: distributions } = await supabase
        .from('mouvements')
        .select('quantite')
        .eq('lot_id', reception.lot_id)
        .eq('type_mouvement', 'vente_pharmacie')
        .eq('source_id', distributeurId);

      const quantiteDistribuee = distributions?.reduce((sum, d) => sum + (d.quantite || 0), 0) || 0;
      const quantiteDisponible = reception.quantite - quantiteDistribuee;

      return {
        ...reception,
        quantite_recue: reception.quantite,
        quantite_distribuee: quantiteDistribuee,
        quantite_disponible: quantiteDisponible,
        lot: reception.lot,
      };
    })
  );

  return lotsAvecDisponibilite.filter(l => l.quantite_disponible > 0);
}


// app/transfert-pharmacie/actions.ts

export async function transfererVersPharmacie(data: {
  lot_id: number;
  pharmacien_id: string;
  quantite: number;
  commentaire?: string;
  currentUser: User;
}) {
  const supabase = await createClient();
  const { currentUser, ...transfertData } = data;
  
  if (currentUser.role !== 'distributeur' && currentUser.role !== 'admin') {
    throw new Error('Seuls les distributeurs peuvent distribuer aux pharmacies');
  }
  
  // 1. Vérifier que le lot a bien été réceptionné par ce distributeur
  // CORRECTION: source_id = distributeurId (pas destination_id)
  const { data: reception, error: receptionError } = await supabase
    .from('mouvements')
    .select('*')
    .eq('type_mouvement', 'reception')
    .eq('lot_id', transfertData.lot_id)
    .eq('source_id', currentUser.id)  // CHANGÉ: destination_id -> source_id
    .eq('statut_apres', 'receptionne')
    .single();
    
  if (receptionError || !reception) {
    console.error('Erreur réception:', receptionError);
    throw new Error('Ce lot n\'a pas été réceptionné par votre entité');
  }
  
  // 2. Calculer la quantité déjà distribuée (vente_pharmacie)
  const { data: distributions } = await supabase
    .from('mouvements')
    .select('quantite')
    .eq('lot_id', transfertData.lot_id)
    .eq('type_mouvement', 'vente_pharmacie')
    .eq('source_id', currentUser.id);
    
  const quantiteDistribuee = distributions?.reduce((sum, d) => sum + (d.quantite || 0), 0) || 0;
  const quantiteDisponible = reception.quantite - quantiteDistribuee;
  
  if (transfertData.quantite > quantiteDisponible) {
    throw new Error(`Quantité insuffisante. Disponible: ${quantiteDisponible} unités`);
  }
  
  // 3. Vérifier le pharmacien
  const { data: pharmacien, error: pharmaError } = await supabase
    .from('users')
    .select('*')
    .eq('id', transfertData.pharmacien_id)
    .eq('role', 'pharmacie')
    .single();
    
  if (pharmaError || !pharmacien) {
    throw new Error('Pharmacien non trouvé');
  }
  
  // 4. Récupérer les infos du lot pour le hash
  const { data: lot } = await supabase
    .from('lots')
    .select('*, medicament:medicament_id (*)')
    .eq('id', transfertData.lot_id)
    .single();
  
  // 5. Générer le hash du mouvement
  const hash_mouvement = generateMouvementHash({
    lot_id: transfertData.lot_id,
    type: 'vente_pharmacie',
    source_id: currentUser.id,
    destination_id: transfertData.pharmacien_id,
    quantite: transfertData.quantite,
    timestamp: new Date().toISOString(),
    created_by: currentUser.nom_entite,
    medicament: lot?.medicament?.nom,
    numero_lot: lot?.numero_lot,
  });

  // 6. Créer le mouvement de type 'vente_pharmacie'
  const { data: mouvement, error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfertData.lot_id,
      type_mouvement: 'vente_pharmacie',
      source_id: currentUser.id,
      destination_id: transfertData.pharmacien_id,
      quantite: transfertData.quantite,
      type_unite: 'boite',
      statut_avant: 'receptionne',
      statut_apres: 'distribue_pharmacie',
      commentaire: transfertData.commentaire || `Distribution de ${transfertData.quantite} unités du lot ${lot?.numero_lot} par ${currentUser.nom_entite} vers ${pharmacien.nom_entite}`,
      hash_mouvement: hash_mouvement,
      created_by: currentUser.nom_entite,
    }])
    .select()
    .single();

  if (mouvementError) {
    console.error('Erreur création mouvement:', mouvementError);
    throw new Error(`Erreur lors de la distribution: ${mouvementError.message}`);
  }

  revalidatePath('/transfert-pharmacie');
  revalidatePath('/mouvements');
  revalidatePath('/reception');
  
  return {
    success: true,
    mouvement,
    quantite_restante: quantiteDisponible - transfertData.quantite,
    lot: lot
  };
}