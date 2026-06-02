
'use client';

import { FileBox, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaPills, FaExchangeAlt, FaUsers, FaHome, FaTruckMoving, FaShieldAlt } from 'react-icons/fa';
import { FiBox } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Package } from 'lucide-react';
import { MdVerified, MdWarning } from 'react-icons/md';
import TunnelButton from '@/components/TunnelButton';
import DeployContractButton from '@/components/DeployContractButton';
// Définition des menus par rôle
const menuConfig = {
  admin: [
    { href: '/verify', label: '', icon: FaShieldAlt, tooltip: 'Vérifier un médicament' },
    //{ href: '/medicaments', label: '', icon: FaPills, tooltip: 'Gérer les médicaments' },
    //{ href: '/lots', label: 'Lots', icon: FiBox, tooltip: 'Gérer les lots' },
    { href: '/mouvements', label: 'Historique', icon: FaExchangeAlt, tooltip: 'Voir les mouvements' },
    { href: '/acteurs', label: 'Acteurs', icon: FaUsers, tooltip: 'Gérer les acteurs' },
   // { href: '/fournir-lot', label: 'Fournir', icon: FileBox, tooltip: 'Fournir un lot' },
   // { href: '/reception', label: 'Réception', icon: FaTruckMoving, tooltip: 'Réceptionner un lot' },
  ],
  fabricant: [
    { href: '/verify', label: '', icon: FaShieldAlt, tooltip: 'Vérifier un médicament' },
    { href: '/medicaments', label: 'Médicaments', icon: FaPills, tooltip: 'Gérer les médicaments' },
    { href: '/lots', label: 'Lots', icon: FiBox, tooltip: 'Gérer les lots' },
    { href: '/mouvements', label: 'Historique', icon: FaExchangeAlt, tooltip: 'Voir les mouvements' },
    { href: '/fournir-lot', label: 'Transfert', icon: FileBox, tooltip: 'Fournir un lot à un distributeur' },
    { href: '/retirer-lot', label: 'Retirer', icon: Trash2, tooltip: 'Retirer un lot du marché' },
  ],
  distributeur: [
    { href: '/verify', label: '', icon: FaShieldAlt, tooltip: 'Vérifier un médicament' },
        { href: '/distributeur', label: 'Mes Lots', icon: FiBox, tooltip: 'Gérer les lots' },
    { href: '/mouvements', label: 'Historique', icon: FaExchangeAlt, tooltip: 'Voir les mouvements' },

    { href: '/reception', label: 'Réception', icon: FaTruckMoving, tooltip: 'Réceptionner un lot' },
    { href: '/transfert-pharmacie', label: 'Transfert pharmacie', icon: Package, tooltip: 'Transférer un lot vers une pharmacie' },
    { href: '/anomalies', label: 'anomalie', icon: MdWarning, tooltip: 'Signaler une anomalie sur un lot' },
  ],
  pharmacie: [
    { href: '/verify', label: '', icon: FaShieldAlt, tooltip: 'Vérifier un médicament' },

    { href: '/pharmacie', label: 'Mes Lots', icon: Package, tooltip: 'Voir mes lots' },
    { href: '/mouvements', label: 'Historique', icon: FaExchangeAlt, tooltip: 'Voir l\'historique des mouvements' },
  ],
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Obtenir les items de navigation selon le rôle
  const getNavItems = () => {
    if (!user) return menuConfig.admin; // Fallback pour la page login
    return menuConfig[user.role as keyof typeof menuConfig] || menuConfig.admin;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'admin': 'Administrateur',
      'pharmacie': 'Pharmacie',
      'fabricant': 'Fabricant',
      'distributeur': 'Distributeur'
    };
    return roles[role] || role;
  };

  return (
    <nav className="bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img src='/logo.png' className='h-8 w-auto' alt='Logo' />
             
            <div className='mx-3'>
                <TunnelButton />
            </div>
            </div>
            
            {/* Navigation principale basée sur le rôle */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href + (item.label || Math.random().toString())}
                    href={item.href}
                    title={item.tooltip || item.label}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-green-500 text-green-700'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {isAuthenticated && user?.role === 'admin' && <DeployContractButton />}
             {/* <DeployContractButton /> */}

          {/* Partie droite : Utilisateur ou Connexion */}
          <div className="flex items-center">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title={`Profil de ${user.nom_entite || user.username}`}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nom_entite || user.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                </button>

                {/* Menu déroulant */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.nom_entite}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Matricule: {user.matricule}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'fabricant' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'pharmacie' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          title="Se déconnecter"
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                title="Se connecter"
                className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}