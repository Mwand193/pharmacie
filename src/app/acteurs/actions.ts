
// app/admin/acteurs/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { userBlockchainService } from '@/lib/userBlockchain';

// Créer un utilisateur
// export async function createUser(data: {
//   matricule: string;
//   username: string;
//   password: string;
//   role: 'admin' | 'pharmacie' | 'fabricant' | 'distributeur';
//   genre?: 'M' | 'F' | null;
// }) {
//   const supabase = await createClient();
  
//   const { data: user, error } = await supabase
//     .from('users')
//     .insert([{
//       ...data,
//       first_login: true,
//     }])
//     .select()
//     .single();

//   if (error) throw error;
  
//   revalidatePath('/admin/acteurs');
//   return user;
// }

// // Mettre à jour un utilisateur
// export async function updateUser(id: number, data: {
//   matricule?: string;
//   username?: string;
//   password?: string;
//   role?: 'admin' | 'pharmacie' | 'fabricant' | 'distributeur';
//   genre?: 'M' | 'F' | null;
// }) {
//   const supabase = await createClient();
  
//   const updateData: any = {
//     ...data,
//     updated_at: new Date().toISOString(),
//   };

//   if (!data.password) {
//     delete updateData.password;
//   }

//   const { data: user, error } = await supabase
//     .from('users')
//     .update(updateData)
//     .eq('id', id)
//     .select()
//     .single();

//   if (error) throw error;
  
//   revalidatePath('/admin/acteurs');
//   return user;
// }

// Supprimer un utilisateur
export async function deleteUser(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/admin/acteurs');
}

// Récupérer tous les utilisateurs
export async function getUsers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Assigner une adresse Ethereum
export async function assignEthereumAddress(userId: number) {
  try {
    const result = await userBlockchainService.assignEthereumAccount(userId);
    revalidatePath('/admin/acteurs');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Vérifier l'intégrité de l'adresse
export async function verifyAddressIntegrity(userId: number) {
  try {
    const isValid = await userBlockchainService.verifyAddressIntegrity(userId);
    revalidatePath('/admin/acteurs');
    return { success: true, isValid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtenir les infos blockchain d'un utilisateur
export async function getUserBlockchainInfo(userId: number) {
  try {
    const info = await userBlockchainService.getUserBlockchainInfo(userId);
    return { success: true, data: info };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Assigner des adresses à tous les utilisateurs qui n'en ont pas
export async function assignAllMissingAddresses() {
  const supabase = await createClient();
  
  try {
    // Récupérer les utilisateurs sans adresse
    const { data: usersWithoutAddress } = await supabase
      .from('users')
      .select('id')
      .is('ethereum_address', null);

    if (!usersWithoutAddress || usersWithoutAddress.length === 0) {
      return { success: true, message: 'Tous les utilisateurs ont déjà une adresse', count: 0 };
    }

    let assignedCount = 0;
    const errors: string[] = [];

    for (const user of usersWithoutAddress) {
      try {
        await userBlockchainService.assignEthereumAccount(user.id);
        assignedCount++;
      } catch (error: any) {
        errors.push(`Utilisateur #${user.id}: ${error.message}`);
      }
    }

    revalidatePath('/admin/acteurs');

    return {
      success: errors.length === 0,
      message: `${assignedCount} adresse(s) assignée(s)`,
      count: assignedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



// app/admin/acteurs/actions.ts

// Créer un utilisateur (avec nom_entite obligatoire)
export async function createUser(data: {
  matricule: string;
  username: string;
  password: string;
  role: 'admin' | 'pharmacie' | 'fabricant' | 'distributeur';
  genre?: 'M' | 'F' | null;
  nom_entite: string; // ← MAINTENANT OBLIGATOIRE
}) {
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      ...data,
      first_login: true,
    }])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/admin/acteurs');
  return user;
}

// Mettre à jour un utilisateur
export async function updateUser(id: number, data: {
  matricule?: string;
  username?: string;
  password?: string;
  role?: 'admin' | 'pharmacie' | 'fabricant' | 'distributeur';
  genre?: 'M' | 'F' | null;
  nom_entite?: string; // ← AJOUTÉ
}) {
  const supabase = await createClient();
  
  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (!data.password) {
    delete updateData.password;
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/admin/acteurs');
  return user;
}