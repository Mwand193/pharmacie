

// // // 'use client';

// // // import { useState, useEffect, useMemo } from 'react';
// // // import { 
// // //   FaExchangeAlt, 
// // //   FaDownload, 
// // //   FaSearch,
// // //   FaChevronDown,
// // //   FaChevronRight,
// // //   FaCalendar,
// // //   FaMapPin,
// // //   FaCheckCircle,
// // //   FaTruck,
// // //   FaStore,
// // //   FaWarehouse,
// // //   FaTrash,
// // //   FaExclamationTriangle,
// // //   FaSpinner,
// // //   FaBoxOpen,
// // //   FaIndustry,
// // //   FaBuilding
// // // } from 'react-icons/fa';
// // // import { getMouvements } from './actions';
// // // import type { Mouvement } from '@/types';
// // // import { FiBox } from 'react-icons/fi';

// // // interface GroupedMouvements {
// // //   lotId: number;
// // //   lotNumero: string;
// // //   medicamentNom: string;
// // //   medicamentId: number;
// // //   dateExpiration: string;
// // //   mouvements: Mouvement[];
// // //   quantiteInitiale: number;
// // //   quantiteActuelle: number;
// // // }

// // // export default function MouvementsPage() {
// // //   const [mouvements, setMouvements] = useState<Mouvement[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [searchTerm, setSearchTerm] = useState('');
// // //   const [filterType, setFilterType] = useState('tous');
// // //   const [expandedLots, setExpandedLots] = useState<Set<number>>(new Set());

// // //   useEffect(() => {
// // //     loadMouvements();
// // //   }, []);

// // //   const loadMouvements = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const data = await getMouvements();
// // //       setMouvements(data);
// // //     } catch (error) {
// // //       console.error('Erreur chargement mouvements:', error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const groupedMouvements = useMemo(() => {
// // //     const groups = new Map<number, GroupedMouvements>();
    
// // //     mouvements.forEach(mouvement => {
// // //       if (!mouvement.lot) return;
      
// // //       const lotId = mouvement.lot.id;
      
// // //       if (!groups.has(lotId)) {
// // //         const creationMouvement = mouvements.find(m => 
// // //           m.lot?.id === lotId && m.type_mouvement === 'creation_lot'
// // //         );
        
// // //         let quantiteActuelle = 0;
// // //         const lotMouvements = mouvements.filter(m => m.lot?.id === lotId);
        
// // //         lotMouvements.forEach(m => {
// // //           if (m.type_mouvement === 'creation_lot') {
// // //             quantiteActuelle += m.quantite || 0;
// // //           } else if (m.type_mouvement === 'transfert' || m.type_mouvement.includes('vente')) {
// // //             quantiteActuelle -= m.quantite || 0;
// // //           } else if (m.type_mouvement === 'destruction') {
// // //             quantiteActuelle -= m.quantite || 0;
// // //           }
// // //         });
        
// // //         groups.set(lotId, {
// // //           lotId,
// // //           lotNumero: mouvement.lot.numero_lot,
// // //           medicamentNom: mouvement.lot.medicament?.nom || 'Médicament inconnu',
// // //           medicamentId: mouvement.lot.medicament_id,
// // //           dateExpiration: mouvement.lot.date_expiration,
// // //           mouvements: [],
// // //           quantiteInitiale: creationMouvement?.quantite || 0,
// // //           quantiteActuelle: Math.max(0, quantiteActuelle)
// // //         });
// // //       }
      
// // //       const group = groups.get(lotId)!;
      
// // //       if (filterType !== 'tous' && mouvement.type_mouvement !== filterType) {
// // //         return;
// // //       }
      
// // //       if (searchTerm) {
// // //         const term = searchTerm.toLowerCase();
// // //         const matchesLot = group.lotNumero.toLowerCase().includes(term);
// // //         const matchesMedicament = group.medicamentNom.toLowerCase().includes(term);
// // //         const matchesComment = mouvement.commentaire?.toLowerCase().includes(term);
// // //         const matchesSource = mouvement.source?.nom_entite?.toLowerCase().includes(term);
// // //         const matchesDestination = mouvement.destination?.nom_entite?.toLowerCase().includes(term);
        
// // //         if (!matchesLot && !matchesMedicament && !matchesComment && !matchesSource && !matchesDestination) {
// // //           return;
// // //         }
// // //       }
      
// // //       group.mouvements.push(mouvement);
// // //     });
    
// // //     const result = Array.from(groups.values())
// // //       .filter(group => group.mouvements.length > 0)
// // //       .map(group => ({
// // //         ...group,
// // //         mouvements: group.mouvements.sort((a, b) => 
// // //           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// // //         )
// // //       }));
    
// // //     return result.sort((a, b) => {
// // //       const dateA = new Date(a.mouvements[0]?.created_at || 0).getTime();
// // //       const dateB = new Date(b.mouvements[0]?.created_at || 0).getTime();
// // //       return dateB - dateA;
// // //     });
// // //   }, [mouvements, filterType, searchTerm]);

// // //   const toggleLotExpansion = (lotId: number) => {
// // //     setExpandedLots(prev => {
// // //       const newSet = new Set(prev);
// // //       if (newSet.has(lotId)) {
// // //         newSet.delete(lotId);
// // //       } else {
// // //         newSet.add(lotId);
// // //       }
// // //       return newSet;
// // //     });
// // //   };

// // //   const expandAll = () => {
// // //     const allLotIds = groupedMouvements.map(g => g.lotId);
// // //     setExpandedLots(new Set(allLotIds));
// // //   };

// // //   const collapseAll = () => {
// // //     setExpandedLots(new Set());
// // //   };

// // //   const getTypeLabel = (type: string) => {
// // //     const labels: Record<string, string> = {
// // //       'creation_lot': 'Création du lot',
// // //       'fractionnement': 'Fractionnement',
// // //       'transfert': 'Transfert',
// // //       'reception': 'Réception',
// // //       'vente_grossiste': 'Vente à un grossiste',
// // //       'vente_pharmacie': 'Vente à une pharmacie',
// // //       'vente_patient': 'Vente à un patient',
// // //       'destruction': 'Destruction',
// // //       'verification': 'Vérification',
// // //       'rappel': 'Rappel de lot',
// // //     };
// // //     return labels[type] || type;
// // //   };

// // //   const getTypeIcon = (type: string) => {
// // //     const icons: Record<string, any> = {
// // //       'creation_lot': FiBox,
// // //       'transfert': FaTruck,
// // //       'reception': FaCheckCircle,
// // //       'vente_grossiste': FaStore,
// // //       'vente_pharmacie': FaStore,
// // //       'vente_patient': FaBuilding,
// // //       'destruction': FaTrash,
// // //       'verification': FaCheckCircle,
// // //       'rappel': FaExclamationTriangle,
// // //     };
// // //     return icons[type] || FaExchangeAlt;
// // //   };

// // //   const getTypeColor = (type: string) => {
// // //     const colors: Record<string, string> = {
// // //       'creation_lot': 'bg-blue-50 text-blue-700 border-blue-200',
// // //       'fractionnement': 'bg-purple-50 text-purple-700 border-purple-200',
// // //       'transfert': 'bg-amber-50 text-amber-700 border-amber-200',
// // //       'reception': 'bg-emerald-50 text-emerald-700 border-emerald-200',
// // //       'vente_grossiste': 'bg-indigo-50 text-indigo-700 border-indigo-200',
// // //       'vente_pharmacie': 'bg-emerald-50 text-emerald-700 border-emerald-200',
// // //       'vente_patient': 'bg-teal-50 text-teal-700 border-teal-200',
// // //       'destruction': 'bg-rose-50 text-rose-700 border-rose-200',
// // //       'verification': 'bg-slate-50 text-slate-700 border-slate-200',
// // //       'rappel': 'bg-orange-50 text-orange-700 border-orange-200',
// // //     };
// // //     return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200';
// // //   };

// // //   const getMouvementDescription = (mouvement: Mouvement) => {
// // //     const parts = [];
    
// // //     if (mouvement.quantite) {
// // //       parts.push(`${mouvement.quantite} ${mouvement.type_unite || 'unités'}`);
// // //     }
    
// // //     if (mouvement.type_mouvement === 'creation_lot') {
// // //       if (mouvement.source) {
// // //         parts.push(`par ${mouvement.source.nom_entite || mouvement.source.username}`);
// // //       }
// // //     } else {
// // //       if (mouvement.source) {
// // //         parts.push(`de ${mouvement.source.nom_entite || mouvement.source.username}`);
// // //       }
      
// // //       if (mouvement.destination) {
// // //         parts.push(`vers ${mouvement.destination.nom_entite || mouvement.destination.username}`);
// // //       }
// // //     }
    
// // //     if (parts.length === 0 && mouvement.commentaire) {
// // //       return mouvement.commentaire;
// // //     }
    
// // //     return parts.join(' ');
// // //   };

// // //   const getRoleLabel = (role: string) => {
// // //     const roles: Record<string, string> = {
// // //       'admin': 'Admin',
// // //       'fabricant': 'Fabricant',
// // //       'distributeur': 'Distributeur',
// // //       'pharmacie': 'Pharmacie',
// // //     };
// // //     return roles[role] || role;
// // //   };

// // //   const exportData = () => {
// // //     const allMouvements = groupedMouvements.flatMap(g => g.mouvements);
// // //     const data = allMouvements.map(m => ({
// // //       date: new Date(m.created_at).toLocaleString('fr-FR'),
// // //       type: getTypeLabel(m.type_mouvement),
// // //       lot: m.lot?.numero_lot,
// // //       medicament: m.lot?.medicament?.nom || 'Médicament inconnu',
// // //       quantite: m.quantite,
// // //       unite: m.type_unite,
// // //       source: m.source?.nom_entite || m.source?.username || '-',
// // //       destination: m.destination?.nom_entite || m.destination?.username || '-',
// // //       commentaire: m.commentaire || '',
// // //       hash: m.hash_mouvement
// // //     }));
    
// // //     if (data.length === 0) return;
    
// // //     const csv = [
// // //       Object.keys(data[0]).join(','),
// // //       ...data.map(row => Object.values(row).join(','))
// // //     ].join('\n');
    
// // //     const blob = new Blob([csv], { type: 'text/csv' });
// // //     const url = window.URL.createObjectURL(blob);
// // //     const a = document.createElement('a');
// // //     a.href = url;
// // //     a.download = `mouvements-${new Date().toISOString().split('T')[0]}.csv`;
// // //     a.click();
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="max-w-7xl mx-auto px-6 py-16">
// // //         <div className="flex flex-col items-center justify-center py-16">
// // //           <FaSpinner className="h-6 w-6 text-emerald-600 animate-spin mb-4" />
// // //           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Chargement...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
// // //       <div className="mb-10">
// // //         <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
// // //           Historique des mouvements
// // //         </h1>
// // //       </div>

// // //       <div className="bg-white border border-slate-200 mb-8">
// // //         <div className="p-5 border-b border-slate-100">
// // //           <div className="flex flex-col lg:flex-row gap-4">
// // //             <div className="flex-1">
// // //               <div className="relative">
// // //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// // //                   <FaSearch className="h-4 w-4 text-slate-400" />
// // //                 </div>
// // //                 <input
// // //                   type="text"
// // //                   placeholder="Rechercher par lot, médicament, entité ou commentaire..."
// // //                   value={searchTerm}
// // //                   onChange={(e) => setSearchTerm(e.target.value)}
// // //                   className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-white text-sm
// // //                            focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
// // //                 />
// // //               </div>
// // //             </div>
            
// // //             <div className="flex items-center gap-3">
// // //               <select
// // //                 value={filterType}
// // //                 onChange={(e) => setFilterType(e.target.value)}
// // //                 className="px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700
// // //                          focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
// // //               >
// // //                 <option value="tous">Tous les types</option>
// // //                 <option value="creation_lot">Création</option>
// // //                 <option value="transfert">Transfert</option>
// // //                 <option value="reception">Réception</option>
// // //                 <option value="vente_grossiste">Vente grossiste</option>
// // //                 <option value="vente_pharmacie">Vente pharmacie</option>
// // //                 <option value="vente_patient">Vente patient</option>
// // //                 <option value="destruction">Destruction</option>
// // //               </select>
              
// // //               <button
// // //                 onClick={exportData}
// // //                 className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 
// // //                          hover:bg-slate-50 transition-colors flex items-center gap-2"
// // //               >
// // //                 <FaDownload className="h-3.5 w-3.5" />
// // //                 <span className="hidden sm:inline">Exporter</span>
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
        
// // //         <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
// // //           <div className="flex items-center gap-2">
// // //             <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
// // //               {groupedMouvements.length} lots · {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)} mouvements
// // //             </span>
// // //           </div>
// // //           <div className="flex items-center gap-4">
// // //             <button
// // //               onClick={expandAll}
// // //               className="text-xs font-medium text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
// // //             >
// // //               Tout déplier
// // //             </button>
// // //             <span className="text-slate-300 text-xs">|</span>
// // //             <button
// // //               onClick={collapseAll}
// // //               className="text-xs font-medium text-slate-500 hover:text-slate-700 uppercase tracking-wider"
// // //             >
// // //               Tout replier
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 mb-8">
// // //         <div className="bg-white p-5">
// // //           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total lots</div>
// // //           <div className="text-2xl font-semibold text-slate-900">
// // //             {groupedMouvements.length}
// // //           </div>
// // //         </div>
// // //         <div className="bg-white p-5">
// // //           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total mouvements</div>
// // //           <div className="text-2xl font-semibold text-slate-900">
// // //             {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)}
// // //           </div>
// // //         </div>
// // //         <div className="bg-white p-5">
// // //           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dernière activité</div>
// // //           <div className="text-base font-medium text-slate-900">
// // //             {groupedMouvements[0]?.mouvements[0] 
// // //               ? new Date(groupedMouvements[0].mouvements[0].created_at).toLocaleDateString('fr-FR')
// // //               : '—'
// // //             }
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {groupedMouvements.length === 0 ? (
// // //         <div className="bg-white border border-slate-200 p-16">
// // //           <div className="text-center">
// // //             <FaBoxOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
// // //             <h3 className="text-base font-medium text-slate-900 mb-1">
// // //               Aucun mouvement trouvé
// // //             </h3>
// // //           </div>
// // //         </div>
// // //       ) : (
// // //         <div className="space-y-3">
// // //           {groupedMouvements.map((group) => (
// // //             <div key={group.lotId} className="bg-white border border-slate-200">
// // //               <div 
// // //                 className="px-6 py-5 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-100"
// // //                 onClick={() => toggleLotExpansion(group.lotId)}
// // //               >
// // //                 <div className="flex items-center justify-between">
// // //                   <div className="flex items-center gap-4">
// // //                     <div className="text-slate-400">
// // //                       {expandedLots.has(group.lotId) ? (
// // //                         <FaChevronDown className="h-4 w-4" />
// // //                       ) : (
// // //                         <FaChevronRight className="h-4 w-4" />
// // //                       )}
// // //                     </div>
// // //                     <div>
// // //                       <div className="flex items-center gap-3">
// // //                         <div className="p-2 bg-emerald-50 border border-emerald-100">
// // //                           <FiBox className="h-4 w-4 text-emerald-600" />
// // //                         </div>
// // //                         <div>
// // //                           <span className="font-medium text-slate-900 text-base">
// // //                             {group.medicamentNom}
// // //                           </span>
// // //                           <div className="flex items-center gap-4 mt-1 text-xs">
// // //                             <span className="font-mono text-slate-600">Lot #{group.lotNumero}</span>
// // //                             <span className="text-slate-300">|</span>
// // //                             <span className="flex items-center gap-1.5 text-slate-500">
// // //                               <FaCalendar className="h-3 w-3" />
// // //                               Expire le {new Date(group.dateExpiration).toLocaleDateString('fr-FR')}
// // //                             </span>
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                   <div className="text-right">
// // //                     <div className={`text-2xl font-semibold ${
// // //                       group.quantiteActuelle === 0 ? 'text-rose-600' : 'text-emerald-600'
// // //                     }`}>
// // //                       {group.quantiteActuelle}
// // //                       <span className="text-sm font-normal text-slate-400 ml-2">
// // //                         / {group.quantiteInitiale}
// // //                       </span>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               </div>
              
// // //               {expandedLots.has(group.lotId) && (
// // //                 <div className="px-6 py-8 bg-slate-50/30">
// // //                   <div className="flow-root">
// // //                     <ul className="-mb-8">
// // //                       {group.mouvements.map((mouvement, index) => {
// // //                         const Icon = getTypeIcon(mouvement.type_mouvement);
// // //                         const isLast = index === group.mouvements.length - 1;
                        
// // //                         return (
// // //                           <li key={mouvement.id}>
// // //                             <div className="relative pb-8">
// // //                               {!isLast && (
// // //                                 <span
// // //                                   className="absolute top-5 left-4 -ml-px h-full w-px bg-slate-200"
// // //                                   aria-hidden="true"
// // //                                 />
// // //                               )}
// // //                               <div className="relative flex gap-4">
// // //                                 <div>
// // //                                   <span className={`h-9 w-9 flex items-center justify-center border ${getTypeColor(mouvement.type_mouvement)}`}>
// // //                                     <Icon className="h-3.5 w-3.5" />
// // //                                   </span>
// // //                                 </div>
// // //                                 <div className="flex min-w-0 flex-1 justify-between gap-6 pt-0.5">
// // //                                   <div className="flex-1">
// // //                                     <div className="flex items-center gap-3 mb-2">
// // //                                       <p className="text-sm font-medium text-slate-900">
// // //                                         {getTypeLabel(mouvement.type_mouvement)}
// // //                                       </p>
// // //                                       <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${getTypeColor(mouvement.type_mouvement)}`}>
// // //                                         {mouvement.type_mouvement.replace(/_/g, ' ')}
// // //                                       </span>
// // //                                     </div>
                                    
// // //                                     <p className="text-sm text-slate-600 mb-3">
// // //                                       {getMouvementDescription(mouvement)}
// // //                                     </p>
                                    
// // //                                     {mouvement.commentaire && (
// // //                                       <div className="mb-3 p-3 bg-white border border-slate-200">
// // //                                         <p className="text-sm text-slate-600">
// // //                                           {mouvement.commentaire}
// // //                                         </p>
// // //                                       </div>
// // //                                     )}
                                    
// // //                                     <div className="flex flex-wrap items-center gap-3">
// // //                                       {mouvement.source && (
// // //                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
// // //                                           <FaIndustry className="h-3 w-3 text-slate-500" />
// // //                                           <span className="text-xs text-slate-600">
// // //                                             {mouvement.source.nom_entite || mouvement.source.username}
// // //                                             <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.source.role)})</span>
// // //                                           </span>
// // //                                         </span>
// // //                                       )}
// // //                                       {mouvement.destination && (
// // //                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
// // //                                           <FaMapPin className="h-3 w-3 text-slate-500" />
// // //                                           <span className="text-xs text-slate-600">
// // //                                             {mouvement.destination.nom_entite || mouvement.destination.username}
// // //                                             <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.destination.role)})</span>
// // //                                           </span>
// // //                                         </span>
// // //                                       )}
// // //                                       {mouvement.created_by && (
// // //                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
// // //                                           <FaBuilding className="h-3 w-3 text-slate-500" />
// // //                                           <span className="text-xs text-slate-600">
// // //                                             Par: {mouvement.created_by}
// // //                                           </span>
// // //                                         </span>
// // //                                       )}
// // //                                     </div>
// // //                                   </div>
                                  
// // //                                   <div className="whitespace-nowrap text-right">
// // //                                     <time dateTime={mouvement.created_at} className="text-sm font-medium text-slate-700">
// // //                                       {new Date(mouvement.created_at).toLocaleString('fr-FR', {
// // //                                         day: '2-digit',
// // //                                         month: '2-digit',
// // //                                         year: 'numeric',
// // //                                         hour: '2-digit',
// // //                                         minute: '2-digit'
// // //                                       })}
// // //                                     </time>
// // //                                     <div className="mt-2 space-y-1.5">
// // //                                       <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
// // //                                         <FaCheckCircle className="mr-1.5 h-3 w-3" />
// // //                                         Vérifié
// // //                                       </span>
// // //                                       {mouvement.hash_mouvement && (
// // //                                         <div className="font-mono text-xs text-slate-400" title={mouvement.hash_mouvement}>
// // //                                           {mouvement.hash_mouvement.substring(0, 10)}...
// // //                                         </div>
// // //                                       )}
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                               </div>
// // //                             </div>
// // //                           </li>
// // //                         );
// // //                       })}
// // //                     </ul>
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           ))}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // 'use client';

// // import { useState, useEffect, useMemo } from 'react';
// // import { 
// //   FaExchangeAlt, 
// //   FaDownload, 
// //   FaSearch,
// //   FaChevronDown,
// //   FaChevronRight,
// //   FaCalendar,
// //   FaMapPin,
// //   FaCheckCircle,
// //   FaTruck,
// //   FaStore,
// //   FaWarehouse,
// //   FaTrash,
// //   FaExclamationTriangle,
// //   FaSpinner,
// //   FaBoxOpen,
// //   FaIndustry,
// //   FaBuilding,
// //   FaFilter,
// //   FaTimes
// // } from 'react-icons/fa';
// // import { getMouvements } from './actions';
// // import type { Mouvement } from '@/types';
// // import { FiBox } from 'react-icons/fi';

// // interface GroupedMouvements {
// //   lotId: number;
// //   lotNumero: string;
// //   medicamentNom: string;
// //   medicamentId: number;
// //   dateExpiration: string;
// //   mouvements: Mouvement[];
// //   quantiteInitiale: number;
// //   quantiteActuelle: number;
// // }

// // interface Entity {
// //   id: number;
// //   matricule: string;
// //   username: string;
// //   nom_entite: string | null;
// //   role: string;
// // }

// // export default function MouvementsPage() {
// //   const [mouvements, setMouvements] = useState<Mouvement[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [filterType, setFilterType] = useState('tous');
// //   const [filterEntity, setFilterEntity] = useState('tous');
// //   const [expandedLots, setExpandedLots] = useState<Set<number>>(new Set());
// //   const [showFilters, setShowFilters] = useState(false);
// //   const [entities, setEntities] = useState<Entity[]>([]);

// //   useEffect(() => {
// //     loadMouvements();
// //   }, []);

// //   useEffect(() => {
// //     // Extraire les entités uniques des mouvements
// //     const entityMap = new Map<number, Entity>();
    
// //     mouvements.forEach(m => {
// //       // Ajouter la source si elle existe et n'est pas un fabricant
// //       if (m.source && m.source.role !== 'fabricant' && m.source.id) {
// //         const sourceId = typeof m.source.id === 'string' ? parseInt(m.source.id) : m.source.id;
// //         if (!entityMap.has(sourceId)) {
// //           entityMap.set(sourceId, {
// //             ...m.source,
// //             id: sourceId
// //           });
// //         }
// //       }
// //       // Ajouter la destination si elle existe et n'est pas un fabricant
// //       if (m.destination && m.destination.role !== 'fabricant' && m.destination.id) {
// //         const destId = typeof m.destination.id === 'string' ? parseInt(m.destination.id) : m.destination.id;
// //         if (!entityMap.has(destId)) {
// //           entityMap.set(destId, {
// //             ...m.destination,
// //             id: destId
// //           });
// //         }
// //       }
// //     });
    
// //     setEntities(Array.from(entityMap.values()));
// //   }, [mouvements]);

// //   const loadMouvements = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await getMouvements();
// //       setMouvements(data);
// //     } catch (error) {
// //       console.error('Erreur chargement mouvements:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const groupedMouvements = useMemo(() => {
// //     const groups = new Map<number, GroupedMouvements>();
    
// //     mouvements.forEach(mouvement => {
// //       if (!mouvement.lot) return;
      
// //       const lotId = mouvement.lot.id;
      
// //       if (!groups.has(lotId)) {
// //         const creationMouvement = mouvements.find(m => 
// //           m.lot?.id === lotId && m.type_mouvement === 'creation_lot'
// //         );
        
// //         let quantiteActuelle = 0;
// //         const lotMouvements = mouvements.filter(m => m.lot?.id === lotId);
        
// //         lotMouvements.forEach(m => {
// //           if (m.type_mouvement === 'creation_lot') {
// //             quantiteActuelle += m.quantite || 0;
// //           } else if (m.type_mouvement === 'transfert' || m.type_mouvement.includes('vente')) {
// //             quantiteActuelle -= m.quantite || 0;
// //           } else if (m.type_mouvement === 'destruction') {
// //             quantiteActuelle -= m.quantite || 0;
// //           }
// //         });
        
// //         groups.set(lotId, {
// //           lotId,
// //           lotNumero: mouvement.lot.numero_lot,
// //           medicamentNom: mouvement.lot.medicament?.nom || 'Médicament inconnu',
// //           medicamentId: mouvement.lot.medicament_id,
// //           dateExpiration: mouvement.lot.date_expiration,
// //           mouvements: [],
// //           quantiteInitiale: creationMouvement?.quantite || 0,
// //           quantiteActuelle: Math.max(0, quantiteActuelle)
// //         });
// //       }
      
// //       const group = groups.get(lotId)!;
// //       let shouldInclude = true;
      
// //       // Filtre par type
// //       if (filterType !== 'tous' && mouvement.type_mouvement !== filterType) {
// //         shouldInclude = false;
// //       }
      
// //       // Filtre par entité (distributeur, pharmacie, etc.)
// //       if (filterEntity !== 'tous' && shouldInclude) {
// //         const entityId = parseInt(filterEntity);
        
// //         // Convertir les IDs en nombre pour la comparaison
// //         const sourceId = mouvement.source?.id ? 
// //           (typeof mouvement.source.id === 'string' ? parseInt(mouvement.source.id) : mouvement.source.id) : null;
// //         const destId = mouvement.destination?.id ? 
// //           (typeof mouvement.destination.id === 'string' ? parseInt(mouvement.destination.id) : mouvement.destination.id) : null;
        
// //         const matchesSource = sourceId === entityId;
// //         const matchesDestination = destId === entityId;
        
// //         // Ne pas filtrer les créations de lot
// //         if (mouvement.type_mouvement !== 'creation_lot' && !matchesSource && !matchesDestination) {
// //           shouldInclude = false;
// //         }
// //       }
      
// //       // Filtre par recherche textuelle
// //       if (searchTerm && shouldInclude) {
// //         const term = searchTerm.toLowerCase();
// //         const matchesLot = group.lotNumero.toLowerCase().includes(term);
// //         const matchesMedicament = group.medicamentNom.toLowerCase().includes(term);
// //         const matchesComment = mouvement.commentaire?.toLowerCase().includes(term);
// //         const matchesSource = mouvement.source?.nom_entite?.toLowerCase().includes(term);
// //         const matchesDestination = mouvement.destination?.nom_entite?.toLowerCase().includes(term);
        
// //         if (!matchesLot && !matchesMedicament && !matchesComment && !matchesSource && !matchesDestination) {
// //           shouldInclude = false;
// //         }
// //       }
      
// //       if (shouldInclude) {
// //         group.mouvements.push(mouvement);
// //       }
// //     });
    
// //     const result = Array.from(groups.values())
// //       .filter(group => group.mouvements.length > 0)
// //       .map(group => ({
// //         ...group,
// //         mouvements: group.mouvements.sort((a, b) => 
// //           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// //         )
// //       }));
    
// //     return result.sort((a, b) => {
// //       const dateA = new Date(a.mouvements[0]?.created_at || 0).getTime();
// //       const dateB = new Date(b.mouvements[0]?.created_at || 0).getTime();
// //       return dateB - dateA;
// //     });
// //   }, [mouvements, filterType, filterEntity, searchTerm]);

// //   const toggleLotExpansion = (lotId: number) => {
// //     setExpandedLots(prev => {
// //       const newSet = new Set(prev);
// //       if (newSet.has(lotId)) {
// //         newSet.delete(lotId);
// //       } else {
// //         newSet.add(lotId);
// //       }
// //       return newSet;
// //     });
// //   };

// //   const expandAll = () => {
// //     const allLotIds = groupedMouvements.map(g => g.lotId);
// //     setExpandedLots(new Set(allLotIds));
// //   };

// //   const collapseAll = () => {
// //     setExpandedLots(new Set());
// //   };

// //   const clearFilters = () => {
// //     setSearchTerm('');
// //     setFilterType('tous');
// //     setFilterEntity('tous');
// //   };

// //   const hasActiveFilters = filterType !== 'tous' || filterEntity !== 'tous' || searchTerm !== '';

// //   const getTypeLabel = (type: string) => {
// //     const labels: Record<string, string> = {
// //       'creation_lot': 'Création du lot',
// //       'fractionnement': 'Fractionnement',
// //       'transfert': 'Transfert',
// //       'reception': 'Réception',
// //       'vente_grossiste': 'Vente à un grossiste',
// //       'vente_pharmacie': 'Vente à une pharmacie',
// //       'vente_patient': 'Vente à un patient',
// //       'destruction': 'Destruction',
// //       'verification': 'Vérification',
// //       'rappel': 'Rappel de lot',
// //     };
// //     return labels[type] || type;
// //   };

// //   const getTypeIcon = (type: string) => {
// //     const icons: Record<string, any> = {
// //       'creation_lot': FiBox,
// //       'transfert': FaTruck,
// //       'reception': FaCheckCircle,
// //       'vente_grossiste': FaStore,
// //       'vente_pharmacie': FaStore,
// //       'vente_patient': FaBuilding,
// //       'destruction': FaTrash,
// //       'verification': FaCheckCircle,
// //       'rappel': FaExclamationTriangle,
// //     };
// //     return icons[type] || FaExchangeAlt;
// //   };

// //   const getTypeColor = (type: string) => {
// //     const colors: Record<string, string> = {
// //       'creation_lot': 'bg-blue-50 text-blue-700 border-blue-200',
// //       'fractionnement': 'bg-purple-50 text-purple-700 border-purple-200',
// //       'transfert': 'bg-amber-50 text-amber-700 border-amber-200',
// //       'reception': 'bg-emerald-50 text-emerald-700 border-emerald-200',
// //       'vente_grossiste': 'bg-indigo-50 text-indigo-700 border-indigo-200',
// //       'vente_pharmacie': 'bg-emerald-50 text-emerald-700 border-emerald-200',
// //       'vente_patient': 'bg-teal-50 text-teal-700 border-teal-200',
// //       'destruction': 'bg-rose-50 text-rose-700 border-rose-200',
// //       'verification': 'bg-slate-50 text-slate-700 border-slate-200',
// //       'rappel': 'bg-orange-50 text-orange-700 border-orange-200',
// //     };
// //     return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200';
// //   };

// //   const getMouvementDescription = (mouvement: Mouvement) => {
// //     const parts = [];
    
// //     if (mouvement.quantite) {
// //       parts.push(`${mouvement.quantite} ${mouvement.type_unite || 'unités'}`);
// //     }
    
// //     if (mouvement.type_mouvement === 'creation_lot') {
// //       if (mouvement.source) {
// //         parts.push(`par ${mouvement.source.nom_entite || mouvement.source.username}`);
// //       }
// //     } else {
// //       if (mouvement.source) {
// //         parts.push(`de ${mouvement.source.nom_entite || mouvement.source.username}`);
// //       }
      
// //       if (mouvement.destination) {
// //         parts.push(`vers ${mouvement.destination.nom_entite || mouvement.destination.username}`);
// //       }
// //     }
    
// //     if (parts.length === 0 && mouvement.commentaire) {
// //       return mouvement.commentaire;
// //     }
    
// //     return parts.join(' ');
// //   };

// //   const getRoleLabel = (role: string) => {
// //     const roles: Record<string, string> = {
// //       'admin': 'Admin',
// //       'fabricant': 'Fabricant',
// //       'distributeur': 'Distributeur',
// //       'pharmacie': 'Pharmacie',
// //     };
// //     return roles[role] || role;
// //   };

// //   const getEntityDisplayName = (entity: Entity) => {
// //     if (entity.nom_entite) {
// //       return `${entity.nom_entite} (${getRoleLabel(entity.role)})`;
// //     }
// //     return `${entity.username} (${getRoleLabel(entity.role)})`;
// //   };

// //   const exportData = () => {
// //     const allMouvements = groupedMouvements.flatMap(g => g.mouvements);
// //     const data = allMouvements.map(m => ({
// //       date: new Date(m.created_at).toLocaleString('fr-FR'),
// //       type: getTypeLabel(m.type_mouvement),
// //       lot: m.lot?.numero_lot,
// //       medicament: m.lot?.medicament?.nom || 'Médicament inconnu',
// //       quantite: m.quantite,
// //       unite: m.type_unite,
// //       source: m.source?.nom_entite || m.source?.username || '-',
// //       destination: m.destination?.nom_entite || m.destination?.username || '-',
// //       commentaire: m.commentaire || '',
// //       hash: m.hash_mouvement
// //     }));
    
// //     if (data.length === 0) return;
    
// //     const csv = [
// //       Object.keys(data[0]).join(','),
// //       ...data.map(row => Object.values(row).join(','))
// //     ].join('\n');
    
// //     const blob = new Blob([csv], { type: 'text/csv' });
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = `mouvements-${new Date().toISOString().split('T')[0]}.csv`;
// //     a.click();
// //   };

// //   if (loading) {
// //     return (
// //       <div className="max-w-7xl mx-auto px-6 py-16">
// //         <div className="flex flex-col items-center justify-center py-16">
// //           <FaSpinner className="h-6 w-6 text-emerald-600 animate-spin mb-4" />
// //           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Chargement...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
// //       <div className="mb-10">
// //         <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
// //           Historique des mouvements
// //         </h1>
// //       </div>

// //       <div className="bg-white border border-slate-200 mb-8">
// //         <div className="p-5 border-b border-slate-100">
// //           <div className="flex flex-col gap-4">
// //             <div className="flex flex-col lg:flex-row gap-4">
// //               <div className="flex-1">
// //                 <div className="relative">
// //                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                     <FaSearch className="h-4 w-4 text-slate-400" />
// //                   </div>
// //                   <input
// //                     type="text"
// //                     placeholder="Rechercher par lot, médicament, entité ou commentaire..."
// //                     value={searchTerm}
// //                     onChange={(e) => setSearchTerm(e.target.value)}
// //                     className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-white text-sm
// //                              focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
// //                   />
// //                 </div>
// //               </div>
              
// //               <div className="flex items-center gap-3">
// //                 <button
// //                   onClick={() => setShowFilters(!showFilters)}
// //                   className={`px-4 py-2.5 text-sm font-medium border transition-colors flex items-center gap-2
// //                     ${showFilters || hasActiveFilters 
// //                       ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
// //                       : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
// //                     }`}
// //                 >
// //                   <FaFilter className="h-3.5 w-3.5" />
// //                   <span>Filtres</span>
// //                   {hasActiveFilters && (
// //                     <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold">
// //                       {(filterType !== 'tous' ? 1 : 0) + (filterEntity !== 'tous' ? 1 : 0)}
// //                     </span>
// //                   )}
// //                 </button>
                
// //                 <button
// //                   onClick={exportData}
// //                   className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 
// //                            hover:bg-slate-50 transition-colors flex items-center gap-2"
// //                 >
// //                   <FaDownload className="h-3.5 w-3.5" />
// //                   <span className="hidden sm:inline">Exporter</span>
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Panneau de filtres */}
// //             {showFilters && (
// //               <div className="pt-4 border-t border-slate-100">
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                   <div>
// //                     <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
// //                       Type de mouvement
// //                     </label>
// //                     <select
// //                       value={filterType}
// //                       onChange={(e) => setFilterType(e.target.value)}
// //                       className="w-full px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700
// //                                focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
// //                     >
// //                       <option value="tous">Tous les types</option>
// //                       <option value="creation_lot">Création</option>
// //                       <option value="transfert">Transfert</option>
// //                       <option value="reception">Réception</option>
// //                       <option value="vente_grossiste">Vente grossiste</option>
// //                       <option value="vente_pharmacie">Vente pharmacie</option>
// //                       <option value="vente_patient">Vente patient</option>
// //                       <option value="destruction">Destruction</option>
// //                     </select>
// //                   </div>
                  
// //                   <div>
// //                     <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
// //                       Entité (Distributeur, Pharmacie, etc.)
// //                     </label>
// //                     <select
// //                       value={filterEntity}
// //                       onChange={(e) => setFilterEntity(e.target.value)}
// //                       className="w-full px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700
// //                                focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
// //                     >
// //                       <option value="tous">Toutes les entités</option>
// //                       {entities.map(entity => (
// //                         <option key={`entity-${entity.id}`} value={entity.id}>
// //                           {getEntityDisplayName(entity)}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 </div>
                
// //                 {hasActiveFilters && (
// //                   <div className="mt-4 flex justify-end">
// //                     <button
// //                       onClick={clearFilters}
// //                       className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 
// //                                hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
// //                     >
// //                       <FaTimes className="h-3 w-3" />
// //                       Effacer tous les filtres
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </div>
// //         </div>
        
// //         <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
// //           <div className="flex items-center gap-2">
// //             <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
// //               {groupedMouvements.length} lots · {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)} mouvements
// //               {hasActiveFilters && (
// //                 <span className="ml-2 text-emerald-600">(filtrés)</span>
// //               )}
// //             </span>
// //           </div>
// //           <div className="flex items-center gap-4">
// //             <button
// //               onClick={expandAll}
// //               className="text-xs font-medium text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
// //             >
// //               Tout déplier
// //             </button>
// //             <span className="text-slate-300 text-xs">|</span>
// //             <button
// //               onClick={collapseAll}
// //               className="text-xs font-medium text-slate-500 hover:text-slate-700 uppercase tracking-wider"
// //             >
// //               Tout replier
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 mb-8">
// //         <div className="bg-white p-5">
// //           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total lots</div>
// //           <div className="text-2xl font-semibold text-slate-900">
// //             {groupedMouvements.length}
// //           </div>
// //         </div>
// //         <div className="bg-white p-5">
// //           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total mouvements</div>
// //           <div className="text-2xl font-semibold text-slate-900">
// //             {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)}
// //           </div>
// //         </div>
// //         <div className="bg-white p-5">
// //           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dernière activité</div>
// //           <div className="text-base font-medium text-slate-900">
// //             {groupedMouvements[0]?.mouvements[0] 
// //               ? new Date(groupedMouvements[0].mouvements[0].created_at).toLocaleDateString('fr-FR')
// //               : '—'
// //             }
// //           </div>
// //         </div>
// //       </div>

// //       {groupedMouvements.length === 0 ? (
// //         <div className="bg-white border border-slate-200 p-16">
// //           <div className="text-center">
// //             <FaBoxOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
// //             <h3 className="text-base font-medium text-slate-900 mb-1">
// //               Aucun mouvement trouvé
// //             </h3>
// //             {hasActiveFilters && (
// //               <>
// //                 <p className="text-sm text-slate-500 mb-4">
// //                   Essayez de modifier vos critères de filtrage
// //                 </p>
// //                 <button
// //                   onClick={clearFilters}
// //                   className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 
// //                            bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
// //                 >
// //                   <FaTimes className="h-3.5 w-3.5" />
// //                   Effacer les filtres
// //                 </button>
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       ) : (
// //         <div className="space-y-3">
// //           {groupedMouvements.map((group) => (
// //             <div key={group.lotId} className="bg-white border border-slate-200">
// //               <div 
// //                 className="px-6 py-5 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-100"
// //                 onClick={() => toggleLotExpansion(group.lotId)}
// //               >
// //                 <div className="flex items-center justify-between">
// //                   <div className="flex items-center gap-4">
// //                     <div className="text-slate-400">
// //                       {expandedLots.has(group.lotId) ? (
// //                         <FaChevronDown className="h-4 w-4" />
// //                       ) : (
// //                         <FaChevronRight className="h-4 w-4" />
// //                       )}
// //                     </div>
// //                     <div>
// //                       <div className="flex items-center gap-3">
// //                         <div className="p-2 bg-emerald-50 border border-emerald-100">
// //                           <FiBox className="h-4 w-4 text-emerald-600" />
// //                         </div>
// //                         <div>
// //                           <span className="font-medium text-slate-900 text-base">
// //                             {group.medicamentNom}
// //                           </span>
// //                           <div className="flex items-center gap-4 mt-1 text-xs">
// //                             <span className="font-mono text-slate-600">Lot #{group.lotNumero}</span>
// //                             <span className="text-slate-300">|</span>
// //                             <span className="flex items-center gap-1.5 text-slate-500">
// //                               <FaCalendar className="h-3 w-3" />
// //                               Expire le {new Date(group.dateExpiration).toLocaleDateString('fr-FR')}
// //                             </span>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div className="text-right">
// //                     <div className={`text-2xl font-semibold ${
// //                       group.quantiteActuelle === 0 ? 'text-rose-600' : 'text-emerald-600'
// //                     }`}>
// //                       {group.quantiteActuelle}
// //                       <span className="text-sm font-normal text-slate-400 ml-2">
// //                         / {group.quantiteInitiale}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
              
// //               {expandedLots.has(group.lotId) && (
// //                 <div className="px-6 py-8 bg-slate-50/30">
// //                   <div className="flow-root">
// //                     <ul className="-mb-8">
// //                       {group.mouvements.map((mouvement, index) => {
// //                         const Icon = getTypeIcon(mouvement.type_mouvement);
// //                         const isLast = index === group.mouvements.length - 1;
                        
// //                         return (
// //                           <li key={mouvement.id}>
// //                             <div className="relative pb-8">
// //                               {!isLast && (
// //                                 <span
// //                                   className="absolute top-5 left-4 -ml-px h-full w-px bg-slate-200"
// //                                   aria-hidden="true"
// //                                 />
// //                               )}
// //                               <div className="relative flex gap-4">
// //                                 <div>
// //                                   <span className={`h-9 w-9 flex items-center justify-center border ${getTypeColor(mouvement.type_mouvement)}`}>
// //                                     <Icon className="h-3.5 w-3.5" />
// //                                   </span>
// //                                 </div>
// //                                 <div className="flex min-w-0 flex-1 justify-between gap-6 pt-0.5">
// //                                   <div className="flex-1">
// //                                     <div className="flex items-center gap-3 mb-2">
// //                                       <p className="text-sm font-medium text-slate-900">
// //                                         {getTypeLabel(mouvement.type_mouvement)}
// //                                       </p>
// //                                       <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${getTypeColor(mouvement.type_mouvement)}`}>
// //                                         {mouvement.type_mouvement.replace(/_/g, ' ')}
// //                                       </span>
// //                                     </div>
                                    
// //                                     <p className="text-sm text-slate-600 mb-3">
// //                                       {getMouvementDescription(mouvement)}
// //                                     </p>
                                    
// //                                     {mouvement.commentaire && (
// //                                       <div className="mb-3 p-3 bg-white border border-slate-200">
// //                                         <p className="text-sm text-slate-600">
// //                                           {mouvement.commentaire}
// //                                         </p>
// //                                       </div>
// //                                     )}
                                    
// //                                     <div className="flex flex-wrap items-center gap-3">
// //                                       {mouvement.source && (
// //                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
// //                                           <FaIndustry className="h-3 w-3 text-slate-500" />
// //                                           <span className="text-xs text-slate-600">
// //                                             {mouvement.source.nom_entite || mouvement.source.username}
// //                                             <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.source.role)})</span>
// //                                           </span>
// //                                         </span>
// //                                       )}
// //                                       {mouvement.destination && (
// //                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
// //                                           <FaMapPin className="h-3 w-3 text-slate-500" />
// //                                           <span className="text-xs text-slate-600">
// //                                             {mouvement.destination.nom_entite || mouvement.destination.username}
// //                                             <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.destination.role)})</span>
// //                                           </span>
// //                                         </span>
// //                                       )}
// //                                       {mouvement.created_by && (
// //                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
// //                                           <FaBuilding className="h-3 w-3 text-slate-500" />
// //                                           <span className="text-xs text-slate-600">
// //                                             Par: {mouvement.created_by}
// //                                           </span>
// //                                         </span>
// //                                       )}
// //                                     </div>
// //                                   </div>
                                  
// //                                   <div className="whitespace-nowrap text-right">
// //                                     <time dateTime={mouvement.created_at} className="text-sm font-medium text-slate-700">
// //                                       {new Date(mouvement.created_at).toLocaleString('fr-FR', {
// //                                         day: '2-digit',
// //                                         month: '2-digit',
// //                                         year: 'numeric',
// //                                         hour: '2-digit',
// //                                         minute: '2-digit'
// //                                       })}
// //                                     </time>
// //                                     <div className="mt-2 space-y-1.5">
// //                                       <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
// //                                         <FaCheckCircle className="mr-1.5 h-3 w-3" />
// //                                         Vérifié
// //                                       </span>
// //                                       {mouvement.hash_mouvement && (
// //                                         <div className="font-mono text-xs text-slate-400" title={mouvement.hash_mouvement}>
// //                                           {mouvement.hash_mouvement.substring(0, 10)}...
// //                                         </div>
// //                                       )}
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               </div>
// //                             </div>
// //                           </li>
// //                         );
// //                       })}
// //                     </ul>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { 
//   FaExchangeAlt, 
//   FaDownload, 
//   FaSearch,
//   FaChevronDown,
//   FaChevronRight,
//   FaCalendar,
//   FaMapPin,
//   FaCheckCircle,
//   FaTruck,
//   FaStore,
//   FaWarehouse,
//   FaTrash,
//   FaExclamationTriangle,
//   FaSpinner,
//   FaBoxOpen,
//   FaIndustry,
//   FaBuilding,
//   FaFilter,
//   FaTimes,
//   FaUser
// } from 'react-icons/fa';
// import { getMouvements } from './actions';
// import type { Mouvement } from '@/types';
// import { FiBox } from 'react-icons/fi';

// interface GroupedMouvements {
//   lotId: number;
//   lotNumero: string;
//   medicamentNom: string;
//   medicamentId: number;
//   dateExpiration: string;
//   mouvements: Mouvement[];
//   quantiteInitiale: number;
//   quantiteActuelle: number;
// }

// interface Entity {
//   id: number;
//   matricule: string;
//   username: string;
//   nom_entite: string | null;
//   role: string;
// }

// export default function MouvementsPage() {
//   const [mouvements, setMouvements] = useState<Mouvement[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('tous');
//   const [filterEntity, setFilterEntity] = useState('tous');
//   const [entitySearch, setEntitySearch] = useState('');
//   const [showEntityDropdown, setShowEntityDropdown] = useState(false);
//   const [expandedLots, setExpandedLots] = useState<Set<number>>(new Set());
//   const [showFilters, setShowFilters] = useState(false);
//   const [entities, setEntities] = useState<Entity[]>([]);

//   useEffect(() => {
//     loadMouvements();
//   }, []);

//   useEffect(() => {
//     // Extraire les entités uniques des mouvements
//     const entityMap = new Map<number, Entity>();
    
//     mouvements.forEach(m => {
//       // Ajouter la source si elle existe et n'est pas un fabricant
//       if (m.source && m.source.role !== 'fabricant' && m.source.id) {
//         const sourceId = typeof m.source.id === 'string' ? parseInt(m.source.id) : m.source.id;
//         if (!entityMap.has(sourceId)) {
//           entityMap.set(sourceId, {
//             ...m.source,
//             id: sourceId
//           });
//         }
//       }
//       // Ajouter la destination si elle existe et n'est pas un fabricant
//       if (m.destination && m.destination.role !== 'fabricant' && m.destination.id) {
//         const destId = typeof m.destination.id === 'string' ? parseInt(m.destination.id) : m.destination.id;
//         if (!entityMap.has(destId)) {
//           entityMap.set(destId, {
//             ...m.destination,
//             id: destId
//           });
//         }
//       }
//     });
    
//     setEntities(Array.from(entityMap.values()));
//   }, [mouvements]);

//   // Filtrer les entités basé sur la recherche
//   const filteredEntities = useMemo(() => {
//     if (!entitySearch) return entities;
    
//     const search = entitySearch.toLowerCase();
//     return entities.filter(entity => {
//       const name = entity.nom_entite?.toLowerCase() || '';
//       const username = entity.username.toLowerCase();
//       const role = getRoleLabel(entity.role).toLowerCase();
      
//       return name.includes(search) || username.includes(search) || role.includes(search);
//     });
//   }, [entities, entitySearch]);

//   const loadMouvements = async () => {
//     try {
//       setLoading(true);
//       const data = await getMouvements();
//       setMouvements(data);
//     } catch (error) {
//       console.error('Erreur chargement mouvements:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const groupedMouvements = useMemo(() => {
//     const groups = new Map<number, GroupedMouvements>();
    
//     mouvements.forEach(mouvement => {
//       if (!mouvement.lot) return;
      
//       const lotId = mouvement.lot.id;
      
//       if (!groups.has(lotId)) {
//         const creationMouvement = mouvements.find(m => 
//           m.lot?.id === lotId && m.type_mouvement === 'creation_lot'
//         );
        
//         let quantiteActuelle = 0;
//         const lotMouvements = mouvements.filter(m => m.lot?.id === lotId);
        
//         lotMouvements.forEach(m => {
//           if (m.type_mouvement === 'creation_lot') {
//             quantiteActuelle += m.quantite || 0;
//           } else if (m.type_mouvement === 'transfert' || m.type_mouvement.includes('vente')) {
//             quantiteActuelle -= m.quantite || 0;
//           } else if (m.type_mouvement === 'destruction') {
//             quantiteActuelle -= m.quantite || 0;
//           }
//         });
        
//         groups.set(lotId, {
//           lotId,
//           lotNumero: mouvement.lot.numero_lot,
//           medicamentNom: mouvement.lot.medicament?.nom || 'Médicament inconnu',
//           medicamentId: mouvement.lot.medicament_id,
//           dateExpiration: mouvement.lot.date_expiration,
//           mouvements: [],
//           quantiteInitiale: creationMouvement?.quantite || 0,
//           quantiteActuelle: Math.max(0, quantiteActuelle)
//         });
//       }
      
//       const group = groups.get(lotId)!;
//       let shouldInclude = true;
      
//       // Filtre par type
//       if (filterType !== 'tous' && mouvement.type_mouvement !== filterType) {
//         shouldInclude = false;
//       }
      
//       // Filtre par entité (distributeur, pharmacie, etc.)
//       if (filterEntity !== 'tous' && shouldInclude) {
//         const entityId = parseInt(filterEntity);
        
//         // Convertir les IDs en nombre pour la comparaison
//         const sourceId = mouvement.source?.id ? 
//           (typeof mouvement.source.id === 'string' ? parseInt(mouvement.source.id) : mouvement.source.id) : null;
//         const destId = mouvement.destination?.id ? 
//           (typeof mouvement.destination.id === 'string' ? parseInt(mouvement.destination.id) : mouvement.destination.id) : null;
        
//         const matchesSource = sourceId === entityId;
//         const matchesDestination = destId === entityId;
        
//         // Ne pas filtrer les créations de lot
//         if (mouvement.type_mouvement !== 'creation_lot' && !matchesSource && !matchesDestination) {
//           shouldInclude = false;
//         }
//       }
      
//       // Filtre par recherche textuelle
//       if (searchTerm && shouldInclude) {
//         const term = searchTerm.toLowerCase();
//         const matchesLot = group.lotNumero.toLowerCase().includes(term);
//         const matchesMedicament = group.medicamentNom.toLowerCase().includes(term);
//         const matchesComment = mouvement.commentaire?.toLowerCase().includes(term);
//         const matchesSource = mouvement.source?.nom_entite?.toLowerCase().includes(term);
//         const matchesDestination = mouvement.destination?.nom_entite?.toLowerCase().includes(term);
        
//         if (!matchesLot && !matchesMedicament && !matchesComment && !matchesSource && !matchesDestination) {
//           shouldInclude = false;
//         }
//       }
      
//       if (shouldInclude) {
//         group.mouvements.push(mouvement);
//       }
//     });
    
//     const result = Array.from(groups.values())
//       .filter(group => group.mouvements.length > 0)
//       .map(group => ({
//         ...group,
//         mouvements: group.mouvements.sort((a, b) => 
//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         )
//       }));
    
//     return result.sort((a, b) => {
//       const dateA = new Date(a.mouvements[0]?.created_at || 0).getTime();
//       const dateB = new Date(b.mouvements[0]?.created_at || 0).getTime();
//       return dateB - dateA;
//     });
//   }, [mouvements, filterType, filterEntity, searchTerm]);

//   const toggleLotExpansion = (lotId: number) => {
//     setExpandedLots(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(lotId)) {
//         newSet.delete(lotId);
//       } else {
//         newSet.add(lotId);
//       }
//       return newSet;
//     });
//   };

//   const expandAll = () => {
//     const allLotIds = groupedMouvements.map(g => g.lotId);
//     setExpandedLots(new Set(allLotIds));
//   };

//   const collapseAll = () => {
//     setExpandedLots(new Set());
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setFilterType('tous');
//     setFilterEntity('tous');
//     setEntitySearch('');
//   };

//   const selectEntity = (entityId: string) => {
//     setFilterEntity(entityId);
//     setShowEntityDropdown(false);
//     setEntitySearch('');
//   };

//   const getSelectedEntityName = () => {
//     if (filterEntity === 'tous') return '';
//     const entity = entities.find(e => e.id.toString() === filterEntity);
//     if (!entity) return '';
//     return entity.nom_entite || entity.username;
//   };

//   const hasActiveFilters = filterType !== 'tous' || filterEntity !== 'tous' || searchTerm !== '';

//   const getTypeLabel = (type: string) => {
//     const labels: Record<string, string> = {
//       'creation_lot': 'Création du lot',
//       'fractionnement': 'Fractionnement',
//       'transfert': 'Transfert',
//       'reception': 'Réception',
//       'vente_grossiste': 'Vente à un grossiste',
//       'vente_pharmacie': 'Vente à une pharmacie',
//       'vente_patient': 'Vente à un patient',
//       'destruction': 'Destruction',
//       'verification': 'Vérification',
//       'rappel': 'Rappel de lot',
//     };
//     return labels[type] || type;
//   };

//   const getTypeIcon = (type: string) => {
//     const icons: Record<string, any> = {
//       'creation_lot': FiBox,
//       'transfert': FaTruck,
//       'reception': FaCheckCircle,
//       'vente_grossiste': FaStore,
//       'vente_pharmacie': FaStore,
//       'vente_patient': FaBuilding,
//       'destruction': FaTrash,
//       'verification': FaCheckCircle,
//       'rappel': FaExclamationTriangle,
//     };
//     return icons[type] || FaExchangeAlt;
//   };

//   const getTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'creation_lot': 'bg-blue-50 text-blue-700 border-blue-200',
//       'fractionnement': 'bg-purple-50 text-purple-700 border-purple-200',
//       'transfert': 'bg-amber-50 text-amber-700 border-amber-200',
//       'reception': 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       'vente_grossiste': 'bg-indigo-50 text-indigo-700 border-indigo-200',
//       'vente_pharmacie': 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       'vente_patient': 'bg-teal-50 text-teal-700 border-teal-200',
//       'destruction': 'bg-rose-50 text-rose-700 border-rose-200',
//       'verification': 'bg-slate-50 text-slate-700 border-slate-200',
//       'rappel': 'bg-orange-50 text-orange-700 border-orange-200',
//     };
//     return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200';
//   };

//   const getMouvementDescription = (mouvement: Mouvement) => {
//     const parts = [];
    
//     if (mouvement.quantite) {
//       parts.push(`${mouvement.quantite} ${mouvement.type_unite || 'unités'}`);
//     }
    
//     if (mouvement.type_mouvement === 'creation_lot') {
//       if (mouvement.source) {
//         parts.push(`par ${mouvement.source.nom_entite || mouvement.source.username}`);
//       }
//     } else {
//       if (mouvement.source) {
//         parts.push(`de ${mouvement.source.nom_entite || mouvement.source.username}`);
//       }
      
//       if (mouvement.destination) {
//         parts.push(`vers ${mouvement.destination.nom_entite || mouvement.destination.username}`);
//       }
//     }
    
//     if (parts.length === 0 && mouvement.commentaire) {
//       return mouvement.commentaire;
//     }
    
//     return parts.join(' ');
//   };

//   const getRoleLabel = (role: string) => {
//     const roles: Record<string, string> = {
//       'admin': 'Admin',
//       'fabricant': 'Fabricant',
//       'distributeur': 'Distributeur',
//       'pharmacie': 'Pharmacie',
//     };
//     return roles[role] || role;
//   };

//   const getEntityDisplayName = (entity: Entity) => {
//     const name = entity.nom_entite || entity.username;
//     return `${name}`;
//   };

//   const exportData = () => {
//     const allMouvements = groupedMouvements.flatMap(g => g.mouvements);
//     const data = allMouvements.map(m => ({
//       date: new Date(m.created_at).toLocaleString('fr-FR'),
//       type: getTypeLabel(m.type_mouvement),
//       lot: m.lot?.numero_lot,
//       medicament: m.lot?.medicament?.nom || 'Médicament inconnu',
//       quantite: m.quantite,
//       unite: m.type_unite,
//       source: m.source?.nom_entite || m.source?.username || '-',
//       destination: m.destination?.nom_entite || m.destination?.username || '-',
//       commentaire: m.commentaire || '',
//       hash: m.hash_mouvement
//     }));
    
//     if (data.length === 0) return;
    
//     const csv = [
//       Object.keys(data[0]).join(','),
//       ...data.map(row => Object.values(row).join(','))
//     ].join('\n');
    
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `mouvements-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-6 py-16">
//         <div className="flex flex-col items-center justify-center py-16">
//           <FaSpinner className="h-6 w-6 text-emerald-600 animate-spin mb-4" />
//           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Chargement...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
//       <div className="mb-10">
//         <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
//           Historique des mouvements
//         </h1>
//       </div>

//       <div className="bg-white border border-slate-200 mb-8">
//         <div className="p-5 border-b border-slate-100">
//           <div className="flex flex-col gap-4">
//             <div className="flex flex-col lg:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaSearch className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Rechercher par lot, médicament, entité ou commentaire..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-white text-sm
//                              focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
//                   />
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className={`px-4 py-2.5 text-sm font-medium border transition-colors flex items-center gap-2
//                     ${showFilters || hasActiveFilters 
//                       ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
//                       : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
//                     }`}
//                 >
//                   <FaFilter className="h-3.5 w-3.5" />
//                   <span>Filtres</span>
//                   {hasActiveFilters && (
//                     <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold">
//                       {(filterType !== 'tous' ? 1 : 0) + (filterEntity !== 'tous' ? 1 : 0)}
//                     </span>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={exportData}
//                   className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 
//                            hover:bg-slate-50 transition-colors flex items-center gap-2"
//                 >
//                   <FaDownload className="h-3.5 w-3.5" />
//                   <span className="hidden sm:inline">Exporter</span>
//                 </button>
//               </div>
//             </div>

//             {/* Panneau de filtres */}
//             {showFilters && (
//               <div className="pt-4 border-t border-slate-100">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
//                       Type de mouvement
//                     </label>
//                     <select
//                       value={filterType}
//                       onChange={(e) => setFilterType(e.target.value)}
//                       className="w-full px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700
//                                focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
//                     >
//                       <option value="tous">Tous les types</option>
//                       <option value="creation_lot">Création</option>
//                       <option value="transfert">Transfert</option>
//                       <option value="reception">Réception</option>
//                       <option value="vente_pharmacie">Vente pharmacie</option>
//                       <option value="vente_patient">Vente patient</option>
//                       <option value="destruction">Destruction</option>
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
//                       Entité (Distributeur, Pharmacie, etc.)
//                     </label>
//                     <div className="relative">
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <FaUser className="h-4 w-4 text-slate-400" />
//                         </div>
//                         <input
//                           type="text"
//                           placeholder={getSelectedEntityName() || "Rechercher une entité..."}
//                           value={entitySearch}
//                           onChange={(e) => {
//                             setEntitySearch(e.target.value);
//                             setShowEntityDropdown(true);
//                           }}
//                           onFocus={() => setShowEntityDropdown(true)}
//                           className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 bg-white text-sm
//                                    focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
//                         />
//                         {getSelectedEntityName() && (
//                           <button
//                             onClick={() => {
//                               setFilterEntity('tous');
//                               setEntitySearch('');
//                             }}
//                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                           >
//                             <FaTimes className="h-4 w-4 text-slate-400 hover:text-slate-600" />
//                           </button>
//                         )}
//                       </div>
                      
//                       {/* Dropdown de recherche d'entités */}
//                       {showEntityDropdown && (
//                         <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 shadow-lg max-h-60 overflow-auto">
//                           <div className="p-1">
//                             <button
//                               onClick={() => {
//                                 setFilterEntity('tous');
//                                 setShowEntityDropdown(false);
//                                 setEntitySearch('');
//                               }}
//                               className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
//                             >
//                               <span className="text-slate-400">—</span>
//                               Toutes les entités
//                             </button>
//                             {filteredEntities.map(entity => (
//                               <button
//                                 key={`entity-${entity.id}`}
//                                 onClick={() => selectEntity(entity.id.toString())}
//                                 className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 group"
//                               >
//                                 <FaUser className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500" />
//                                 <div>
//                                   <div className="font-medium text-slate-700">
//                                     {entity.nom_entite || entity.username}
//                                   </div>
//                                   <div className="text-xs text-slate-500">
//                                     {getRoleLabel(entity.role)}
//                                   </div>
//                                 </div>
//                               </button>
//                             ))}
//                             {filteredEntities.length === 0 && (
//                               <div className="px-3 py-2 text-sm text-slate-500 text-center">
//                                 Aucune entité trouvée
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
                
//                 {hasActiveFilters && (
//                   <div className="mt-4 flex justify-end">
//                     <button
//                       onClick={clearFilters}
//                       className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 
//                                hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
//                     >
//                       <FaTimes className="h-3 w-3" />
//                       Effacer tous les filtres
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
//               {groupedMouvements.length} lots · {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)} mouvements
//               {hasActiveFilters && (
//                 <span className="ml-2 text-emerald-600">(filtrés)</span>
//               )}
//             </span>
//           </div>
//           <div className="flex items-center gap-4">
//             <button
//               onClick={expandAll}
//               className="text-xs font-medium text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
//             >
//               Tout déplier
//             </button>
//             <span className="text-slate-300 text-xs">|</span>
//             <button
//               onClick={collapseAll}
//               className="text-xs font-medium text-slate-500 hover:text-slate-700 uppercase tracking-wider"
//             >
//               Tout replier
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 mb-8">
//         <div className="bg-white p-5">
//           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total lots</div>
//           <div className="text-2xl font-semibold text-slate-900">
//             {groupedMouvements.length}
//           </div>
//         </div>
//         <div className="bg-white p-5">
//           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total mouvements</div>
//           <div className="text-2xl font-semibold text-slate-900">
//             {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)}
//           </div>
//         </div>
//         <div className="bg-white p-5">
//           <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dernière activité</div>
//           <div className="text-base font-medium text-slate-900">
//             {groupedMouvements[0]?.mouvements[0] 
//               ? new Date(groupedMouvements[0].mouvements[0].created_at).toLocaleDateString('fr-FR')
//               : '—'
//             }
//           </div>
//         </div>
//       </div>

//       {groupedMouvements.length === 0 ? (
//         <div className="bg-white border border-slate-200 p-16">
//           <div className="text-center">
//             <FaBoxOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
//             <h3 className="text-base font-medium text-slate-900 mb-1">
//               Aucun mouvement trouvé
//             </h3>
//             {hasActiveFilters && (
//               <>
//                 <p className="text-sm text-slate-500 mb-4">
//                   Essayez de modifier vos critères de filtrage
//                 </p>
//                 <button
//                   onClick={clearFilters}
//                   className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 
//                            bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
//                 >
//                   <FaTimes className="h-3.5 w-3.5" />
//                   Effacer les filtres
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {groupedMouvements.map((group) => (
//             <div key={group.lotId} className="bg-white border border-slate-200">
//               <div 
//                 className="px-6 py-5 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-100"
//                 onClick={() => toggleLotExpansion(group.lotId)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className="text-slate-400">
//                       {expandedLots.has(group.lotId) ? (
//                         <FaChevronDown className="h-4 w-4" />
//                       ) : (
//                         <FaChevronRight className="h-4 w-4" />
//                       )}
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-emerald-50 border border-emerald-100">
//                           <FiBox className="h-4 w-4 text-emerald-600" />
//                         </div>
//                         <div>
//                           <span className="font-medium text-slate-900 text-base">
//                             {group.medicamentNom}
//                           </span>
//                           <div className="flex items-center gap-4 mt-1 text-xs">
//                             <span className="font-mono text-slate-600">Lot #{group.lotNumero}</span>
//                             <span className="text-slate-300">|</span>
//                             <span className="flex items-center gap-1.5 text-slate-500">
//                               <FaCalendar className="h-3 w-3" />
//                               Expire le {new Date(group.dateExpiration).toLocaleDateString('fr-FR')}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className={`text-2xl font-semibold ${
//                       group.quantiteActuelle === 0 ? 'text-rose-600' : 'text-emerald-600'
//                     }`}>
//                       {group.quantiteActuelle}
//                       <span className="text-sm font-normal text-slate-400 ml-2">
//                         / {group.quantiteInitiale}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {expandedLots.has(group.lotId) && (
//                 <div className="px-6 py-8 bg-slate-50/30">
//                   <div className="flow-root">
//                     <ul className="-mb-8">
//                       {group.mouvements.map((mouvement, index) => {
//                         const Icon = getTypeIcon(mouvement.type_mouvement);
//                         const isLast = index === group.mouvements.length - 1;
                        
//                         return (
//                           <li key={mouvement.id}>
//                             <div className="relative pb-8">
//                               {!isLast && (
//                                 <span
//                                   className="absolute top-5 left-4 -ml-px h-full w-px bg-slate-200"
//                                   aria-hidden="true"
//                                 />
//                               )}
//                               <div className="relative flex gap-4">
//                                 <div>
//                                   <span className={`h-9 w-9 flex items-center justify-center border ${getTypeColor(mouvement.type_mouvement)}`}>
//                                     <Icon className="h-3.5 w-3.5" />
//                                   </span>
//                                 </div>
//                                 <div className="flex min-w-0 flex-1 justify-between gap-6 pt-0.5">
//                                   <div className="flex-1">
//                                     <div className="flex items-center gap-3 mb-2">
//                                       <p className="text-sm font-medium text-slate-900">
//                                         {getTypeLabel(mouvement.type_mouvement)}
//                                       </p>
//                                       <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${getTypeColor(mouvement.type_mouvement)}`}>
//                                         {mouvement.type_mouvement.replace(/_/g, ' ')}
//                                       </span>
//                                     </div>
                                    
//                                     <p className="text-sm text-slate-600 mb-3">
//                                       {getMouvementDescription(mouvement)}
//                                     </p>
                                    
//                                     {mouvement.commentaire && (
//                                       <div className="mb-3 p-3 bg-white border border-slate-200">
//                                         <p className="text-sm text-slate-600">
//                                           {mouvement.commentaire}
//                                         </p>
//                                       </div>
//                                     )}
                                    
//                                     <div className="flex flex-wrap items-center gap-3">
//                                       {mouvement.source && (
//                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
//                                           <FaIndustry className="h-3 w-3 text-slate-500" />
//                                           <span className="text-xs text-slate-600">
//                                             {mouvement.source.nom_entite || mouvement.source.username}
//                                             <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.source.role)})</span>
//                                           </span>
//                                         </span>
//                                       )}
//                                       {mouvement.destination && (
//                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
//                                           <FaMapPin className="h-3 w-3 text-slate-500" />
//                                           <span className="text-xs text-slate-600">
//                                             {mouvement.destination.nom_entite || mouvement.destination.username}
//                                             <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.destination.role)})</span>
//                                           </span>
//                                         </span>
//                                       )}
//                                       {mouvement.created_by && (
//                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
//                                           <FaBuilding className="h-3 w-3 text-slate-500" />
//                                           <span className="text-xs text-slate-600">
//                                             Par: {mouvement.created_by}
//                                           </span>
//                                         </span>
//                                       )}
//                                     </div>
//                                   </div>
                                  
//                                   <div className="whitespace-nowrap text-right">
//                                     <time dateTime={mouvement.created_at} className="text-sm font-medium text-slate-700">
//                                       {new Date(mouvement.created_at).toLocaleString('fr-FR', {
//                                         day: '2-digit',
//                                         month: '2-digit',
//                                         year: 'numeric',
//                                         hour: '2-digit',
//                                         minute: '2-digit'
//                                       })}
//                                     </time>
//                                     <div className="mt-2 space-y-1.5">
//                                       <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
//                                         <FaCheckCircle className="mr-1.5 h-3 w-3" />
//                                         Vérifié
//                                       </span>
//                                       {mouvement.hash_mouvement && (
//                                         <div className="font-mono text-xs text-slate-400" title={mouvement.hash_mouvement}>
//                                           {mouvement.hash_mouvement.substring(0, 10)}...
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// app/mouvements/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FaExchangeAlt, 
  FaDownload, 
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaCalendar,
  FaMapPin,
  FaCheckCircle,
  FaTruck,
  FaStore,
  FaWarehouse,
  FaTrash,
  FaExclamationTriangle,
  FaSpinner,
  FaBoxOpen,
  FaIndustry,
  FaBuilding,
  FaFilter,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import { getMouvements } from './actions';
import type { Mouvement } from '@/types';
import { FiBox } from 'react-icons/fi';

interface GroupedMouvements {
  lotId: number;
  lotNumero: string;
  medicamentNom: string;
  medicamentId: number;
  dateExpiration: string;
  mouvements: Mouvement[];
  quantiteInitiale: number;
  quantiteActuelle: number;
}

interface Entity {
  id: number;
  matricule: string;
  username: string;
  nom_entite: string | null;
  role: string;
}

export default function MouvementsPage() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterEntity, setFilterEntity] = useState('tous');
  const [entitySearch, setEntitySearch] = useState('');
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [expandedLots, setExpandedLots] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    loadMouvements();
  }, []);

  useEffect(() => {
    // Extraire les entités uniques des mouvements
    const entityMap = new Map<number, Entity>();
    
    mouvements.forEach(m => {
      // Ajouter la source si elle existe
      if (m.source && m.source.id) {
        const sourceId = typeof m.source.id === 'string' ? parseInt(m.source.id) : m.source.id;
        if (!entityMap.has(sourceId)) {
          entityMap.set(sourceId, {
            ...m.source,
            id: sourceId
          });
        }
      }
      // Ajouter la destination si elle existe
      if (m.destination && m.destination.id) {
        const destId = typeof m.destination.id === 'string' ? parseInt(m.destination.id) : m.destination.id;
        if (!entityMap.has(destId)) {
          entityMap.set(destId, {
            ...m.destination,
            id: destId
          });
        }
      }
    });
    
    setEntities(Array.from(entityMap.values()));
  }, [mouvements]);

  // Filtrer les entités basé sur la recherche
  const filteredEntities = useMemo(() => {
    if (!entitySearch) return entities;
    
    const search = entitySearch.toLowerCase();
    return entities.filter(entity => {
      const name = entity.nom_entite?.toLowerCase() || '';
      const username = entity.username.toLowerCase();
      const role = getRoleLabel(entity.role).toLowerCase();
      
      return name.includes(search) || username.includes(search) || role.includes(search);
    });
  }, [entities, entitySearch]);

  const loadMouvements = async () => {
    try {
      setLoading(true);
      const data = await getMouvements();
      setMouvements(data);
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedMouvements = useMemo(() => {
    const groups = new Map<number, GroupedMouvements>();
    
    mouvements.forEach(mouvement => {
      if (!mouvement.lot) return;
      
      const lotId = mouvement.lot.id;
      
      if (!groups.has(lotId)) {
        const creationMouvement = mouvements.find(m => 
          m.lot?.id === lotId && m.type_mouvement === 'creation_lot'
        );
        
        let quantiteActuelle = 0;
        const lotMouvements = mouvements.filter(m => m.lot?.id === lotId);
        
        lotMouvements.forEach(m => {
          if (m.type_mouvement === 'creation_lot') {
            quantiteActuelle += m.quantite || 0;
          } else if (m.type_mouvement === 'transfert' || m.type_mouvement.includes('vente')) {
            quantiteActuelle -= m.quantite || 0;
          } else if (m.type_mouvement === 'destruction') {
            quantiteActuelle -= m.quantite || 0;
          }else if (m.type_mouvement === 'retrait_defectueux') {
            quantiteActuelle -= m.quantite || 0;
        }
        });
        
        groups.set(lotId, {
          lotId,
          lotNumero: mouvement.lot.numero_lot,
          medicamentNom: mouvement.lot.medicament?.nom || 'Médicament inconnu',
          medicamentId: mouvement.lot.medicament_id,
          dateExpiration: mouvement.lot.date_expiration,
          mouvements: [],
          quantiteInitiale: creationMouvement?.quantite || 0,
          quantiteActuelle: Math.max(0, quantiteActuelle)
        });
      }
      
      const group = groups.get(lotId)!;
      let shouldInclude = true;
      
      // Filtre par type
      if (filterType !== 'tous' && mouvement.type_mouvement !== filterType) {
        shouldInclude = false;
      }
      
      // Filtre par entité (distributeur, pharmacie, etc.)
      if (filterEntity !== 'tous' && shouldInclude) {
        const entityId = parseInt(filterEntity);
        
        const sourceId = mouvement.source?.id ? 
          (typeof mouvement.source.id === 'string' ? parseInt(mouvement.source.id) : mouvement.source.id) : null;
        const destId = mouvement.destination?.id ? 
          (typeof mouvement.destination.id === 'string' ? parseInt(mouvement.destination.id) : mouvement.destination.id) : null;
        
        const matchesSource = sourceId === entityId;
        const matchesDestination = destId === entityId;
        
        // Ne pas filtrer les créations de lot
        if (mouvement.type_mouvement !== 'creation_lot' && !matchesSource && !matchesDestination) {
          shouldInclude = false;
        }
      }
      
      // Filtre par recherche textuelle
      if (searchTerm && shouldInclude) {
        const term = searchTerm.toLowerCase();
        const matchesLot = group.lotNumero.toLowerCase().includes(term);
        const matchesMedicament = group.medicamentNom.toLowerCase().includes(term);
        const matchesComment = mouvement.commentaire?.toLowerCase().includes(term);
        const matchesSource = mouvement.source?.nom_entite?.toLowerCase().includes(term);
        const matchesDestination = mouvement.destination?.nom_entite?.toLowerCase().includes(term);
        const matchesCreatedBy = mouvement.created_by?.toLowerCase().includes(term);
        
        if (!matchesLot && !matchesMedicament && !matchesComment && !matchesSource && !matchesDestination && !matchesCreatedBy) {
          shouldInclude = false;
        }
      }
      
      if (shouldInclude) {
        group.mouvements.push(mouvement);
      }
    });
    
    const result = Array.from(groups.values())
      .filter(group => group.mouvements.length > 0)
      .map(group => ({
        ...group,
        mouvements: group.mouvements.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }));
    
    return result.sort((a, b) => {
      const dateA = new Date(a.mouvements[0]?.created_at || 0).getTime();
      const dateB = new Date(b.mouvements[0]?.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [mouvements, filterType, filterEntity, searchTerm]);

  const toggleLotExpansion = (lotId: number) => {
    setExpandedLots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lotId)) {
        newSet.delete(lotId);
      } else {
        newSet.add(lotId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allLotIds = groupedMouvements.map(g => g.lotId);
    setExpandedLots(new Set(allLotIds));
  };

  const collapseAll = () => {
    setExpandedLots(new Set());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('tous');
    setFilterEntity('tous');
    setEntitySearch('');
  };

  const selectEntity = (entityId: string) => {
    setFilterEntity(entityId);
    setShowEntityDropdown(false);
    setEntitySearch('');
  };

  const getSelectedEntityName = () => {
    if (filterEntity === 'tous') return '';
    const entity = entities.find(e => e.id.toString() === filterEntity);
    if (!entity) return '';
    // Priorité au nom_entite, sinon username
    return entity.nom_entite || entity.username;
  };

  const hasActiveFilters = filterType !== 'tous' || filterEntity !== 'tous' || searchTerm !== '';

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'creation_lot': 'Création du lot',
      'fractionnement': 'Fractionnement',
      'transfert': 'Transfert',
      'reception': 'Réception',
      'vente_grossiste': 'Vente à un grossiste',
      'vente_pharmacie': 'Vente à une pharmacie',
      'vente_patient': 'Vente à un patient',
      'destruction': 'Destruction',
       'retrait_defectueux': 'Retrait lot défectueux',
      'verification': 'Vérification',
      'rappel': 'Rappel de lot',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'creation_lot': FiBox,
      'transfert': FaTruck,
      'reception': FaCheckCircle,
      'vente_grossiste': FaStore,
      'vente_pharmacie': FaStore,
      'vente_patient': FaBuilding,
      'destruction': FaTrash,
       'retrait_defectueux': FaTrash,
      'verification': FaCheckCircle,
      'rappel': FaExclamationTriangle,
    };
    return icons[type] || FaExchangeAlt;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'creation_lot': 'bg-blue-50 text-blue-700 border-blue-200',
      'fractionnement': 'bg-purple-50 text-purple-700 border-purple-200',
      'transfert': 'bg-amber-50 text-amber-700 border-amber-200',
      'reception': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'vente_grossiste': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'vente_pharmacie': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'vente_patient': 'bg-teal-50 text-teal-700 border-teal-200',
      'destruction': 'bg-rose-50 text-rose-700 border-rose-200',
       'retrait_defectueux': 'bg-red-50 text-red-700 border-red-200',
      'verification': 'bg-slate-50 text-slate-700 border-slate-200',
      'rappel': 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // // Fonction pour obtenir le nom d'affichage d'une entité
  // const getEntityDisplayName = (entity: any): string => {
  //   if (!entity) return 'Inconnu';
  //   // Priorité absolue au nom_entite
  //   if (entity.nom_entite && entity.nom_entite.trim() !== '') {
  //     return entity.nom_entite;
  //   }
  //   // Sinon utiliser le username
  //   if (entity.username && entity.username.trim() !== '') {
  //     return entity.username;
  //   }
  //   return 'Inconnu';
  // };
// Fonction pour obtenir le nom d'affichage d'une entité - CORRIGÉE
const getEntityDisplayName = (entity: any): string => {
  if (!entity) return 'Inconnu';
  
  // Vérifier si l'entité a un nom_entite non null et non vide
  if (entity.nom_entite && typeof entity.nom_entite === 'string' && entity.nom_entite.trim() !== '') {
    return entity.nom_entite;
  }
  
  // Si nom_entite est null ou vide, utiliser username
  if (entity.username && typeof entity.username === 'string' && entity.username.trim() !== '') {
    return entity.username;
  }
  
  // Si on a un matricule, l'utiliser
  if (entity.matricule && typeof entity.matricule === 'string' && entity.matricule.trim() !== '') {
    return entity.matricule;
  }
  
  // En dernier recours, retourner l'ID
  return `Entité #${entity.id}`;
};
  // Fonction pour obtenir le nom complet avec rôle
  const getEntityFullName = (entity: any): string => {
    if (!entity) return 'Inconnu';
    const name = getEntityDisplayName(entity);
    const role = entity.role ? ` (${getRoleLabel(entity.role)})` : '';
    return `${name}${role}`;
  };

const getMouvementDescription = (mouvement: Mouvement) => {
  const parts = [];
  
  if (mouvement.quantite) {
    parts.push(`${mouvement.quantite} ${mouvement.type_unite || 'unités'}`);
  }
  
  switch (mouvement.type_mouvement) {
    case 'creation_lot':
      if (mouvement.source) {
        parts.push(`par ${getEntityDisplayName(mouvement.source)}`);
      }
      break;
      
    case 'reception':
      // Pour la réception : 
      // source = le distributeur qui a reçu
      // destination = le fabricant qui a envoyé
      if (mouvement.source) {
        parts.push(`par ${getEntityDisplayName(mouvement.source)}`);
      }
      if (mouvement.destination) {
        parts.push(`(expédié par ${getEntityDisplayName(mouvement.destination)})`);
      }
      break;
     case 'retrait_defectueux':
  if (mouvement.source) {
    parts.push(`retiré par ${getEntityDisplayName(mouvement.source)}`);
  }
  break; 
    case 'transfert':
      if (mouvement.source) {
        parts.push(`de ${getEntityDisplayName(mouvement.source)}`);
      }
      if (mouvement.destination) {
        parts.push(`vers ${getEntityDisplayName(mouvement.destination)}`);
      }
      break;
      
    default:
      if (mouvement.source) {
        parts.push(`de ${getEntityDisplayName(mouvement.source)}`);
      }
      if (mouvement.destination) {
        parts.push(`vers ${getEntityDisplayName(mouvement.destination)}`);
      }
  }
  
  if (mouvement.created_by && mouvement.type_mouvement !== 'reception') {
    parts.push(`(par ${mouvement.created_by})`);
  }
  
  return parts.join(' ') || mouvement.commentaire || '';
};
  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'admin': 'Administrateur',
      'fabricant': 'Fabricant',
      'distributeur': 'Distributeur',
      'pharmacie': 'Pharmacie',
    };
    return roles[role] || role;
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, any> = {
      'admin': FaBuilding,
      'fabricant': FaIndustry,
      'distributeur': FaWarehouse,
      'pharmacie': FaStore,
    };
    return icons[role] || FaUser;
  };

  const exportData = () => {
    const allMouvements = groupedMouvements.flatMap(g => g.mouvements);
    const data = allMouvements.map(m => ({
      date: new Date(m.created_at).toLocaleString('fr-FR'),
      type: getTypeLabel(m.type_mouvement),
      lot: m.lot?.numero_lot,
      medicament: m.lot?.medicament?.nom || 'Médicament inconnu',
      quantite: m.quantite,
      unite: m.type_unite,
      source: getEntityDisplayName(m.source),
      destination: getEntityDisplayName(m.destination),
      created_by: m.created_by || '',
      commentaire: m.commentaire || '',
      hash: m.hash_mouvement
    }));
    
    if (data.length === 0) return;
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mouvements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-16">
          <FaSpinner className="h-6 w-6 text-emerald-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Historique des mouvements
        </h1>
      </div>

      <div className="bg-white border border-slate-200 mb-8">
        <div className="p-5 border-b border-slate-100">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par lot, médicament, entité ou commentaire..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-white text-sm
                             focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 text-sm font-medium border transition-colors flex items-center gap-2
                    ${showFilters || hasActiveFilters 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <FaFilter className="h-3.5 w-3.5" />
                  <span>Filtres</span>
                  {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                      {(filterType !== 'tous' ? 1 : 0) + (filterEntity !== 'tous' ? 1 : 0)}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={exportData}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 
                           hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <FaDownload className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exporter</span>
                </button>
              </div>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Type de mouvement
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700
                               focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="tous">Tous les types</option>
                      <option value="creation_lot">Création</option>
                      <option value="transfert">Transfert</option>
                      <option value="reception">Réception</option>
                      <option value="retrait_defectueux">Retrait défectueux</option>
                      <option value="vente_pharmacie">Vente pharmacie</option>
                      <option value="vente_patient">Vente patient</option>
                      <option value="destruction">Destruction</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Entité (Distributeur, Pharmacie, etc.)
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder={getSelectedEntityName() || "Rechercher une entité..."}
                          value={entitySearch}
                          onChange={(e) => {
                            setEntitySearch(e.target.value);
                            setShowEntityDropdown(true);
                          }}
                          onFocus={() => setShowEntityDropdown(true)}
                          className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 bg-white text-sm
                                   focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        {getSelectedEntityName() && (
                          <button
                            onClick={() => {
                              setFilterEntity('tous');
                              setEntitySearch('');
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <FaTimes className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                          </button>
                        )}
                      </div>
                      
                      {/* Dropdown de recherche d'entités */}
                      {showEntityDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 shadow-lg max-h-60 overflow-auto">
                          <div className="p-1">
                            <button
                              onClick={() => {
                                setFilterEntity('tous');
                                setShowEntityDropdown(false);
                                setEntitySearch('');
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <span className="text-slate-400">—</span>
                              Toutes les entités
                            </button>
                            {filteredEntities.map(entity => {
                              const RoleIcon = getRoleIcon(entity.role);
                              return (
                                <button
                                  key={`entity-${entity.id}`}
                                  onClick={() => selectEntity(entity.id.toString())}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 group"
                                >
                                  <RoleIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500" />
                                  <div>
                                    <div className="font-medium text-slate-700">
                                      {entity.nom_entite || entity.username}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {getRoleLabel(entity.role)}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                            {filteredEntities.length === 0 && (
                              <div className="px-3 py-2 text-sm text-slate-500 text-center">
                                Aucune entité trouvée
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 
                               hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <FaTimes className="h-3 w-3" />
                      Effacer tous les filtres
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {groupedMouvements.length} lots · {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)} mouvements
              {hasActiveFilters && (
                <span className="ml-2 text-emerald-600">(filtrés)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={expandAll}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
            >
              Tout déplier
            </button>
            <span className="text-slate-300 text-xs">|</span>
            <button
              onClick={collapseAll}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 uppercase tracking-wider"
            >
              Tout replier
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 mb-8">
        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total lots</div>
          <div className="text-2xl font-semibold text-slate-900">
            {groupedMouvements.length}
          </div>
        </div>
        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total mouvements</div>
          <div className="text-2xl font-semibold text-slate-900">
            {groupedMouvements.reduce((acc, g) => acc + g.mouvements.length, 0)}
          </div>
        </div>
        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dernière activité</div>
          <div className="text-base font-medium text-slate-900">
            {groupedMouvements[0]?.mouvements[0] 
              ? new Date(groupedMouvements[0].mouvements[0].created_at).toLocaleDateString('fr-FR')
              : '—'
            }
          </div>
        </div>
      </div>

      {groupedMouvements.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16">
          <div className="text-center">
            <FaBoxOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-base font-medium text-slate-900 mb-1">
              Aucun mouvement trouvé
            </h3>
            {hasActiveFilters && (
              <>
                <p className="text-sm text-slate-500 mb-4">
                  Essayez de modifier vos critères de filtrage
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 
                           bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                  Effacer les filtres
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedMouvements.map((group) => (
            <div key={group.lotId} className="bg-white border border-slate-200">
              <div 
                className="px-6 py-5 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-100"
                onClick={() => toggleLotExpansion(group.lotId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400">
                      {expandedLots.has(group.lotId) ? (
                        <FaChevronDown className="h-4 w-4" />
                      ) : (
                        <FaChevronRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 border border-emerald-100">
                          <FiBox className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 text-base">
                            {group.medicamentNom}
                          </span>
                          <div className="flex items-center gap-4 mt-1 text-xs">
                            <span className="font-mono text-slate-600">Lot #{group.lotNumero}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <FaCalendar className="h-3 w-3" />
                              Expire le {new Date(group.dateExpiration).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-semibold ${
                      group.quantiteActuelle === 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {group.quantiteActuelle}
                      <span className="text-sm font-normal text-slate-400 ml-2">
                        / {group.quantiteInitiale}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedLots.has(group.lotId) && (
                <div className="px-6 py-8 bg-slate-50/30">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {group.mouvements.map((mouvement, index) => {
                        const Icon = getTypeIcon(mouvement.type_mouvement);
                        const isLast = index === group.mouvements.length - 1;
                        const SourceRoleIcon = mouvement.source ? getRoleIcon(mouvement.source.role) : FaUser;
                        const DestRoleIcon = mouvement.destination ? getRoleIcon(mouvement.destination.role) : FaUser;
                        
                        return (
                          <li key={mouvement.id}>
                            <div className="relative pb-8">
                              {!isLast && (
                                <span
                                  className="absolute top-5 left-4 -ml-px h-full w-px bg-slate-200"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex gap-4">
                                <div>
                                  <span className={`h-9 w-9 flex items-center justify-center border ${getTypeColor(mouvement.type_mouvement)}`}>
                                    <Icon className="h-3.5 w-3.5" />
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between gap-6 pt-0.5">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <p className="text-sm font-medium text-slate-900">
                                        {getTypeLabel(mouvement.type_mouvement)}
                                      </p>
                                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${getTypeColor(mouvement.type_mouvement)}`}>
                                        {mouvement.type_mouvement.replace(/_/g, ' ')}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-600 mb-3">
                                      {getMouvementDescription(mouvement)}
                                    </p>
                                    
                                    {mouvement.commentaire && (
                                      <div className="mb-3 p-3 bg-white border border-slate-200">
                                        <p className="text-sm text-slate-600">
                                          {mouvement.commentaire}
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                      {/* Source */}
                                      {mouvement.source && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
                                          <SourceRoleIcon className="h-3 w-3 text-slate-500" />
                                          <span className="text-xs text-slate-600">
                                            <span className="font-medium">{getEntityDisplayName(mouvement.source)}</span>
                                            <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.source.role)})</span>
                                          </span>
                                        </span>
                                      )}
                                      
                                      {/* Destination */}
                                      {mouvement.destination && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
                                          <DestRoleIcon className="h-3 w-3 text-slate-500" />
                                          <span className="text-xs text-slate-600">
                                            <span className="font-medium">{getEntityDisplayName(mouvement.destination)}</span>
                                            <span className="text-slate-400 ml-1">({getRoleLabel(mouvement.destination.role)})</span>
                                          </span>
                                        </span>
                                      )}
                                      
                                      {/* Créé par */}
                                      {mouvement.created_by && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200">
                                          <FaBuilding className="h-3 w-3 text-slate-500" />
                                          <span className="text-xs text-slate-600">
                                            Par: <span className="font-medium">{mouvement.created_by}</span>
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="whitespace-nowrap text-right">
                                    <time dateTime={mouvement.created_at} className="text-sm font-medium text-slate-700">
                                      {new Date(mouvement.created_at).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </time>
                                    <div className="mt-2 space-y-1.5">
                                      <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                                        <FaCheckCircle className="mr-1.5 h-3 w-3" />
                                        Vérifié
                                      </span>
                                      {mouvement.hash_mouvement && (
                                        <div className="font-mono text-xs text-slate-400" title={mouvement.hash_mouvement}>
                                          {mouvement.hash_mouvement.substring(0, 10)}...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}