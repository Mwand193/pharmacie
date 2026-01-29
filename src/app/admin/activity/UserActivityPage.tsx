
// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { supabase } from '@/lib/supabase';
// import { debounce } from 'lodash';
// import { 
//   FiSearch, 
//   FiFilter, 
//   FiX, 
//   FiRefreshCw,
//   FiUser,
//   FiGlobe,
//   FiCalendar,
//   FiClock,
//   FiSmartphone,
//   FiMonitor,
//   FiEye,
//   FiLogIn,
//   FiLogOut,
//   FiPlus,
//   FiEdit,
//   FiTrash2
// } from 'react-icons/fi';

// interface UserActivity {
//   id: string;
//   user_id: string;
//   page_url: string;
//   action_type: string;
//   user_agent: string;
//   ip_address: string;
//   created_at: string;
//   users?: {
//     id: string;
//     username: string;
//     email: string;
//     name: string;
//     role: string;
//     departement: string;
//     active: boolean;
//     last_login: string;
//     created_at: string;
//   };
// }

// export default function UserActivityPage() {
//   const [activities, setActivities] = useState<UserActivity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState({
//     user: '',
//     actionType: '',
//     pageUrl: '',
//     dateRange: ''
//   });
//   const [searchTrigger, setSearchTrigger] = useState(0);
//   const [showFilters, setShowFilters] = useState(false);

//   // Debounced search function
//   const debouncedSearch = useCallback(
//     debounce(() => {
//       setSearchTrigger(prev => prev + 1);
//     }, 500),
//     []
//   );

//   useEffect(() => {
//     fetchUserActivities();
//   }, [searchTrigger, filter.actionType, filter.dateRange]);

//   useEffect(() => {
//     debouncedSearch();
//     return () => debouncedSearch.cancel();
//   }, [filter.user, filter.pageUrl, debouncedSearch]);

//   // Nouvelle fonction getDateRange corrigée
// const getDateRange = (range: string) => {
//   const now = new Date();
//   let startDate: Date | null = null;
//   let endDate: Date | null = null;

//   switch (range) {
//     case 'today':
//       startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
//       break;
    
//     case 'yesterday':
//       const yesterday = new Date(now);
//       yesterday.setDate(yesterday.getDate() - 1);
//       startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
//       endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
//       break;
    
//     case 'week':
//       startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
//       break;
    
//     case 'month':
//       startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
//       endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
//       break;
    
//     default:
//       return { startDate: null, endDate: null };
//   }

//   console.log(`Filtre ${range}:`, { 
//     start: startDate?.toISOString(), 
//     end: endDate?.toISOString() 
//   });

//   return { startDate, endDate };
// };
// const fetchUserActivities = async () => {
//   try {
//     setLoading(true);
    
//     let query = supabase
//       .from('user_activity')
//       .select(`
//         *,
//         users (
//           id,
//           username,
//           email,
//           name,
//           role,
//           departement,
//           active,
//           last_login,
//           created_at
//         )
//       `)
//       .order('created_at', { ascending: false })
//       .limit(100);

//     // CORRECTION: Filtre utilisateur avec sous-requête
//     if (filter.user) {
//       // D'abord, on récupère les IDs des utilisateurs qui matchent
//       const { data: matchingUsers, error: usersError } = await supabase
//         .from('users')
//         .select('id')
//         .or(`username.ilike.%${filter.user}%,email.ilike.%${filter.user}%,name.ilike.%${filter.user}%`);

//       if (usersError) throw usersError;

//       if (matchingUsers && matchingUsers.length > 0) {
//         const userIds = matchingUsers.map(user => user.id);
//         query = query.in('user_id', userIds);
//       } else {
//         // Aucun utilisateur trouvé, on retourne un tableau vide
//         setActivities([]);
//         return;
//       }
//     }
    
//     // Filtre type d'action
//     if (filter.actionType) {
//       query = query.eq('action_type', filter.actionType);
//     }
    
//     // Filtre page URL
//     if (filter.pageUrl) {
//       query = query.ilike('page_url', `%${filter.pageUrl}%`);
//     }

//     // CORRECTION: Filtre par période avec gestion complète
//     if (filter.dateRange) {
//       const { startDate, endDate } = getDateRange(filter.dateRange);
      
//       if (startDate) {
//         query = query.gte('created_at', startDate.toISOString());
//       }
//       if (endDate) {
//         query = query.lte('created_at', endDate.toISOString());
//       }
//     }

//     const { data, error } = await query;

//     if (error) {
//       console.error('Erreur Supabase:', error);
//       throw error;
//     }

//     console.log('Activités chargées:', data?.length);
//     setActivities(data || []);
//   } catch (error) {
//     console.error('Erreur lors du chargement des activités:', error);
//     // S'assurer que l'état est mis à jour même en cas d'erreur
//     setActivities([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Alternative plus robuste pour le filtre utilisateur
//   const fetchUserActivitiesAlternative = async () => {
//     try {
//       setLoading(true);
      
//       // Construction manuelle de la requête
//       let query = supabase
//         .from('user_activity')
//         .select(`
//           *,
//           users (
//             id,
//             username,
//             email,
//             name,
//             role,
//             departement,
//             active,
//             last_login,
//             created_at
//           )
//         `)
//         .order('created_at', { ascending: false })
//         .limit(100);

//       // Filtre utilisateur - APPROCHE ALTERNATIVE
//       if (filter.user) {
//         // On filtre d'abord sans le filtre utilisateur, puis on filtre côté client
//         // Cette approche est plus fiable
//         const { data, error } = await query;
        
//         if (error) throw error;
        
//         // Filtrage côté client pour l'utilisateur
//         let filteredData = data || [];
//         if (filter.user) {
//           filteredData = filteredData.filter(activity => 
//             activity.users?.name?.toLowerCase().includes(filter.user.toLowerCase()) ||
//             activity.users?.email?.toLowerCase().includes(filter.user.toLowerCase()) ||
//             activity.users?.username?.toLowerCase().includes(filter.user.toLowerCase())
//           );
//         }
        
//         // Application des autres filtres côté client si nécessaire
//         if (filter.actionType) {
//           filteredData = filteredData.filter(activity => 
//             activity.action_type === filter.actionType
//           );
//         }
        
//         if (filter.pageUrl) {
//           filteredData = filteredData.filter(activity => 
//             activity.page_url?.toLowerCase().includes(filter.pageUrl.toLowerCase())
//           );
//         }
        
//         if (filter.dateRange) {
//           const startDate = new Date();
//           switch (filter.dateRange) {
//             case 'today':
//               startDate.setHours(0, 0, 0, 0);
//               break;
//             case 'yesterday':
//               startDate.setDate(startDate.getDate() - 1);
//               startDate.setHours(0, 0, 0, 0);
//               break;
//             case 'week':
//               startDate.setDate(startDate.getDate() - 7);
//               break;
//             case 'month':
//               startDate.setMonth(startDate.getMonth() - 1);
//               break;
//           }
          
//           filteredData = filteredData.filter(activity => 
//             new Date(activity.created_at) >= startDate
//           );
//         }
        
//         setActivities(filteredData);
//         return;
//       }

//       // Si pas de filtre utilisateur, on utilise la requête normale
//       const { data, error } = await query;

//       if (error) {
//         throw error;
//       }

//       setActivities(data || []);
//     } catch (error: any) {
//       console.error('Erreur lors du chargement des activités:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const browserIcons: { [key: string]: string } = {
//     chrome: '/icons/browsers/chrome.png',
//     firefox: '/icons/browsers/firefox.png',
//     safari: '/icons/browsers/safari.png',
//     edge: '/icons/browsers/edge.png',
//     opera: '/icons/browsers/opera.png',
//     default: '/icons/browsers/default.png'
//   };

//   const getBrowserInfo = (userAgent: string) => {
//     if (!userAgent) return { name: 'Inconnu', icon: 'default' };

//     const ua = userAgent.toLowerCase();
    
//     if (ua.includes('chrome') && !ua.includes('edg')) return { name: 'Chrome', icon: 'chrome' };
//     if (ua.includes('firefox')) return { name: 'Firefox', icon: 'firefox' };
//     if (ua.includes('safari') && !ua.includes('chrome')) return { name: 'Safari', icon: 'safari' };
//     if (ua.includes('edg')) return { name: 'Edge', icon: 'edge' };
//     if (ua.includes('opera')) return { name: 'Opera', icon: 'opera' };
    
//     return { name: 'Navigateur', icon: 'default' };
//   };

//   const getDeviceInfo = (userAgent: string) => {
//     if (!userAgent) return { type: 'Desktop', icon: <FiMonitor className="text-gray-600" /> };

//     const ua = userAgent.toLowerCase();
    
//     if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
//       return { type: 'Mobile', icon: <FiSmartphone className="text-blue-500" /> };
//     }
//     if (ua.includes('tablet') || ua.includes('ipad')) {
//       return { type: 'Tablette', icon: <FiSmartphone className="text-purple-500" /> };
//     }
    
//     return { type: 'Desktop', icon: <FiMonitor className="text-gray-600" /> };
//   };

//   const getActionConfig = (actionType: string) => {
//     const configs = {
//       login: { 
//         color: 'bg-green-100 text-green-800 border-green-200', 
//         label: 'Connexion', 
//         icon: <FiLogIn className="text-green-600" />
//       },
//       logout: { 
//         color: 'bg-red-100 text-red-800 border-red-200', 
//         label: 'Déconnexion', 
//         icon: <FiLogOut className="text-red-600" />
//       },
//       page_view: { 
//         color: 'bg-blue-100 text-blue-800 border-blue-200', 
//         label: 'Page visitée', 
//         icon: <FiEye className="text-blue-600" />
//       },
//       create: { 
//         color: 'bg-purple-100 text-purple-800 border-purple-200', 
//         label: 'Création', 
//         icon: <FiPlus className="text-purple-600" />
//       },
//       update: { 
//         color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
//         label: 'Modification', 
//         icon: <FiEdit className="text-yellow-600" />
//       },
//       delete: { 
//         color: 'bg-red-100 text-red-800 border-red-200', 
//         label: 'Suppression', 
//         icon: <FiTrash2 className="text-red-600" />
//       }
//     };
    
//     return configs[actionType as keyof typeof configs] || { 
//       color: 'bg-gray-100 text-gray-800 border-gray-200', 
//       label: actionType, 
//       icon: <FiEye className="text-gray-600" />
//     };
//   };

//   const getRoleConfig = (role: string) => {
//     const configs = {
//       admin: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Admin' },
//       teacher: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Enseignant' },
//       student: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Étudiant' },
//       alumni: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Alumni' }
//     };
    
//     return configs[role as keyof typeof configs] || { 
//       color: 'bg-gray-100 text-gray-800 border-gray-200', 
//       label: role 
//     };
//   };

//   const getTimeAgo = (dateString: string) => {
//     if (!dateString) return 'Jamais';
    
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now.getTime() - date.getTime();
//       const diffMins = Math.floor(diffMs / (1000 * 60));
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
//       if (diffMins < 1) return 'À l\'instant';
//       if (diffMins < 60) return `${diffMins}min`;
//       if (diffHours < 24) return `${diffHours}h`;
      
//       return `${Math.floor(diffHours / 24)}j`;
//     } catch (error) {
//       return 'Date invalide';
//     }
//   };

//  const getUniqueActionTypes = () => {
//   const types = activities
//     .map(activity => activity.action_type)
//     .filter(Boolean); // Filtrer les valeurs nulles
//   return Array.from(new Set(types));
// };

//   const handleSearch = () => {
//     setSearchTrigger(prev => prev + 1);
//   };

//   const resetFilters = () => {
//     setFilter({ user: '', actionType: '', pageUrl: '', dateRange: '' });
//     setSearchTrigger(prev => prev + 1);
//   };

//   const formatDateRange = (range: string) => {
//     const formats: { [key: string]: string } = {
//       'today': "Aujourd'hui",
//       'yesterday': 'Hier',
//       'week': '7 derniers jours',
//       'month': '30 derniers jours',
//       '': 'Toutes périodes'
//     };
//     return formats[range] || range;
//   };

//   // TEST: Fonction pour debugger les dates
//   const testDateFilter = () => {
//     const testCases = ['today', 'yesterday', 'week', 'month'];
    
//     testCases.forEach(testCase => {
//       const startDate = new Date();
//       switch (testCase) {
//         case 'today':
//           startDate.setHours(0, 0, 0, 0);
//           break;
//         case 'yesterday':
//           startDate.setDate(startDate.getDate() - 1);
//           startDate.setHours(0, 0, 0, 0);
//           break;
//         case 'week':
//           startDate.setDate(startDate.getDate() - 7);
//           break;
//         case 'month':
//           startDate.setMonth(startDate.getMonth() - 1);
//           break;
//       }
//       console.log(`Test ${testCase}:`, {
//         startDate: startDate.toISOString(),
//         local: startDate.toLocaleString('fr-FR')
//       });
//     });
//   };

//   // Décommentez cette ligne pour tester les dates
//   // useEffect(() => { testDateFilter(); }, []);

//   if (loading && activities.length === 0) {
//     return (
//       <div className="animate-pulse">
//         <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="h-10 bg-gray-200 rounded"></div>
//           <div className="h-10 bg-gray-200 rounded"></div>
//           <div className="h-10 bg-gray-200 rounded"></div>
//           <div className="h-10 bg-gray-200 rounded"></div>
//         </div>
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Header avec bouton filtre */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900">Journal d'Activité</h2>
//           <p className="text-sm text-gray-600">{activities.length} activités trouvées</p>
//         </div>
//         <div className="flex items-center gap-3">
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
//           <button
//             onClick={fetchUserActivities}
//             className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
//           >
//             <FiRefreshCw className="w-4 h-4" />
//             Actualiser
//           </button>
//         </div>
//       </div>

//       {/* Filtres Améliorés - Bloc pliable */}
//       {showFilters && (
//         <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
//               <FiFilter className="w-4 h-4" />
//               Filtres de recherche
//             </h3>
//             <button
//               onClick={() => setShowFilters(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <FiX className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <label className="bloc text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <FiUser className="w-4 h-4" />
//                 Utilisateur
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Nom, email..."
//                   value={filter.user}
//                   onChange={(e) => setFilter(prev => ({ ...prev, user: e.target.value }))}
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
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Type d'action
//               </label>
//               <select
//                 value={filter.actionType}
//                 onChange={(e) => setFilter(prev => ({ ...prev, actionType: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//               >
//                 <option value="">Tous les types</option>
//                 {getUniqueActionTypes().map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label className="bloc text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <FiGlobe className="w-4 h-4" />
//                 Page
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="URL de la page..."
//                   value={filter.pageUrl}
//                   onChange={(e) => setFilter(prev => ({ ...prev, pageUrl: e.target.value }))}
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

//             <div>
//               <label className="bloc text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <FiCalendar className="w-4 h-4" />
//                 Période
//               </label>
//               <select
//                 value={filter.dateRange}
//                 onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//               >
//                 <option value="">Toutes périodes</option>
//                 <option value="today">Aujourd'hui</option>
//                 <option value="yesterday">Hier</option>
//                 <option value="week">7 derniers jours</option>
//                 <option value="month">30 derniers jours</option>
//               </select>
//             </div>
//           </div>

//           {/* Filtres actifs */}
//           {(filter.user || filter.actionType || filter.pageUrl || filter.dateRange) && (
//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className="text-sm text-gray-600">Filtres actifs:</span>
//                 {filter.user && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Utilisateur: {filter.user}
//                     <button onClick={() => setFilter(prev => ({ ...prev, user: '' }))}>
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filter.actionType && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Action: {filter.actionType}
//                     <button onClick={() => setFilter(prev => ({ ...prev, actionType: '' }))}>
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filter.pageUrl && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Page: {filter.pageUrl}
//                     <button onClick={() => setFilter(prev => ({ ...prev, pageUrl: '' }))}>
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filter.dateRange && (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Période: {formatDateRange(filter.dateRange)}
//                     <button onClick={() => setFilter(prev => ({ ...prev, dateRange: '' }))}>
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
//           { label: 'Total activités', value: activities.length, color: 'text-gray-600', icon: <FiClock className="w-5 h-5" /> },
// { label: 'Utilisateurs uniques', value: Array.from(new Set(activities.map(a => a.user_id))).length, color: 'text-blue-600', icon: <FiUser className="w-5 h-5" /> },          { label: 'Types d\'actions', value: getUniqueActionTypes().length, color: 'text-purple-600', icon: <FiFilter className="w-5 h-5" /> },
// { label: 'Pages visitées', value: Array.from(new Set(activities.map(a => a.page_url))).length, color: 'text-green-600', icon: <FiGlobe className="w-5 h-5" /> }        ].map((stat, index) => (
//           <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
//                 <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
//               </div>
//               <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg').replace('-600', '-100')}`}>
//                 {stat.icon}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Main Content */}
//       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appareil</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temps</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {activities.map((activity) => {
//                 const browserInfo = getBrowserInfo(activity.user_agent);
//                 const deviceInfo = getDeviceInfo(activity.user_agent);
//                 const actionConfig = getActionConfig(activity.action_type);
//                 const roleConfig = getRoleConfig(activity.users?.role || '');
                
//                 return (
//                   <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
//                           {activity.users?.name?.charAt(0).toUpperCase() || '?'}
//                         </div>
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {activity.users?.name || activity.users?.username || 'N/A'}
//                           </div>
//                           <div className="text-xs text-gray-500">{activity.users?.email}</div>
//                           <div className="flex items-center gap-1 mt-1">
//                             <span className={`px-2 py-1 rounded text-xs font-medium border ${roleConfig.color}`}>
//                               {roleConfig.label}
//                             </span>
//                             {activity.users?.departement && (
//                               <span className="text-xs text-gray-500">• {activity.users.departement}</span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         {actionConfig.icon}
//                         <span className={`px-2 py-1 rounded text-xs font-medium border ${actionConfig.color}`}>
//                           {actionConfig.label}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900 max-w-xs truncate" title={activity.page_url}>
//                         {activity.page_url || 'N/A'}
//                       </div>
//                       <div className="text-xs text-gray-500 truncate max-w-xs">
//                         {activity.ip_address}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <img 
//                           src={browserIcons[browserInfo.icon] || browserIcons.default} 
//                           alt={browserInfo.name}
//                           width={20}
//                           height={20}
//                           className="rounded"
//                         />
//                         <span>{browserInfo.name}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
//                         {deviceInfo.icon}
//                         <span>{deviceInfo.type}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-600 font-medium">
//                         {getTimeAgo(activity.created_at)}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {new Date(activity.created_at).toLocaleTimeString('fr-FR')}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Empty State */}
//         {activities.length === 0 && (
//           <div className="text-center py-12">
//             <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//               <FiFilter className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité</h3>
//             <p className="text-gray-500 text-sm">
//               Aucune activité ne correspond à vos critères de recherche.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiRefreshCw,
  FiUser,
  FiGlobe,
  FiCalendar,
  FiClock,
  FiSmartphone,
  FiMonitor,
  FiEye,
  FiLogIn,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { debounce } from 'lodash';

interface UserActivity {
  id: string;
  user_id: string;
  page_url: string;
  action_type: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  users?: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    departement: string;
    active: boolean;
    last_login: string;
    created_at: string;
  };
}

export default function UserActivityPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    user: '',
    actionType: '',
    pageUrl: '',
    dateRange: ''
  });
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      setSearchTrigger(prev => prev + 1);
    }, 500),
    []
  );

  useEffect(() => {
    fetchUserActivities();
  }, [searchTrigger, filter.actionType, filter.dateRange]);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [filter.user, filter.pageUrl, debouncedSearch]);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchUserActivities, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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

  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_activity')
        .select(`
          *,
          users (
            id,
            username,
            email,
            name,
            role,
            departement,
            active,
            last_login,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter.user) {
        const { data: matchingUsers, error: usersError } = await supabase
          .from('users')
          .select('id')
          .or(`username.ilike.%${filter.user}%,email.ilike.%${filter.user}%,name.ilike.%${filter.user}%`);

        if (usersError) throw usersError;

        if (matchingUsers && matchingUsers.length > 0) {
          const userIds = matchingUsers.map(user => user.id);
          query = query.in('user_id', userIds);
        } else {
          setActivities([]);
          return;
        }
      }
      
      if (filter.actionType) {
        query = query.eq('action_type', filter.actionType);
      }
      
      if (filter.pageUrl) {
        query = query.ilike('page_url', `%${filter.pageUrl}%`);
      }

      if (filter.dateRange) {
        const { startDate, endDate } = getDateRange(filter.dateRange);
        if (startDate) query = query.gte('created_at', startDate.toISOString());
        if (endDate) query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const browserIcons: { [key: string]: string } = {
    chrome: '/icons/browsers/chrome.png',
    firefox: '/icons/browsers/firefox.png',
    safari: '/icons/browsers/safari.png',
    edge: '/icons/browsers/edge.png',
    opera: '/icons/browsers/opera.png',
    default: '/icons/browsers/default.png'
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return { name: 'Inconnu', icon: 'default' };
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edg')) return { name: 'Chrome', icon: 'chrome' };
    if (ua.includes('firefox')) return { name: 'Firefox', icon: 'firefox' };
    if (ua.includes('safari') && !ua.includes('chrome')) return { name: 'Safari', icon: 'safari' };
    if (ua.includes('edg')) return { name: 'Edge', icon: 'edge' };
    if (ua.includes('opera')) return { name: 'Opera', icon: 'opera' };
    
    return { name: 'Navigateur', icon: 'default' };
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return { type: 'Desktop', icon: <FiMonitor className="w-4 h-4" /> };
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return { type: 'Mobile', icon: <FiSmartphone className="w-4 h-4" /> };
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return { type: 'Tablette', icon: <FiSmartphone className="w-4 h-4" /> };
    }
    
    return { type: 'Desktop', icon: <FiMonitor className="w-4 h-4" /> };
  };

  const getActionConfig = (actionType: string) => {
    const configs = {
      login: { 
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700', 
        label: 'Connexion', 
        icon: <FiLogIn className="w-3 h-3" />
      },
      logout: { 
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700', 
        label: 'Déconnexion', 
        icon: <FiLogOut className="w-3 h-3" />
      },
      page_view: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700', 
        label: 'Page visitée', 
        icon: <FiEye className="w-3 h-3" />
      },
      create: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700', 
        label: 'Création', 
        icon: <FiPlus className="w-3 h-3" />
      },
      update: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', 
        label: 'Modification', 
        icon: <FiEdit className="w-3 h-3" />
      },
      delete: { 
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700', 
        label: 'Suppression', 
        icon: <FiTrash2 className="w-3 h-3" />
      }
    };
    
    return configs[actionType as keyof typeof configs] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600', 
      label: actionType, 
      icon: <FiEye className="w-3 h-3" />
    };
  };

  const getRoleConfig = (role: string) => {
    const configs = {
      admin: { 
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700', 
        label: 'Admin' 
      },
      teacher: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700', 
        label: 'Enseignant' 
      },
      student: { 
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700', 
        label: 'Étudiant' 
      },
      alumni: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700', 
        label: 'Alumni' 
      }
    };
    
    return configs[role as keyof typeof configs] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600', 
      label: role 
    };
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Jamais';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `${diffMins}min`;
      if (diffHours < 24) return `${diffHours}h`;
      return `${Math.floor(diffHours / 24)}j`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getUniqueActionTypes = () => {
    const types = activities.map(activity => activity.action_type).filter(Boolean);
    return Array.from(new Set(types));
  };

  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1);
  };

  const resetFilters = () => {
    setFilter({ user: '', actionType: '', pageUrl: '', dateRange: '' });
    setSearchTrigger(prev => prev + 1);
  };

  const formatDateRange = (range: string) => {
    const formats: { [key: string]: string } = {
      'today': "Aujourd'hui",
      'yesterday': 'Hier',
      'week': '7 derniers jours',
      'month': '30 derniers jours',
      '': 'Toutes périodes'
    };
    return formats[range] || range;
  };

  // Statistics
  const stats = {
    totalActivities: activities.length,
    uniqueUsers: Array.from(new Set(activities.map(a => a.user_id))).length,
    actionTypes: getUniqueActionTypes().length,
    uniquePages: Array.from(new Set(activities.map(a => a.page_url))).length
  };

  if (loading && activities.length === 0) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900  ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
          <div className="mb-4 lg:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Journal d'Activité
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base text-gray-600 dark:text-gray-400"
            >
              {activities.length} activité{activities.length !== 1 ? 's' : ''} trouvée{activities.length !== 1 ? 's' : ''}
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {/* Bouton Recherche/Filtres */}
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
              onClick={fetchUserActivities}
              className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
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
                    label: 'Total activités', 
                    value: stats.totalActivities, 
                    color: 'text-gray-600 dark:text-gray-300', 
                    bgColor: 'bg-gray-50 dark:bg-gray-800', 
                    icon: <FiClock className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  },
                  { 
                    label: 'Utilisateurs uniques', 
                    value: stats.uniqueUsers, 
                    color: 'text-blue-600 dark:text-blue-400', 
                    bgColor: 'bg-blue-50 dark:bg-blue-900', 
                    icon: <FiUser className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  },
                  { 
                    label: 'Types d\'actions', 
                    value: stats.actionTypes, 
                    color: 'text-purple-600 dark:text-purple-400', 
                    bgColor: 'bg-purple-50 dark:bg-purple-900', 
                    icon: <FiFilter className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  },
                  { 
                    label: 'Pages visitées', 
                    value: stats.uniquePages, 
                    color: 'text-green-600 dark:text-green-400', 
                    bgColor: 'bg-green-50 dark:bg-green-900', 
                    icon: <FiGlobe className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-lg sm:text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className={`p-2 dark:text-gray-200 rounded-lg ${stat.bgColor}`}>
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
                    Filtres de recherche
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Recherche Utilisateur */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Utilisateur
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nom, email..."
                        value={filter.user}
                        onChange={(e) => setFilter(prev => ({ ...prev, user: e.target.value }))}
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
                  
                  {/* Type d'action */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type d'action
                    </label>
                    <select
                      value={filter.actionType}
                      onChange={(e) => setFilter(prev => ({ ...prev, actionType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Tous les types</option>
                      {getUniqueActionTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiGlobe className="w-4 h-4" />
                      Page
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="URL de la page..."
                        value={filter.pageUrl}
                        onChange={(e) => setFilter(prev => ({ ...prev, pageUrl: e.target.value }))}
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

                  {/* Période */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      Période
                    </label>
                    <select
                      value={filter.dateRange}
                      onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Toutes périodes</option>
                      <option value="today">Aujourd'hui</option>
                      <option value="yesterday">Hier</option>
                      <option value="week">7 derniers jours</option>
                      <option value="month">30 derniers jours</option>
                    </select>
                  </div>
                </div>

                {/* Filtres actifs */}
                {(filter.user || filter.actionType || filter.pageUrl || filter.dateRange) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Filtres actifs:</span>
                      {filter.user && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Utilisateur: {filter.user}
                          <button onClick={() => setFilter(prev => ({ ...prev, user: '' }))}>
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filter.actionType && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Action: {filter.actionType}
                          <button onClick={() => setFilter(prev => ({ ...prev, actionType: '' }))}>
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filter.pageUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Page: {filter.pageUrl}
                          <button onClick={() => setFilter(prev => ({ ...prev, pageUrl: '' }))}>
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filter.dateRange && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          Période: {formatDateRange(filter.dateRange)}
                          <button onClick={() => setFilter(prev => ({ ...prev, dateRange: '' }))}>
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
                Activités des utilisateurs
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Dernières activités
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
                    Action
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Appareil
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Temps
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {activities.map((activity) => {
                  const browserInfo = getBrowserInfo(activity.user_agent);
                  const deviceInfo = getDeviceInfo(activity.user_agent);
                  const actionConfig = getActionConfig(activity.action_type);
                  const roleConfig = getRoleConfig(activity.users?.role || '');
                  
                  return (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {activity.users?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {activity.users?.name || activity.users?.username || 'N/A'}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {activity.users?.email}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${roleConfig.color}`}>
                                <span className="hidden sm:inline">{roleConfig.label}</span>
                                <span className="sm:hidden">{roleConfig.label.split(' ')[0]}</span>
                              </span>
                              {activity.users?.departement && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                                  • {activity.users.departement}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          {actionConfig.icon}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${actionConfig.color}`}>
                            <span className="hidden sm:inline">{actionConfig.label}</span>
                            <span className="sm:hidden">{actionConfig.label.split(' ')[0]}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-xs" title={activity.page_url}>
                          {activity.page_url || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-xs">
                          {activity.ip_address}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <img 
                            src={browserIcons[browserInfo.icon] || browserIcons.default} 
                            alt={browserInfo.name}
                            width={16}
                            height={16}
                            className="rounded hidden sm:block"
                          />
                          <span className="text-xs sm:text-sm">{browserInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {deviceInfo.icon}
                          <span>{deviceInfo.type}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {getTimeAgo(activity.created_at)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.created_at).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {activities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiFilter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune activité</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucune activité ne correspond à vos critères de recherche.
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
            <FiActivity className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">{activities.length} activités</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <FiEye className="w-3 h-3 text-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Monitoring</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}