
// // app/verify/[code]/page.tsx - VERSION AVEC VÉRIFICATION BLOCKCHAIN
// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { 
//   FaShieldAlt, FaCheckCircle, FaTimesCircle, FaSpinner,
//   FaPills, FaCalendar, FaIndustry, FaBox, FaBarcode,
//   FaExclamationTriangle, FaRedo, FaCube, FaExchangeAlt,
//   FaClock
// } from 'react-icons/fa';
// import { parseTraceabilityCode } from '@/lib/utils/traceability';
// import QRCodeGenerator from '@/components/QRCodeGenerator';

// interface MouvementComparison {
//   type: string;
//   date: string;
//   quantite: number;
//   commentaire: string | null;
//   source_id: string;
//   destination_id: string | null;
//   raison: string | null;
//   db_hash: string;
//   db_hash_recalculated: string;
//   blockchain_hash: string | null;
//   hash_db_intact: boolean;
//   match: boolean | null;
//   exists_on_blockchain: boolean;
//   blockchain_data: any;
// }

// interface VerificationResult {
//   verified: boolean;
//   code: string;
//   integrity: boolean | null;
//   blockchain_available: boolean;
//   lot: {
//     id: number;
//     numero_lot: string;
//     code_unique: string;
//     medicament_nom: string;
//     code_cis: string;
//     dosage: string;
//     forme: string;
//     fabricant: string;
//     date_fabrication: string;
//     date_expiration: string;
//     quantite: number;
//     hash_lot: string;
//     blockchain_lot_id: string | null;
//   } | null;
//   hashComparison: {
//     lot: {
//       db_hash: string;
//       db_hash_recalculated: string;
//       blockchain_hash: string | null;
//       match: boolean;
//       db_hash_intact: boolean;
//     };
//     mouvements: MouvementComparison[];
//     missing_movements: string[];
//   } | null;
//   modifications: string[];
//   movements: Array<{
//     id: number;
//     type_mouvement: string;
//     quantite: number;
//     commentaire: string | null;
//     created_at: string;
//     source_id: string;
//     destination_id: string | null;
//   }>;
//   timestamp: string;
// }

// export default function VerifyByCodePage() {
//   const params = useParams();
//   const code = params?.code as string;
  
//   const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (code) {
//       verifyCode(code);
//     }
//   }, [code]);

//   const verifyCode = async (traceabilityCode: string) => {
//     try {
//       setLoading(true);
//       setError(null);
//       setVerificationResult(null);

//       console.log('🔍 Vérification du code:', traceabilityCode);

//       const parsed = parseTraceabilityCode(traceabilityCode);
//       if (!parsed) {
//         throw new Error('Format de code de traçabilité invalide. Format attendu: TRC-XXXX-XXXXXX-XXXXXX');
//       }

//       const apiUrl = `/api/verify/${encodeURIComponent(traceabilityCode)}`;
//       const response = await fetch(apiUrl);

//       if (!response.ok) {
//         const data = await response.json();
//         throw new Error(data.error || `Erreur ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('✅ Résultat reçu:', data);
      
//       setVerificationResult(data);
      
//     } catch (err: any) {
//       console.error('❌ Erreur:', err);
//       setError(err.message || 'Une erreur inattendue est survenue.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRetry = () => {
//     if (code) {
//       setError(null);
//       setVerificationResult(null);
//       setLoading(true);
//       verifyCode(code);
//     }
//   };

//   // État de chargement
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
//         <div className="text-center">
//           <FaSpinner className="animate-spin h-16 w-16 text-green-600 mx-auto mb-6" />
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">Vérification en cours...</h2>
//           <p className="text-gray-600 mb-4">Analyse du code et comparaison blockchain</p>
//           <div className="bg-white border border-gray-200 -lg px-6 py-3 inline-block">
//             <p className="text-sm font-mono text-gray-700">{code}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // État d'erreur
//   if (error && !loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
//         <div className="bg-white border-2 border-red-200 -xl shadow-lg p-8 max-w-lg w-full">
//           <div className="text-center mb-6">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 -full mb-4">
//               <FaTimesCircle className="h-10 w-10 text-red-500" />
//             </div>
//             <h1 className="text-2xl font-bold text-red-700 mb-2">Vérification Échouée</h1>
//             <p className="text-gray-600">{error}</p>
//           </div>

//           <div className="bg-red-50 border border-red-200 -lg p-4 mb-4">
//             <p className="text-xs text-red-600 font-semibold mb-1">Code testé :</p>
//             <p className="text-sm font-mono text-red-800 break-all">{code}</p>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 -lg p-4 mb-6">
//             <p className="text-xs font-bold text-blue-800 mb-2">💡 Suggestions :</p>
//             <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
//               <li>Vérifiez que le code est complet et sans espaces</li>
//               <li>Le format doit être : <code className="bg-blue-100 px-1 ">TRC-XXXX-XXXXXX-XXXXXX</code></li>
//               <li>Assurez-vous que le lot existe dans la base de données</li>
//             </ul>
//           </div>

//           <div className="text-center">
//             <button
//               onClick={handleRetry}
//               className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold -lg hover:bg-green-700 transition-colors"
//             >
//               <FaRedo className="mr-2 h-4 w-4" />
//               Réessayer
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!verificationResult) return null;

//   const { lot, hashComparison, modifications, integrity, blockchain_available, movements } = verificationResult;

//   // Déterminer le statut global
//   const getStatusInfo = () => {
//     if (integrity === true) {
//       return {
//         icon: FaCheckCircle,
//         color: 'green',
//         title: 'Lot Authentique ✓',
//         subtitle: 'Tous les hashs correspondent. Aucune altération détectée.',
//         bgClass: 'from-green-600 to-green-700',
//         badgeClass: 'bg-green-100 text-green-800 border-green-300',
//         badgeText: 'Authentique'
//       };
//     } else if (integrity === false) {
//       return {
//         icon: FaTimesCircle,
//         color: 'red',
//         title: '⚠️ Lot Altéré',
//         subtitle: 'Incohérence détectée entre la base de données et la blockchain.',
//         bgClass: 'from-red-600 to-red-700',
//         badgeClass: 'bg-red-100 text-red-800 border-red-300',
//         badgeText: 'Altéré'
//       };
//     } else {
//       return {
//         icon: FaExclamationTriangle,
//         color: 'amber',
//         title: 'Vérification Partielle',
//         subtitle: 'Lot non enregistré sur la blockchain ou blockchain indisponible.',
//         bgClass: 'from-amber-600 to-amber-700',
//         badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
//         badgeText: 'Partiel'
//       };
//     }
//   };

//   const status = getStatusInfo();
//   const StatusIcon = status.icon;

//   const lotModifications = modifications.filter((m: string) => 
//     !m.toLowerCase().includes('mouvement #')
//   );
  
//   const mouvementModifications = modifications.filter((m: string) => 
//     m.toLowerCase().includes('mouvement #')
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
//         {/* En-tête */}
//         <div className={`text-center p-8 sm:p-10 -t-2xl shadow-lg bg-gradient-to-br ${status.bgClass}`}>
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 -full mb-4">
//             <StatusIcon className="h-10 w-10 text-white" />
//           </div>
          
//           <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
//             {status.title}
//           </h1>
          
//           <div className="inline-block bg-white/10 backdrop-blur-sm -lg px-6 py-3 mt-4">
//             <p className="text-lg sm:text-xl font-mono text-white tracking-widest">
//               {code}
//             </p>
//           </div>
          
//           <p className="text-white/80 mt-4 text-sm">{status.subtitle}</p>
//         </div>

//         {/* Corps */}
//         <div className="bg-white shadow-xl -b-2xl p-6 sm:p-8 space-y-8">
          
//           {/* QR Code + Badge */}
//           <div className="text-center">
//             <div className="inline-block p-4 bg-white border-2 border-gray-200 -xl shadow-sm">
//               <QRCodeGenerator 
//                 value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${code}`}
//                 size={160}
//               />
//             </div>
            
//             <div className="mt-4">
//               <span className={`inline-flex items-center px-5 py-2 -full text-sm font-bold uppercase tracking-wide border-2 ${status.badgeClass}`}>
//                 <StatusIcon className="mr-2 h-4 w-4" />
//                 {status.badgeText}
//               </span>
//             </div>
//           </div>

//           {/* Modifications détectées (si altéré) */}
//           {modifications.length > 0 && integrity === false && (
//             <div className="bg-red-50 border-2 border-red-200 -xl p-6">
//               <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
//                 <FaExclamationTriangle className="mr-2 h-5 w-5" />
//                 Modifications Détectées
//               </h3>
              
//               {/* Modifications du lot */}
//               {lotModifications.length > 0 && (
//                 <div className="mb-4">
//                   <h4 className="text-sm font-semibold text-red-700 mb-2">📦 Sur le lot :</h4>
//                   <ul className="space-y-2">
//                     {lotModifications.map((modif: string, i: number) => (
//                       <li key={i} className="text-sm text-red-600 flex items-start gap-2 bg-white/50 p-2 ">
//                         <FaExclamationTriangle className="h-3 w-3 flex-shrink-0 mt-1" />
//                         <span>{modif}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
              
//               {/* Modifications des mouvements */}
//               {mouvementModifications.length > 0 && (
//                 <div>
//                   <h4 className="text-sm font-semibold text-red-700 mb-2">🔄 Sur les mouvements :</h4>
//                   <ul className="space-y-2">
//                     {mouvementModifications.map((modif: string, i: number) => (
//                       <li key={i} className="text-sm text-red-600 flex items-start gap-2 bg-white/50 p-2 ">
//                         <FaExclamationTriangle className="h-3 w-3 flex-shrink-0 mt-1" />
//                         <span>{modif}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Informations du lot */}
//           {lot && (
//             <div className="border-2 border-gray-100 -xl p-6 space-y-4">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center">
//                 <FaPills className="mr-3 h-6 w-6 text-green-600" />
//                 Informations du Lot
//               </h3>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                 <InfoField label="Numéro de lot" value={lot.numero_lot} mono />
//                 <InfoField label="Médicament" value={lot.medicament_nom} />
//                 <InfoField label="Fabricant" value={lot.fabricant} icon={FaIndustry} />
//                 <InfoField label="Quantité" value={`${lot.quantite.toLocaleString()} unités`} icon={FaBox} />
//                 <InfoField 
//                   label="Fabrication" 
//                   value={new Date(lot.date_fabrication).toLocaleDateString('fr-FR', {
//                     day: 'numeric', month: 'long', year: 'numeric'
//                   })} 
//                   icon={FaCalendar} 
//                 />
//                 <InfoField 
//                   label="Expiration" 
//                   value={new Date(lot.date_expiration).toLocaleDateString('fr-FR', {
//                     day: 'numeric', month: 'long', year: 'numeric'
//                   })} 
//                   icon={FaCalendar}
//                   expired={new Date(lot.date_expiration) < new Date()}
//                 />
//                 {lot.code_cis && lot.code_cis !== 'N/A' && (
//                   <InfoField label="Code CIS" value={lot.code_cis} mono />
//                 )}
//                 {lot.blockchain_lot_id && (
//                   <div className="bg-purple-50 -lg p-3">
//                     <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
//                       Blockchain ID
//                     </span>
//                     <p className="text-sm font-mono font-bold text-purple-700 mt-1">
//                       #{lot.blockchain_lot_id}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Hash Blockchain */}
//               <div className="border-t pt-4 mt-4">
//                 <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                   <FaBarcode className="mr-2 h-4 w-4 text-gray-400" />
//                   Hash Blockchain (SHA-256)
//                 </div>
//                 <div className="bg-gray-50 border border-gray-200 -lg p-3">
//                   <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
//                     {lot.hash_lot}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Comparaison des hashs */}
//           {hashComparison && (
//             <HashComparisonSection 
//               comparison={hashComparison} 
//               integrity={integrity}
//               blockchainAvailable={blockchain_available}
//             />
//           )}

//           {/* Mouvements */}
//           {movements && movements.length > 0 && hashComparison?.mouvements && (
//             <MouvementsSection 
//               mouvements={hashComparison.mouvements} 
//               modifications={mouvementModifications}
//             />
//           )}

//           {/* Certificat (si authentique) */}
//           {integrity === true && (
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 -xl p-6 text-center">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 -full mb-4">
//                 <FaCheckCircle className="h-8 w-8 text-green-600" />
//               </div>
//               <h4 className="text-lg font-bold text-green-900 uppercase tracking-wide mb-2">
//                 🏅 Certificat d'Authenticité
//               </h4>
//               <p className="text-sm text-green-700 mb-3">
//                 Ce lot a été vérifié avec succès. L'intégrité des données est garantie par la technologie blockchain.
//               </p>
//               <div className="bg-white/50 -lg p-3 inline-block">
//                 <p className="text-xs text-green-600">
//                   Vérifié le {new Date().toLocaleDateString('fr-FR', {
//                     day: 'numeric', month: 'long', year: 'numeric'
//                   })} à {new Date().toLocaleTimeString('fr-FR', {
//                     hour: '2-digit', minute: '2-digit', second: '2-digit'
//                   })}
//                 </p>
//                 <p className="text-xs font-mono text-green-700 mt-1 font-bold">{code}</p>
//               </div>
//             </div>
//           )}

//           {/* Footer */}
//           <div className="text-center pt-4 border-t border-gray-200">
//             <button
//               onClick={() => window.location.href = '/verify'}
//               className="text-sm text-green-600 hover:text-green-800 font-medium"
//             >
//               ← Vérifier un autre lot
//             </button>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// // Composant InfoField
// function InfoField({ 
//   label, 
//   value, 
//   icon: Icon, 
//   mono = false, 
//   expired = false 
// }: { 
//   label: string; 
//   value: string; 
//   icon?: any; 
//   mono?: boolean; 
//   expired?: boolean;
// }) {
//   return (
//     <div className="bg-gray-50 -lg p-3">
//       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//         {label}
//       </span>
//       <p className={`text-sm font-bold mt-1 flex items-center ${expired ? 'text-red-600' : 'text-gray-900'} ${mono ? 'font-mono' : ''}`}>
//         {Icon && <Icon className="mr-2 h-3.5 w-3.5 text-gray-400" />}
//         {value}
//         {expired && (
//           <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 -full">Expiré</span>
//         )}
//       </p>
//     </div>
//   );
// }

// // Composant HashComparisonSection
// function HashComparisonSection({ 
//   comparison, 
//   integrity, 
//   blockchainAvailable 
// }: { 
//   comparison: any; 
//   integrity: boolean | null; 
//   blockchainAvailable: boolean;
// }) {
//   if (!comparison) return null;

//   return (
//     <div className="border-2 border-purple-100 -xl p-6 bg-purple-50/30">
//       <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
//         <FaShieldAlt className="mr-3 h-6 w-6 text-purple-600" />
//         Comparaison des Hashs
//       </h3>

//       {/* Hash du lot */}
//       <div className={`p-4 mb-4 border -lg ${
//         comparison.lot.match ? 'bg-emerald-50 border-emerald-200' : 
//         comparison.lot.match === false ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
//       }`}>
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-semibold text-gray-700">HASH DU LOT</span>
//           {comparison.lot.match ? (
//             <span className="text-xs text-emerald-600 font-medium">✓ OK</span>
//           ) : comparison.lot.match === false ? (
//             <span className="text-xs text-red-600 font-medium">✗ MODIFIÉ</span>
//           ) : (
//             <span className="text-xs text-gray-400 font-medium">— Non vérifié</span>
//           )}
//         </div>
//         <div className="space-y-1 text-xs font-mono">
//           <div>
//             <span className="text-gray-400">DB (stocké): </span>
//             <span className={comparison.lot.db_hash_intact ? 'text-gray-600' : 'text-red-600 line-through'}>
//               {comparison.lot.db_hash?.substring(0, 40)}...
//             </span>
//           </div>
//           <div>
//             <span className="text-gray-400">DB (recalculé): </span>
//             <span className="text-gray-600">
//               {comparison.lot.db_hash_recalculated?.substring(0, 40)}...
//             </span>
//           </div>
//           {comparison.lot.blockchain_hash && (
//             <div>
//               <span className="text-gray-400">Blockchain: </span>
//               <span className="text-purple-600">
//                 {comparison.lot.blockchain_hash?.substring(0, 40)}...
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Résumé des mouvements */}
//       {comparison.mouvements && comparison.mouvements.length > 0 && (
//         <div className="text-sm text-gray-600 mb-2">
//           <span className="font-semibold">{comparison.mouvements.length}</span> mouvement(s) vérifié(s)
//           {comparison.missing_movements && comparison.missing_movements.length > 0 && (
//             <span className="text-red-600 ml-2">
//               — {comparison.missing_movements.length} manquant(s)
//             </span>
//           )}
//         </div>
//       )}

//       {/* Blockchain indisponible */}
//       {!blockchainAvailable && (
//         <div className="bg-amber-50 border border-amber-200 p-3 -lg mt-2">
//           <p className="text-sm text-amber-700">
//             ⚠️ La blockchain n'est pas disponible. Vérification limitée à la base de données.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// // Composant MouvementsSection
// function MouvementsSection({ 
//   mouvements, 
//   modifications 
// }: { 
//   mouvements: MouvementComparison[]; 
//   modifications: string[];
// }) {
//   if (!mouvements || mouvements.length === 0) return null;

//   const isMouvementModified = (index: number) => {
//     return modifications.some(m => m.toLowerCase().includes(`mouvement #${index + 1}`));
//   };

//   // Déterminer la couleur selon le type de mouvement
//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case 'creation_lot': return 'bg-blue-100 text-blue-800';
//       case 'transfert':
//       case 'transfert_pharmacie':
//       case 'transfert_distributeur': return 'bg-purple-100 text-purple-800';
//       case 'reception': return 'bg-teal-100 text-teal-800';
//       case 'reception_rejet': return 'bg-red-100 text-red-800';
//       case 'retrait_defectueux': return 'bg-orange-100 text-orange-800';
//       case 'vente_pharmacie':
//       case 'vente_patient': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="border-2 border-gray-100 -xl p-6">
//       <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//         <FaExchangeAlt className="mr-3 h-6 w-6 text-purple-600" />
//         Chaîne de Traçabilité
//         <span className="ml-2 text-sm font-normal text-gray-500">
//           ({mouvements.length} mouvement{mouvements.length > 1 ? 's' : ''})
//         </span>
//       </h3>

//       <div className="space-y-4">
//         {mouvements.map((mvt, idx) => {
//           const isModified = mvt.match === false || !mvt.hash_db_intact || isMouvementModified(idx);
          
//           return (
//             <div 
//               key={idx}
//               className={`p-4 border -lg transition-all ${
//                 isModified 
//                   ? 'bg-red-50 border-red-300 shadow-sm' 
//                   : mvt.match === true
//                     ? 'bg-emerald-50/30 border-emerald-200'
//                     : 'bg-white border-gray-200 hover:border-gray-300'
//               }`}
//             >
//               {/* En-tête */}
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <span className={`inline-flex items-center px-2.5 py-1 -full text-xs font-medium ${getTypeColor(mvt.type)}`}>
//                     {mvt.type.replace(/_/g, ' ')}
//                   </span>
                  
//                   {isModified && (
//                     <FaExclamationTriangle className="h-4 w-4 text-red-500" />
//                   )}
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   {mvt.match === true ? (
//                     <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 -full">✓ Intact</span>
//                   ) : mvt.match === false ? (
//                     <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 -full">⚠️ Altéré</span>
//                   ) : (
//                     <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 -full">— Non vérifié</span>
//                   )}
//                 </div>
//               </div>

//               {/* Infos */}
//               <div className="grid grid-cols-2 gap-3 mb-3">
//                 <div className="flex items-center gap-2">
//                   <FaClock className="h-3.5 w-3.5 text-gray-400" />
//                   <div>
//                     <div className="text-xs text-gray-400">Date</div>
//                     <span className="text-sm text-gray-700">
//                       {new Date(mvt.date).toLocaleString('fr-FR', {
//                         day: '2-digit', month: '2-digit', year: 'numeric',
//                         hour: '2-digit', minute: '2-digit'
//                       })}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <FaBox className="h-3.5 w-3.5 text-gray-400" />
//                   <div>
//                     <div className="text-xs text-gray-400">Quantité</div>
//                     <span className="text-sm font-medium text-gray-900">{mvt.quantite} unités</span>
//                   </div>
//                 </div>

//                 {mvt.commentaire && (
//                   <div className="col-span-2">
//                     <div className="text-xs text-gray-400 mb-1">Commentaire</div>
//                     <div className="text-sm p-2  bg-gray-50 text-gray-600">
//                       {mvt.commentaire}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Hashs */}
//               <div className="mt-3 pt-3 border-t border-gray-200">
//                 <div className="text-xs font-medium text-gray-500 mb-2">🔐 Vérification des hashs</div>
//                 <div className="space-y-1.5">
//                   <div className="flex items-start gap-2">
//                     <span className="text-xs text-gray-400 w-20 flex-shrink-0">DB stocké:</span>
//                     <code className={`text-xs break-all ${!mvt.hash_db_intact ? 'text-red-600 line-through bg-red-50 px-1 ' : 'text-gray-500'}`}>
//                       {mvt.db_hash?.substring(0, 40)}...
//                     </code>
//                   </div>
                  
//                   {!mvt.hash_db_intact && (
//                     <div className="flex items-start gap-2">
//                       <span className="text-xs text-gray-400 w-20 flex-shrink-0">DB recalculé:</span>
//                       <code className="text-xs text-orange-600 break-all bg-orange-50 px-1 ">
//                         {mvt.db_hash_recalculated?.substring(0, 40)}...
//                       </code>
//                     </div>
//                   )}
                  
//                   {mvt.blockchain_hash && (
//                     <div className="flex items-start gap-2">
//                       <span className="text-xs text-gray-400 w-20 flex-shrink-0">Blockchain:</span>
//                       <code className="text-xs text-purple-600 break-all bg-purple-50 px-1 ">
//                         {mvt.blockchain_hash?.substring(0, 40)}...
//                       </code>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// app/verify/[code]/page.tsx - VERSION SPACIEUSE & ÉQUILIBRÉE
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FaShieldAlt, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaPills, FaCalendar, FaIndustry, FaBox, FaBarcode,
  FaExclamationTriangle, FaRedo, FaExchangeAlt
} from 'react-icons/fa';
import { parseTraceabilityCode } from '@/lib/utils/traceability';
import QRCodeGenerator from '@/components/QRCodeGenerator';

// ... (interfaces inchangées)

interface MouvementComparison {
  type: string;
  date: string;
  quantite: number;
  commentaire: string | null;
  source_id: string;
  destination_id: string | null;
  raison: string | null;
  db_hash: string;
  db_hash_recalculated: string;
  blockchain_hash: string | null;
  hash_db_intact: boolean;
  match: boolean | null;
  exists_on_blockchain: boolean;
  blockchain_data: any;
}

interface VerificationResult {
  verified: boolean;
  code: string;
  integrity: boolean | null;
  blockchain_available: boolean;
  lot: {
    id: number;
    numero_lot: string;
    code_unique: string;
    medicament_nom: string;
    code_cis: string;
    dosage: string;
    forme: string;
    fabricant: string;
    date_fabrication: string;
    date_expiration: string;
    quantite: number;
    hash_lot: string;
    blockchain_lot_id: string | null;
  } | null;
  hashComparison: {
    lot: {
      db_hash: string;
      db_hash_recalculated: string;
      blockchain_hash: string | null;
      match: boolean;
      db_hash_intact: boolean;
    };
    mouvements: MouvementComparison[];
    missing_movements: string[];
  } | null;
  modifications: string[];
  movements: Array<{
    id: number;
    type_mouvement: string;
    quantite: number;
    commentaire: string | null;
    created_at: string;
    source_id: string;
    destination_id: string | null;
  }>;
  timestamp: string;
}

export default function VerifyByCodePage() {
  const params = useParams();
  const code = params?.code as string;
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      verifyCode(code);
    }
  }, [code]);

   const verifyCode = async (traceabilityCode: string) => {
    try {
      setLoading(true);
      setError(null);
      setVerificationResult(null);

      console.log('🔍 Vérification du code:', traceabilityCode);

      const parsed = parseTraceabilityCode(traceabilityCode);
      if (!parsed) {
        throw new Error('Format de code de traçabilité invalide. Format attendu: TRC-XXXX-XXXXXX-XXXXXX');
      }

      const apiUrl = `/api/verify/${encodeURIComponent(traceabilityCode)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Résultat reçu:', data);
      
      setVerificationResult(data);
      
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };


  const handleRetry = () => {
    if (code) {
      setError(null);
      setVerificationResult(null);
      setLoading(true);
      verifyCode(code);
    }
  };


  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-100" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-800 mb-1">Vérification en cours</h2>
            <p className="text-sm text-zinc-500">Analyse du code et comparaison blockchain</p>
          </div>
          <div className="inline-block bg-white -full px-6 py-3 shadow-sm border border-zinc-100">
            <p className="text-sm font-mono text-zinc-600">{code}</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="bg-white -3xl shadow-sm border border-zinc-100 p-8 md:p-10 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 -2xl flex items-center justify-center mb-6">
            <FaTimesCircle className="h-8 w-8 text-red-400" />
          </div>
          
          <h1 className="text-xl font-semibold text-zinc-800 mb-2">Vérification échouée</h1>
          <p className="text-sm text-zinc-500 mb-6">{error}</p>

          <div className="bg-zinc-50 -2xl p-4 mb-6">
            <p className="text-xs font-mono text-zinc-500 break-all">{code}</p>
          </div>

          <button
            onClick={handleRetry}
            className="w-full py-3.5 bg-zinc-900 text-white text-sm font-medium -2xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <FaRedo className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!verificationResult) return null;

  const { lot, hashComparison, modifications, integrity, movements } = verificationResult;

  const getStatusConfig = () => {
    if (integrity === true) {
      return {
        bg: 'from-emerald-500 to-emerald-600',
        icon: FaCheckCircle,
        title: 'Lot Authentique',
        subtitle: 'Tous les hashs correspondent. Aucune altération détectée.',
        badge: 'bg-emerald-50 text-emerald-700',
      };
    } else if (integrity === false) {
      return {
        bg: 'from-red-500 to-red-600',
        icon: FaTimesCircle,
        title: 'Lot Altéré',
        subtitle: 'Incohérence détectée entre la base de données et la blockchain.',
        badge: 'bg-red-50 text-red-700',
      };
    } else {
      return {
        bg: 'from-amber-500 to-amber-600',
        icon: FaExclamationTriangle,
        title: 'Vérification Partielle',
        subtitle: 'Lot non enregistré sur la blockchain ou blockchain indisponible.',
        badge: 'bg-amber-50 text-amber-700',
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const modificationsCount = modifications.length;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Container principal - utilise tout l'écran sur desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Grille responsive : sidebar sur desktop, stack sur mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          
          {/* ============================================ */}
          {/* COLONNE GAUCHE : INFOS PRINCIPALES (2/5) */}
          {/* ============================================ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carte statut + code */}
            <div className={`bg-gradient-to-br ${statusConfig.bg} -3xl p-6 sm:p-8 text-white shadow-lg`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 -2xl p-3">
                  <StatusIcon className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{statusConfig.title}</h1>
                  <p className="text-sm text-white/70">{statusConfig.subtitle}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm -2xl px-5 py-3 mt-4">
                <p className="text-sm sm:text-base font-mono tracking-wider text-center">{code}</p>
              </div>
            </div>

            {/* Carte informations du lot */}
            {lot && (
              <div className="bg-white -3xl shadow-sm border border-zinc-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-zinc-800 mb-5 flex items-center gap-2">
                  <FaPills className="h-5 w-5 text-emerald-500" />
                  Informations du lot
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Médicament</label>
                      <p className="text-sm font-semibold text-zinc-800 mt-1">{lot.medicament_nom}</p>
                      <p className="text-xs text-zinc-400">{lot.dosage} - {lot.forme}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Numéro de lot</label>
                      <p className="text-sm font-mono font-semibold text-zinc-800 mt-1">{lot.numero_lot}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Fabricant</label>
                      <p className="text-sm font-semibold text-zinc-800 mt-1 flex items-center gap-1.5">
                        <FaIndustry className="h-3.5 w-3.5 text-zinc-400" />
                        {lot.fabricant}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Quantité</label>
                      <p className="text-sm font-semibold text-zinc-800 mt-1 flex items-center gap-1.5">
                        <FaBox className="h-3.5 w-3.5 text-zinc-400" />
                        {lot.quantite.toLocaleString()} unités
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Fabrication</label>
                      <p className="text-sm font-semibold text-zinc-800 mt-1">
                        {new Date(lot.date_fabrication).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Expiration</label>
                      <p className={`text-sm font-semibold mt-1 flex items-center gap-2 ${
                        new Date(lot.date_expiration) < new Date() ? 'text-red-600' : 'text-zinc-800'
                      }`}>
                        {new Date(lot.date_expiration).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                        {new Date(lot.date_expiration) < new Date() && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 -full">Expiré</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {lot.code_cis && lot.code_cis !== 'N/A' && (
                    <div>
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Code CIS</label>
                      <p className="text-sm font-mono font-semibold text-zinc-800 mt-1">{lot.code_cis}</p>
                    </div>
                  )}

                  {lot.blockchain_lot_id && (
                    <div className="bg-purple-50 -2xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 -xl flex items-center justify-center">
                        <FaShieldAlt className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-purple-400 uppercase tracking-wider">Blockchain ID</label>
                        <p className="text-sm font-mono font-semibold text-purple-700">#{lot.blockchain_lot_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="bg-white -3xl shadow-sm border border-zinc-100 p-6 sm:p-8 text-center">
              <h3 className="text-sm font-medium text-zinc-500 mb-4">QR Code de vérification</h3>
              <div className="inline-block bg-zinc-50 -2xl p-4">
                <QRCodeGenerator 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${code}`}
                  size={180}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-3">Scannez pour vérifier l'authenticité</p>
            </div>

          </div>

          {/* ============================================ */}
          {/* COLONNE DROITE : DÉTAILS TECHNIQUES (3/5) */}
          {/* ============================================ */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Anomalies détectées */}
            {modifications.length > 0 && (
              <div className="bg-red-50 border border-red-100 -3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 -2xl p-3">
                    <FaExclamationTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Anomalies détectées</h2>
                    <p className="text-sm text-red-600">{modificationsCount} modification{modificationsCount > 1 ? 's' : ''} trouvée{modificationsCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {modifications.map((modif, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/60 -2xl p-4">
                      <FaExclamationTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{modif}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparaison des hashs */}
            {hashComparison && (
              <div className="bg-white -3xl shadow-sm border border-zinc-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-zinc-800 mb-5 flex items-center gap-2">
                  <FaBarcode className="h-5 w-5 text-purple-500" />
                  Comparaison des hashs
                </h2>

                {/* Hash du lot */}
                <div className={`-2xl p-5 mb-5 ${
                  hashComparison.lot.match 
                    ? 'bg-emerald-50 border border-emerald-100' 
                    : hashComparison.lot.match === false 
                      ? 'bg-red-50 border border-red-100' 
                      : 'bg-zinc-50 border border-zinc-100'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-zinc-700">Hash du lot</h3>
                    {hashComparison.lot.match ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-3 py-1 -full">✓ Correspond</span>
                    ) : hashComparison.lot.match === false ? (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-3 py-1 -full">✗ Différent</span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-3 py-1 -full">Non vérifié</span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400 text-xs w-20 flex-shrink-0">DB stocké:</span>
                      <code className={`text-xs break-all ${!hashComparison.lot.db_hash_intact ? 'text-red-500 line-through' : 'text-zinc-600'}`}>
                        {hashComparison.lot.db_hash?.substring(0, 50)}...
                      </code>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400 text-xs w-20 flex-shrink-0">DB recalculé:</span>
                      <code className="text-xs break-all text-zinc-600">
                        {hashComparison.lot.db_hash_recalculated?.substring(0, 50)}...
                      </code>
                    </div>
                    {hashComparison.lot.blockchain_hash && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-400 text-xs w-20 flex-shrink-0">Blockchain:</span>
                        <code className="text-xs break-all text-purple-600">
                          {hashComparison.lot.blockchain_hash?.substring(0, 50)}...
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Résumé mouvements */}
                <div className="flex items-center gap-4 text-sm text-zinc-600 mb-5">
                  <span>
                    <strong className="text-zinc-800">{hashComparison.mouvements?.length || 0}</strong> mouvements vérifiés
                  </span>
                  {hashComparison.missing_movements && hashComparison.missing_movements.length > 0 && (
                    <span className="text-red-500">
                      <strong>{hashComparison.missing_movements.length}</strong> manquants
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Mouvements */}
            {hashComparison?.mouvements && hashComparison.mouvements.length > 0 && (
              <div className="bg-white -3xl shadow-sm border border-zinc-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-zinc-800 mb-5 flex items-center gap-2">
                  <FaExchangeAlt className="h-5 w-5 text-purple-500" />
                  Chaîne de traçabilité
                </h2>

                <div className="space-y-4">
                  {hashComparison.mouvements.map((mvt, idx) => {
                    const isModified = mvt.match === false || !mvt.hash_db_intact;
                    
                    const getTypeColor = (type: string) => {
                      switch (type) {
                        case 'creation_lot': return 'bg-blue-50 text-blue-700 border-blue-200';
                        case 'transfert':
                        case 'transfert_pharmacie':
                        case 'transfert_distributeur': return 'bg-purple-50 text-purple-700 border-purple-200';
                        case 'reception': return 'bg-teal-50 text-teal-700 border-teal-200';
                        case 'reception_rejet': return 'bg-red-50 text-red-700 border-red-200';
                        case 'retrait_defectueux': return 'bg-orange-50 text-orange-700 border-orange-200';
                        case 'vente_pharmacie':
                        case 'vente_patient': return 'bg-green-50 text-green-700 border-green-200';
                        default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
                      }
                    };

                    return (
                      <div 
                        key={idx}
                        className={`-2xl border p-5 ${
                          isModified 
                            ? 'bg-red-50 border-red-200' 
                            : mvt.match === true
                              ? 'bg-emerald-50/30 border-emerald-100'
                              : 'bg-zinc-50/50 border-zinc-100'
                        }`}
                      >
                        {/* En-tête du mouvement */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-3 py-1.5 -full border ${getTypeColor(mvt.type)}`}>
                              {mvt.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-zinc-400">
                              #{idx + 1}
                            </span>
                          </div>
                          
                          <span className={`text-xs font-medium px-3 py-1 -full ${
                            mvt.match === true 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : mvt.match === false 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {mvt.match === true ? '✓ Intact' : mvt.match === false ? '⚠ Altéré' : 'Non vérifié'}
                          </span>
                        </div>

                        {/* Infos */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-zinc-400">Date</label>
                            <p className="text-sm font-medium text-zinc-700">
                              {new Date(mvt.date).toLocaleString('fr-FR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400">Quantité</label>
                            <p className="text-sm font-medium text-zinc-700">{mvt.quantite} unités</p>
                          </div>
                          {mvt.raison && (
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-xs text-zinc-400">Raison</label>
                              <p className="text-sm font-medium text-zinc-700">{mvt.raison}</p>
                            </div>
                          )}
                        </div>

                        {mvt.commentaire && (
                          <div className="mb-4 bg-white/50 -xl p-3">
                            <p className="text-sm text-zinc-600">{mvt.commentaire}</p>
                          </div>
                        )}

                        {/* Hashs du mouvement */}
                        <div className="border-t border-zinc-200/50 pt-3 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-zinc-400 w-24 flex-shrink-0">Hash DB:</span>
                            <code className={`text-xs break-all ${!mvt.hash_db_intact ? 'text-red-500 line-through' : 'text-zinc-500'}`}>
                              {mvt.db_hash?.substring(0, 40)}...
                            </code>
                          </div>
                          {mvt.blockchain_hash && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-zinc-400 w-24 flex-shrink-0">Hash BC:</span>
                              <code className="text-xs break-all text-purple-500">
                                {mvt.blockchain_hash?.substring(0, 40)}...
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Certificat d'authenticité */}
            {integrity === true && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 -3xl p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 -2xl mb-4">
                  <FaCheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-emerald-800 mb-2">🏅 Certificat d'Authenticité</h3>
                <p className="text-sm text-emerald-600 mb-4">
                  Ce lot a été vérifié avec succès via la blockchain
                </p>
                <div className="inline-block bg-white -2xl px-6 py-3">
                  <p className="text-xs text-emerald-600">
                    Vérifié le {new Date().toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })} à {new Date().toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs font-mono text-emerald-700 mt-1 font-semibold">{code}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/verify'}
            className="text-sm text-zinc-500 hover:text-zinc-700 font-medium transition-colors"
          >
            ← Vérifier un autre lot
          </button>
        </div>
      </div>
    </div>
  );
}