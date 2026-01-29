// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const currentUser = JSON.parse(userCookie.value);
    const updates = await request.json();

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.username) updateData.username = updates.username;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.profil_url) updateData.profil_url = updates.profil_url;
    
    // Mettre à jour le mot de passe si fourni
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 12);
    }

    // Mettre à jour dans Supabase
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Mettre à jour le cookie avec les nouvelles données
    const updatedUser = {
      ...currentUser,
      name: data.name,
      email: data.email,
      username: data.username,
      bio: data.bio,
      profil_url: data.profil_url
    };

    cookieStore.set('user', JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ message: 'Profil mis à jour', user: updatedUser });

  } catch (error: any) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}