// // components/Modals/CreateMouvementModal.tsx
// 'use client';

// import { useState, Fragment, useEffect } from 'react';
// import { Dialog, Transition } from '@headlessui/react';
// import { FaTimes, FaSearch, FaExchangeAlt } from 'react-icons/fa';
// import { createMouvement } from '@/app/mouvements/actions';
// import { getLots } from '@/app/lots/actions';
// import { getDistributeurs } from '@/app/acteurs/actions';
// import type { Lot, Distributeur } from '@/types';

// interface CreateMouvementModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function CreateMouvementModal({ isOpen, onClose, onSuccess }: CreateMouvementModalProps) {
//   const [lots, setLots] = useState<Lot[]>([]);
//   const [acteurs, setActeurs] = useState<Distributeur[]>([]);
//   const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
//   const [searchLotTerm, setSearchLotTerm] = useState('');
//   const [formData, setFormData] = useState({
//     type_mouvement: 'transfert',
//     source_id: '',
//     destination_id: '',
//     quantite: '',
//     type_unite: 'boite',
//     commentaire: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [stockInfo, setStockInfo] = useState<any>(null);

//   useEffect(() => {
//     if (isOpen) {
//       loadLots();
//       loadActeurs();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (selectedLot && formData.source_id) {
//       checkStockAvailability();
//     }
//   }, [selectedLot, formData.source_id]);

//   const loadLots = async () => {
//     try {
//       const data = await getLots();
//       setLots(data);
//     } catch (error) {
//       console.error('Erreur chargement lots:', error);
//     }
//   };

//   const loadActeurs = async () => {
//     try {
//       const data = await getDistributeurs();
//       setActeurs(data);
//     } catch (error) {
//       console.error('Erreur chargement acteurs:', error);
//     }
//   };

//   const checkStockAvailability = async () => {
//     if (!selectedLot || !formData.source_id) return;
    
//     // Simuler la vérification du stock (à implémenter avec Supabase)
//     setStockInfo({
//       disponible: selectedLot.quantite_totale,
//       message: `${selectedLot.quantite_totale} unités disponibles`
//     });
//   };

//   const filteredLots = lots.filter(lot =>
//     lot.numero_lot.toLowerCase().includes(searchLotTerm.toLowerCase()) ||
//     lot.medicament?.nom.toLowerCase().includes(searchLotTerm.toLowerCase())
//   );

//   const getMouvementTypes = () => {
//     const baseTypes = [
//       { value: 'transfert', label: 'Transfert entre acteurs' },
//       { value: 'vente_grossiste', label: 'Vente à un grossiste' },
//       { value: 'vente_pharmacie', label: 'Vente à une pharmacie' },
//       { value: 'vente_patient', label: 'Vente à un patient' },
//       { value: 'destruction', label: 'Destruction de stock' },
//       { value: 'verification', label: 'Vérification de lot' },
//       { value: 'rappel', label: 'Rappel de lot' },
//     ];

//     if (!selectedLot) {
//       return baseTypes;
//     }

//     return [
//       { value: 'fractionnement', label: 'Fractionnement du lot' },
//       ...baseTypes,
//     ];
//   };

//   const getAvailableDestinations = () => {
//     if (!formData.type_mouvement) return acteurs;
    
//     switch (formData.type_mouvement) {
//       case 'vente_grossiste':
//         return acteurs.filter(a => a.type_acteur === 'grossiste');
//       case 'vente_pharmacie':
//         return acteurs.filter(a => a.type_acteur === 'pharmacie');
//       case 'vente_patient':
//         return []; // Les patients ne sont pas dans la table distributeurs
//       default:
//         return acteurs.filter(a => a.id !== parseInt(formData.source_id));
//     }
//   };

//   const needsDestination = () => {
//     return ['transfert', 'vente_grossiste', 'vente_pharmacie'].includes(formData.type_mouvement);
//   };

//   const needsSource = () => {
//     return !['creation_lot'].includes(formData.type_mouvement);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!selectedLot) {
//       alert('Veuillez sélectionner un lot');
//       return;
//     }

//     if (needsSource() && !formData.source_id) {
//       alert('Veuillez sélectionner une source');
//       return;
//     }

//     if (needsDestination() && !formData.destination_id) {
//       alert('Veuillez sélectionner une destination');
//       return;
//     }

//     if (formData.quantite && parseInt(formData.quantite) > (stockInfo?.disponible || 0)) {
//       alert('Quantité insuffisante en stock');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       await createMouvement({
//         lot_id: selectedLot.id,
//         type_mouvement: formData.type_mouvement as any,
//         source_id: formData.source_id ? parseInt(formData.source_id) : null,
//         destination_id: formData.destination_id ? parseInt(formData.destination_id) : null,
//         quantite: formData.quantite ? parseInt(formData.quantite) : null,
//         type_unite: formData.type_unite as any,
//         commentaire: formData.commentaire || null,
//       });
      
//       onSuccess();
//       onClose();
//       resetForm();
//     } catch (error) {
//       console.error('Erreur création mouvement:', error);
//       alert('Erreur lors de la création du mouvement');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setSelectedLot(null);
//     setSearchLotTerm('');
//     setFormData({
//       type_mouvement: 'transfert',
//       source_id: '',
//       destination_id: '',
//       quantite: '',
//       type_unite: 'boite',
//       commentaire: '',
//     });
//     setStockInfo(null);
//   };

//   const getTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'transfert': 'border-yellow-500 bg-yellow-50',
//       'vente_grossiste': 'border-indigo-500 bg-indigo-50',
//       'vente_pharmacie': 'border-green-500 bg-green-50',
//       'vente_patient': 'border-teal-500 bg-teal-50',
//       'destruction': 'border-red-500 bg-red-50',
//       'verification': 'border-gray-500 bg-gray-50',
//       'rappel': 'border-orange-500 bg-orange-50',
//       'fractionnement': 'border-purple-500 bg-purple-50',
//     };
//     return colors[type] || 'border-gray-300 bg-white';
//   };

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-10" onClose={onClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-25" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
//                 <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-white px-6 py-4">
//                   <Dialog.Title as="div" className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
//                         <FaExchangeAlt className="h-5 w-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-medium leading-6 text-gray-900">
//                           Nouveau mouvement
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Enregistrer un mouvement de stock
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={onClose}
//                       className="text-gray-400 hover:text-gray-500 transition-colors"
//                     >
//                       <FaTimes />
//                     </button>
//                   </Dialog.Title>
//                 </div>

//                 <form onSubmit={handleSubmit} className="px-6 py-4">
//                   {/* Sélection du lot */}
//                   <div className="mb-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Lot concerné *
//                     </label>
                    
//                     {!selectedLot ? (
//                       <>
//                         <div className="relative">
//                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//                             <FaSearch className="h-5 w-5 text-gray-400" />
//                           </div>
//                           <input
//                             type="text"
//                             placeholder="Rechercher un lot par numéro ou médicament..."
//                             value={searchLotTerm}
//                             onChange={(e) => setSearchLotTerm(e.target.value)}
//                             className="block w-full rounded-md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                           />
//                         </div>
                        
//                         {searchLotTerm && (
//                           <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
//                             {filteredLots.length === 0 ? (
//                               <div className="px-4 py-3 text-sm text-gray-500">
//                                 Aucun lot trouvé
//                               </div>
//                             ) : (
//                               filteredLots.map((lot) => (
//                                 <button
//                                   key={lot.id}
//                                   type="button"
//                                   onClick={() => {
//                                     setSelectedLot(lot);
//                                     setSearchLotTerm('');
//                                   }}
//                                   className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
//                                 >
//                                   <div className="flex items-center justify-between">
//                                     <div>
//                                       <div className="font-medium text-gray-900">
//                                         {lot.medicament?.nom}
//                                       </div>
//                                       <div className="text-sm text-gray-500">
//                                         Lot: {lot.numero_lot}
//                                       </div>
//                                       <div className="text-xs text-gray-400">
//                                         Expire le {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
//                                       </div>
//                                     </div>
//                                     <div className="text-sm font-medium text-gray-900">
//                                       {lot.quantite_totale} unités
//                                     </div>
//                                   </div>
//                                 </button>
//                               ))
//                             )}
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       <div className={`p-4 rounded-lg border-2 ${getTypeColor(formData.type_mouvement)}`}>
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <div className="font-medium text-gray-900">
//                               {selectedLot.medicament?.nom}
//                             </div>
//                             <div className="text-sm text-gray-600">
//                               Lot: {selectedLot.numero_lot}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               Expire le {new Date(selectedLot.date_expiration).toLocaleDateString('fr-FR')}
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => setSelectedLot(null)}
//                             className="text-gray-400 hover:text-gray-600"
//                           >
//                             <FaTimes />
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {selectedLot && (
//                     <div className="space-y-4">
//                       {/* Type de mouvement */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Type de mouvement *
//                         </label>
//                         <select
//                           required
//                           value={formData.type_mouvement}
//                           onChange={(e) => {
//                             setFormData({
//                               ...formData,
//                               type_mouvement: e.target.value,
//                               destination_id: '', // Reset destination quand le type change
//                             });
//                           }}
//                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                         >
//                           {getMouvementTypes().map((type) => (
//                             <option key={type.value} value={type.value}>
//                               {type.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         {/* Source */}
//                         {needsSource() && (
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Source *
//                             </label>
//                             <select
//                               required
//                               value={formData.source_id}
//                               onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
//                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                             >
//                               <option value="">Sélectionner la source</option>
//                               {acteurs.map((acteur) => (
//                                 <option key={acteur.id} value={acteur.id}>
//                                   {acteur.nom} ({acteur.type_acteur})
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}

//                         {/* Destination */}
//                         {needsDestination() && (
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Destination *
//                             </label>
//                             <select
//                               required
//                               value={formData.destination_id}
//                               onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
//                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                             >
//                               <option value="">Sélectionner la destination</option>
//                               {getAvailableDestinations().map((acteur) => (
//                                 <option key={acteur.id} value={acteur.id}>
//                                   {acteur.nom} ({acteur.type_acteur})
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                       </div>

//                       {/* Informations de stock */}
//                       {stockInfo && formData.source_id && (
//                         <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm text-blue-900">Stock disponible:</span>
//                             <span className="text-sm font-medium text-blue-900">
//                               {stockInfo.message}
//                             </span>
//                           </div>
//                         </div>
//                       )}

//                       {/* Quantité et unité */}
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Quantité
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             max={stockInfo?.disponible || undefined}
//                             value={formData.quantite}
//                             onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
//                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                             placeholder="Ex: 100"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Type d'unité
//                           </label>
//                           <select
//                             value={formData.type_unite}
//                             onChange={(e) => setFormData({ ...formData, type_unite: e.target.value })}
//                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                           >
//                             <option value="boite">Boîte</option>
//                             <option value="carton">Carton</option>
//                             <option value="palette">Palette</option>
//                           </select>
//                         </div>
//                       </div>

//                       {/* Commentaire */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Commentaire
//                         </label>
//                         <textarea
//                           rows={3}
//                           value={formData.commentaire}
//                           onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
//                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                           placeholder="Informations complémentaires sur ce mouvement..."
//                         />
//                       </div>

//                       {/* Récapitulatif du mouvement */}
//                       {selectedLot && formData.type_mouvement && (
//                         <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                           <h4 className="text-sm font-medium text-gray-900 mb-2">
//                             Récapitulatif du mouvement
//                           </h4>
//                           <div className="space-y-1 text-sm">
//                             <div className="flex justify-between">
//                               <span className="text-gray-600">Lot:</span>
//                               <span className="font-medium">{selectedLot.numero_lot}</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-gray-600">Type:</span>
//                               <span className="font-medium">
//                                 {getMouvementTypes().find(t => t.value === formData.type_mouvement)?.label}
//                               </span>
//                             </div>
//                             {formData.source_id && (
//                               <div className="flex justify-between">
//                                 <span className="text-gray-600">De:</span>
//                                 <span className="font-medium">
//                                   {acteurs.find(a => a.id === parseInt(formData.source_id))?.nom}
//                                 </span>
//                               </div>
//                             )}
//                             {formData.destination_id && (
//                               <div className="flex justify-between">
//                                 <span className="text-gray-600">Vers:</span>
//                                 <span className="font-medium">
//                                   {acteurs.find(a => a.id === parseInt(formData.destination_id))?.nom}
//                                 </span>
//                               </div>
//                             )}
//                             {formData.quantite && (
//                               <div className="flex justify-between">
//                                 <span className="text-gray-600">Quantité:</span>
//                                 <span className="font-medium">
//                                   {formData.quantite} {formData.type_unite}(s)
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   <div className="mt-6 flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       onClick={onClose}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//                     >
//                       Annuler
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={loading || !selectedLot}
//                       className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
//                     >
//                       {loading ? (
//                         <>
//                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                           </svg>
//                           Création...
//                         </>
//                       ) : (
//                         'Enregistrer le mouvement'
//                       )}
//                     </button>
//                   </div>
//                 </form>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };