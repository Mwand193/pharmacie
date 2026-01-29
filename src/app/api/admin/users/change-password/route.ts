// // app/api/admin/users/change-password/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import { getSession } from '@/utils/session';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getSession();
//     if (!session || session.role !== 'admin') {
//       return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
//     }

//     const { userId, newPassword } = await request.json();

//     const { error } = await supabase.rpc('change_user_password', {
//       p_user_id: userId,
//       p_new_password: newPassword,
//       p_modified_by: session.id
//     });

//     if (error) throw error;

//     return NextResponse.json({ message: 'Mot de passe modifié avec succès' });
//   } catch (error) {
//     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/utils/session';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { userId, newPassword } = await request.json();

    // Hasher le mot de passe avant de l'envoyer à la RPC
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const { error } = await supabase.rpc('change_user_password', {
      p_user_id: userId,
      p_new_password: hashedPassword, // Envoyer le hash au lieu du mot de passe en clair
      p_modified_by: session.id
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}