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
  signale_par: number;
};

// Fonction helper pour récupérer les infos utilisateur
async function getUserInfo(supabase: any, userId: number) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, nom_entite, role')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
}

// Vérifier si un lot a été réceptionné par un distributeur
async function verifierLotReceptionne(
  supabase: any,
  lotId: number,
  distributeurId: number
) {
  // Vérifier que le lot existe
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('id, numero_lot, medicament_id')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) {
    throw new Error('Lot non trouvé');
  }

  // Vérifier qu'il y a un transfert vers ce distributeur
  const { data: transfert, error: transfertError } = await supabase
    .from('mouvements')
    .select('id, type_mouvement, destination_id, statut_apres, lot_id')
    .eq('lot_id', lotId)
    .eq('type_mouvement', 'transfert')
    .eq('destination_id', distributeurId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (transfertError || !transfert) {
    throw new Error(
      `Le lot #${lot.numero_lot} n'a pas été transféré à votre entité. ` +
      'Vous ne pouvez signaler une anomalie que sur un lot que vous avez reçu.'
    );
  }

  // Vérifier qu'il y a une réception validée
  const { data: reception, error: receptionError } = await supabase
    .from('mouvements')
    .select('id, statut_apres, type_mouvement, source_id, destination_id')
    .eq('lot_id', lotId)
    .eq('type_mouvement', 'reception')
    .eq('source_id', distributeurId)
    .eq('statut_apres', 'receptionne')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (receptionError || !reception) {
    throw new Error(
      `Le lot #${lot.numero_lot} n'a pas encore été réceptionné. ` +
      'Vous devez d\'abord valider la réception avant de signaler une anomalie.'
    );
  }

  return { lot, transfert, reception };
}

// Signaler une anomalie (SANS blockchain - c'est un signalement, pas un mouvement)
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
  const verification = await verifierLotReceptionne(supabase, data.lot_id, data.signale_par);

  // Vérifier si une anomalie n'a pas déjà été signalée
  const { data: existingAnomalie } = await supabase
    .from('anomalies')
    .select('id, statut')
    .eq('lot_id', data.lot_id)
    .eq('signale_par', data.signale_par)
    .not('statut', 'in', '("resolu","rejete")')
    .maybeSingle();

  if (existingAnomalie) {
    throw new Error(
      `Vous avez déjà signalé une anomalie sur ce lot (statut: ${existingAnomalie.statut}). ` +
      'Attendez qu\'elle soit traitée avant d\'en signaler une nouvelle.'
    );
  }

  // Créer l'anomalie dans PostgreSQL
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

  // Récupérer les infos complètes
  const [signaleur, lotInfo] = await Promise.all([
    getUserInfo(supabase, anomalie.signale_par),
    supabase
      .from('lots')
      .select(`id, numero_lot, medicament:medicament_id (id, nom, code_cis, dosage)`)
      .eq('id', anomalie.lot_id)
      .single()
  ]);

  const anomalieComplete = {
    ...anomalie,
    signaleur,
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



// Récupérer les anomalies
export async function getAnomalies(userId: number, role: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('anomalies')
    .select(`
      id, lot_id, mouvement_id, type_anomalie, description, statut, gravite,
      signale_par, traite_par, commentaire_resolution, created_at, updated_at
    `)
    .order('created_at', { ascending: false });

  if (role !== 'admin') {
    query = query.eq('signale_par', userId);
  }

  const { data: anomalies, error } = await query;

  if (error) {
    console.error('Erreur chargement anomalies:', error);
    throw error;
  }

  const anomaliesComplete = await Promise.all(
    (anomalies || []).map(async (anomalie: any) => {
      const [signaleur, traiteur, lot] = await Promise.all([
        getUserInfo(supabase, anomalie.signale_par),
        anomalie.traite_par ? getUserInfo(supabase, anomalie.traite_par) : null,
        supabase
          .from('lots')
          .select('id, numero_lot, date_expiration, medicament:medicament_id (id, nom, code_cis, dosage)')
          .eq('id', anomalie.lot_id)
          .single()
      ]);

      return { ...anomalie, signaleur, traiteur, lot: lot.data || null };
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

  const [signaleur, traiteur, lot, mouvement] = await Promise.all([
    getUserInfo(supabase, anomalie.signale_par),
    anomalie.traite_par ? getUserInfo(supabase, anomalie.traite_par) : null,
    supabase.from('lots').select(`*, medicament:medicament_id (*)`).eq('id', anomalie.lot_id).single(),
    anomalie.mouvement_id 
      ? supabase.from('mouvements').select(`*, source:source_id (id, nom_entite, username), destination:destination_id (id, nom_entite, username)`).eq('id', anomalie.mouvement_id).single() 
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

// Traiter une anomalie (admin)
export async function traiterAnomalie(
  anomalieId: number,
  data: { statut: string; traite_par: number; commentaire_resolution?: string; }
) {
  const supabase = await createClient();
  
  const { data: adminUser, error: userError } = await supabase
    .from('users')
    .select('id, role, nom_entite')
    .eq('id', data.traite_par)
    .single();

  if (userError || !adminUser) throw new Error('Utilisateur traitant non trouvé');
  if (adminUser.role !== 'admin') throw new Error('Seuls les administrateurs peuvent traiter les anomalies');

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

  if (error) throw new Error(`Erreur lors du traitement: ${error.message}`);

  const [signaleur, traiteur, lot] = await Promise.all([
    getUserInfo(supabase, updated.signale_par),
    getUserInfo(supabase, updated.traite_par),
    supabase.from('lots').select(`numero_lot, medicament:medicament_id (nom, code_cis)`).eq('id', updated.lot_id).single()
  ]);

  revalidatePath('/anomalies');
  revalidatePath('/admin/anomalies');
  
  return { ...updated, signaleur, traiteur, lot: lot.data || null };
}

// Supprimer une anomalie (admin)
export async function supprimerAnomalie(anomalieId: number, userId: number) {
  const supabase = await createClient();
  
  const { data: user } = await supabase.from('users').select('id, role').eq('id', userId).single();
  if (!user || user.role !== 'admin') throw new Error('Seuls les administrateurs peuvent supprimer des anomalies');

  const { error } = await supabase.from('anomalies').delete().eq('id', anomalieId);
  if (error) throw new Error(`Erreur lors de la suppression: ${error.message}`);

  revalidatePath('/anomalies');
  return { success: true };
}

// Statistiques
export async function getStatistiquesAnomalies() {
  const supabase = await createClient();
  const { data: stats, error } = await supabase.from('anomalies').select('statut, gravite, type_anomalie');
  if (error) throw error;

  return {
    total: stats?.length || 0,
    par_statut: stats?.reduce((acc: any, curr: any) => { 
      acc[curr.statut] = (acc[curr.statut] || 0) + 1; 
      return acc; 
    }, {}),
    par_gravite: stats?.reduce((acc: any, curr: any) => { 
      acc[curr.gravite] = (acc[curr.gravite] || 0) + 1; 
      return acc; 
    }, {}),
    par_type: stats?.reduce((acc: any, curr: any) => { 
      acc[curr.type_anomalie] = (acc[curr.type_anomalie] || 0) + 1; 
      return acc; 
    }, {}),
  };
}




// Récupérer les lots réceptionnés pour le signalement - VERSION CORRIGÉE
export async function getLotsReceptionnesPourSignalement(distributeurId: number) {
  const supabase = await createClient();
  
  console.log('═══════════════════════════════════════');
  console.log('🔍 RECHERCHE DES RÉCEPTIONS');
  console.log('Distributeur ID:', distributeurId);
  console.log('Type:', typeof distributeurId);
  console.log('═══════════════════════════════════════');
  
  // Étape 1: Vérifier que l'utilisateur existe
  const { data: user } = await supabase
    .from('users')
    .select('id, role, nom_entite, username')
    .eq('id', distributeurId)
    .single();
  
  console.log('👤 Utilisateur:', user);
  
  if (!user) {
    console.error('❌ Utilisateur non trouvé');
    return [];
  }
  
  if (user.role !== 'distributeur' && user.role !== 'admin') {
    console.error('❌ L\'utilisateur n\'est pas un distributeur');
    return [];
  }
  
  // Étape 2: Récupérer TOUS les mouvements de type 'reception' pour cet utilisateur
  console.log('📋 Recherche des mouvements de réception...');
  
  const { data: allMouvements, error: allMouvementsError } = await supabase
    .from('mouvements')
    .select('*')
    .eq('source_id', distributeurId)
    .order('created_at', { ascending: false });
  
  console.log(`📊 Total mouvements (source_id=${distributeurId}):`, allMouvements?.length || 0);
  
  if (allMouvements) {
    console.log('Types de mouvements trouvés:', 
      [...new Set(allMouvements.map(m => m.type_mouvement))]
    );
    console.log('Statuts trouvés:', 
      [...new Set(allMouvements.map(m => m.statut_apres))]
    );
  }
  
  // Étape 3: Filtrer uniquement les réceptions validées
  const receptions = allMouvements?.filter(m => 
    m.type_mouvement === 'reception' && 
    m.statut_apres === 'receptionne'
  ) || [];
  
  console.log(`✅ Réceptions validées trouvées: ${receptions.length}`);
  
  if (receptions.length > 0) {
    console.log('Première réception:', {
      id: receptions[0].id,
      lot_id: receptions[0].lot_id,
      quantite: receptions[0].quantite,
      created_at: receptions[0].created_at,
      commentaire: receptions[0].commentaire
    });
  }
  
  // Étape 4: Enrichir avec les informations des lots
  const lotsAvecAnomalies = await Promise.all(
    receptions.map(async (reception: any) => {
      console.log(`\n📦 Traitement réception #${reception.id}, lot_id: ${reception.lot_id}`);
      
      // Récupérer les infos du lot
      const { data: lot, error: lotError } = await supabase
        .from('lots')
        .select(`
          id,
          numero_lot,
          date_fabrication,
          date_expiration,
          medicament:medicament_id (
            id,
            nom,
            code_cis,
            dosage,
            forme
          )
        `)
        .eq('id', reception.lot_id)
        .single();
      
      if (lotError) {
        console.error(`❌ Erreur lot #${reception.lot_id}:`, lotError.message);
      } else {
        console.log(`✅ Lot trouvé: ${lot?.numero_lot} `);
      }
      
      // Récupérer les infos de la source (le distributeur lui-même)
      const { data: source } = await supabase
        .from('users')
        .select('id, nom_entite, username, role')
        .eq('id', reception.source_id)
        .single();
      
      // Récupérer les infos de la destination
      const { data: destination } = await supabase
        .from('users')
        .select('id, nom_entite, username, role')
        .eq('id', reception.destination_id)
        .single();
      
      // Vérifier les anomalies existantes
      const { data: anomalies, error: anomaliesError } = await supabase
        .from('anomalies')
        .select('id, statut, type_anomalie, created_at')
        .eq('lot_id', reception.lot_id)
        .eq('signale_par', distributeurId)
        .not('statut', 'in', '("resolu","rejete")')
        .order('created_at', { ascending: false });
      
      if (anomaliesError) {
        console.error(`❌ Erreur anomalies lot #${reception.lot_id}:`, anomaliesError.message);
      }
      
      return {
        ...reception,
        lot: lot || null,
        source: source || null,
        destination: destination || null,
        anomalies_actives: anomalies || [],
        a_anomalie_en_cours: anomalies && anomalies.length > 0
      };
    })
  );
  
  console.log('\n═══════════════════════════════════════');
  console.log(`📊 RÉSULTAT FINAL: ${lotsAvecAnomalies.length} lots réceptionnés`);
  console.log('═══════════════════════════════════════\n');
  
  return lotsAvecAnomalies;
}

// ... (garder le reste des fonctions inchangées) ...