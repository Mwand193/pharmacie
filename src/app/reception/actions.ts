
// // app/reception/actions.ts
// 'use server';

// import { createClient } from '@/lib/supabase/server';
// import { generateMouvementHash } from '@/lib/utils/crypto';
// import { revalidatePath } from 'next/cache';

// export async function getTransfertsEnAttente(distributeurId?: string, distributeurNom?: string) {
//   const supabase = await createClient();
  
//   // Récupérer tous les transferts
//   let query = supabase
//     .from('mouvements')
//     .select(`
//       *,
//       lot:lot_id (
//         *,
//         medicament:medicament_id (*)
//       ),
//       source:source_id (
//         id,
//         matricule,
//         username,
//         role,
//         nom_entite
//       ),
//       destination:destination_id (
//         id,
//         matricule,
//         username,
//         role,
//         nom_entite
//       )
//     `)
//     .eq('type_mouvement', 'transfert')
//     .order('created_at', { ascending: false });

//   // Filtrer par distributeur si l'ID est fourni
//   if (distributeurId) {
//     query = query.eq('destination_id', distributeurId);
//   }

//   const { data: transferts, error: transfertsError } = await query;

//   if (transfertsError) {
//     console.error('Erreur chargement transferts:', transfertsError);
//     throw transfertsError;
//   }

//   console.log('Transferts trouvés:', transferts?.length || 0);
//   if (transferts && transferts.length > 0) {
//     console.log('Premier transfert:', {
//       id: transferts[0].id,
//       destination: transferts[0].destination,
//       source: transferts[0].source
//     });
//   }

//   // Pour chaque transfert, vérifier s'il a déjà une réception
//   const transfertsAvecStatut = await Promise.all(
//     (transferts || []).map(async (transfert) => {
//       const { data: receptions } = await supabase
//         .from('mouvements')
//         .select('*')
//         .eq('type_mouvement', 'reception')
//         .eq('lot_id', transfert.lot_id)
//         .eq('source_id', transfert.source_id)
//         .eq('destination_id', transfert.destination_id)
//         .order('created_at', { ascending: false });

//       const hasReception = receptions && receptions.length > 0 && 
//                           !receptions.some(r => r.commentaire?.includes('REJETÉ'));
//       const isRejete = receptions?.some(r => r.commentaire?.includes('REJETÉ'));

//       return {
//         ...transfert,
//         hasReception,
//         isRejete,
//         reception: hasReception ? receptions[0] : null
//       };
//     })
//   );

//   return transfertsAvecStatut;
// }

// export async function validerReception(
//   transfertId: number, 
//   userId?: string, 
//   distributeurNom?: string
// ) {
//   const supabase = await createClient();
  
//   // 1. Récupérer le transfert avec les informations de destination
//   const { data: transfert, error: transfertError } = await supabase
//     .from('mouvements')
//     .select(`
//       *,
//       destination:destination_id (
//         id,
//         nom_entite,
//         role
//       )
//     `)
//     .eq('id', transfertId)
//     .eq('type_mouvement', 'transfert')
//     .single();

//   if (transfertError || !transfert) {
//     console.error('Erreur récupération transfert:', transfertError);
//     throw new Error('Transfert non trouvé');
//   }

//   // Vérifier que la destination est bien un distributeur
//   if (transfert.destination?.role !== 'distributeur') {
//     throw new Error('Ce transfert n\'est pas destiné à un distributeur');
//   }

//   // Vérifier que l'utilisateur connecté est bien le distributeur destinataire
//   if (userId && transfert.destination_id !== userId) {
//     throw new Error('Ce transfert n\'est pas destiné à votre entité');
//   }

//   // 2. Vérifier si une réception existe déjà
//   const { data: existingReception } = await supabase
//     .from('mouvements')
//     .select('id')
//     .eq('type_mouvement', 'reception')
//     .eq('lot_id', transfert.lot_id)
//     .eq('source_id', transfert.source_id)
//     .eq('destination_id', transfert.destination_id)
//     .single();

//   if (existingReception) {
//     throw new Error('Ce transfert a déjà été réceptionné');
//   }

//   // 3. Générer le hash pour la réception
//   const hash_reception = generateMouvementHash({
//     transfert_id: transfertId,
//     lot_id: transfert.lot_id,
//     source_id: transfert.source_id,
//     destination_id: transfert.destination_id,
//     quantite: transfert.quantite,
//     type: 'reception',
//     timestamp: new Date().toISOString(),
//     user_id: userId,
//     entite: distributeurNom,
//   });

//   // 4. Créer le mouvement de réception (SANS la colonne statut)
//   const { data: reception, error: receptionError } = await supabase
//     .from('mouvements')
//     .insert([{
//       lot_id: transfert.lot_id,
//       type_mouvement: 'reception',
//       source_id: transfert.source_id,
//       destination_id: transfert.destination_id,
//       quantite: transfert.quantite,
//       type_unite: transfert.type_unite || 'boite',
//       statut_avant: 'en_attente',      // Utiliser statut_avant
//       statut_apres: 'receptionne',     // Utiliser statut_apres
//       commentaire: `Réception du transfert #${transfertId} - ${transfert.quantite} ${transfert.type_unite || 'boite'}(s) par ${distributeurNom || 'Distributeur'}`,
//       hash_mouvement: hash_reception,
//       created_by: userId || 'user',
//     }])
//     .select()
//     .single();

//   if (receptionError) {
//     console.error('Erreur création réception:', receptionError);
//     throw new Error('Erreur lors de la validation de la réception');
//   }

//   revalidatePath('/reception');
//   revalidatePath('/mouvements');
  
//   return reception;
// }

// export async function rejeterReception(
//   transfertId: number, 
//   raison: string,
//   userId?: string
// ) {
//   const supabase = await createClient();
  
//   // 1. Récupérer le transfert
//   const { data: transfert, error: transfertError } = await supabase
//     .from('mouvements')
//     .select(`
//       *,
//       destination:destination_id (
//         id,
//         nom_entite,
//         role
//       )
//     `)
//     .eq('id', transfertId)
//     .eq('type_mouvement', 'transfert')
//     .single();

//   if (transfertError || !transfert) {
//     throw new Error('Transfert non trouvé');
//   }

//   // 2. Générer le hash pour le rejet
//   const hash_rejet = generateMouvementHash({
//     transfert_id: transfertId,
//     lot_id: transfert.lot_id,
//     source_id: transfert.source_id,
//     destination_id: transfert.destination_id,
//     raison,
//     type: 'reception_rejet',
//     timestamp: new Date().toISOString(),
//     user_id: userId,
//   });

//   // 3. Créer un mouvement de réception rejeté (SANS la colonne statut)
//   const { data: rejet, error: rejetError } = await supabase
//     .from('mouvements')
//     .insert([{
//       lot_id: transfert.lot_id,
//       type_mouvement: 'reception',
//       source_id: transfert.source_id,
//       destination_id: transfert.destination_id,
//       quantite: transfert.quantite,
//       type_unite: transfert.type_unite || 'boite',
//       statut_avant: 'en_attente',      // Utiliser statut_avant
//       statut_apres: 'rejete',          // Utiliser statut_apres
//       commentaire: `REJETÉ: ${raison} (Transfert #${transfertId})`,
//       hash_mouvement: hash_rejet,
//       created_by: userId || 'user',
//     }])
//     .select()
//     .single();

//   if (rejetError) {
//     console.error('Erreur rejet réception:', rejetError);
//     throw new Error('Erreur lors du rejet de la réception');
//   }

//   revalidatePath('/reception');
//   return rejet;
// }

// export async function getReceptions(distributeurId?: string) {
//   const supabase = await createClient();
  
//   let query = supabase
//     .from('mouvements')
//     .select(`
//       *,
//       lot:lot_id (
//         *,
//         medicament:medicament_id (*)
//       ),
//       source:source_id (
//         id,
//         matricule,
//         username,
//         nom_entite,
//         role
//       ),
//       destination:destination_id (
//         id,
//         matricule,
//         username,
//         nom_entite,
//         role
//       )
//     `)
//     .eq('type_mouvement', 'reception')
//     .order('created_at', { ascending: false });

//   // Filtrer par distributeur si l'ID est fourni
//   if (distributeurId) {
//     query = query.eq('destination_id', distributeurId);
//   }

//   const { data, error } = await query;

//   if (error) {
//     console.error('Erreur chargement réceptions:', error);
//     throw error;
//   }
  
//   return data || [];
// }


// app/reception/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { generateMouvementHash } from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';

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
        nom_entite
      ),
      destination:destination_id (
        id,
        matricule,
        username,
        role,
        nom_entite
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

// export async function validerReception(
//   transfertId: number, 
//   userId?: string, 
//   distributeurNom?: string
// ) {
//   const supabase = await createClient();
  
//   // 1. Récupérer le transfert avec les informations de destination
//   const { data: transfert, error: transfertError } = await supabase
//     .from('mouvements')
//     .select(`
//       *,
//       source:source_id (
//         id,
//         nom_entite,
//         username,
//         role
//       ),
//       destination:destination_id (
//         id,
//         nom_entite,
//         username,
//         role
//       )
//     `)
//     .eq('id', transfertId)
//     .eq('type_mouvement', 'transfert')
//     .single();

//   if (transfertError || !transfert) {
//     console.error('Erreur récupération transfert:', transfertError);
//     throw new Error('Transfert non trouvé');
//   }

//   // Vérifier que la destination est bien un distributeur
//   if (transfert.destination?.role !== 'distributeur') {
//     throw new Error('Ce transfert n\'est pas destiné à un distributeur');
//   }

//   // Vérifier que l'utilisateur connecté est bien le distributeur destinataire
//   if (userId && transfert.destination_id !== userId) {
//     throw new Error('Ce transfert n\'est pas destiné à votre entité');
//   }

//   // 2. Vérifier si une réception existe déjà
//   // Pour la réception : source_id = destination du transfert (distributeur), destination_id = source du transfert (fabricant)
//   const { data: existingReception } = await supabase
//     .from('mouvements')
//     .select('id')
//     .eq('type_mouvement', 'reception')
//     .eq('lot_id', transfert.lot_id)
//     .eq('source_id', transfert.destination_id)  // Le distributeur est la source de la réception
//     .eq('destination_id', transfert.source_id)   // Le fabricant est la destination de la réception
//     .single();

//   if (existingReception) {
//     throw new Error('Ce transfert a déjà été réceptionné');
//   }

//   // 3. Générer le hash pour la réception
//   const hash_reception = generateMouvementHash({
//     transfert_id: transfertId,
//     lot_id: transfert.lot_id,
//     source_id: transfert.destination_id,  // Distributeur qui reçoit
//     destination_id: transfert.source_id,   // Fabricant qui a envoyé
//     quantite: transfert.quantite,
//     type: 'reception',
//     timestamp: new Date().toISOString(),
//     user_id: userId,
//     entite: distributeurNom,
//   });

//   // 4. Créer le mouvement de réception
//   // Logique : La source de la réception = le distributeur qui reçoit
//   //          La destination de la réception = le fabricant qui a envoyé
//   const { data: reception, error: receptionError } = await supabase
//     .from('mouvements')
//     .insert([{
//       lot_id: transfert.lot_id,
//       type_mouvement: 'reception',
//       source_id: transfert.destination_id,  // Le distributeur (celui qui reçoit) devient la source
//       destination_id: transfert.source_id,   // Le fabricant (celui qui a envoyé) devient la destination
//       quantite: transfert.quantite,
//       type_unite: transfert.type_unite || 'boite',
//       statut_avant: 'en_attente',
//       statut_apres: 'receptionne',
//       commentaire: `Réception du transfert #${transfertId} - ${transfert.quantite} ${transfert.type_unite || 'boite'}(s) par ${distributeurNom || transfert.destination?.nom_entite || transfert.destination?.username || 'Distributeur'}`,
//       hash_mouvement: hash_reception,
//       created_by: userId || 'user',
//     }])
//     .select(`
//       *,
//       source:source_id (
//         id,
//         matricule,
//         username,
//         nom_entite,
//         role
//       ),
//       destination:destination_id (
//         id,
//         matricule,
//         username,
//         nom_entite,
//         role
//       )
//     `)
//     .single();

//   if (receptionError) {
//     console.error('Erreur création réception:', receptionError);
//     throw new Error('Erreur lors de la validation de la réception');
//   }

//   console.log('Réception créée avec succès:', {
//     id: reception.id,
//     source: reception.source,
//     destination: reception.destination,
//     source_nom: reception.source?.nom_entite || reception.source?.username,
//     dest_nom: reception.destination?.nom_entite || reception.destination?.username
//   });

//   revalidatePath('/reception');
//   revalidatePath('/mouvements');
  
//   return reception;
// }

export async function rejeterReception(
  transfertId: number, 
  raison: string,
  userId?: string
) {
  const supabase = await createClient();
  
  // 1. Récupérer le transfert
  const { data: transfert, error: transfertError } = await supabase
    .from('mouvements')
    .select(`
      *,
      source:source_id (
        id,
        nom_entite,
        username,
        role
      ),
      destination:destination_id (
        id,
        nom_entite,
        username,
        role
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

  // 2. Générer le hash pour le rejet
  const hash_rejet = generateMouvementHash({
    transfert_id: transfertId,
    lot_id: transfert.lot_id,
    source_id: transfert.destination_id,  // Distributeur
    destination_id: transfert.source_id,   // Fabricant
    raison,
    type: 'reception_rejet',
    timestamp: new Date().toISOString(),
    user_id: userId,
  });

  // 3. Créer un mouvement de réception rejeté
  // Même logique que validerReception : source = distributeur, destination = fabricant
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
      commentaire: `REJETÉ: ${raison} (Transfert #${transfertId})`,
      hash_mouvement: hash_rejet,
      created_by: userId || 'user',
    }])
    .select()
    .single();

  if (rejetError) {
    console.error('Erreur rejet réception:', rejetError);
    throw new Error('Erreur lors du rejet de la réception');
  }

  revalidatePath('/reception');
  revalidatePath('/mouvements');
  
  return rejet;
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
  distributeurNom?: string
) {
  const supabase = await createClient();
  
  // 1. Récupérer le transfert avec les informations de destination
  const { data: transfert, error: transfertError } = await supabase
    .from('mouvements')
    .select(`
      *,
      source:source_id (
        id,
        nom_entite,
        username,
        role
      ),
      destination:destination_id (
        id,
        nom_entite,
        username,
        role
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
  // Pour la réception : source_id = destination du transfert (distributeur), destination_id = source du transfert (fabricant)
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

  // 3. Déterminer le nom du distributeur à utiliser
  const nomDistributeur = distributeurNom || 
                          transfert.destination?.nom_entite || 
                          transfert.destination?.username || 
                          'Distributeur';

  // 4. Générer le hash pour la réception
  const hash_reception = generateMouvementHash({
    transfert_id: transfertId,
    lot_id: transfert.lot_id,
    source_id: transfert.destination_id,
    destination_id: transfert.source_id,
    quantite: transfert.quantite,
    type: 'reception',
    timestamp: new Date().toISOString(),
    user_id: userId,
    entite: nomDistributeur,
  });

  // 5. Créer le mouvement de réception
  // Logique : La source de la réception = le distributeur qui reçoit
  //          La destination de la réception = le fabricant qui a envoyé
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
      commentaire: `Réception du transfert #${transfertId} - ${transfert.quantite} ${transfert.type_unite || 'boite'}(s) par ${nomDistributeur}`,
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

  console.log('Réception créée avec succès:', {
    id: reception.id,
    source: {
      id: reception.source?.id,
      nom_entite: reception.source?.nom_entite,
      username: reception.source?.username,
      role: reception.source?.role
    },
    destination: {
      id: reception.destination?.id,
      nom_entite: reception.destination?.nom_entite,
      username: reception.destination?.username,
      role: reception.destination?.role
    },
    created_by: reception.created_by
  });

  revalidatePath('/reception');
  revalidatePath('/mouvements');
  
  return reception;
}