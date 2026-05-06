'use server';

import { createClient } from '@/lib/supabase/server';
import { generateMouvementHash } from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';
import type { Mouvement } from '@/types';

export async function getMouvements() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (
        *,
        medicament:medicament_id (*)
      ),
      source:source_id (
        id, matricule, username, nom_entite, role
      ),
      destination:destination_id (
        id, matricule, username, nom_entite, role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMouvement(data: {
  lot_id: number;
  type_mouvement: string;
  source_id?: number;
  destination_id?: number;
  quantite?: number;
  type_unite?: string;
  commentaire?: string;
  created_by: string;
}) {
  const supabase = await createClient();
  
  const hash_mouvement = generateMouvementHash({
    ...data,
    timestamp: new Date().toISOString(),
  });

  const { data: mouvement, error } = await supabase
    .from('mouvements')
    .insert([{
      ...data,
      hash_mouvement,
    }])
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/mouvements');
  return mouvement;
}