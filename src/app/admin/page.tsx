'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function SimpleAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    setUser(userData);
  }, [router]);

  const menuItems = [
    { name: 'Utilisateurs', path: '/admin/users', icon: UserGroupIcon, color: 'blue' },
    { name: 'Étudiants', path: '/admin/students', icon: AcademicCapIcon, color: 'green' },
    { name: 'Statistiques', path: '/admin/stats', icon: ChartBarIcon, color: 'purple' },
    { name: 'Paramètres', path: '/admin/config', icon: Cog6ToothIcon, color: 'gray' },
  ];

  if (!user) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header simple */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {user.username}
          </h1>
          <p className="text-gray-600">Administrateur • {user.matricule}</p>
        </div>

        {/* Menu en grille simple */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                href={item.path}
                className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-lg bg-${item.color}-100 w-fit mb-4`}>
                  <Icon className={`h-6 w-6 text-${item.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Gérer cette section</p>
              </a>
            );
          })}
        </div>

        {/* Logout button */}
        <div className="mt-8">
          <button
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}