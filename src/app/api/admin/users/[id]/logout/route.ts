
// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // ✅ AWAIT les params
//     const { id } = await params;
//     const userId = id;

//     // Vérifier que l'utilisateur existe
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('id, username, active')
//       .eq('id', userId)
//       .single();

//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Utilisateur non trouvé' },
//         { status: 404 }
//       );
//     }

//     if (!user.active) {
//       return NextResponse.json(
//         { error: 'Utilisateur déjà désactivé' },
//         { status: 400 }
//       );
//     }

//     // Mettre à jour l'utilisateur pour le déconnecter
//     const { error: updateError } = await supabase
//       .from('users')
//       .update({ 
//         active: false,
//         last_logout: new Date().toISOString()
//       })
//       .eq('id', userId);

//     if (updateError) {
//       console.error('Erreur lors du logout:', updateError);
//       return NextResponse.json(
//         { error: 'Erreur lors de la déconnexion' },
//         { status: 500 }
//       );
//     }

//     // Optionnel: Ajouter une entrée dans les logs d'activité
//     await supabase
//       .from('user_activity')
//       .insert({
//         user_id: userId,
//         page_url: '/admin/logout',
//         action_type: 'forced_logout',
//         ip_address: '0.0.0.0',
//         user_agent: request.headers.get('user-agent') || 'Admin'
//       });

//     return NextResponse.json({
//       success: true,
//       message: `Utilisateur ${user.username} déconnecté avec succès`
//     });

//   } catch (error) {
//     console.error('Erreur API logout:', error);
//     return NextResponse.json(
//       { error: 'Erreur interne du serveur' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Correction ici
) {
  try {
    // ✅ Récupérer les params avec await
    const { id } = await context.params; // ✅ Correction ici
    const userId = id;

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: 'Utilisateur déjà désactivé' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur pour le déconnecter
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        active: false,
        last_logout: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Erreur lors du logout:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion' },
        { status: 500 }
      );
    }

    // Optionnel: Ajouter une entrée dans les logs d'activité
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        page_url: '/admin/logout',
        action_type: 'forced_logout',
        ip_address:  '0.0.0.0',
        user_agent: request.headers.get('user-agent') || 'Admin'
      });

    return NextResponse.json({
      success: true,
      message: `Utilisateur ${user.username} déconnecté avec succès`
    });

  } catch (error) {
    console.error('Erreur API logout:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}