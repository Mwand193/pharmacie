
// 'use client'

// import { useState } from 'react'
// import { FaQuoteLeft, FaQuoteRight, FaLink, FaFilePdf, FaExternalLinkAlt, FaSearch } from 'react-icons/fa'

// interface TFCNode {
//   id: number
//   titre: string
//   auteur: string
//   annee: string
//   note?: number
//   faculte: string
//   departement?: string
//   filiere?: string
//   mots_cles?: string[]
//   resume?: string
// }

// interface TFCReferencesTabsProps {
//   references: TFCNode[]
//   referencedBy: TFCNode[]
//   onOpenTFC: (tfcId: number) => void
//   onAddReference?: () => void
// }

// export default function TFCReferencesTabs({
//   references,
//   referencedBy,
//   onOpenTFC,
//   onAddReference
// }: TFCReferencesTabsProps) {
//   const [activeTab, setActiveTab] = useState<'references' | 'citedBy'>('references')
//   const [searchTerm, setSearchTerm] = useState('')

//   const filteredReferences = references.filter(tfc =>
//     tfc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     tfc.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     tfc.mots_cles?.some(mot => mot.toLowerCase().includes(searchTerm.toLowerCase()))
//   )

//   const filteredCitedBy = referencedBy.filter(tfc =>
//     tfc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     tfc.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     tfc.mots_cles?.some(mot => mot.toLowerCase().includes(searchTerm.toLowerCase()))
//   )

//   const currentData = activeTab === 'references' ? filteredReferences : filteredCitedBy

//   const TFCListItem = ({ tfc, type }: { tfc: TFCNode; type: 'reference' | 'citedBy' }) => (
//     <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg p-4">
//       {/* En-tête avec métadonnées */}
//       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
//         <div className="flex items-start space-x-3">
//           <div className={`p-2 rounded-lg ${
//             type === 'reference' 
//               ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
//               : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
//           }`}>
//             {type === 'reference' ? <FaQuoteLeft size={14} /> : <FaQuoteRight size={14} />}
//           </div>
//           <div>
//             <div className="flex flex-wrap items-center gap-2">
//               <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                 type === 'reference' 
//                   ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' 
//                   : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
//               }`}>
//                 {type === 'reference' ? 'Référence citée' : 'Cite ce mémoire'}
//               </span>
//               {tfc.note && (
//                 <span className="text-xs font-bold bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
//                   {tfc.note}/20
//                 </span>
//               )}
//             </div>
//             <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//               {tfc.annee} • {tfc.faculte}
//             </div>
//           </div>
//         </div>
        
//         <button
//           onClick={() => onOpenTFC(tfc.id)}
//           className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 w-full sm:w-auto"
//         >
//           <FaExternalLinkAlt size={12} />
//           <span>Ouvrir</span>
//         </button>
//       </div>

//       {/* Titre */}
//       <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight text-sm">
//         {tfc.titre}
//       </h3>

//       {/* Auteur */}
//       <div className="flex items-center space-x-2 mb-3">
//         <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Par {tfc.auteur}</span>
//       </div>

//       {/* Mots-clés */}
//       {tfc.mots_cles && tfc.mots_cles.length > 0 && (
//         <div className="flex flex-wrap gap-1 mb-3">
//           {tfc.mots_cles.slice(0, 4).map((mot, index) => (
//             <span
//               key={index}
//               className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800"
//             >
//               #{mot}
//             </span>
//           ))}
//           {tfc.mots_cles.length > 4 && (
//             <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
//               +{tfc.mots_cles.length - 4}
//             </span>
//           )}
//         </div>
//       )}

//       {/* Résumé (optionnel) */}
//       {tfc.resume && (
//         <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
//           {tfc.resume}
//         </div>
//       )}

//       {/* Footer avec informations supplémentaires */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">
//         <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
//           {tfc.departement && (
//             <span className="font-medium">{tfc.departement}</span>
//           )}
//           {tfc.filiere && (
//             <span>{tfc.filiere}</span>
//           )}
//         </div>
//         <FaFilePdf size={14} className="text-red-500 dark:text-red-400" />
//       </div>
//     </div>
//   )

//   return (
//     <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
//       {/* En-tête avec onglets */}
//       <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 lg:p-6 pb-0 gap-4">
//           <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//             <div className="flex items-center space-x-2">
//               <FaLink className="text-blue-600 dark:text-blue-400" size={20} />
//               <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Relations académiques</h2>
//             </div>
            
//             {/* Statistiques */}
//             <div className="flex items-center space-x-4 sm:space-x-6">
//               <div className="text-center">
//                 <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{references.length}</div>
//                 <div className="text-xs text-gray-600 dark:text-gray-400">Références</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{referencedBy.length}</div>
//                 <div className="text-xs text-gray-600 dark:text-gray-400">Citants</div>
//               </div>
//             </div>
//           </div>

//           {onAddReference && (
//             <button
//               onClick={onAddReference}
//               className="px-4 py-2 bg-blue-600 w-[70%] dark:bg-blue-700 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center space-x-2 mxau md:w-full sm:w-auto"
//             >
//               <FaLink size={12} />
//               <span className='hidden md:block'>Ajouter une référence</span>
//               <span className='md:hidden block '>Ajouter </span>
//             </button>
//           )}
//         </div>

//         {/* Barre d'onglets */}
//         <div className="flex space-x-1 p-2 lg:p-6 lg:mt-6 mt-4 overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('references')}
//             className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
//               activeTab === 'references'
//                 ? 'border-green-500 text-green-700 dark:text-green-400 bg-white dark:bg-gray-800'
//                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//             }`}
//           >
//             <FaQuoteLeft size={14} />
//             <span className='text-xs'>Références citées</span>
//             <span className={`px-2 py-1 rounded-full text-xs ${
//               activeTab === 'references'
//                 ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
//                 : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
//             }`}>
//               {references.length}
//             </span>
//           </button>

//           <button
//             onClick={() => setActiveTab('citedBy')}
//             className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
//               activeTab === 'citedBy'
//                 ? 'border-orange-500 text-orange-700 dark:text-orange-400 bg-white dark:bg-gray-800'
//                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//             }`}
//           >
//             <FaQuoteRight size={14} />
//             <span className='text-xs'>Travaux qui citent</span>
//             <span className={`px-2 py-1 rounded-full text-xs ${
//               activeTab === 'citedBy'
//                 ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
//                 : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
//             }`}>
//               {referencedBy.length}
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Barre de recherche */}
//       <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//         <div className="relative max-w-md">
//           <FaSearch className="absolute left-3 top-3 text-gray-400" size={14} />
//           <input
//             type="text"
//             placeholder={`Rechercher dans les ${activeTab === 'references' ? 'références' : 'citants'}...`}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
//             >
//               ×
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Contenu des onglets */}
//       <div className="p-4 lg:p-6 bg-gray-50/30 dark:bg-gray-900/30">
//         {currentData.length > 0 ? (
//           <div className="grid gap-4">
//             {currentData.map((tfc) => (
//               <TFCListItem
//                 key={tfc.id}
//                 tfc={tfc}
//                 type={activeTab === 'references' ? 'reference' : 'citedBy'}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 lg:py-12">
//             <div className="text-gray-400 dark:text-gray-500 mb-3">
//               {activeTab === 'references' ? (
//                 <FaQuoteLeft size={30} className="mx-auto mb-4 lg:size-12" />
//               ) : (
//                 <FaQuoteRight size={30} className="mx-auto mb-4 lg:size-12" />
//               )}
//             </div>
//             <h3 className="text-base lg:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
//               {searchTerm ? 'Aucun résultat trouvé' : 
//                 activeTab === 'references' 
//                   ? 'Aucune référence citée' 
//                   : 'Aucun travail ne cite ce mémoire'
//               }
//             </h3>
//             <p className="text-gray-500 dark:text-gray-500 text-sm">
//               {searchTerm 
//                 ? 'Essayez avec d\'autres termes de recherche'
//                 : activeTab === 'references'
//                   ? 'Les références citées par ce mémoire apparaîtront ici'
//                   : 'Les travaux qui citent ce mémoire apparaîtront ici'
//               }
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'

import { Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { FaQuoteLeft, FaQuoteRight, FaLink, FaFilePdf, FaExternalLinkAlt, FaSearch, FaKey, FaLock, FaUnlock } from 'react-icons/fa'

interface TFCNode {
  id: number
  titre: string
  auteur: string
  annee: string
  note?: number
  faculte: string
  departement?: string
  filiere?: string
  mots_cles?: string[]
  resume?: string
}

interface TFCReferencesTabsProps {
  references: TFCNode[]
  referencedBy: TFCNode[]
  onOpenTFC: (tfcId: number) => void
  onAddReference?: () => void
}

export default function TFCReferencesTabs({
  references,
  referencedBy,
  onOpenTFC,
  onAddReference
}: TFCReferencesTabsProps) {
  const [activeTab, setActiveTab] = useState<'references' | 'citedBy'>('references')
  const [searchTerm, setSearchTerm] = useState('')
  const [clickCount, setClickCount] = useState(0)
  const [showAccessGranted, setShowAccessGranted] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  // Réinitialiser le compteur après 5 secondes d'inactivité
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [clickCount])

  // Vérifier si on a atteint 10 clics
  useEffect(() => {
    if (clickCount >= 10 && !accessGranted) {
      setAccessGranted(true)
      setShowAccessGranted(true)
      setClickCount(0)
      
      const timer = setTimeout(() => {
        setShowAccessGranted(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [clickCount, accessGranted])

  const handleAddReferenceClick = () => {
    if (accessGranted && onAddReference) {
      onAddReference()
    } else {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }
  }

  const handleSecretClick = () => {
    setClickCount(prev => prev + 1)
  }

  const filteredReferences = references.filter(tfc =>
    tfc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tfc.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tfc.mots_cles?.some(mot => mot.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredCitedBy = referencedBy.filter(tfc =>
    tfc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tfc.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tfc.mots_cles?.some(mot => mot.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const currentData = activeTab === 'references' ? filteredReferences : filteredCitedBy

  const TFCListItem = ({ tfc, type }: { tfc: TFCNode; type: 'reference' | 'citedBy' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg p-4">
      {/* En-tête avec métadonnées */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            type === 'reference' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
          }`}>
            {type === 'reference' ? <FaQuoteLeft size={14} /> : <FaQuoteRight size={14} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                type === 'reference' 
                  ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' 
                  : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
              }`}>
                {type === 'reference' ? 'Référence citée' : 'Cite ce mémoire'}
              </span>
              {tfc.note && (
                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  {tfc.note}/20
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tfc.annee} • {tfc.faculte}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onOpenTFC(tfc.id)}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 w-full sm:w-auto"
        >
          <FaExternalLinkAlt size={12} />
          <span>Ouvrir</span>
        </button>
      </div>

      {/* Titre */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight text-sm">
        {tfc.titre}
      </h3>

      {/* Auteur */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Par {tfc.auteur}</span>
      </div>

      {/* Mots-clés */}
      {tfc.mots_cles && tfc.mots_cles.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tfc.mots_cles.slice(0, 4).map((mot, index) => (
            <span
              key={index}
              className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800"
            >
              #{mot}
            </span>
          ))}
          {tfc.mots_cles.length > 4 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{tfc.mots_cles.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Résumé (optionnel) */}
      {tfc.resume && (
        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {tfc.resume}
        </div>
      )}

      {/* Footer avec informations supplémentaires */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {tfc.departement && (
            <span className="font-medium">{tfc.departement}</span>
          )}
          {tfc.filiere && (
            <span>{tfc.filiere}</span>
          )}
        </div>
        <FaFilePdf size={14} className="text-red-500 dark:text-red-400" />
      </div>
    </div>
  )

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Notification d'accès accordé */}
      {showAccessGranted && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-bounce">
          <FaUnlock size={16} />
          <span className="font-semibold">Accès spécial accordé !</span>
        </div>
      )}

      {/* Avertissement */}
      {showWarning && (
        <div className="fixed  inset-2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <Lock className='block size-4'/>
          <div>
            <div className="font-semibold">Accès restreint</div>
            <div className="text-sm opacity-90">
              {!accessGranted 
                ? "Vous ne pouvez pas ajouter une référence sans privilèges."
                : "Accès spécial activé - Vous pouvez maintenant ajouter des références"
              }
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 lg:p-6 pb-0 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <FaLink className="text-blue-600 dark:text-blue-400" size={20} />
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Relations académiques</h2>
            </div>
            
            {/* Statistiques */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{references.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Références</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{referencedBy.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Citants</div>
              </div>
            </div>
          </div>

          {onAddReference && (
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={handleAddReferenceClick}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm flex items-center justify-center space-x-2 w-full md:w-auto ${
                  accessGranted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {accessGranted ? <FaUnlock size={12} /> : <FaLock size={12} />}
                <span className='hidden md:block'>
                  {accessGranted ? 'Ajouter une référence (Accès spécial)' : 'Ajouter une référence'}
                </span>
                <span className='md:hidden block'>
                  {accessGranted ? 'Ajouter (Accès spécial)' : 'Ajouter'}
                </span>
              </button>
              
              {/* Easter Egg - Texte secret (sans compteur visible) */}
              <div 
                onClick={handleSecretClick}
                className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 transition-colors flex items-center space-x-1"
                title="Cliquez plusieurs fois pour accéder au mode spécial"
              >
                <FaKey size={10} />
                <span>accès spécial</span>
              </div>
            </div>
          )}
        </div>

        {/* Barre d'onglets */}
        <div className="flex space-x-1 p-2 lg:p-6 lg:mt-6 mt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('references')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'references'
                ? 'border-green-500 text-green-700 dark:text-green-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FaQuoteLeft size={14} />
            <span className='text-xs'>Références citées</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activeTab === 'references'
                ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {references.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('citedBy')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'citedBy'
                ? 'border-orange-500 text-orange-700 dark:text-orange-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FaQuoteRight size={14} />
            <span className='text-xs'>Travaux qui citent</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activeTab === 'citedBy'
                ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {referencedBy.length}
            </span>
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-400" size={14} />
          <input
            type="text"
            placeholder={`Rechercher dans les ${activeTab === 'references' ? 'références' : 'citants'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="p-4 lg:p-6 bg-gray-50/30 dark:bg-gray-900/30">
        {currentData.length > 0 ? (
          <div className="grid gap-4">
            {currentData.map((tfc) => (
              <TFCListItem
                key={tfc.id}
                tfc={tfc}
                type={activeTab === 'references' ? 'reference' : 'citedBy'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-3">
              {activeTab === 'references' ? (
                <FaQuoteLeft size={30} className="mx-auto mb-4 lg:size-12" />
              ) : (
                <FaQuoteRight size={30} className="mx-auto mb-4 lg:size-12" />
              )}
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {searchTerm ? 'Aucun résultat trouvé' : 
                activeTab === 'references' 
                  ? 'Aucune référence citée' 
                  : 'Aucun travail ne cite ce mémoire'
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche'
                : activeTab === 'references'
                  ? 'Les références citées par ce mémoire apparaîtront ici'
                  : 'Les travaux qui citent ce mémoire apparaîtront ici'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}