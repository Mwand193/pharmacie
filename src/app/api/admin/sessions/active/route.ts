// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import { requireAuth } from '@/utils/session';

// export async function GET(request: NextRequest) {
//   try {
//     const admin = await requireAuth('admin');
    
//     const { data: activeUsers, error } = await supabase
//       .from('users')
//       .select('id, username, name, role, last_login, profil_url')
//       .not('last_login', 'is', null)
//       .gte('last_login', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // 30 minutes
//       .order('last_login', { ascending: false });

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ activeUsers: activeUsers || [] });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 401 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getRecentlyActiveUsers } from '@/lib/auth';
import { requireAuth } from '@/utils/session';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAuth('admin');
    
    // Utilisateurs actifs dans les 30 dernières minutes
    const activeUsers = await getRecentlyActiveUsers(0.5); // 0.5 heure = 30 minutes
    
    return NextResponse.json({ 
      activeUsers: activeUsers.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        departement: user.departement,
        profil_url: user.profil_url,
        last_login: user.last_login
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}