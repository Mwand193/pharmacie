
// app/anomalies/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type AnomalieInput = {
  lot_id: number;
  mouvement_id?: number;
  type_anomalie: string;
  description: string;
  gravite?: string;
  signale_par: number; // user_id du distributeur
};

// Vérifier si un lot a été réceptionné par un distributeur
// async function verifierLotReceptionne(
//   supabase: any,
//   lotId: number,
//   distributeurId: number
// ) {
//   // Vérifier d'abord que le lot existe
//   const { data: lot, error: lotError } = await supabase
//     .from('lots')
//     .select('id, numero_lot')
//     .eq('id', lotId)
//     .single();

//   if (lotError || !lot) {
//     throw new Error('Lot non trouvé');
//   }

//   // Vérifier que le lot a été transféré ET réceptionné par ce distributeur
//   const { data: transfert, error: transfertError } = await supabase
//     .from('mouvements')
//     .select(`
//       id,
//       type_mouvement,
//       destination_id,
//       statut_apres,
//       lot_id
//     `)
//     .eq('lot_id', lotId)
//     .eq('type_mouvement', 'transfert')
//     .eq('destination_id', distributeurId)
//     .single();

//   if (transfertError || !transfert) {
//     throw new Error(
//       `Le lot #${lot.numero_lot} n'a pas été transféré à votre entité. ` +
//       'Vous ne pouvez signaler une anomalie que sur un lot que vous avez reçu.'
//     );
//   }

//   // Vérifier qu'il y a bien une réception validée pour ce transfert
//   const { data: reception, error: receptionError } = await supabase
//     .from('mouvements')
//     .select('id, statut_apres')
//     .eq('lot_id', lotId)
//     .eq('type_mouvement', 'reception')
//     .eq('destination_id', distributeurId)
//     .eq('statut_apres', 'receptionne')
//     .single();

//   if (receptionError || !reception) {
//     throw new Error(
//       `Le lot #${lot.numero_lot} n'a pas encore été réceptionné.  +
//       'Vous devez d'abord valider la réception avant de signaler une anomalie.`
//     );
//   }

//   return {
//     lot,
//     transfert,
//     reception
//   };
// }

// Fonction helper pour récupérer les infos utilisateur séparément
async function getUserInfo(supabase: any, userId: number) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, nom_entite, role')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
}

// Signaler une anomalie (uniquement sur les lots réceptionnés)
export async function signalerAnomalie(data: AnomalieInput) {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur existe et est un distributeur
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, role, nom_entite, username')
    .eq('id', data.signale_par)
    .single();

  if (userError || !user) {
    throw new Error('Utilisateur non trouvé');
  }

  if (user.role !== 'distributeur') {
    throw new Error('Seuls les distributeurs peuvent signaler des anomalies');
  }

  // Vérifier que le lot a bien été réceptionné par ce distributeur
  const verification = await verifierLotReceptionne(
    supabase,
    data.lot_id,
    data.signale_par
  );

  // Vérifier si une anomalie n'a pas déjà été signalée pour ce lot par ce distributeur
  const { data: existingAnomalie } = await supabase
    .from('anomalies')
    .select('id, statut')
    .eq('lot_id', data.lot_id)
    .eq('signale_par', data.signale_par)
    .neq('statut', 'resolu')
    .neq('statut', 'rejete')
    .single();

  if (existingAnomalie) {
    throw new Error(
      `Vous avez déjà signalé une anomalie sur ce lot (${existingAnomalie.statut}). ` +
      'Attendez qu\'elle soit traitée avant d\'en signaler une nouvelle.'
    );
  }

  // Créer l'anomalie
  const { data: anomalie, error } = await supabase
    .from('anomalies')
    .insert([{
      lot_id: data.lot_id,
      mouvement_id: verification.reception.id,
      type_anomalie: data.type_anomalie,
      description: data.description,
      gravite: data.gravite || 'moyenne',
      signale_par: data.signale_par,
      statut: 'signale'
    }])
    .select(`
      id,
      lot_id,
      mouvement_id,
      type_anomalie,
      description,
      statut,
      gravite,
      signale_par,
      traite_par,
      commentaire_resolution,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Erreur signalement anomalie:', error);
    throw new Error(`Erreur lors du signalement: ${error.message}`);
  }

  // Récupérer les infos utilisateur et lot séparément
  const [signaleur, lotInfo] = await Promise.all([
    getUserInfo(supabase, anomalie.signale_par),
    supabase
      .from('lots')
      .select(`
        id,
        numero_lot,
        medicament:medicament_id (id, nom, code_cis, dosage)
      `)
      .eq('id', anomalie.lot_id)
      .single()
  ]);

  const anomalieComplete = {
    ...anomalie,
    signaleur: signaleur,
    lot: lotInfo.data
  };

  revalidatePath('/anomalies');
  revalidatePath('/reception');
  revalidatePath('/lots');
  
  return {
    success: true,
    message: `Anomalie signalée avec succès sur le lot #${verification.lot.numero_lot}`,
    anomalie: anomalieComplete
  };
}

// Récupérer les lots réceptionnés pour le signalement
// export async function getLotsReceptionnesPourSignalement(distributeurId: number) {
//   const supabase = await createClient();
  
//   // Récupérer toutes les réceptions validées du distributeur
//   const { data: receptions, error } = await supabase
//     .from('mouvements')
//     .select(`
//       id,
//       lot_id,
//       quantite,
//       created_at,
//       statut_apres,
//       commentaire,
//       source_id,
//       destination_id
//     `)
//     .eq('type_mouvement', 'reception')
//     .eq('destination_id', distributeurId)
//     .eq('statut_apres', 'receptionne')
//     .order('created_at', { ascending: false });

//   if (error) {
//     console.error('Erreur chargement réceptions:', error);
//     throw error;
//   }

//   // Récupérer les infos des lots, sources et anomalies séparément
//   const lotsAvecAnomalies = await Promise.all(
//     (receptions || []).map(async (reception) => {
//       // Récupérer le lot
//       const { data: lot } = await supabase
//         .from('lots')
//         .select(`
//           id,
//           numero_lot,
//           date_fabrication,
//           date_expiration,
//           medicament:medicament_id (id, nom, code_cis, dosage, forme)
//         `)
//         .eq('id', reception.lot_id)
//         .single();

//       // Récupérer la source
//       const { data: source } = await supabase
//         .from('users')
//         .select('id, nom_entite, username, role')
//         .eq('id', reception.source_id)
//         .single();

//       // Vérifier les anomalies existantes
//       const { data: anomalies } = await supabase
//         .from('anomalies')
//         .select('id, statut, type_anomalie, created_at')
//         .eq('lot_id', reception.lot_id)
//         .eq('signale_par', distributeurId)
//         .neq('statut', 'resolu')
//         .neq('statut', 'rejete')
//         .order('created_at', { ascending: false });

//       return {
//         ...reception,
//         lot: lot,
//         source: source,
//         anomalies_actives: anomalies || [],
//         a_anomalie_en_cours: anomalies && anomalies.length > 0
//       };
//     })
//   );

//   return lotsAvecAnomalies;
// }

// Récupérer les anomalies (filtrées par rôle)
export async function getAnomalies(userId: number, role: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('anomalies')
    .select(`
      id,
      lot_id,
      mouvement_id,
      type_anomalie,
      description,
      statut,
      gravite,
      signale_par,
      traite_par,
      commentaire_resolution,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  // Les distributeurs voient seulement leurs propres signalements
  if (role !== 'admin') {
    query = query.eq('signale_par', userId);
  }

  const { data: anomalies, error } = await query;

  if (error) {
    console.error('Erreur chargement anomalies:', error);
    throw error;
  }

  // Récupérer les infos liées séparément pour chaque anomalie
  const anomaliesComplete = await Promise.all(
    (anomalies || []).map(async (anomalie) => {
      const [signaleur, traiteur, lot] = await Promise.all([
        getUserInfo(supabase, anomalie.signale_par),
        anomalie.traite_par ? getUserInfo(supabase, anomalie.traite_par) : null,
        supabase
          .from('lots')
          .select(`
            id,
            numero_lot,
            date_expiration,
            medicament:medicament_id (id, nom, code_cis, dosage)
          `)
          .eq('id', anomalie.lot_id)
          .single()
      ]);

      return {
        ...anomalie,
        signaleur,
        traiteur,
        lot: lot.data || null
      };
    })
  );
  
  return anomaliesComplete;
}

// Récupérer une anomalie spécifique
export async function getAnomalie(anomalieId: number) {
  const supabase = await createClient();
  
  const { data: anomalie, error } = await supabase
    .from('anomalies')
    .select('*')
    .eq('id', anomalieId)
    .single();

  if (error) throw error;
  if (!anomalie) throw new Error('Anomalie non trouvée');

  // Récupérer toutes les infos liées
  const [signaleur, traiteur, lot, mouvement] = await Promise.all([
    getUserInfo(supabase, anomalie.signale_par),
    anomalie.traite_par ? getUserInfo(supabase, anomalie.traite_par) : null,
    supabase
      .from('lots')
      .select(`
        *,
        medicament:medicament_id (*)
      `)
      .eq('id', anomalie.lot_id)
      .single(),
    anomalie.mouvement_id
      ? supabase
          .from('mouvements')
          .select(`
            *,
            source:source_id (id, nom_entite, username),
            destination:destination_id (id, nom_entite, username)
          `)
          .eq('id', anomalie.mouvement_id)
          .single()
      : null
  ]);

  return {
    ...anomalie,
    signaleur,
    traiteur,
    lot: lot.data || null,
    mouvement: mouvement?.data || null
  };
}

// Mettre à jour le statut d'une anomalie (admin seulement)
export async function traiterAnomalie(
  anomalieId: number,
  data: {
    statut: string;
    traite_par: number;
    commentaire_resolution?: string;
  }
) {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur traitant existe et est admin
  const { data: adminUser, error: userError } = await supabase
    .from('users')
    .select('id, role, nom_entite')
    .eq('id', data.traite_par)
    .single();

  if (userError || !adminUser) {
    throw new Error('Utilisateur traitant non trouvé');
  }

  if (adminUser.role !== 'admin') {
    throw new Error('Seuls les administrateurs peuvent traiter les anomalies');
  }

  const { data: updated, error } = await supabase
    .from('anomalies')
    .update({
      statut: data.statut,
      traite_par: data.traite_par,
      commentaire_resolution: data.commentaire_resolution || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', anomalieId)
    .select('*')
    .single();

  if (error) {
    console.error('Erreur traitement anomalie:', error);
    throw new Error(`Erreur lors du traitement: ${error.message}`);
  }

  // Récupérer les infos liées
  const [signaleur, traiteur, lot] = await Promise.all([
    getUserInfo(supabase, updated.signale_par),
    getUserInfo(supabase, updated.traite_par),
    supabase
      .from('lots')
      .select(`
        numero_lot,
        medicament:medicament_id (nom, code_cis)
      `)
      .eq('id', updated.lot_id)
      .single()
  ]);

  revalidatePath('/anomalies');
  revalidatePath('/admin/anomalies');
  
  return {
    ...updated,
    signaleur,
    traiteur,
    lot: lot.data || null
  };
}

// Supprimer une anomalie (admin seulement)
export async function supprimerAnomalie(anomalieId: number, userId: number) {
  const supabase = await createClient();
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (userError || !user || user.role !== 'admin') {
    throw new Error('Seuls les administrateurs peuvent supprimer des anomalies');
  }

  const { error } = await supabase
    .from('anomalies')
    .delete()
    .eq('id', anomalieId);

  if (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }

  revalidatePath('/anomalies');
  return { success: true };
}

// Obtenir des statistiques sur les anomalies
export async function getStatistiquesAnomalies() {
  const supabase = await createClient();
  
  const { data: stats, error } = await supabase
    .from('anomalies')
    .select('statut, gravite, type_anomalie');

  if (error) throw error;

  return {
    total: stats?.length || 0,
    par_statut: stats?.reduce((acc: any, curr) => {
      acc[curr.statut] = (acc[curr.statut] || 0) + 1;
      return acc;
    }, {}),
    par_gravite: stats?.reduce((acc: any, curr) => {
      acc[curr.gravite] = (acc[curr.gravite] || 0) + 1;
      return acc;
    }, {}),
    par_type: stats?.reduce((acc: any, curr) => {
      acc[curr.type_anomalie] = (acc[curr.type_anomalie] || 0) + 1;
      return acc;
    }, {}),
  };
}






// app/anomalies/actions.ts

// Vérifier si un lot a été réceptionné par un distributeur
async function verifierLotReceptionne(
  supabase: any,
  lotId: number,
  distributeurId: number
) {
  // Vérifier d'abord que le lot existe
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('id, numero_lot')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) {
    throw new Error('Lot non trouvé');
  }

  // Vérifier que le lot a été transféré ET réceptionné par ce distributeur
  const { data: transfert, error: transfertError } = await supabase
    .from('mouvements')
    .select(`
      id,
      type_mouvement,
      destination_id,
      statut_apres,
      lot_id
    `)
    .eq('lot_id', lotId)
    .eq('type_mouvement', 'transfert')
    .eq('destination_id', distributeurId)
    .single();

  if (transfertError || !transfert) {
    throw new Error(
      `Le lot #${lot.numero_lot} n'a pas été transféré à votre entité. ` +
      'Vous ne pouvez signaler une anomalie que sur un lot que vous avez reçu.'
    );
  }

  // Vérifier qu'il y a bien une réception validée pour ce transfert
  // CORRECTION: source_id = distributeurId (pas destination_id)
  const { data: reception, error: receptionError } = await supabase
    .from('mouvements')
    .select('id, statut_apres')
    .eq('lot_id', lotId)
    .eq('type_mouvement', 'reception')
    .eq('source_id', distributeurId)  // CHANGÉ: destination_id -> source_id
    .eq('statut_apres', 'receptionne')
    .single();

  if (receptionError || !reception) {
    throw new Error(
      `Le lot #${lot.numero_lot} n'a pas encore été réceptionné. ` +
      'Vous devez d\'abord valider la réception avant de signaler une anomalie.'
    );
  }

  return {
    lot,
    transfert,
    reception
  };
}

// Récupérer les lots réceptionnés pour le signalement
export async function getLotsReceptionnesPourSignalement(distributeurId: number) {
  const supabase = await createClient();
  
  // Récupérer toutes les réceptions validées du distributeur
  // CORRECTION: source_id = distributeurId (pas destination_id)
  const { data: receptions, error } = await supabase
    .from('mouvements')
    .select(`
      id,
      lot_id,
      quantite,
      created_at,
      statut_apres,
      commentaire,
      source_id,
      destination_id
    `)
    .eq('type_mouvement', 'reception')
    .eq('source_id', distributeurId)  // CHANGÉ: destination_id -> source_id
    .eq('statut_apres', 'receptionne')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur chargement réceptions:', error);
    throw error;
  }

  // Récupérer les infos des lots, sources et anomalies séparément
  const lotsAvecAnomalies = await Promise.all(
    (receptions || []).map(async (reception) => {
      // Récupérer le lot
      const { data: lot } = await supabase
        .from('lots')
        .select(`
          id,
          numero_lot,
          date_fabrication,
          date_expiration,
          medicament:medicament_id (id, nom, code_cis, dosage, forme)
        `)
        .eq('id', reception.lot_id)
        .single();

      // Récupérer la source (le distributeur)
      const { data: source } = await supabase
        .from('users')
        .select('id, nom_entite, username, role')
        .eq('id', reception.source_id)
        .single();

      // Récupérer la destination (le fabricant)
      const { data: destination } = await supabase
        .from('users')
        .select('id, nom_entite, username, role')
        .eq('id', reception.destination_id)
        .single();

      // Vérifier les anomalies existantes
      const { data: anomalies } = await supabase
        .from('anomalies')
        .select('id, statut, type_anomalie, created_at')
        .eq('lot_id', reception.lot_id)
        .eq('signale_par', distributeurId)
        .neq('statut', 'resolu')
        .neq('statut', 'rejete')
        .order('created_at', { ascending: false });

      return {
        ...reception,
        lot: lot,
        source: source,  // Le distributeur
        destination: destination,  // Le fabricant
        anomalies_actives: anomalies || [],
        a_anomalie_en_cours: anomalies && anomalies.length > 0
      };
    })
  );

  return lotsAvecAnomalies;
}