
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { 
//   FiUsers, 
//   FiActivity, 
//   FiUserCheck, 
//   FiTrendingUp,
//   FiRefreshCw,
//   FiUser,
//   FiClock,
//   FiCircle,
//   FiRadio,
//   FiGlobe,
//   FiFilter,
//   FiX,
//   FiSearch
// } from 'react-icons/fi';
// import { RealTimeClock } from '@/components/RealTimeClock';

// interface OnlineUser {
//   id: string;
//   username: string;
//   name: string;
//   email: string;
//   role: string;
//   departement?: string;
//   last_activity: string;
//   is_online: boolean;
//   profil_url?: string;
//   active: boolean;
//   current_page?: string;
//   login_duration?: string;
// }

// interface SessionStats {
//   onlineNow: number;
//   activeToday: number;
//   totalUsers: number;
//   peakToday: number;
// }

// interface LogoutResponse {
//   success: boolean;
//   message: string;
// }

// export default function RecentSessionsPage() {
//   const [recentUsers, setRecentUsers] = useState<OnlineUser[]>([]);
//   const [stats, setStats] = useState<SessionStats>({
//     onlineNow: 0,
//     activeToday: 0,
//     totalUsers: 0,
//     peakToday: 0
//   });
//   const [logoutLoading, setLogoutLoading] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdate, setLastUpdate] = useState<string>('');
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [showFilters, setShowFilters] = useState(false);
//   const [filter, setFilter] = useState({
//     role: '',
//     status: '',
//     search: ''
//   });

// // Ajoutez cette fonction
// const handleForceLogout = async (userId: string, username: string) => {
//   if (!confirm(`Êtes-vous sûr de vouloir déconnecter l'utilisateur ${username} ?`)) {
//     return;
//   }

//   try {
//     setLogoutLoading(userId);
    
//     const response = await fetch(`/api/admin/users/${userId}/logout`, {
//       method: 'POST',
//     });

//     if (!response.ok) {
//       throw new Error('Erreur lors de la déconnexion');
//     }

//     const result: LogoutResponse = await response.json();
    
//     // Recharger les données
//     await loadSessionData();
    
//     // Afficher un message de succès
//     alert(result.message);
    
//   } catch (error) {
//     console.error('Erreur déconnexion:', error);
//     alert('Erreur lors de la déconnexion de l\'utilisateur');
//   } finally {
//     setLogoutLoading(null);
//   }
// };
//   const loadSessionData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/admin/sessions/recent');

//       if (response.ok) {
//         const data = await response.json();
//         setRecentUsers(data.recentUsers || []);
        
//         setStats(data.stats || {
//           onlineNow: 0,
//           activeToday: data.recentUsers?.length || 0,
//           totalUsers: 0,
//           peakToday: 0
//         });
//       }

//       setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
//     } catch (error) {
//       console.error('Erreur chargement sessions:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSessionData();

//     if (autoRefresh) {
//       const interval = setInterval(loadSessionData, 10000);
//       return () => clearInterval(interval);
//     }
//   }, [autoRefresh]);

//   // Filtrer les utilisateurs
//   const filteredUsers = recentUsers.filter(user => {
//     const matchesRole = !filter.role || user.role === filter.role;
//     const matchesStatus = !filter.status || 
//       (filter.status === 'online' && user.is_online) ||
//       (filter.status === 'offline' && !user.is_online);
//     const matchesSearch = !filter.search || 
//       user.name.toLowerCase().includes(filter.search.toLowerCase()) ||
//       user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
//       user.departement?.toLowerCase().includes(filter.search.toLowerCase());
    
//     return matchesRole && matchesStatus && matchesSearch;
//   });

//   const getTimeAgo = (dateString: string) => {
//     if (!dateString) return 'Jamais';
    
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now.getTime() - date.getTime();
//       const diffSecs = Math.floor(diffMs / 1000);
//       const diffMins = Math.floor(diffMs / (1000 * 60));
      
//       if (diffSecs < 30) return 'À l\'instant';
//       if (diffSecs < 60) return `${diffSecs}s`;
//       if (diffMins < 60) return `${diffMins}min`;
      
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//       if (diffHours < 24) return `${diffHours}h`;
      
//       return `${Math.floor(diffHours / 24)}j`;
//     } catch (error) {
//       return 'Date invalide';
//     }
//   };

//   const getRoleConfig = (role: string) => {
//     const configs = {
//       admin: { 
//         color: 'bg-red-100 text-red-800 border-red-200', 
//         label: 'Admin',
//         icon: <FiUserCheck className="w-3 h-3" />
//       },
//       check_in_admin: { 
//         color: 'bg-orange-100 text-orange-800 border-orange-200', 
//         label: 'Check-in',
//         icon: <FiUserCheck className="w-3 h-3" />
//       },
//       teacher: { 
//         color: 'bg-blue-100 text-blue-800 border-blue-200', 
//         label: 'Enseignant',
//         icon: <FiUsers className="w-3 h-3" />
//       },
//       student: { 
//         color: 'bg-green-100 text-green-800 border-green-200', 
//         label: 'Étudiant',
//         icon: <FiUser className="w-3 h-3" />
//       },
//       alumni: { 
//         color: 'bg-purple-100 text-purple-800 border-purple-200', 
//         label: 'Alumni',
//         icon: <FiActivity className="w-3 h-3" />
//       }
//     };
    
//     return configs[role as keyof typeof configs] || { 
//       color: 'bg-gray-100 text-gray-800 border-gray-200', 
//       label: role,
//       icon: <FiUser className="w-3 h-3" />
//     };
//   };

//   const getStatusConfig = (isOnline: boolean) => {
//     return isOnline ? {
//       color: 'text-green-600 bg-green-50 border-green-200',
//       label: 'En ligne',
//       icon: <FiRadio className="w-3 h-3 animate-pulse" />
//     } : {
//       color: 'text-gray-600 bg-gray-50 border-gray-200',
//       label: 'Hors ligne',
//       icon: <FiCircle className="w-3 h-3" />
//     };
//   };

//   const getUniqueRoles = () => {
//     const roles = recentUsers.map(user => user.role).filter(Boolean);
//     return Array.from(new Set(roles));
//   };

//   const forceRefresh = () => {
//     loadSessionData();
//   };

//   const resetFilters = () => {
//     setFilter({ role: '', status: '', search: '' });
//   };

//   const handleSearch = () => {
//     // Déclenche un re-filtrage si nécessaire
//     loadSessionData();
//   };

//   if (loading && recentUsers.length === 0) {
//     return (
//       <div className="animate-pulse">
//         <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="h-20 bg-gray-200 rounded"></div>
//           <div className="h-20 bg-gray-200 rounded"></div>
//           <div className="h-20 bg-gray-200 rounded"></div>
//           <div className="h-20 bg-gray-200 rounded"></div>
//         </div>
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="h-16 bg-gray-200 rounded mb-4"></div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Header avec bouton filtre */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900">Activité des Utilisateurs</h2>
//          <p className="text-sm text-gray-600">
//   Surveillance en temps réel • {filteredUsers.length} utilisateurs
//   <span className="text-gray-500"> • MAJ: <RealTimeClock /></span>
// </p>
//         </div>
//         <div className="flex items-center gap-3">
//           {/* Bouton Filtres */}
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
//               showFilters 
//                 ? 'bg-blue-50 text-blue-700 border-blue-200' 
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             <FiFilter className="w-4 h-4" />
//             Filtres
//             {Object.values(filter).some(value => value) && (
//               <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                 {Object.values(filter).filter(Boolean).length}
//               </span>
//             )}
//           </button>

//           {/* Bouton Auto-refresh */}
//           <button
//             onClick={() => setAutoRefresh(!autoRefresh)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
//               autoRefresh 
//                 ? 'bg-green-50 text-green-700 border-green-200' 
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
//             Auto
//           </button>

//           {/* Bouton Actualiser */}
//           <button
//             onClick={forceRefresh}
//             className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
//           >
//             <FiRefreshCw className="w-4 h-4" />
           
//           </button>

//           {/* Bouton Gestion utilisateurs */}
//           <Link
//             href="/admin/users"
//             className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm transition-colors"
//           >
//             <FiUsers className="w-4 h-4" />
//             Users
//           </Link>
//         </div>
//       </div>

//       {/* Filtres Améliorés - Bloc pliable */}
//       {showFilters && (
//         <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
//               <FiFilter className="w-4 h-4" />
//               Filtres des utilisateurs
//             </h3>
//             <button
//               onClick={() => setShowFilters(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <FiX className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Recherche */}
//             <div>
//               <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <FiSearch className="w-4 h-4" />
//                 Recherche
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Nom, email, département..."
//                   value={filter.search}
//                   onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 />
//                 <button
//                   onClick={handleSearch}
//                   className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                 >
//                   <FiSearch className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
            
//             {/* Rôle */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Rôle
//               </label>
//               <select
//                 value={filter.role}
//                 onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//               >
//                 <option value="">Tous les rôles</option>
//                 {getUniqueRoles().map(role => (
//                   <option key={role} value={role}>
//                     {getRoleConfig(role).label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Statut */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Statut
//               </label>
//               <select
//                 value={filter.status}
//                 onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//               >
//                 <option value="">Tous les statuts</option>
//                 <option value="online">En ligne</option>
//                 <option value="offline">Hors ligne</option>
//               </select>
//             </div>
//           </div>

//           {/* Filtres actifs */}
//           {(filter.role || filter.status || filter.search) && (
//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className="text-sm text-gray-600">Filtres actifs:</span>
//                 {filter.search && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Recherche: {filter.search}
//                     <button onClick={() => setFilter(prev => ({ ...prev, search: '' }))}>
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filter.role && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Rôle: {getRoleConfig(filter.role).label}
//                     <button onClick={() => setFilter(prev => ({ ...prev, role: '' }))}>
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filter.status && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Statut: {filter.status === 'online' ? 'En ligne' : 'Hors ligne'}
//                     <button onClick={() => setFilter(prev => ({ ...prev, status: '' }))}>
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 <button
//                   onClick={resetFilters}
//                   className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
//                 >
//                   <FiX className="w-4 h-4" />
//                   Tout effacer
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Statistics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         {[
//           { 
//             label: 'En ligne maintenant', 
//             value: stats.onlineNow, 
//             color: 'text-green-600', 
//             bgColor: 'bg-green-50',
//             icon: <FiRadio className="w-5 h-5 text-green-600" />
//           },
//           { 
//             label: 'Actifs aujourd\'hui', 
//             value: stats.activeToday, 
//             color: 'text-blue-600',
//             bgColor: 'bg-blue-50',
//             icon: <FiActivity className="w-5 h-5 text-blue-600" />
//           },
//           { 
//             label: 'Total utilisateurs', 
//             value: stats.totalUsers, 
//             color: 'text-gray-600',
//             bgColor: 'bg-gray-50',
//             icon: <FiUsers className="w-5 h-5 text-gray-600" />
//           },
//           { 
//             label: 'Pic aujourd\'hui', 
//             value: stats.peakToday, 
//             color: 'text-orange-600',
//             bgColor: 'bg-orange-50',
//             icon: <FiTrendingUp className="w-5 h-5 text-orange-600" />
//           }
//         ].map((stat, index) => (
//           <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
//                 <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
//               </div>
//               <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                 {stat.icon}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Main Content */}
//       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//         {/* Table Header */}
//         <div className="border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Utilisateurs récents ({filteredUsers.length})
//             </h3>
//             <span className="text-sm text-gray-500">
//               Dernières 24 heures
//             </span>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {filteredUsers.map((user) => {
//                 const roleConfig = getRoleConfig(user.role);
//                 const statusConfig = getStatusConfig(user.is_online);
                
//                 return (
//                   <tr key={user.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-3">
//                         <div className="relative">
//                           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
//                             {user.profil_url ? (
//                               <img 
//                                 className="w-10 h-10 rounded-lg object-cover" 
//                                 src={user.profil_url} 
//                                 alt={user.name} 
//                               />
//                             ) : (
//                               user.name.charAt(0).toUpperCase()
//                             )}
//                           </div>
//                           {user.is_online && (
//                             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
//                           )}
//                         </div>
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                           <div className="text-xs text-gray-500">{user.email}</div>
//                           {user.current_page && (
//                             <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
//                               <FiGlobe className="w-3 h-3" />
//                               <span className="truncate max-w-xs" title={user.current_page}>
//                                 {user.current_page.replace(/^https?:\/\//, '')}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         {roleConfig.icon}
//                         <span className={`px-2 py-1 rounded text-xs font-medium border ${roleConfig.color}`}>
//                           {roleConfig.label}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-600">
//                         {user.departement || '-'}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <FiClock className="w-4 h-4 text-gray-400" />
//                         <span className="font-medium">{getTimeAgo(user.last_activity)}</span>
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {new Date(user.last_activity).toLocaleTimeString('fr-FR')}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
//                         {statusConfig.icon}
//                         <span>{statusConfig.label}</span>
//                       </div>
//                       {user.login_duration && user.is_online && (
//                         <div className="text-xs text-gray-500 mt-1">
//                           Connecté depuis {user.login_duration}
//                         </div>
//                       )}
//                     </td>
//                      <td className="px-6 py-4 whitespace-nowrap">
//               <div className="flex items-center gap-2">
//                 {/* Bouton Forcer la déconnexion */}
//                 <button
//                   onClick={() => handleForceLogout(user.id, user.username)}
//                   disabled={logoutLoading === user.id || !user.is_online}
//                   className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
//                     logoutLoading === user.id || !user.is_online
//                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                       : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
//                   }`}
//                   title={!user.is_online ? 'Utilisateur déjà hors ligne' : 'Forcer la déconnexion'}
//                 > {logoutLoading === user.id ? (
//                     <FiRefreshCw className="w-3 h-3 animate-spin" />
//                   ) : (
//                     <FiX className="w-3 h-3" />
//                   )}
//                   {logoutLoading === user.id ? 'Déconnexion...' : 'Déconnecter'}

//                 </button>
//                  <Link
//                   href={`/admin/users/${user.id}`}
//                   className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 border border-blue-200 transition-colors"
//                 >
//                   <FiUser className="w-3 h-3" />
//                   Profil
//                 </Link>
//               </div>
//             </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Empty State */}
//         {filteredUsers.length === 0 && (
//           <div className="text-center py-12">
//             <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//               <FiUsers className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
//             <p className="text-gray-500 text-sm">
//               Aucun utilisateur ne correspond à vos critères de recherche.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiActivity, 
  FiUserCheck, 
  FiTrendingUp,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiCircle,
  FiRadio,
  FiGlobe,
  FiFilter,
  FiX,
  FiSearch,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { RealTimeClock } from '@/components/RealTimeClock';

interface OnlineUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  departement?: string;
  last_activity: string;
  is_online: boolean;
  profil_url?: string;
  active: boolean;
  current_page?: string;
  login_duration?: string;
}

interface SessionStats {
  onlineNow: number;
  activeToday: number;
  totalUsers: number;
  peakToday: number;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export default function RecentSessionsPage() {
  const [recentUsers, setRecentUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    onlineNow: 0,
    activeToday: 0,
    totalUsers: 0,
    peakToday: 0
  });
  const [logoutLoading, setLogoutLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filter, setFilter] = useState({
    role: '',
    status: '',
    search: ''
  });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleForceLogout = async (userId: string, username: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter l'utilisateur ${username} ?`)) {
      return;
    }

    try {
      setLogoutLoading(userId);
      
      const response = await fetch(`/api/admin/users/${userId}/logout`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion');
      }

      const result: LogoutResponse = await response.json();
      await loadSessionData();
      alert(result.message);
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      alert('Erreur lors de la déconnexion de l\'utilisateur');
    } finally {
      setLogoutLoading(null);
    }
  };

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sessions/recent');

      if (response.ok) {
        const data = await response.json();
        setRecentUsers(data.recentUsers || []);
        
        setStats(data.stats || {
          onlineNow: 0,
          activeToday: data.recentUsers?.length || 0,
          totalUsers: 0,
          peakToday: 0
        });
      }

      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionData();

    if (autoRefresh) {
      const interval = setInterval(loadSessionData, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const checkScrollButtons = () => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = recentUsers.filter(user => {
    const matchesRole = !filter.role || user.role === filter.role;
    const matchesStatus = !filter.status || 
      (filter.status === 'online' && user.is_online) ||
      (filter.status === 'offline' && !user.is_online);
    const matchesSearch = !filter.search || 
      user.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
      user.departement?.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Jamais';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffSecs < 30) return 'À l\'instant';
      if (diffSecs < 60) return `${diffSecs}s`;
      if (diffMins < 60) return `${diffMins}min`;
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) return `${diffHours}h`;
      
      return `${Math.floor(diffHours / 24)}j`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getRoleConfig = (role: string) => {
    const configs = {
      admin: { 
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700', 
        label: 'Admin',
        icon: <FiUserCheck className="w-3 h-3" />
      },
      check_in_admin: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700', 
        label: 'Check-in',
        icon: <FiUserCheck className="w-3 h-3" />
      },
      teacher: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700', 
        label: 'Enseignant',
        icon: <FiUsers className="w-3 h-3" />
      },
      student: { 
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700', 
        label: 'Étudiant',
        icon: <FiUser className="w-3 h-3" />
      },
      alumni: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700', 
        label: 'Alumni',
        icon: <FiActivity className="w-3 h-3" />
      }
    };
    
    return configs[role as keyof typeof configs] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600', 
      label: role,
      icon: <FiUser className="w-3 h-3" />
    };
  };

  const getStatusConfig = (isOnline: boolean) => {
    return isOnline ? {
      color: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900 dark:border-green-700',
      label: 'En ligne',
      icon: <FiRadio className="w-3 h-3 animate-pulse" />
    } : {
      color: 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600',
      label: 'Hors ligne',
      icon: <FiCircle className="w-3 h-3" />
    };
  };

  const getUniqueRoles = () => {
    const roles = recentUsers.map(user => user.role).filter(Boolean);
    return Array.from(new Set(roles));
  };

  const forceRefresh = () => {
    loadSessionData();
  };

  const resetFilters = () => {
    setFilter({ role: '', status: '', search: '' });
  };

  const handleSearch = () => {
    loadSessionData();
  };

  if (loading && recentUsers.length === 0) {
    return (
      <div className="animate-pulse dark:bg-gray-900 min-h-screen ">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
          <div className="mb-4 lg:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Sessions Récentes
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base text-gray-600 dark:text-gray-400"
            >
              Surveillance en temps réel • {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
              <span className="text-gray-500 dark:text-gray-500"> • MAJ: <RealTimeClock /></span>
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {/* Bouton Filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                showFilters 
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <FiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
              {Object.values(filter).some(value => value) && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filter).filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Bouton Statistiques */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                showStats 
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            {/* Bouton Auto-refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                autoRefresh 
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
              <span className="hidden sm:inline">Auto</span>
            </button>

            {/* Bouton Actualiser */}
            <button
              onClick={forceRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            {/* Bouton Gestion utilisateurs */}
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm transition-colors"
            >
              <FiUsers className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </Link>
          </motion.div>
        </div>

        {/* Statistics Grid - Caché par défaut */}
        <AnimatePresence>
          {showStats && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { 
                    label: 'En ligne maintenant', 
                    value: stats.onlineNow, 
                    color: 'text-green-600 dark:text-green-400', 
                    bgColor: 'bg-green-50 dark:bg-green-900',
                    icon: <FiRadio className="w-4 h-4 sm:w-5 sm:h-5" />
                  },
                  { 
                    label: 'Actifs aujourd\'hui', 
                    value: stats.activeToday, 
                    color: 'text-blue-600 dark:text-blue-400',
                    bgColor: 'bg-blue-50 dark:bg-blue-900',
                    icon: <FiActivity className="w-4 h-4 sm:w-5 sm:h-5" />
                  },
                  { 
                    label: 'Total utilisateurs', 
                    value: stats.totalUsers, 
                    color: 'text-gray-600 dark:text-gray-300',
                    bgColor: 'bg-gray-50 dark:bg-gray-800',
                    icon: <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
                  },
                  { 
                    label: 'Pic aujourd\'hui', 
                    value: stats.peakToday, 
                    color: 'text-orange-600 dark:text-orange-400',
                    bgColor: 'bg-orange-50 dark:bg-orange-900',
                    icon: <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-lg sm:text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg dark:text-gray-200 ${stat.bgColor}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtres Améliorés - Bloc pliable */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiFilter className="w-4 h-4" />
                    Filtres des utilisateurs
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Recherche */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiSearch className="w-4 h-4" />
                      Recherche
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nom, email, département..."
                        value={filter.search}
                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleSearch}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FiSearch className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Rôle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rôle
                    </label>
                    <select
                      value={filter.role}
                      onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Tous les rôles</option>
                      {getUniqueRoles().map(role => (
                        <option key={role} value={role}>
                          {getRoleConfig(role).label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="online">En ligne</option>
                      <option value="offline">Hors ligne</option>
                    </select>
                  </div>
                </div>

                {/* Filtres actifs */}
                {(filter.role || filter.status || filter.search) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Filtres actifs:</span>
                      {filter.search && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Recherche: {filter.search}
                          <button onClick={() => setFilter(prev => ({ ...prev, search: '' }))}>
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filter.role && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Rôle: {getRoleConfig(filter.role).label}
                          <button onClick={() => setFilter(prev => ({ ...prev, role: '' }))}>
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filter.status && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Statut: {filter.status === 'online' ? 'En ligne' : 'Hors ligne'}
                          <button onClick={() => setFilter(prev => ({ ...prev, status: '' }))}>
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      <button
                        onClick={resetFilters}
                        className="ml-auto text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <FiX className="w-4 h-4" />
                        Tout effacer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Table Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
                Utilisateurs récents ({filteredUsers.length})
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Dernières 24 heures
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dernière activité
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  const statusConfig = getStatusConfig(user.is_online);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                              {user.profil_url ? (
                                <img 
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" 
                                  src={user.profil_url} 
                                  alt={user.name} 
                                />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            {user.is_online && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {user.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </div>
                            {user.current_page && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                                <FiGlobe className="w-3 h-3" />
                                <span className="truncate max-w-[100px] sm:max-w-xs" title={user.current_page}>
                                  {user.current_page.replace(/^https?:\/\//, '')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          {roleConfig.icon}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${roleConfig.color}`}>
                            <span className="hidden sm:inline">{roleConfig.label}</span>
                            <span className="sm:hidden">{roleConfig.label.split(' ')[0]}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[100px] sm:max-w-none">
                          {user.departement || '-'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{getTimeAgo(user.last_activity)}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(user.last_activity).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className={`flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span className="hidden sm:inline">{statusConfig.label}</span>
                          <span className="sm:hidden">{statusConfig.label.split(' ')[0]}</span>
                        </div>
                        {user.login_duration && user.is_online && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Connecté depuis {user.login_duration}
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Bouton Forcer la déconnexion */}
                          <button
                            onClick={() => handleForceLogout(user.id, user.username)}
                            disabled={logoutLoading === user.id || !user.is_online}
                            className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded text-xs font-medium transition-colors ${
                              logoutLoading === user.id || !user.is_online
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-800'
                            }`}
                            title={!user.is_online ? 'Utilisateur déjà hors ligne' : 'Forcer la déconnexion'}
                          >
                            {logoutLoading === user.id ? (
                              <FiRefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <FiX className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">
                              {logoutLoading === user.id ? 'Déconnexion...' : 'Déconnecter'}
                            </span>
                          </button>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800 transition-colors"
                          >
                            <FiUser className="w-3 h-3" />
                            <span className="hidden sm:inline">Profil</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucun utilisateur ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer avec indicateur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg px-3 py-2 flex items-center gap-4 text-xs"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-gray-600 dark:text-gray-400">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <FiUsers className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">{filteredUsers.length} users</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <FiActivity className="w-3 h-3 text-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">{stats.onlineNow} en ligne</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}