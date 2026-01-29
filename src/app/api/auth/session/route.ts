//api/auth/session
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return NextResponse.json({ user: null });
    }

    const sessionUser = JSON.parse(userCookie.value);
    
    // Récupérer les données fraîches depuis la base
    const user = await getUserById(sessionUser.id);

    if (!user || user.active === false) {
      // Supprimer le cookie si l'user n'existe plus ou est désactivé
      cookieStore.delete('user');
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ user: null });
  }
}