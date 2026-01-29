
import { NextRequest, NextResponse } from 'next/server';
import { getOnlineUsers, getRecentActivity } from '@/lib/auth';
import { requireAuth } from '@/utils/session';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAuth('admin');
    
    const [onlineUsers, recentActivity] = await Promise.all([
      getOnlineUsers(),
      getRecentActivity(24)
    ]);

    // Récupérer le nombre total d'utilisateurs
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Erreur comptage utilisateurs:', countError);
    }

    // Formater les données récentes - prendre le dernier activité par user
    const recentUsersMap = new Map();
    
    recentActivity.forEach((activity: any) => {
      const userId = activity.users.id;
      const activityTime = new Date(activity.created_at);
      
      if (!recentUsersMap.has(userId) || activityTime > new Date(recentUsersMap.get(userId).last_activity)) {
        const isOnline = onlineUsers.some((online: any) => online.id === userId);
        
        recentUsersMap.set(userId, {
          ...activity.users,
          last_activity: activity.created_at,
          is_online: isOnline,
          current_page: activity.page_url
        });
      }
    });

    const recentUsers = Array.from(recentUsersMap.values())
      .sort((a: any, b: any) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());

    return NextResponse.json({
      activeSessions: onlineUsers.length,
      recentUsers: recentUsers,
      allUsers: totalUsers || 0,
      stats: {
        activeUsers: onlineUsers.length,
        recentUsers: recentUsers.length,
        allUsers: totalUsers || 0
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}