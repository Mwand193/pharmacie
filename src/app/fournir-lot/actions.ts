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
  
  // Vérifier la quantité disponible
  if (lot.quantite_totale < transfertData.quantite) {
    throw new Error('Quantité insuffisante dans le lot');
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
  
  // 2. Créer le hash du mouvement
  const hash_mouvement = generateMouvementHash({
    lot_id: transfertData.lot_id,
    type: 'transfert',
    source_id: currentUser.id,
    destination_id: transfertData.destination_id,
    quantite: transfertData.quantite,
    timestamp: new Date().toISOString(),
    created_by: currentUser.nom_entite,
  });

  // 3. Créer le mouvement
  const { data: mouvement, error: mouvementError } = await supabase
    .from('mouvements')
    .insert([{
      lot_id: transfertData.lot_id,
      type_mouvement: 'transfert',
      source_id: currentUser.id,           // ID du fabricant (users)
      destination_id: transfertData.destination_id, // ID du distributeur (users)
      quantite: transfertData.quantite,
      type_unite: 'boite',
      commentaire: transfertData.commentaire || `Transfert de ${transfertData.quantite} unités de ${currentUser.nom_entite} vers ${destination.nom_entite}`,
      hash_mouvement: hash_mouvement,
      created_by: currentUser.nom_entite,
    }])
    .select()
    .single();

  if (mouvementError) {
    console.error('Erreur création mouvement:', mouvementError);
    throw new Error(`Erreur lors de la création du mouvement: ${mouvementError.message}`);
  }

  // 4. Mettre à jour la quantité du lot
  const nouvelleQuantite = lot.quantite_totale - transfertData.quantite;
  const { error: updateError } = await supabase
    .from('lots')
    .update({
      quantite_totale: nouvelleQuantite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transfertData.lot_id);

  if (updateError) {
    console.error('Erreur mise à jour lot:', updateError);
    throw new Error('Erreur lors de la mise à jour du lot');
  }

  revalidatePath('/fournir-lot');
  revalidatePath('/mouvements');
  revalidatePath('/lots');
  
  return mouvement;
}