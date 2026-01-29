// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/utils/session'

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAuth('admin')

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}