import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity, getOnlineUsers } from '@/lib/auth';
import { requireAuth } from '@/utils/session';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAuth('admin');
    
    const [onlineUsers, recentActivity, { count: totalUsers }] = await Promise.all([
      getOnlineUsers(),
      getRecentActivity(24),
      supabase.from('users').select('*', { count: 'exact', head: true })
    ]);

    // Formater les données récentes
    const recentUsersMap = new Map();
    
    recentActivity.forEach((activity: any) => {
      const userId = activity.users.id;
      const activityTime = new Date(activity.created_at);
      const isOnline = onlineUsers.some((online: any) => online.id === userId);
      
      if (!recentUsersMap.has(userId) || activityTime > new Date(recentUsersMap.get(userId).last_activity)) {
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
      recentUsers: recentUsers,
      stats: {
        onlineNow: onlineUsers.length,
        activeToday: recentUsers.length,
        totalUsers: totalUsers || 0,
        peakToday: Math.max(onlineUsers.length, recentUsers.length) // Estimation
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}