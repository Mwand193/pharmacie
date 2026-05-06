// app/medicaments/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Medicament } from '@/types';

export async function createMedicament(data: Partial<Medicament>) {
  const supabase = await createClient();
  
  const { data: medicament, error } = await supabase
    .from('medicaments')
    .insert([{
      code_cis: data.code_cis || null,
      nom: data.nom,
      dosage: data.dosage || null,
      forme: data.forme || null,
      type_unite: data.type_unite || 'boite',
      description: data.description || null,
      image_base64: data.image_base64 || null,
    }])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/medicaments');
  return medicament;
}

export async function getMedicaments() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('medicaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Medicament[];
}

export async function getMedicamentById(id: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('medicaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Medicament;
}

export async function updateMedicament(id: number, data: Partial<Medicament>) {
  const supabase = await createClient();
  
  const { data: medicament, error } = await supabase
    .from('medicaments')
    .update({
      code_cis: data.code_cis,
      nom: data.nom,
      dosage: data.dosage,
      forme: data.forme,
      type_unite: data.type_unite,
      description: data.description,
      image_base64: data.image_base64,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/medicaments');
  return medicament;
}

export async function deleteMedicament(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('medicaments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/medicaments');
}