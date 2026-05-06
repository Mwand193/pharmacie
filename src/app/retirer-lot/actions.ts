// app/retirer-lot/actions.ts
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
  first_login: boolean;
  genre?: 'M' | 'F';
};

// export async function getLotsDisponibles(userId: string, userRole: string) {
//   const supabase = await createClient();
  
//   let query = supabase
//     .from('lots')
//     .select(`
//       *,
//       medicament:medicament_id (*)
//     `)
//     .gt('quantite_totale', 0)
//     .order('created_at', { ascending: false });

//   // Filtrer selon le rôle
//   if (userRole === 'fabricant') {
//     query = query.eq('fabricant_id', userId);
//   } else if (userRole === 'distributeur') {
//     // Pour le distributeur, on prend les lots qui ont été réceptionnés
//     const { data: receptions } = await supabase
//       .from('mouvements')
//       .select('lot_id')
//       .eq('type_mouvement', 'reception')
//       .eq('source_id', userId);

//     if (receptions && receptions.length > 0) {
//       const lotIds = receptions.map(r => r.lot_id);
//       query = query.in('id', lotIds);
//     } else {
//       return [];
//     }
//   }

//   const { data, error } = await query;

//   if (error) {
//     console.error('Erreur chargement lots:', error);
//     throw error;
//   }

//   return data || [];
// }

export async function retirerLotDefectueux(data: {
  lot_id: number;
  quantite: number;
  raison: string;
  currentUser: User;
}) {
  const supabase = await createClient();
  const { currentUser, ...retraitData } = data;
  
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
  
  // 2. Vérifier la quantité disponible
  if (lot.quantite_totale < retraitData.quantite) {
    throw new Error(`Quantité insuffisante. Disponible: ${lot.quantite_totale}`);
  }
  
  // 3. Vérifier les droits selon le rôle
  if (currentUser.role === 'fabricant') {
    if (lot.fabricant_id !== currentUser.id) {
      throw new Error('Vous ne pouvez retirer que vos propres lots');
    }
  }
  
  // 4. Générer le hash du mouvement
  const hash_mouvement = generateMouvementHash({
    lot_id: retraitData.lot_id,
    type: 'retrait_defectueux',
    source_id: currentUser.id,
    quantite: retraitData.quantite,
    raison: retraitData.raison,
    timestamp: new Date().toISOString(),
    created_by: currentUser.nom_entite,
  });

  // 5. Créer le mouvement de retrait
  const { data: mouvement, error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: retraitData.lot_id,
      type_mouvement: 'retrait_defectueux',
      source_id: currentUser.id,
      destination_id: null,
      quantite: retraitData.quantite,
      type_unite: lot.type_unite || 'boite',
      statut_avant: 'actif',
      statut_apres: 'defectueux',
      commentaire: `Retrait lot défectueux - ${retraitData.raison}. Lot #${lot.numero_lot} - ${lot.medicament?.nom || 'Médicament'}`,
      hash_mouvement: hash_mouvement,
      created_by: currentUser.nom_entite,
    }])
    .select()
    .single();

  if (mouvementError) {
    console.error('Erreur création mouvement:', mouvementError);
    throw new Error(`Erreur lors de la création du mouvement: ${mouvementError.message}`);
  }

  // 6. Mettre à jour la quantité du lot
  const nouvelleQuantite = lot.quantite_totale - retraitData.quantite;
  const { error: updateError } = await supabase
    .from('lots')
    .update({
      quantite_totale: nouvelleQuantite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', retraitData.lot_id);

  if (updateError) {
    console.error('Erreur mise à jour lot:', updateError);
    throw new Error('Erreur lors de la mise à jour du lot');
  }

  revalidatePath('/retirer-lot');
  revalidatePath('/mouvements');
  revalidatePath('/lots');
  
  return mouvement;
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
    // Le fabricant voit ses propres lots
    query = query.eq('fabricant_id', userId);
    
  } else if (userRole === 'distributeur') {
    // Le distributeur voit les lots qu'il a réceptionnés
    // Récupérer d'abord les IDs des lots réceptionnés par ce distributeur
    const { data: receptions, error: receptionsError } = await supabase
      .from('mouvements')
      .select('lot_id')
      .eq('type_mouvement', 'reception')
      .eq('source_id', userId)  // Le distributeur est la source de la réception
      .order('created_at', { ascending: false });

    if (receptionsError) {
      console.error('Erreur récupération réceptions:', receptionsError);
      return [];
    }

    if (receptions && receptions.length > 0) {
      // Récupérer les IDs uniques des lots
      const lotIds = [...new Set(receptions.map(r => r.lot_id))];
      console.log('Lots réceptionnés par le distributeur:', lotIds);
      query = query.in('id', lotIds);
    } else {
      console.log('Aucune réception trouvée pour ce distributeur');
      return [];
    }
    
  } else if (userRole === 'pharmacie') {
    // La pharmacie voit les lots qu'elle a achetés/reçus
    const { data: achats, error: achatsError } = await supabase
      .from('mouvements')
      .select('lot_id')
      .in('type_mouvement', ['vente_pharmacie', 'vente_patient'])
      .eq('destination_id', userId)
      .order('created_at', { ascending: false });

    if (achatsError) {
      console.error('Erreur récupération achats:', achatsError);
      return [];
    }

    if (achats && achats.length > 0) {
      const lotIds = [...new Set(achats.map(a => a.lot_id))];
      query = query.in('id', lotIds);
    } else {
      return [];
    }
    
  } else if (userRole === 'admin') {
    // L'admin voit tous les lots, pas de filtre supplémentaire
    console.log('Admin - accès à tous les lots');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur chargement lots:', error);
    throw error;
  }

  console.log('Lots trouvés:', data?.length || 0);
  if (data && data.length > 0) {
    console.log('Premier lot:', {
      id: data[0].id,
      numero_lot: data[0].numero_lot,
      medicament: data[0].medicament?.nom,
      quantite: data[0].quantite_totale
    });
  }

  return data || [];
}

