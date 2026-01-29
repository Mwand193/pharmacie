// app/api/admin/users/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/utils/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { userId, active } = await request.json();

    const { error } = await supabase.rpc('toggle_user_account', {
      p_user_id: userId,
      p_active: active,
      p_modified_by: session.id
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Statut modifié avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}