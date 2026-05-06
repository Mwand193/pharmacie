// // components/Modals/CreateStockModal.tsx
// 'use client';

// import { useState, Fragment, useEffect } from 'react';
// import { Dialog, Transition } from '@headlessui/react';
// import { FaTimes, FaBox } from 'react-icons/fa';
// import { createStock } from '@/app/medicaments/action';
// import { getDistributeurs } from '@/app/acteurs/actions';
// import type { Medicament, Distributeur } from '@/types';

// interface CreateStockModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   medicament: Medicament;
//   onSuccess: () => void;
// }

// export default function CreateStockModal({ 
//   isOpen, 
//   onClose, 
//   medicament, 
//   onSuccess 
// }: CreateStockModalProps) {
//   const [distributeurs, setDistributeurs] = useState<Distributeur[]>([]);
//   const [formData, setFormData] = useState({
//     distributeur_id: '',
//     quantite: '',
//     type_unite: 'boite',
//     coefficient: '1',
//     statut: 'disponible',
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       loadDistributeurs();
//     }
//   }, [isOpen]);

//   const loadDistributeurs = async () => {
//     try {
//       const data = await getDistributeurs();
//       setDistributeurs(data);
//     } catch (error) {
//       console.error('Erreur chargement des distributeurs:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.distributeur_id) {
//       alert('Veuillez sélectionner un distributeur');
//       return;
//     }

//     if (!formData.quantite || parseInt(formData.quantite) <= 0) {
//       alert('Veuillez entrer une quantité valide');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       await createStock({
//         medicament_id: medicament.id,
//         distributeur_id: parseInt(formData.distributeur_id),
//         quantite: parseInt(formData.quantite),
//         type_unite: formData.type_unite as 'boite' | 'carton' | 'palette',
//         coefficient: parseInt(formData.coefficient),
//         statut: formData.statut as 'disponible' | 'reserve' | 'vendu' | 'detruit',
//       });
      
//       onSuccess();
//       onClose();
//       resetForm();
//     } catch (error) {
//       console.error('Erreur création stock:', error);
//       alert('Erreur lors de la création du stock');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       distributeur_id: '',
//       quantite: '',
//       type_unite: 'boite',
//       coefficient: '1',
//       statut: 'disponible',
//     });
//   };

//   const getUniteCoefficient = () => {
//     const coeffs: Record<string, number> = {
//       'boite': 1,
//       'carton': 12,
//       'palette': 144,
//     };
//     return coeffs[formData.type_unite] || 1;
//   };

//   const calculateTotalUnites = () => {
//     const quantite = parseInt(formData.quantite) || 0;
//     const coefficient = parseInt(formData.coefficient) || 1;
//     return quantite * coefficient;
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
//               <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
//                 <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-white px-6 py-4">
//                   <Dialog.Title as="div" className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
//                         <FaBox className="h-5 w-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-medium leading-6 text-gray-900">
//                           Gérer le stock
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           {medicament.nom} - {medicament.dosage} {medicament.forme}
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
//                   <div className="space-y-4">
//                     {/* Information du médicament */}
//                     <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
//                       <div className="text-sm">
//                         <div className="font-medium text-gray-900">{medicament.nom}</div>
//                         {medicament.code_cis && (
//                           <div className="text-gray-600">Code CIS: {medicament.code_cis}</div>
//                         )}
//                         <div className="text-gray-600">
//                           {medicament.dosage} - {medicament.forme}
//                         </div>
//                         {medicament.description && (
//                           <div className="mt-1 text-xs text-gray-500">{medicament.description}</div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Distributeur */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Distributeur *
//                       </label>
//                       <select
//                         required
//                         value={formData.distributeur_id}
//                         onChange={(e) => setFormData({ ...formData, distributeur_id: e.target.value })}
//                         className="mt-1 block w-full border p-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                       >
//                         <option value="">Sélectionner un distributeur</option>
//                         {distributeurs.map((dist) => (
//                           <option key={dist.id} value={dist.id}>
//                             {dist.nom} ({dist.type_acteur})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Type d'unité et coefficient */}
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Type d'unité *
//                         </label>
//                         <select
//                           required
//                           value={formData.type_unite}
//                           onChange={(e) => {
//                             setFormData({ 
//                               ...formData, 
//                               type_unite: e.target.value,
//                               coefficient: getUniteCoefficient().toString()
//                             });
//                           }}
//                           className="mt-1 block w-full border p-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                         >
//                           <option value="boite">Boîte</option>
//                           <option value="carton">Carton</option>
//                           <option value="palette">Palette</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Coefficient
//                         </label>
//                         <input
//                           type="number"
//                           min="1"
//                           value={formData.coefficient}
//                           onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
//                           className="mt-1 block w-full border p-2 rounded-md  border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                           placeholder="Ex: 12 boîtes par carton"
//                         />
//                         <p className="mt-1 text-xs text-gray-500">
//                           Nombre d'unités de base par {formData.type_unite}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Quantité */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Quantité *
//                       </label>
//                       <input
//                         type="number"
//                         required
//                         min="1"
//                         value={formData.quantite}
//                         onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
//                         className="mt-1 block w-full border p-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                         placeholder={`Nombre de ${formData.type_unite}s`}
//                       />
//                     </div>

//                     {/* Statut */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Statut
//                       </label>
//                       <select
//                         value={formData.statut}
//                         onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
//                         className="mt-1 block w-full border p-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
//                       >
//                         <option value="disponible">Disponible</option>
//                         <option value="reserve">Réservé</option>
//                         <option value="vendu">Vendu</option>
//                         <option value="detruit">Détruit</option>
//                       </select>
//                     </div>

//                     {/* Récapitulatif */}
//                     {formData.quantite && (
//                       <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                         <h4 className="text-sm font-medium text-green-900 mb-2">
//                           Récapitulatif du stock
//                         </h4>
//                         <div className="space-y-1 text-sm">
//                           <div className="flex justify-between">
//                             <span className="text-green-700">Quantité en {formData.type_unite}s:</span>
//                             <span className="font-medium text-green-900">{formData.quantite}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-green-700">Coefficient:</span>
//                             <span className="font-medium text-green-900">1 {formData.type_unite} = {formData.coefficient} unités</span>
//                           </div>
//                           <div className="flex justify-between border-t border-green-200 pt-1 mt-1">
//                             <span className="text-green-700 font-medium">Total unités:</span>
//                             <span className="font-bold text-green-900">{calculateTotalUnites()}</span>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

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
//                       disabled={loading}
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
//                         'Créer le stock'
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
// }