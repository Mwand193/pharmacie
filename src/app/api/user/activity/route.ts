import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/session';
import { trackUserActivity } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('API Activity: Requête reçue');
    
    const body = await request.json();
    const { pageUrl, actionType = 'page_view', userId: explicitUserId } = body;
    
    console.log('API Activity: Données reçues', { 
      explicitUserId,
      pageUrl, 
      actionType 
    });

    // Méthode 1: Utiliser l'userId explicite si fourni
    let userId = explicitUserId;

    // Méthode 2: Sinon utiliser la session
    if (!userId) {
      const user = await getSession();
      if (!user) {
        console.log('API Activity: Utilisateur non authentifié');
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!pageUrl) {
      return NextResponse.json({ error: 'URL de page requise' }, { status: 400 });
    }

    // Récupérer l'IP et user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('API Activity: Tracking en cours pour user:', userId);
    
    // Track l'activité
    await trackUserActivity(userId, pageUrl, actionType, ipAddress, userAgent);

    console.log('API Activity: Activité enregistrée avec succès');

    return NextResponse.json({ 
      success: true,
      message: 'Activité enregistrée',
      userId: userId,
      activity: {
        pageUrl,
        actionType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('API Activity: Erreur tracking:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}