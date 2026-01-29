
// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';
import { getSession } from '@/utils/session';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, name, role, departement, privileged, bio } = await request.json();

    // Valider les données requises
    if (!username || !email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'username existe déjà
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 409 }
      );
    }

    // Vérifier si l'email existe déjà
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur dans la base de données
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        password: hashedPassword,
        name,
        role,
        departement: departement || null,
        privileged: privileged || false,
        bio: bio || null,
        active: true
      }])
      .select('id, username, email, name, role, departement, privileged, active, created_at')
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // const session = await getSession();
    // if (!session || session.role !== 'admin') {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}