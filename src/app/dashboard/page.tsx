'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    students: 0
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    
    if (userData.role !== 'admin') {
      router.push('/student');
      return;
    }
    
    setUser(userData);
    fetchStats();
    setLoading(false);
  }, [router]);

  const fetchStats = async () => {
    try {
      const { count: total } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: admins } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      const { count: students } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      setStats({
        totalUsers: total || 0,
        admins: admins || 0,
        students: students || 0
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-medium">Administration</h1>
              <div className="text-sm text-gray-600">
                {user?.username} • {user?.matricule}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Utilisateurs</div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              {stats.admins} admins • {stats.students} étudiants
            </div>
          </div>

          <div className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Administrateurs</div>
                <div className="text-2xl font-bold">{stats.admins}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-green-600">
              Connecté en tant qu'admin
            </div>
          </div>

          <div className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Étudiants</div>
                <div className="text-2xl font-bold">{stats.students}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              Gérer les comptes
            </div>
          </div>
        </div>

        {/* Menu */}
        <h2 className="text-lg font-medium mb-4">Gestion</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a href="/admin/users" className="block">
            <div className="border rounded p-4 hover:border-blue-300">
              <div className="flex justify-between mb-3">
                <div className="text-gray-600">Utilisateurs</div>
                <div className="text-xl font-bold">{stats.totalUsers}</div>
              </div>
              <div className="text-sm text-gray-600">Gérer les utilisateurs</div>
            </div>
          </a>

          <a href="/admin/students" className="block">
            <div className="border rounded p-4 hover:border-blue-300">
              <div className="flex justify-between mb-3">
                <div className="text-gray-600">Étudiants</div>
                <div className="text-xl font-bold">{stats.students}</div>
              </div>
              <div className="text-sm text-gray-600">Gérer les étudiants</div>
            </div>
          </a>

          <a href="/admin/stats" className="block">
            <div className="border rounded p-4 hover:border-blue-300">
              <div className="mb-3">
                <div className="text-gray-600">Statistiques</div>
              </div>
              <div className="text-sm text-gray-600">Voir les statistiques</div>
            </div>
          </a>

          <a href="/admin/config" className="block">
            <div className="border rounded p-4 hover:border-blue-300">
              <div className="mb-3">
                <div className="text-gray-600">Paramètres</div>
              </div>
              <div className="text-sm text-gray-600">Configurer le système</div>
            </div>
          </a>
        </div>

        {/* Actions */}
        <div className="border rounded p-6">
          <h3 className="font-medium mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/admin/users/create" className="block">
              <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded">
                <div className="font-medium text-gray-900">Nouvel utilisateur</div>
              </div>
            </a>

            <a href="/admin/users" className="block">
              <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded">
                <div className="font-medium text-gray-900">Liste complète</div>
              </div>
            </a>

            <button
              onClick={fetchStats}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded text-left"
            >
              <div className="font-medium text-gray-900">Actualiser</div>
            </button>

            <button
              onClick={handleLogout}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded text-left"
            >
              <div className="font-medium text-gray-900">Déconnexion</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}