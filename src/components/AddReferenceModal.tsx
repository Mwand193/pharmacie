// 'use client'

// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { TFC } from '@/lib/gen'
// import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa'
// interface AddReferenceModalProps {
//   isOpen: boolean
//   onClose: () => void
//   currentTfcId: number        // ⬅️ number au lieu de string
//   onReferenceAdded: () => void
//   existingReferences: number[] // ⬅️ number[] au lieu de string[]
// }

// export default function AddReferenceModal({
//   isOpen,
//   onClose,
//   currentTfcId,
//   onReferenceAdded,
//   existingReferences
// }: AddReferenceModalProps) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [searchResults, setSearchResults] = useState<TFC[]>([])
//   const [loading, setLoading] = useState(false)
//   const [selectedTfc, setSelectedTfc] = useState<TFC | null>(null)

//   const searchTFCs = async (query: string) => {
//     if (!query.trim()) {
//       setSearchResults([])
//       return
//     }

//     setLoading(true)
//     try {
//       const { data, error } = await supabase
//         .from('tfc')
//         .select(`
//           *,
//           facultes:faculte_id(nom, code),
//           annees_academiques:annee_academique_id(annee),
//           departements:departement_id(nom, code)
//         `)
//         .or(`titre.ilike.%${query}%,auteur.ilike.%${query}%,mots_cles.cs.{${query}}`)
//         .limit(10)

//       if (error) throw error

//       // Filtrer les TFC déjà référencés et le TFC courant
//       const filteredResults = data?.filter(tfc => 
//         tfc.id !== currentTfcId && 
//         !existingReferences.includes(tfc.id)
//       ) || []

//       setSearchResults(filteredResults)
//     } catch (error) {
//       console.error('Erreur de recherche:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const addReference = async () => {
//     if (!selectedTfc) return

//     try {
//       const { error } = await supabase
//         .from('tfc_references')
//         .insert({
//           tfc_source_id: currentTfcId,
//           tfc_reference_id: selectedTfc.id,
//           type_reference: 'reference'
//         })

//       if (error) throw error

//       onReferenceAdded()
//       onClose()
//       setSelectedTfc(null)
//       setSearchTerm('')
//     } catch (error) {
//       console.error('Erreur lors de l\'ajout de la référence:', error)
//     }
//   }

//   useEffect(() => {
//     if (searchTerm) {
//       const timeoutId = setTimeout(() => searchTFCs(searchTerm), 300)
//       return () => clearTimeout(timeoutId)
//     }
//   }, [searchTerm])

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Ajouter une référence</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <FaTimes size={20} />
//           </button>
//         </div>

//         <div className="mb-4">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Rechercher un TFC par titre, auteur ou mot-clé..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg pl-10"
//             />
//             <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
//           </div>
//         </div>

//         {selectedTfc ? (
//           <div className="mb-4 p-4 border border-green-200 bg-green-50 rounded-lg">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="font-semibold">{selectedTfc.titre}</h3>
//                 <p className="text-sm text-gray-600">
//                   {selectedTfc.auteur} • {selectedTfc.annees_academiques?.annee} • {selectedTfc.facultes?.nom}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setSelectedTfc(null)}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <FaTimes />
//               </button>
//             </div>
//             <button
//               onClick={addReference}
//               className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
//             >
//               <FaPlus />
//               <span>Confirmer l'ajout de la référence</span>
//             </button>
//           </div>
//         ) : (
//           <div className="max-h-64 overflow-y-auto">
//             {loading ? (
//               <div className="text-center py-4">Recherche en cours...</div>
//             ) : searchResults.length > 0 ? (
//               <div className="space-y-2">
//                 {searchResults.map(tfc => (
//                   <div
//                     key={tfc.id}
//                     className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
//                     onClick={() => setSelectedTfc(tfc)}
//                   >
//                     <h4 className="font-medium text-sm line-clamp-1">{tfc.titre}</h4>
//                     <p className="text-xs text-gray-600">
//                       {tfc.auteur} • {tfc.annees_academiques?.annee} • {tfc.facultes?.nom}
//                     </p>
//                     {tfc.mots_cles && (
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {tfc.mots_cles.slice(0, 3).map((mot, index) => (
//                           <span key={index} className="text-xs bg-gray-100 px-1 rounded">
//                             #{mot}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : searchTerm ? (
//               <div className="text-center py-4 text-gray-500">
//                 Aucun TFC trouvé
//               </div>
//             ) : null}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TFC } from '@/lib/gen'
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa'

interface AddReferenceModalProps {
  isOpen: boolean
  onClose: () => void
  currentTfcId: number
  onReferenceAdded: () => void
  existingReferences: number[]
}

export default function AddReferenceModal({
  isOpen,
  onClose,
  currentTfcId,
  onReferenceAdded,
  existingReferences
}: AddReferenceModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<TFC[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTfc, setSelectedTfc] = useState<TFC | null>(null)

  const searchTFCs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tfc')
        .select(`
          *,
          facultes:faculte_id(nom, code),
          annees_academiques:annee_academique_id(annee),
          departements:departement_id(nom, code)
        `)
        .or(`titre.ilike.%${query}%,auteur.ilike.%${query}%,mots_cles.cs.{${query}}`)
        .limit(10)

      if (error) throw error

      const filteredResults = data?.filter(tfc => 
        tfc.id !== currentTfcId && 
        !existingReferences.includes(tfc.id)
      ) || []

      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Erreur de recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const addReference = async () => {
    if (!selectedTfc) return

    try {
      const { error } = await supabase
        .from('tfc_references')
        .insert({
          tfc_source_id: currentTfcId,
          tfc_reference_id: selectedTfc.id,
          type_reference: 'reference'
        })

      if (error) throw error

      onReferenceAdded()
      onClose()
      setSelectedTfc(null)
      setSearchTerm('')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la référence:', error)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => searchTFCs(searchTerm), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ajouter une référence
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un TFC par titre, auteur ou mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {selectedTfc ? (
          <div className="mb-4 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedTfc.titre}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTfc.auteur} • {selectedTfc.annees_academiques?.annee} • {selectedTfc.facultes?.nom}
                </p>
              </div>
              <button
                onClick={() => setSelectedTfc(null)}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <button
              onClick={addReference}
              className="mt-3 w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center space-x-2 transition-colors"
            >
              <FaPlus />
              <span>Confirmer l'ajout de la référence</span>
            </button>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                Recherche en cours...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map(tfc => (
                  <div
                    key={tfc.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTfc(tfc)}
                  >
                    <h4 className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-white">
                      {tfc.titre}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tfc.auteur} • {tfc.annees_academiques?.annee} • {tfc.facultes?.nom}
                    </p>
                    {tfc.mots_cles && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tfc.mots_cles.slice(0, 3).map((mot, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1 rounded border border-gray-200 dark:border-gray-600"
                          >
                            #{mot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Aucun TFC trouvé
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}