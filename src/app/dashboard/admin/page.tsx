'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Pill, Users, Package, Truck, LogOut, BarChart3, 
  Activity, Calendar, ChevronRight, Plus, Search 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLots: 0,
    activeShipments: 0,
    pendingValidations: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Compter les utilisateurs par rôle
      const { count: pharmacieCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'pharmacie');

      const { count: fabricantCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'fabricant');

      const { count: distributeurCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'distributeur');

      setStats({
        totalUsers: (pharmacieCount || 0) + (fabricantCount || 0) + (distributeurCount || 0),
        totalLots: 156, // À remplacer par vraie requête
        activeShipments: 12,
        pendingValidations: 8
      });

      // Activité récente (simulée)
      setRecentActivity([
        { id: 1, action: 'Nouveau lot créé', user: 'FAB001', time: '10 min', type: 'lot' },
        { id: 2, action: 'Validation pharmacie', user: 'PHA001', time: '25 min', type: 'validation' },
        { id: 3, action: 'Expédition en cours', user: 'DIS001', time: '1h', type: 'shipment' },
        { id: 4, action: 'Connexion utilisateur', user: 'ADM001', time: '2h', type: 'login' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const statCards = [
    { 
      title: 'UTILISATEURS', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'border-gray-300',
      bg: 'bg-gray-50'
    },
    { 
      title: 'LOTS ACTIFS', 
      value: stats.totalLots, 
      icon: Package, 
      color: 'border-black',
      bg: 'bg-white'
    },
    { 
      title: 'EXPÉDITIONS', 
      value: stats.activeShipments, 
      icon: Truck, 
      color: 'border-gray-300',
      bg: 'bg-gray-50'
    },
    { 
      title: 'EN ATTENTE', 
      value: stats.pendingValidations, 
      icon: Activity, 
      color: 'border-black',
      bg: 'bg-white'
    },
  ];

  const menuItems = [
    { label: 'Gestion des utilisateurs', icon: Users, href: '/dashboard/admin/users' },
    { label: 'Suivi des lots', icon: Package, href: '/dashboard/admin/lots' },
    { label: 'Validation des transactions', icon: Activity, href: '/dashboard/admin/validations' },
    { label: 'Rapports', icon: BarChart3, href: '/dashboard/admin/reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium tracking-wider">MEDTRACK ADMIN</h1>
                <p className="text-xs text-gray-500">{user?.matricule}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs tracking-wide">DÉCONNEXION</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.bg} border ${stat.color} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-2xl font-light">{stat.value}</span>
                </div>
                <p className="text-xs text-gray-500 tracking-wide">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Menu rapide */}
          <div className="col-span-2">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xs font-medium tracking-wider mb-4 text-gray-500">
                ACCÈS RAPIDE
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 hover:border-black transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-xs tracking-wide">{item.label}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-black" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xs font-medium tracking-wider mb-4 text-gray-500">
                ACTIVITÉ RÉCENTE
              </h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-1.5 h-1.5 bg-black mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.user} · {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section gestion des utilisateurs */}
        <div className="mt-6">
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium tracking-wider text-gray-500">
                UTILISATEURS RÉCENTS
              </h2>
              <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 hover:bg-black hover:text-white transition-colors">
                <Plus className="w-3 h-3" />
                <span className="text-xs">Ajouter</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-medium text-gray-500 tracking-wide">MATRICULE</th>
                    <th className="text-left py-2 text-xs font-medium text-gray-500 tracking-wide">NOM</th>
                    <th className="text-left py-2 text-xs font-medium text-gray-500 tracking-wide">RÔLE</th>
                    <th className="text-left py-2 text-xs font-medium text-gray-500 tracking-wide">STATUT</th>
                    <th className="text-left py-2 text-xs font-medium text-gray-500 tracking-wide">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-xs">PHA001</td>
                    <td className="py-2 text-xs">Pharmacie Centrale</td>
                    <td className="py-2 text-xs">Pharmacie</td>
                    <td className="py-2 text-xs">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs">
                        Actif
                      </span>
                    </td>
                    <td className="py-2">
                      <button className="text-xs text-gray-500 hover:text-black">Éditer</button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-xs">FAB001</td>
                    <td className="py-2 text-xs">Laboratoire XYZ</td>
                    <td className="py-2 text-xs">Fabricant</td>
                    <td className="py-2 text-xs">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs">
                        Actif
                      </span>
                    </td>
                    <td className="py-2">
                      <button className="text-xs text-gray-500 hover:text-black">Éditer</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}