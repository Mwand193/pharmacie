

// // app/lots/page.tsx
// 'use client';
// import RouteProtector from '@/components/RouteProtector'
// import { useState, useEffect } from 'react';
// import { 
//   FaPlus, 
//   FaQrcode, 
//   FaSearch, 
//   FaCheckCircle, 
//   FaExclamationTriangle,
//   FaTimesCircle,
//   FaMinusCircle,
//   FaExclamationCircle
// } from 'react-icons/fa';
// import { Package, Trash2 } from 'lucide-react';
// import CreateLotModal from '@/components/Modals/CreateLotModal';
// import QRCodeModal from '@/components/Modals/QRCodeModal';
// import { getLots, deleteLotWithoutMovements } from './actions';
// import type { Lot } from '@/types';
// import { FiBox } from "react-icons/fi";

// // Étendre le type Lot pour inclure les nouvelles propriétés
// // app/lots/page.tsx - Mise à jour du type
// interface LotWithStats extends Lot {
//   quantite_transferee?: number;
//   quantite_restante?: number;
//   quantite_retiree?: number; // Nouveau
//   nombre_retraits?: number; // Nouveau
//   statut?: 'disponible' | 'partiel' | 'epuise' | 'expire';
//   isDeletable?: boolean;
//   mouvementsDetail?: { // Nouveau
//     total: number;
//     retraits: number;
//     transferts: number;
//   };
// }

// export default function LotsPage() {
//   const [lots, setLots] = useState<LotWithStats[]>([]);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isQRModalOpen, setIsQRModalOpen] = useState(false);
//   const [selectedLot, setSelectedLot] = useState<LotWithStats | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [deletingLotId, setDeletingLotId] = useState<number | null>(null);

//   useEffect(() => {
//     loadLots();
//   }, []);

//   const loadLots = async () => {
//     try {
//       const data = await getLots();
//       setLots(data);
//     } catch (error) {
//       console.error('Erreur chargement lots:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteLot = async (lotId: number) => {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible.')) {
//       return;
//     }
    
//     setDeletingLotId(lotId);
    
//     try {
//       await deleteLotWithoutMovements(lotId);
//       await loadLots();
//       alert('Lot supprimé avec succès');
//     } catch (error) {
//       console.error('Erreur suppression:', error);
//       alert(error instanceof Error ? error.message : 'Erreur lors de la suppression du lot');
//     } finally {
//       setDeletingLotId(null);
//     }
//   };

//   const getLotStatusConfig = (lot: LotWithStats) => {
//     const statut = lot.statut || 'disponible';
    
//     const configs = {
//       disponible: {
//         label: 'Disponible',
//         color: 'bg-green-100 text-green-800 border-green-200',
//         icon: FaCheckCircle,
//         iconColor: 'text-green-600'
//       },
//       partiel: {
//         label: 'Partiellement transféré',
//         color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//         icon: FaMinusCircle,
//         iconColor: 'text-yellow-600'
//       },
//       epuise: {
//         label: 'Épuisé',
//         color: 'bg-gray-100 text-gray-800 border-gray-200',
//         icon: FaTimesCircle,
//         iconColor: 'text-gray-600'
//       },
//       expire: {
//         label: 'Expiré',
//         color: 'bg-red-100 text-red-800 border-red-200',
//         icon: FaExclamationTriangle,
//         iconColor: 'text-red-600'
//       }
//     };
//     return configs[statut] || configs.disponible;
//   };

//   const filteredLots = lots.filter(lot => 
//     lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     lot.medicament?.nom.toLowerCase().includes(searchTerm.toLowerCase())
//   );
// // app/lots/page.tsx - Ajoutez cette fonction en haut du composant
// // Juste avant le return

// const generateTraceabilityCodeForLot = (lot: any) => {
//   const numeroCourt = (lot.numero_lot || '')
//     .replace(/[^A-Z0-9]/g, '')
//     .slice(-4)
//     .toUpperCase()
//     .padEnd(4, 'X');
  
//   const codeUniqueCourt = (lot.code_unique || '')
//     .replace(/[^A-Z0-9]/g, '')
//     .slice(-6)
//     .toUpperCase()
//     .padEnd(6, '0');
  
//   const hashCourt = (lot.hash_lot || '')
//     .replace(/[^A-F0-9]/g, '')
//     .substring(0, 6)
//     .toUpperCase()
//     .padEnd(6, '0');
  
//   return `TRC-${numeroCourt}-${codeUniqueCourt}-${hashCourt}`;
// };
//   return (
//     <RouteProtector roles={['fabricant','admin']} showUnauthorized={true}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="sm:flex sm:items-center">
//           <div className="sm:flex-auto">
//             <h1 className="text-2xl font-semibold text-gray-900">Lots</h1>
//             <p className="mt-2 text-sm text-gray-700">
//               Gestion des lots de médicaments avec traçabilité blockchain
//             </p>
//           </div>
//           <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="inline-flex items-center justify-center -md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
//             >
//               <FaPlus className="mr-2 h-4 w-4" />
//               Nouveau lot
//             </button>
//           </div>
//         </div>

//         {/* Barre de recherche */}
//         <div className="mt-4">
//           <div className="relative">
//             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//               <FaSearch className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Rechercher un lot par numéro ou médicament..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full -md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         <div className="mt-8 grid  grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {loading ? (
//             <div className="col-span-full text-center py-12">
//               <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement...</h3>
//             </div>
//           ) : filteredLots.length === 0 ? (
//             <div className="col-span-full text-center py-12">
//               <Package className="mx-auto h-12 w-12 text-gray-400" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot</h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 Commencez par créer un nouveau lot.
//               </p>
//             </div>
//           ) : (
//             filteredLots.map((lot) => {
//               const statusConfig = getLotStatusConfig(lot);
//               const StatusIcon = statusConfig.icon;
//               const quantiteRestante = lot.quantite_restante ?? lot.quantite_totale;
//               const isExpired = new Date(lot.date_expiration) < new Date();
              
//               return (
//                 <div
//                   key={lot.id}
//                   className="relative flex flex-col  -lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <div className="flex h-10 w-10 items-center justify-center -full bg-green-100">
//                         <FiBox className="h-5 w-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-900">
//                           {lot.medicament?.nom}
//                         </h3>
//                         <p className="text-xs text-gray-500">
//                           {lot.medicament?.dosage} - {lot.medicament?.forme}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center space-x-2">
//                       {lot.isDeletable && (
//                         <div className="relative group">
//                           <FaExclamationCircle className="h-5  w-5 text-amber-500 hover:text-amber-600 cursor-help" />
//                           <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 px-2 py-1 bg-gray-900 text-white text-xs  shadow-lg">
//                             Ce lot n'a pas de mouvements (autre que création)
//                           </div>
//                         </div>
//                       )}
                      
//                       {lot.isDeletable && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteLot(lot.id);
//                           }}
//                           disabled={deletingLotId === lot.id}
//                           className="text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                           title="Supprimer le lot (sans mouvements)"
//                         >
//                           {deletingLotId === lot.id ? (
//                             <div className="h-5 w-5 animate-spin -full border-2 border-red-600 border-t-transparent" />
//                           ) : (
//                             <Trash2 className="h-5 w-5" />
//                           )}
//                         </button>
//                       )}
                      
//                       <button
//                         onClick={() => {
//                           setSelectedLot(lot);
//                           setIsQRModalOpen(true);
//                         }}
//                         className="text-green-600 hover:text-green-700"
//                         title="Voir QR Code"
//                       >
//                         <FaQrcode className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="mt-4 space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">N° Lot:</span>
//                       <span className="font-mono font-medium text-gray-900">
//                         {lot.numero_lot}
//                       </span>
//                     </div>
                    
//                     {/* AFFICHAGE DU TOTAL ET DU RESTANT */}
//                     <div className="bg-gray-50 -lg p-3 space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Quantité totale:</span>
//                         <span className="font-semibold text-gray-900">
//                           {lot.quantite_totale} unités
//                         </span>
//                       </div>
//                        {lot.quantite_retiree !== undefined && lot.quantite_retiree > 0 && (
//     <div className="flex justify-between text-sm">
//       <span className="text-gray-500">
//         <FaExclamationTriangle className="inline mr-1 text-red-500" />
//         Retirés (défectueux):
//       </span>
//       <span className="font-medium text-red-600">
//         {lot.quantite_retiree} unités
//         {lot.nombre_retraits && lot.nombre_retraits > 1 && 
//           ` (${lot.nombre_retraits} retraits)`
//         }
//       </span>
//     </div>
//   )}
//                       {lot.quantite_transferee !== undefined && lot.quantite_transferee > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-500">Quantité transférée:</span>
//                           <span className="font-medium text-yellow-600">
//                             {lot.quantite_transferee} unités
//                           </span>
//                         </div>
//                       )}
                      
//                       <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
//                         <span className="text-gray-700 font-medium">Reste disponible:</span>
//                         <span className={`font-bold text-lg ${
//                           quantiteRestante > 0 
//                             ? 'text-green-600' 
//                             : 'text-red-600'
//                         }`}>
//                           {quantiteRestante} unités
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Fabrication:</span>
//                       <span className="text-gray-900">
//                         {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Expiration:</span>
//                       <span className={`font-medium ${
//                         isExpired ? 'text-red-600' : 'text-gray-900'
//                       }`}>
//                         {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="mt-2 flex justify-between text-sm">
//                     <span className="text-gray-500">Fabricant:</span>
//                     <span className="text-gray-900 font-medium">
//                       {lot.created_by}
//                     </span>
//                   </div>

//                   {/* Statut du lot */}
//                   <div className="mt-4">
//                     <div className={`inline-flex items-center px-3 py-1 -full text-xs font-medium border ${statusConfig.color}`}>
//                       <StatusIcon className={`mr-1.5 h-3.5 w-3.5 ${statusConfig.iconColor}`} />
//                       {statusConfig.label}
//                     </div>
//                   </div>

//                   {/* Barre de progression */}
//                   {lot.quantite_transferee !== undefined && lot.quantite_transferee > 0 && (
//                     <div className="mt-3">
//                       <div className="w-full bg-gray-200 -full h-2">
//                         <div 
//                           className="bg-green-600 h-2 -full transition-all duration-500"
//                           style={{ 
//                             width: `${(lot.quantite_transferee / lot.quantite_totale) * 100}%` 
//                           }}
//                         />
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1 text-right">
//                         {((lot.quantite_transferee / lot.quantite_totale) * 100).toFixed(1)}% transféré
//                       </div>
//                     </div>
//                   )}

//                   <div className="mt-4 border-t border-gray-200 pt-4">
//                     <div className="text-xs font-mono text-gray-500 truncate">
//                       Hash: {lot.hash_lot?.substring(0, 32)}...
//                     </div>
//                   </div>
// <div className="mt-2 flex items-center justify-between">
//     <span className="text-xs text-gray-500">Code traçabilité:</span>
//     <button
//       onClick={() => {
//         const code = generateTraceabilityCodeForLot(lot);
//         navigator.clipboard.writeText(code);
//         alert(`Code copié: ${code}`);
//       }}
//       className="text-xs font-mono text-blue-600 hover:text-blue-800 cursor-pointer"
//       title="Cliquer pour copier"
//     >
//       {generateTraceabilityCodeForLot(lot)}
//     </button>
//   </div>
//                   {/* Badge d'expiration */}
//                   <div className="mt-3">
//                     <span className={`inline-flex items-center -full px-2.5 py-0.5 text-xs font-medium ${
//                       isExpired 
//                         ? 'bg-red-100 text-red-800'
//                         : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-green-100 text-green-800'
//                     }`}>
//                       {isExpired 
//                         ? 'Expiré'
//                         : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
//                         ? 'Expire bientôt'
//                         : 'Valide'}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         <CreateLotModal
//           isOpen={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//           onSuccess={loadLots}
//         />

//         {selectedLot && (
//           <QRCodeModal
//             isOpen={isQRModalOpen}
//             onClose={() => {
//               setIsQRModalOpen(false);
//               setSelectedLot(null);
//             }}
//             lot={selectedLot}
//           />
//         )}
//       </div>
//     </RouteProtector>
//   );
// }

// app/lots/page.tsx
'use client';
import RouteProtector from '@/components/RouteProtector'
import { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaQrcode, 
  FaSearch, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimesCircle,
  FaMinusCircle,
  FaExclamationCircle,
  FaTruck,
  FaTrash,
  FaBuilding
} from 'react-icons/fa';
import { Package, Trash2, AlertCircle } from 'lucide-react';
import CreateLotModal from '@/components/Modals/CreateLotModal';
import QRCodeModal from '@/components/Modals/QRCodeModal';
import { getLots, deleteLotWithoutMovements } from './actions';
import type { Lot } from '@/types';
import { FiBox } from "react-icons/fi";

// Type étendu pour les lots avec statistiques
interface LotWithStats extends Lot {
  quantite_transferee?: number;
  quantite_restante?: number;
  quantite_retiree?: number;
  nombre_retraits?: number;
  quantite_distribuee?: number;
  nombre_distributions?: number;
  statut?: 'disponible' | 'partiel' | 'epuise' | 'expire';
  isDeletable?: boolean;
  mouvementsDetail?: {
    total: number;
    retraits: number;
    transferts: number;
    distributions: number;
  };
}

export default function LotsPage() {
  const [lots, setLots] = useState<LotWithStats[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotWithStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingLotId, setDeletingLotId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('tous');

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      const data = await getLots();
      setLots(data);
    } catch (error) {
      console.error('Erreur chargement lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLot = async (lotId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible.')) {
      return;
    }
    
    setDeletingLotId(lotId);
    
    try {
      await deleteLotWithoutMovements(lotId);
      await loadLots();
      alert('Lot supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression du lot');
    } finally {
      setDeletingLotId(null);
    }
  };

  const getLotStatusConfig = (lot: LotWithStats) => {
    const statut = lot.statut || 'disponible';
    
    const configs = {
      disponible: {
        label: 'Disponible',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FaCheckCircle,
        iconColor: 'text-green-600',
        description: 'Lot disponible pour utilisation'
      },
      partiel: {
        label: 'Partiellement utilisé',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FaMinusCircle,
        iconColor: 'text-yellow-600',
        description: 'Une partie du lot a été transférée ou distribuée'
      },
      epuise: {
        label: 'Épuisé',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FaTimesCircle,
        iconColor: 'text-gray-600',
        description: 'Toutes les unités ont été utilisées'
      },
      expire: {
        label: 'Expiré',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FaExclamationTriangle,
        iconColor: 'text-red-600',
        description: 'La date d\'expiration est dépassée'
      }
    };
    return configs[statut] || configs.disponible;
  };

  const generateTraceabilityCodeForLot = (lot: any) => {
    const numeroCourt = (lot.numero_lot || '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(-4)
      .toUpperCase()
      .padEnd(4, 'X');
    
    const codeUniqueCourt = (lot.code_unique || '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(-6)
      .toUpperCase()
      .padEnd(6, '0');
    
    const hashCourt = (lot.hash_lot || '')
      .replace(/[^A-F0-9]/g, '')
      .substring(0, 6)
      .toUpperCase()
      .padEnd(6, '0');
    
    return `TRC-${numeroCourt}-${codeUniqueCourt}-${hashCourt}`;
  };

  // Filtrage des lots
  const filteredLots = lots.filter(lot => {
    const matchesSearch = 
      lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.medicament?.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'tous') return matchesSearch;
    return matchesSearch && lot.statut === filterStatus;
  });

  // Statistiques globales
  const stats = {
    total: lots.length,
    disponibles: lots.filter(l => l.statut === 'disponible').length,
    partiels: lots.filter(l => l.statut === 'partiel').length,
    epuises: lots.filter(l => l.statut === 'epuise').length,
    expires: lots.filter(l => l.statut === 'expire').length,
  };

  return (
    <RouteProtector roles={['fabricant','admin']} showUnauthorized={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des Lots</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gérez vos lots de médicaments avec traçabilité blockchain complète
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Nouveau lot
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Total</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="text-sm font-medium text-green-700">Disponibles</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">{stats.disponibles}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="text-sm font-medium text-yellow-700">Partiels</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">{stats.partiels}</div>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-700">Épuisés</div>
            <div className="mt-1 text-2xl font-semibold text-gray-600">{stats.epuises}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-sm font-medium text-red-700">Expirés</div>
            <div className="mt-1 text-2xl font-semibold text-red-600">{stats.expires}</div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un lot par numéro ou médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
          >
            <option value="tous">Tous les statuts</option>
            <option value="disponible">Disponibles</option>
            <option value="partiel">Partiels</option>
            <option value="epuise">Épuisés</option>
            <option value="expire">Expirés</option>
          </select>
        </div>

        {/* Grille des lots */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement des lots...</h3>
            </div>
          ) : filteredLots.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Aucun lot ne correspond à votre recherche.' : 'Commencez par créer un nouveau lot.'}
              </p>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const statusConfig = getLotStatusConfig(lot);
              const StatusIcon = statusConfig.icon;
              const quantiteRestante = lot.quantite_restante ?? lot.quantite_totale;
              const isExpired = new Date(lot.date_expiration) < new Date();
              const pourcentageUtilise = lot.quantite_totale > 0 
                ? ((lot.quantite_totale - quantiteRestante) / lot.quantite_totale) * 100 
                : 0;
              
              return (
                <div
                  key={lot.id}
                  className="relative flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* En-tête de la carte */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <FiBox className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {lot.medicament?.nom}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {lot.medicament?.dosage} - {lot.medicament?.forme}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {lot.isDeletable && (
                        <div className="relative group">
                          <AlertCircle className="h-5 w-5 text-amber-500 hover:text-amber-600 cursor-help" />
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg">
                            Ce lot n'a pas de mouvements (autre que création) et peut être supprimé
                          </div>
                        </div>
                      )}
                      
                      {lot.isDeletable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLot(lot.id);
                          }}
                          disabled={deletingLotId === lot.id}
                          className="text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Supprimer le lot (sans mouvements)"
                        >
                          {deletingLotId === lot.id ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedLot(lot);
                          setIsQRModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-700"
                        title="Voir QR Code"
                      >
                        <FaQrcode className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Informations du lot */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">N° Lot:</span>
                      <span className="font-mono font-medium text-gray-900">
                        {lot.numero_lot}
                      </span>
                    </div>
                    
                    {/* Détail des quantités */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Quantité totale:</span>
                        <span className="font-semibold text-gray-900">
                          {lot.quantite_totale} unités
                        </span>
                      </div>

                      {/* Transferts */}
                      {(lot.quantite_transferee ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            <FaTruck className="inline mr-1 text-blue-500" />
                            Transférée:
                          </span>
                          <span className="font-medium text-blue-600">
                            {lot.quantite_transferee} unités
                            {lot.mouvementsDetail?.transferts && lot.mouvementsDetail.transferts > 1 && 
                              ` (${lot.mouvementsDetail.transferts} transferts)`
                            }
                          </span>
                        </div>
                      )}

                      {/* Distributions */}
                      {(lot.quantite_distribuee ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            <FaBuilding className="inline mr-1 text-purple-500" />
                            Distribuée:
                          </span>
                          <span className="font-medium text-purple-600">
                            {lot.quantite_distribuee} unités
                            {lot.nombre_distributions && lot.nombre_distributions > 1 && 
                              ` (${lot.nombre_distributions} distributions)`
                            }
                          </span>
                        </div>
                      )}

                      {/* Retraits défectueux */}
                      {(lot.quantite_retiree ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            <FaExclamationTriangle className="inline mr-1 text-red-500" />
                            Retirés (défectueux):
                          </span>
                          <span className="font-medium text-red-600">
                            {lot.quantite_retiree} unités
                            {lot.nombre_retraits && lot.nombre_retraits > 1 && 
                              ` (${lot.nombre_retraits} retraits)`
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* Reste disponible */}
                      <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-700 font-medium">Reste disponible:</span>
                        <span className={`font-bold text-lg ${
                          quantiteRestante > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {quantiteRestante} unités
                        </span>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fabrication:</span>
                      <span className="text-gray-900">
                        {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expiration:</span>
                      <span className={`font-medium ${
                        isExpired ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Fabricant */}
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-500">Fabricant:</span>
                    <span className="text-gray-900 font-medium">
                      {lot.created_by}
                    </span>
                  </div>

                  {/* Statut du lot */}
                  <div className="mt-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon className={`mr-1.5 h-3.5 w-3.5 ${statusConfig.iconColor}`} />
                      {statusConfig.label}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{statusConfig.description}</p>
                  </div>

                  {/* Barre de progression d'utilisation */}
                  {pourcentageUtilise > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Utilisation</span>
                        <span>{pourcentageUtilise.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            pourcentageUtilise >= 100 ? 'bg-red-600' :
                            pourcentageUtilise >= 75 ? 'bg-yellow-500' :
                            pourcentageUtilise >= 50 ? 'bg-blue-500' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(pourcentageUtilise, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hash blockchain */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="text-xs font-mono text-gray-500 truncate">
                      Hash: {lot.hash_lot?.substring(0, 32)}...
                    </div>
                  </div>

                  {/* Code traçabilité */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Code traçabilité:</span>
                    <button
                      onClick={() => {
                        const code = generateTraceabilityCodeForLot(lot);
                        navigator.clipboard.writeText(code);
                        alert(`Code copié: ${code}`);
                      }}
                      className="text-xs font-mono text-blue-600 hover:text-blue-800 cursor-pointer"
                      title="Cliquer pour copier"
                    >
                      {generateTraceabilityCodeForLot(lot)}
                    </button>
                  </div>

                  {/* Badge d'expiration */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isExpired 
                        ? 'bg-red-100 text-red-800'
                        : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isExpired 
                        ? 'Expiré'
                        : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                        ? 'Expire bientôt'
                        : 'Valide'}
                    </span>
                  </div>

                  {/* Détail des mouvements */}
                  {lot.mouvementsDetail && lot.mouvementsDetail.total > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Total mouvements:</span>
                          <span className="font-medium">{lot.mouvementsDetail.total}</span>
                        </div>
                        {lot.mouvementsDetail.transferts > 0 && (
                          <div className="flex justify-between">
                            <span>Transferts:</span>
                            <span className="text-blue-600">{lot.mouvementsDetail.transferts}</span>
                          </div>
                        )}
                        {lot.mouvementsDetail.distributions > 0 && (
                          <div className="flex justify-between">
                            <span>Distributions:</span>
                            <span className="text-purple-600">{lot.mouvementsDetail.distributions}</span>
                          </div>
                        )}
                        {lot.mouvementsDetail.retraits > 0 && (
                          <div className="flex justify-between">
                            <span>Retraits:</span>
                            <span className="text-red-600">{lot.mouvementsDetail.retraits}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modales */}
        <CreateLotModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={loadLots}
        />

        {selectedLot && (
          <QRCodeModal
            isOpen={isQRModalOpen}
            onClose={() => {
              setIsQRModalOpen(false);
              setSelectedLot(null);
            }}
            lot={selectedLot}
          />
        )}
      </div>
    </RouteProtector>
  );
}