// app/api/admin/users/toggle-privileged/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/utils/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { userId, privileged } = await request.json();

    if (!userId || typeof privileged !== 'boolean') {
      return NextResponse.json(
        { error: 'Données invalides: userId et privileged sont requis' },
        { status: 400 }
      );
    }

    // Appel à votre fonction RPC existante
    const { error } = await supabase.rpc('toggle_user_privileges', {
      p_user_id: userId,
      p_privileged: privileged,
      p_modified_by: session.id
    });

    if (error) {
      console.error('Erreur RPC toggle_user_privileges:', error);
      
      // Gestion des erreurs spécifiques
      if (error.message.includes('Seuls les administrateurs peuvent modifier les privilèges')) {
        return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
      }
      
      throw error;
    }

    return NextResponse.json({ 
      message: `Privilèges ${privileged ? 'activés' : 'désactivés'} avec succès` 
    });

  } catch (error) {
    console.error('Erreur toggle-privileged:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la modification des privilèges' },
      { status: 500 }
    );
  }
}