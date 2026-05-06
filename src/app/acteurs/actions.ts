
// app/acteurs/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Distributeur } from '@/types';

export async function createDistributeur(data: Partial<Distributeur>) {
  const supabase = await createClient();
  
  const { data: distributeur, error } = await supabase
    .from('distributeurs')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/acteurs');
  return distributeur;
}

export async function getDistributeurs() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('distributeurs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteDistributeur(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('distributeurs')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/acteurs');
}
