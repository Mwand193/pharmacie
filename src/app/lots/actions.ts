'use server';

import { createClient } from '@/lib/supabase/server';
import { generateLotNumber, generateLotHash, generateMouvementHash } from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';

// Type pour l'utilisateur
type User = {
  id: string;
  matricule: string;
  username: string;
  role: string;
  nom_entite: string;
  first_login: boolean;
  genre?: 'M' | 'F';
};

export async function createLot(data: {
  medicament_id: number;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
  currentUser: User; // Ajouter l'utilisateur en paramètre
}) {
  const supabase = await createClient();
  
  const { currentUser, ...lotData } = data;
  
  // Vérifier que l'utilisateur est un fabricant
  if (currentUser.role !== 'fabricant' && currentUser.role !== 'admin') {
    throw new Error('Seuls les fabricants peuvent créer des lots');
  }
  
  const numero_lot = generateLotNumber();
  const code_unique = `LOT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const hash_lot = generateLotHash(lotData.medicament_id, numero_lot, lotData.date_fabrication);
  
  // Données pour le QR code
  const qrData = {
    numero_lot,
    code_unique,
    hash_lot,
    medicament_id: lotData.medicament_id,
    date_fabrication: lotData.date_fabrication,
    date_expiration: lotData.date_expiration,
    created_by: currentUser.nom_entite,
  };
  
  const qr_content = JSON.stringify(qrData);

  try {
    // Créer le lot avec le created_by = nom_entite du fabricant connecté
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

    // Créer le mouvement de création
    const hash_mouvement = generateMouvementHash({
      lot_id: lot.id,
      type: 'creation_lot',
      timestamp: new Date().toISOString(),
      created_by: currentUser.nom_entite,
    });

    const { error: mouvementError } = await supabase
      .from('mouvements')
      .insert([{
        lot_id: lot.id,
        type_mouvement: 'creation_lot',
        quantite: lotData.quantite_totale,
        type_unite: 'boite',
        commentaire: `Création du lot ${numero_lot} par ${currentUser.nom_entite}`,
        hash_mouvement,
        created_by: currentUser.nom_entite,
      }]);

    if (mouvementError) {
      console.error('Erreur création mouvement:', mouvementError);
    }

    revalidatePath('/lots');
    return lot;
    
  } catch (error) {
    console.error('Erreur complète:', error);
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
  
//   const lotsWithStatus = await Promise.all(data.map(async (lot) => {
//     const { data: mouvements, error: mouvementError } = await supabase
//       .from('mouvements')
//       .select('id')
//       .eq('lot_id', lot.id)
//       .in('type_mouvement', ['transfert_pharmacie', 'transfert_distributeur'])
//       .limit(1);
    
//     if (mouvementError) {
//       console.error('Erreur vérification mouvements:', mouvementError);
//     }
    
//     const hasTransferts = mouvements && mouvements.length > 0;
    
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
//       statut
//     };
//   }));
  
//   return lotsWithStatus;
// }

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

export async function transfertLot(data: {
  lot_id: number;
  quantite: number;
  destination_type: 'pharmacie' | 'distributeur';
  destination_id: number;
  commentaire?: string;
  currentUser: User; // Ajouter l'utilisateur en paramètre
}) {
  const supabase = await createClient();
  const { currentUser, ...transfertData } = data;
  
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('*')
    .eq('id', transfertData.lot_id)
    .single();
    
  if (lotError || !lot) {
    throw new Error('Lot non trouvé');
  }
  
  if (lot.quantite_totale < transfertData.quantite) {
    throw new Error('Quantité insuffisante');
  }
  
  const type_mouvement = transfertData.destination_type === 'pharmacie' 
    ? 'transfert_pharmacie' 
    : 'transfert_distributeur';
  
  const hash_mouvement = generateMouvementHash({
    lot_id: transfertData.lot_id,
    type: type_mouvement,
    quantite: transfertData.quantite,
    timestamp: new Date().toISOString(),
    created_by: currentUser.nom_entite,
  });
  
  const nouvelleQuantite = lot.quantite_totale - transfertData.quantite;
  const { error: updateError } = await supabase
    .from('lots')
    .update({ 
      quantite_totale: nouvelleQuantite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transfertData.lot_id);
    
  if (updateError) {
    throw new Error('Erreur lors de la mise à jour du lot');
  }
  
  const { error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfertData.lot_id,
      type_mouvement: type_mouvement,
      quantite: transfertData.quantite,
      destination_type: transfertData.destination_type,
      destination_id: transfertData.destination_id,
      commentaire: transfertData.commentaire || `Transfert de ${transfertData.quantite} unités par ${currentUser.nom_entite}`,
      hash_mouvement,
      created_by: currentUser.nom_entite,
    }]);
    
  if (mouvementError) {
    throw new Error('Erreur lors de la création du mouvement');
  }
  
  revalidatePath('/lots');
  return { success: true, nouvelleQuantite };
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


// app/lots/actions.ts
// Ajoutez cette fonction à la fin du fichier existant

export async function deleteLotWithoutMovements(lotId: number) {
  const supabase = await createClient();
  
  try {
    // Vérifier d'abord si le lot a des mouvements
    const { data: mouvements, error: mouvementError } = await supabase
      .from('mouvements')
      .select('id')
      .eq('lot_id', lotId);
    
    if (mouvementError) {
      throw new Error('Erreur lors de la vérification des mouvements');
    }
    
    // Si des mouvements existent, ne pas supprimer
    if (mouvements && mouvements.length > 0) {
      throw new Error('Ce lot a des mouvements associés et ne peut pas être supprimé');
    }
    
    // Supprimer le lot
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

// Fonction pour vérifier si un lot a des mouvements
export async function checkLotMovements(lotId: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mouvements')
    .select('id')
    .eq('lot_id', lotId)
    .not('type_mouvement', 'eq', 'creation_lot'); // Exclure le mouvement de création
    
  if (error) throw error;
  
  return {
    hasMovements: data && data.length > 0,
    movementsCount: data?.length || 0
  };
}




// Modifiez la fonction getLots existante
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
  
  const lotsWithStatus = await Promise.all(data.map(async (lot) => {
    const { data: mouvements, error: mouvementError } = await supabase
      .from('mouvements')
      .select('id')
      .eq('lot_id', lot.id);
    
    if (mouvementError) {
      console.error('Erreur vérification mouvements:', mouvementError);
    }
    
    const totalMovements = mouvements?.length || 0;
    // Exclure le mouvement de création du comptage
    const { data: transfertsOnly } = await supabase
      .from('mouvements')
      .select('id')
      .eq('lot_id', lot.id)
      .in('type_mouvement', ['transfert_pharmacie', 'transfert_distributeur']);
    
    const hasTransferts = transfertsOnly && transfertsOnly.length > 0;
    const isDeletable = totalMovements <= 1; // Seulement le mouvement de création
    
    let statut = 'disponible';
    if (new Date(lot.date_expiration) < new Date()) {
      statut = 'expire';
    } else if (lot.quantite_totale === 0) {
      statut = 'epuise';
    } else if (hasTransferts) {
      statut = 'partiel';
    }
    
    return {
      ...lot,
      statut,
      hasMovements: totalMovements > 1, // Vrai si plus que le mouvement de création
      isDeletable
    };
  }));
  
  return lotsWithStatus;
}