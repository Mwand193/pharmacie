
// // app/lots/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   FaPlus, 
//   FaQrcode, 
//   FaSearch, 
  
//   FaCheckCircle, 
//   FaExclamationTriangle,
//   FaTimesCircle,
//   FaMinusCircle
// } from 'react-icons/fa';
// import { Package } from 'lucide-react';
// import CreateLotModal from '@/components/Modals/CreateLotModal';
// import QRCodeModal from '@/components/Modals/QRCodeModal';
// import { getLots } from './actions';
// import type { Lot } from '@/types';
// import { FiBox } from "react-icons/fi";
// export default function LotsPage() {
//   const [lots, setLots] = useState<Lot[]>([]);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isQRModalOpen, setIsQRModalOpen] = useState(false);
//   const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadLots();
//   }, []);

//   const loadLots = async () => {
//     try {
//       const data = await getLots();
//       // Ajouter le statut calculé à chaque lot
//       const lotsWithStatus = data.map(lot => ({
//         ...lot,
//         statut: getLotStatus(lot)
//       }));
//       setLots(lotsWithStatus);
//     } catch (error) {
//       console.error('Erreur chargement lots:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fonction pour déterminer le statut du lot
//   const getLotStatus = (lot: Lot): 'disponible' | 'partiel' | 'epuise' | 'expire' => {
//     // Vérifier d'abord l'expiration
//     if (new Date(lot.date_expiration) < new Date()) {
//       return 'expire';
//     }
    
//     // Vérifier la quantité
//     if (lot.quantite_totale === 0) {
//       return 'epuise';
//     }
    
//     // Si la quantité initiale a été réduite (transferts effectués)
//     // On considère qu'il y a eu des mouvements si le lot a été créé il y a plus de 5 minutes
//     // ou si on peut vérifier dans les mouvements (à implémenter avec une jointure)
//     const dateCreation = new Date(lot.created_at);
//     const maintenant = new Date();
//     const differenceMinutes = (maintenant.getTime() - dateCreation.getTime()) / (1000 * 60);
    
//     // Pour l'instant, on considère "partiel" si le lot a plus de 5 minutes
//     // Idéalement, il faudrait vérifier s'il y a eu des mouvements de transfert
//     if (differenceMinutes > 5 && lot.quantite_totale > 0) {
//       return 'partiel';
//     }
    
//     return 'disponible';
//   };

//   const getStatusConfig = (statut: string) => {
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
//     return configs[statut as keyof typeof configs] || configs.disponible;
//   };

//   const filteredLots = lots.filter(lot => 
//     lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     lot.medicament?.nom.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="sm:flex sm:items-center">
//         <div className="sm:flex-auto">
//           <h1 className="text-2xl font-semibold text-gray-900">Lots</h1>
//           <p className="mt-2 text-sm text-gray-700">
//             Gestion des lots de médicaments avec traçabilité blockchain
//           </p>
//         </div>
//         <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
//           <button
//             onClick={() => setIsCreateModalOpen(true)}
//             className="inline-flex items-center justify-center -md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
//           >
//             <FaPlus className="mr-2 h-4 w-4" />
//             Nouveau lot
//           </button>
//         </div>
//       </div>

//       {/* Barre de recherche */}
//       <div className="mt-4">
//         <div className="relative">
//           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//             <FaSearch className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Rechercher un lot par numéro ou médicament..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block p-2 w-max border pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
//           />
//         </div>
//       </div>

//       <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {loading ? (
//           <div className="col-span-full text-center py-12">
//             <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
//             <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement...</h3>
//           </div>
//         ) : filteredLots.length === 0 ? (
//           <div className="col-span-full text-center py-12">
//             <Package className="mx-auto h-12 w-12 text-gray-400" />
//             <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               Commencez par créer un nouveau lot.
//             </p>
//           </div>
//         ) : (
//           filteredLots.map((lot) => {
//             const statusConfig = getStatusConfig(lot.statut || 'disponible');
//             const StatusIcon = statusConfig.icon;
            
//             return (
//               <div
//                 key={lot.id}
//                 className="relative flex flex-col overflow-hidden -lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="flex h-10 w-10 items-center justify-center -full bg-green-100">
//                       <FiBox className="h-5 w-5 text-green-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-medium text-gray-900">
//                         {lot.medicament?.nom}
//                       </h3>
//                       <p className="text-xs text-gray-500">
//                         {lot.medicament?.dosage} - {lot.medicament?.forme}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setSelectedLot(lot);
//                       setIsQRModalOpen(true);
//                     }}
//                     className="text-green-600  hover:text-green-700"
//                     title="Voir QR Code"
//                   >
//                     <FaQrcode className="h-5 w-5" />
//                   </button>
//                 </div>

//                 <div className="mt-4 space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">N° Lot:</span>
//                     <span className="font-mono font-medium text-gray-900">
//                       {lot.numero_lot}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Quantité:</span>
//                     <span className={`font-medium ${
//                       lot.quantite_totale === 0 ? 'text-gray-400' : 'text-gray-900'
//                     }`}>
//                       {lot.quantite_totale} unités
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Fabrication:</span>
//                     <span className="text-gray-900">
//                       {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Expiration:</span>
//                     <span className={`font-medium ${
//                       new Date(lot.date_expiration) < new Date() 
//                         ? 'text-red-600' 
//                         : 'text-gray-900'
//                     }`}>
//                       {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
//                     </span>
//                   </div>
//                 </div>
// <div className="mt-2 flex justify-between text-sm">
//   <span className="text-gray-500">Fabricant:</span>
//   <span className="text-gray-900 font-medium">
//     {lot.created_by}
//   </span>
// </div>

//                 {/* Statut du lot */}
//                 <div className="mt-4">
//                   <div className={`inline-flex items-center px-3 py-1 -full text-xs font-medium border ${statusConfig.color}`}>
//                     <StatusIcon className={`mr-1.5 h-3.5 w-3.5 ${statusConfig.iconColor}`} />
//                     {statusConfig.label}
//                   </div>
//                 </div>

//                 {/* Information de transfert */}
//                 {lot.statut === 'partiel' && (
//                   <div className="mt-2 text-xs text-gray-500">
//                     Une partie du lot a été transférée
//                   </div>
//                 )}
                
//                 {lot.statut === 'epuise' && (
//                   <div className="mt-2 text-xs text-gray-500">
//                     Lot entièrement transféré
//                   </div>
//                 )}

//                 <div className="mt-4 border-t border-gray-200 pt-4">
//                   <div className="text-xs font-mono text-gray-500 truncate">
//                     Hash: {lot.hash_lot.substring(0, 32)}...
//                   </div>
//                 </div>

//                 {/* Badge d'expiration */}
//                 <div className="mt-3">
//                   <span className={`inline-flex items-center -full px-2.5 py-0.5 text-xs font-medium ${
//                     new Date(lot.date_expiration) < new Date() 
//                       ? 'bg-red-100 text-red-800'
//                       : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
//                       ? 'bg-yellow-100 text-yellow-800'
//                       : 'bg-green-100 text-green-800'
//                   }`}>
//                     {new Date(lot.date_expiration) < new Date() 
//                       ? 'Expiré'
//                       : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
//                       ? 'Expire bientôt'
//                       : 'Valide'}
//                   </span>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       <CreateLotModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onSuccess={loadLots}
//       />

//       {selectedLot && (
//         <QRCodeModal
//           isOpen={isQRModalOpen}
//           onClose={() => {
//             setIsQRModalOpen(false);
//             setSelectedLot(null);
//           }}
//           lot={selectedLot}
//         />
//       )}
//     </div>
//   );
// }


// app/lots/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaQrcode, 
  FaSearch, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimesCircle,
  FaMinusCircle,
  FaTrash, // Ajoutez cette icône
  FaExclamationCircle // Ajoutez cette icône
} from 'react-icons/fa';
import { Package, Trash2 } from 'lucide-react';
import CreateLotModal from '@/components/Modals/CreateLotModal';
import QRCodeModal from '@/components/Modals/QRCodeModal';
import { getLots, deleteLotWithoutMovements } from './actions'; // Importez la nouvelle fonction
import type { Lot } from '@/types';
import { FiBox } from "react-icons/fi";


export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingLotId, setDeletingLotId] = useState<number | null>(null);

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

  // Fonction pour gérer la suppression
  const handleDeleteLot = async (lotId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible.')) {
      return;
    }
    
    setDeletingLotId(lotId);
    
    try {
      await deleteLotWithoutMovements(lotId);
      // Rafraîchir la liste
      await loadLots();
      alert('Lot supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression du lot');
    } finally {
      setDeletingLotId(null);
    }
  };

  const getLotStatus = (lot: Lot): 'disponible' | 'partiel' | 'epuise' | 'expire' => {
    if (new Date(lot.date_expiration) < new Date()) {
      return 'expire';
    }
    
    if (lot.quantite_totale === 0) {
      return 'epuise';
    }
    
    const dateCreation = new Date(lot.created_at);
    const maintenant = new Date();
    const differenceMinutes = (maintenant.getTime() - dateCreation.getTime()) / (1000 * 60);
    
    if (differenceMinutes > 5 && lot.quantite_totale > 0) {
      return 'partiel';
    }
    
    return 'disponible';
  };

  const getStatusConfig = (statut: string) => {
    const configs = {
      disponible: {
        label: 'Disponible',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FaCheckCircle,
        iconColor: 'text-green-600'
      },
      partiel: {
        label: 'Partiellement transféré',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FaMinusCircle,
        iconColor: 'text-yellow-600'
      },
      epuise: {
        label: 'Épuisé',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FaTimesCircle,
        iconColor: 'text-gray-600'
      },
      expire: {
        label: 'Expiré',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FaExclamationTriangle,
        iconColor: 'text-red-600'
      }
    };
    return configs[statut as keyof typeof configs] || configs.disponible;
  };

  const filteredLots = lots.filter(lot => 
    lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.medicament?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Lots</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestion des lots de médicaments avec traçabilité blockchain
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center -md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Nouveau lot
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mt-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un lot par numéro ou médicament..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full -md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement...</h3>
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer un nouveau lot.
            </p>
          </div>
        ) : (
          filteredLots.map((lot) => {
            const statusConfig = getStatusConfig(lot.statut || 'disponible');
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={lot.id}
                className="relative flex flex-col overflow-hidden -lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center -full bg-green-100">
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
                  
                  {/* Actions : QR Code + Suppression */}
                  <div className="flex items-center -none space-x-2">
                    {/* Indicateur de statut de suppression */}
                    {lot.isDeletable && (
                      <div className="relative group">
                        <FaExclamationCircle className="h-5 w-5 text-amber-500 hover:text-amber-600 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 px-2 py-1 bg-gray-900 text-white text-xs  shadow-lg">
                          Ce lot n'a pas de mouvements (autre que création)
                        </div>
                      </div>
                    )}
                    
                    {/* Bouton de suppression */}
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
                          <div className="h-5 w-5 animate-spin -full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    
                    {/* Bouton QR Code */}
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

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">N° Lot:</span>
                    <span className="font-mono font-medium text-gray-900">
                      {lot.numero_lot}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantité:</span>
                    <span className={`font-medium ${
                      lot.quantite_totale === 0 ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {lot.quantite_totale} unités
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fabrication:</span>
                    <span className="text-gray-900">
                      {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expiration:</span>
                    <span className={`font-medium ${
                      new Date(lot.date_expiration) < new Date() 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                    }`}>
                      {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
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
                </div>

                {/* Information de transfert */}
                {lot.statut === 'partiel' && (
                  <div className="mt-2 text-xs text-gray-500">
                    Une partie du lot a été transférée
                  </div>
                )}
                
                {lot.statut === 'epuise' && (
                  <div className="mt-2 text-xs text-gray-500">
                    Lot entièrement transféré
                  </div>
                )}

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="text-xs font-mono text-gray-500 truncate">
                    Hash: {lot.hash_lot?.substring(0, 32)}...
                  </div>
                </div>

                {/* Badge d'expiration */}
                <div className="mt-3">
                  <span className={`inline-flex items-center -full px-2.5 py-0.5 text-xs font-medium ${
                    new Date(lot.date_expiration) < new Date() 
                      ? 'bg-red-100 text-red-800'
                      : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {new Date(lot.date_expiration) < new Date() 
                      ? 'Expiré'
                      : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                      ? 'Expire bientôt'
                      : 'Valide'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

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
  );
}