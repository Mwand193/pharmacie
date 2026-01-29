
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if ((!username && !email) || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur/email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur par nom d'utilisateur OU email
    let query = supabase
      .from('users')
      .select('*');

    if (username) {
      query = query.or(`username.eq.${username},email.eq.${username}`);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: users, error } = await query;

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Vérifier si le compte est actif
    if (user.active === false) {
      return NextResponse.json(
        { error: 'Ce compte est désactivé. Contactez votre administrateur.' },
        { status: 403 }
      );
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Créer la session
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      departement: user.departement,
      privileged: user.privileged,
      profil_url: user.profil_url
    };

    // Stocker dans un cookie (durée de 7 jours)
    const cookieStore = await cookies();
    cookieStore.set('user', JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    return NextResponse.json({
  message: 'Connexion réussie',
  user: {
    ...sessionUser,
    requires_password_change: !user.last_login // ← AJOUT IMPORTANT
  }
});

  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Déconnexion
// export async function DELETE() {
//   try {
//     const cookieStore = await cookies();
//     cookieStore.delete('user');
    
//     return NextResponse.json({ message: 'Déconnexion réussie' });
//   } catch (error) {
//     console.error('Erreur de déconnexion:', error);
//     return NextResponse.json(
//       { error: 'Erreur lors de la déconnexion' },
//       { status: 500 }
//     );
//   }
// }
// app/api/auth/route.ts - Version simplifiée
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (userCookie) {
      const user = JSON.parse(userCookie.value);
      
      // Mettre à jour le statut de l'utilisateur
      await supabase
        .from('users')
        .update({ 
          is_online: false,
          last_logout: new Date().toISOString()
        })
        .eq('id', user.id);

      console.log(`🚪 Utilisateur ${user.username} déconnecté`);

      // NETTOYAGE : Mettre hors ligne tous les utilisateurs déconnectés depuis longtemps
      const { error: cleanupError } = await supabase
        .from('users')
        .update({ is_online: false })
        .eq('is_online', true)
        .lt('last_login', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24 heures

      if (cleanupError) {
        console.error('Erreur cleanup:', cleanupError);
      } else {
        console.log('✅ Utilisateurs inactifs nettoyés');
      }
    }

    // Supprimer le cookie
    cookieStore.delete('user');
    
    return NextResponse.json({ 
      message: 'Déconnexion réussie et nettoyage effectué' 
    });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}


// Dans la réponse réussie, remplacez cette partie :


// PAR CECI :
