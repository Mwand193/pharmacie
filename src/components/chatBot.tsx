
// 'use client'

// import { useState, useRef, useEffect, JSX } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { 
//   Send, Bot, User, Trash2, BookOpen, Loader2, AlertCircle, 
//   ThumbsUp, ThumbsDown, Copy, ChevronDown, ChevronUp,
//   Search, Filter, MessageCircle, UserCircle, History,
//   Settings, X, Menu, ChevronLeft,
//   LoaderIcon,
//   BarChart2,
//   PlusCircle,
//   LucidePanelLeftOpen,
//   PanelLeft
// } from 'lucide-react'
// import LottieAnimation from './LottieAnimation'
// import { FaBars } from 'react-icons/fa'
// import { FiMenu } from 'react-icons/fi'
// import { ArrowLongLeftIcon, Bars2Icon, PlusCircleIcon } from '@heroicons/react/24/outline'
// import ThemeSwitch from './ThemeSwitch'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'

// interface Message {
//   id: number
//   role: 'user' | 'assistant'
//   content: string
//   tfc_references?: number[]
//   created_at: string
//   feedback?: 'positive' | 'negative'
// }

// interface TFCReference {
//   id: number
//   titre: string
//   auteur: string
//   annee_academique?: { annee: string }
//   similarity?: number
//   abstract?: string
// }

// interface User {
//   id: string
//   name: string
//   email: string
//   role: string
//   profil_url?: string
// }

// interface Conversation {
//   id: number
//   title: string
//   created_at: string
//   updated_at: string
//   chat_messages?: Message[]
// }

// export default function ChatBot() {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [conversationId, setConversationId] = useState<number>()
//   const [references, setReferences] = useState<TFCReference[]>([])
//   const [filteredReferences, setFilteredReferences] = useState<TFCReference[]>([])
//   const [error, setError] = useState<string>('')
//   const [showReferences, setShowReferences] = useState(false)
//   const [expandedReference, setExpandedReference] = useState<number | null>(null)
//   const [similarityThreshold, setSimilarityThreshold] = useState<number>(20)
//   const [user, setUser] = useState<User | null>(null)
//   const [conversations, setConversations] = useState<Conversation[]>([])
//   const [showConversations, setShowConversations] = useState(false)
//   const [isLoadingConversations, setIsLoadingConversations] = useState(false)
//   const [mobileView, setMobileView] = useState<'chat' | 'conversations'>('chat')
//   const [isLoadingConversation, setIsLoadingConversation] = useState<number | null>(null)
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true)
//   const [authChecked, setAuthChecked] = useState(false) // 🔥 Nouvel état pour suivre si l'auth a déjà été vérifiée

//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const textareaRef = useRef<HTMLTextAreaElement>(null)
//   const messagesContainerRef = useRef<HTMLDivElement>(null)
//   const mobileMenuRef = useRef<HTMLDivElement>(null)
//   const router = useRouter()

//   const similarityThresholds = [20, 30, 40, 50]

//   // Charger l'utilisateur et ses conversations au montage - UNE SEULE FOIS
//   useEffect(() => {
//     if (!authChecked) {
//       loadUserAndConversations()
//     }
//   }, [authChecked])

//   // 🔥 CORRECTION : Redirection seulement après avoir fini de vérifier l'authentification
//   useEffect(() => {
//     if (!isCheckingAuth && user === null && authChecked) {
//       console.log('🔴 Utilisateur non connecté, redirection...')
//       router.push('/auth/login')
//     }
//   }, [user, isCheckingAuth, router, authChecked])

//   // Filtrage des références par seuil de similarité
//   useEffect(() => {
//     if (references.length > 0) {
//       const filtered = references.filter(ref => 
//         ref.similarity && ref.similarity >= similarityThreshold
//       )
//       setFilteredReferences(filtered)
//     } else {
//       setFilteredReferences([])
//     }
//   }, [references, similarityThreshold])

//   // Gestion du clic en dehors du menu mobile
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (mobileView === 'conversations' && 
//           mobileMenuRef.current && 
//           !mobileMenuRef.current.contains(event.target as Node)) {
//         setMobileView('chat')
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [mobileView])

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto'
//       textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
//     }
//   }, [input])

//   const loadUserAndConversations = async () => {
//     try {
//       setIsLoadingConversations(true)
//       setIsCheckingAuth(true)
      
//       const response = await fetch('/api/chat/conversations')
      
//       if (response.ok) {
//         const data = await response.json()
//         console.log('✅ Utilisateur connecté:', data.user)
//         setUser(data.user)
//         setConversations(data.conversations || [])
//       } else if (response.status === 401) {
//         console.log('🔴 Non authentifié, statut 401')
//         setUser(null)
//       } else {
//         console.log('⚠️ Erreur autre que 401:', response.status)
//         setUser(null)
//       }
//     } catch (error) {
//       console.error('❌ Erreur chargement utilisateur:', error)
//       setUser(null)
//     } finally {
//       setIsLoadingConversations(false)
//       setIsCheckingAuth(false)
//       setAuthChecked(true) // 🔥 Marquer que l'authentification a été vérifiée
//     }
//   }

//   const loadConversation = async (convId: number) => {
//     try {
//       setIsLoadingConversation(convId)
//       const response = await fetch(`/api/chat/conversations/${convId}`)
//       if (response.ok) {
//         const data = await response.json()
//         setMessages(data.messages || [])
//         setConversationId(convId)
//         setShowConversations(false)
//         setMobileView('chat')
//         // Réinitialiser les références quand on change de conversation
//         setReferences([])
//         setFilteredReferences([])
//       } else if (response.status === 401) {
//         // 🔥 Ne pas reset user ici pour éviter la boucle de redirection
//         console.log('Session expirée lors du chargement de la conversation')
//       }
//     } catch (error) {
//       console.error('❌ Erreur chargement conversation:', error)
//       setError('Erreur lors du chargement de la conversation')
//     } finally {
//       setIsLoadingConversation(null)
//     }
//   }

//   // Formatage amélioré du markdown
//   const formatMessageContent = (content: string) => {
//     if (!content) return [<span key="empty"> </span>]
    
//     const lines = content.split('\n')
//     const elements: JSX.Element[] = []
//     let inList = false
//     let inTable = false
//     let inCodeBlock = false
//     let codeLanguage = ''
//     let codeContent: string[] = []
//     let tableRows: string[][] = []
//     let tableHeaders: string[] = []

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i]

//       // Gestion des blocs de code
//       if (line.startsWith('```')) {
//         if (!inCodeBlock) {
//           // Début du bloc de code
//           inCodeBlock = true
//           codeLanguage = line.replace('```', '').trim()
//           codeContent = []
//         } else {
//           // Fin du bloc de code
//           inCodeBlock = false
//           elements.push(
//             <pre key={`code-${i}`} className="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 text-sm">
//               <code>{codeContent.join('\n')}</code>
//             </pre>
//           )
//           codeContent = []
//         }
//         continue
//       }

//       if (inCodeBlock) {
//         codeContent.push(line)
//         continue
//       }

//       // Titres
//       if (line.startsWith('#### ')) {
//         const titleText = line.replace('#### ', '')
//         elements.push(<h4 key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">
//           {formatInlineMarkdown(titleText)}
//         </h4>)
//         continue
//       }

//       if (line.startsWith('### ')) {
//         const titleText = line.replace('### ', '')
//         elements.push(<h3 key={i} className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
//           {formatInlineMarkdown(titleText)}
//         </h3>)
//         continue
//       }

//       if (line.startsWith('## ')) {
//         const titleText = line.replace('## ', '')
//         elements.push(<h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
//           {formatInlineMarkdown(titleText)}
//         </h2>)
//         continue
//       }

//       if (line.startsWith('# ')) {
//         const titleText = line.replace('# ', '')
//         elements.push(<h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
//           {formatInlineMarkdown(titleText)}
//         </h1>)
//         continue
//       }

//       // Séparateurs
//       if (line.startsWith('---')) {
//         elements.push(<hr key={i} className="my-4 border-gray-300 dark:border-gray-600" />)
//         continue
//       }

//       // Gestion des tableaux
//       if (line.includes('|')) {
//         if (line.includes('---')) {
//           inTable = true
//           continue
//         } else {
//           const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
//           if (inTable) {
//             tableRows.push(cells)
//           } else {
//             tableHeaders = cells
//             inTable = true
//           }
//           continue
//         }
//       } else if (inTable) {
//         // Fin du tableau
//         elements.push(
//           <div key={`table-${i}`} className="overflow-x-auto my-4">
//             <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
//               <tbody>
//                 {tableHeaders.length > 0 && (
//                   <tr>
//                     {tableHeaders.map((header, idx) => (
//                       <td key={idx} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-left font-semibold">
//                         {formatInlineMarkdown(header)}
//                       </td>
//                     ))}
//                   </tr>
//                 )}
//                 {tableRows.map((row, rowIdx) => (
//                   <tr key={rowIdx}>
//                     {row.map((cell, cellIdx) => (
//                       <td key={cellIdx} className="px-4 py-2 border border-gray-300 dark:border-gray-600">
//                         {formatInlineMarkdown(cell)}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )
//         inTable = false
//         tableRows = []
//         tableHeaders = []
//       }

//       // Listes
//       if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
//         if (!inList) {
//           elements.push(<ul key={`list-start-${i}`} className="list-disc pl-5 my-2 space-y-1" />)
//           inList = true
//         }
//         const listItem = line.replace(/^[-*] /, '')
//         elements.push(
//           <li key={i} className="text-gray-700 dark:text-gray-300">
//             {formatInlineMarkdown(listItem)}
//           </li>
//         )
//         continue
//       } else if (inList && line.trim() === '') {
//         inList = false
//       }

//       // Citations
//       if (line.startsWith('> ')) {
//         elements.push(
//           <blockquote key={i} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 text-gray-600 dark:text-gray-400 italic">
//             {formatInlineMarkdown(line.replace('> ', ''))}
//           </blockquote>
//         )
//         continue
//       }

//       // Lignes vides
//       if (line.trim() === '') {
//         elements.push(<br key={i} />)
//         continue
//       }

//       // Paragraphes normaux avec formatage inline
//       elements.push(
//         <p key={i} className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300">
//           {formatInlineMarkdown(line)}
//         </p>
//       )
//     }

//     // Fermer le tableau si on arrive à la fin
//     if (inTable) {
//       elements.push(
//         <div key="table-final" className="overflow-x-auto my-4">
//           <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
//             <tbody>
//               {tableHeaders.length > 0 && (
//                 <tr>
//                   {tableHeaders.map((header, idx) => (
//                     <td key={idx} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-left font-semibold">
//                       {formatInlineMarkdown(header)}
//                     </td>
//                   ))}
//                 </tr>
//               )}
//               {tableRows.map((row, rowIdx) => (
//                 <tr key={rowIdx}>
//                   {row.map((cell, cellIdx) => (
//                     <td key={cellIdx} className="px-4 py-2 border border-gray-300 dark:border-gray-600">
//                       {formatInlineMarkdown(cell)}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )
//     }

//     return elements
//   }

//   // Formatage du markdown inline amélioré
//   const formatInlineMarkdown = (text: string): (string | JSX.Element)[] => {
//     if (!text) return ['']
    
//     const elements: (string | JSX.Element)[] = []
//     let currentIndex = 0
//     let buffer = ''

//     const flushBuffer = () => {
//       if (buffer) {
//         elements.push(buffer)
//         buffer = ''
//       }
//     }

//     const processFormatting = (startMarker: string, endMarker: string, Component: React.ComponentType<{children: React.ReactNode}>) => {
//       const remaining = text.substring(currentIndex)
      
//       if (remaining.startsWith(startMarker)) {
//         flushBuffer()
        
//         let endIndex = remaining.indexOf(endMarker, startMarker.length)
//         let searchStart = startMarker.length
        
//         // Chercher la prochaine occurrence qui n'est pas échappée
//         while (endIndex !== -1) {
//           // Vérifier si ce n'est pas échappé
//           if (endIndex === 0 || remaining[endIndex - 1] !== '\\') {
//             break
//           }
//           endIndex = remaining.indexOf(endMarker, endIndex + 1)
//         }

//         if (endIndex !== -1) {
//           const content = remaining.substring(startMarker.length, endIndex)
//           elements.push(
//             <Component key={`${startMarker}-${currentIndex}`}>
//               {formatInlineMarkdown(content)}
//             </Component>
//           )
//           currentIndex += endIndex + endMarker.length
//           return true
//         }
//       }
//       return false
//     }

//     while (currentIndex < text.length) {
//       // Échappement des caractères
//       if (text[currentIndex] === '\\' && currentIndex < text.length - 1) {
//         buffer += text[currentIndex + 1]
//         currentIndex += 2
//         continue
//       }

//       // Essayer les différents formats dans l'ordre de priorité
//       if (processFormatting('***', '***', ({children}) => 
//         <strong className="font-bold italic">{children}</strong>)) continue

//       if (processFormatting('**', '**', ({children}) => 
//         <strong className="font-bold">{children}</strong>)) continue

//       if (processFormatting('*', '*', ({children}) => 
//         <em className="italic">{children}</em>)) continue

//       if (processFormatting('`', '`', ({children}) => 
//         <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>)) continue

//       if (processFormatting('__', '__', ({children}) => 
//         <strong className="font-bold">{children}</strong>)) continue

//       if (processFormatting('_', '_', ({children}) => 
//         <em className="italic">{children}</em>)) continue

//       // Aucun format trouvé, ajouter au buffer
//       buffer += text[currentIndex]
//       currentIndex++
//     }

//     flushBuffer()
//     return elements
//   }

//   const sendMessage = async () => {
//     if (!input.trim() || isLoading) return

//     const userMessage = input.trim()
//     setInput('')
//     setIsLoading(true)
//     setError('')

//     const userMsg: Message = {
//       id: Date.now(),
//       role: 'user',
//       content: userMessage,
//       created_at: new Date().toISOString()
//     }

//     setMessages(prev => [...prev, userMsg])

//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: userMessage,
//           conversationId: conversationId
//         })
//       })

//       // 🔥 CORRECTION : Gérer les erreurs d'authentification sans reset user
//       if (response.status === 401) {
//         throw new Error('Session expirée. Veuillez vous reconnecter.')
//       }

//       const responseData = await response.json()

//       if (!response.ok) {
//         throw new Error(responseData.error || `Erreur ${response.status}`)
//       }

//       if (!responseData.success) {
//         throw new Error(responseData.details || 'Erreur inconnue')
//       }

//       const assistantMsg: Message = {
//         id: Date.now() + 1,
//         role: 'assistant',
//         content: responseData.response,
//         created_at: new Date().toISOString(),
//         tfc_references: responseData.references?.map((r: any) => r.id)
//       }

//       setMessages(prev => [...prev, assistantMsg])
//       setReferences(responseData.references || [])
      
//       if (responseData.conversationId) {
//         setConversationId(responseData.conversationId)
//         // Recharger la liste des conversations pour avoir la dernière
//         setTimeout(() => loadUserAndConversations(), 500)
//       }

//     } catch (error: any) {
//       console.error('❌ Erreur chat:', error)
      
//       const errorMessage = error.message || 'Erreur de connexion avec le serveur'
//       setError(errorMessage)
      
//       const errorMsg: Message = {
//         id: Date.now() + 1,
//         role: 'assistant',
//         content: `Désolé, une erreur s'est produite : ${errorMessage}. Veuillez réessayer.`,
//         created_at: new Date().toISOString()
//       }
      
//       setMessages(prev => [...prev, errorMsg])

//       // 🔥 CORRECTION : Rediriger seulement si c'est une erreur d'authentification
//       if (errorMessage.includes('Session expirée')) {
//         setTimeout(() => {
//           router.push('/auth/login')
//         }, 2000)
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const clearConversation = () => {
//     setMessages([])
//     setReferences([])
//     setFilteredReferences([])
//     setConversationId(undefined)
//     setError('')
//     setExpandedReference(null)
//     setSimilarityThreshold(20)
//   }

//   const startNewConversation = () => {
//     clearConversation()
//     setShowConversations(false)
//     setMobileView('chat')
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text)
//   }

//   const handleFeedback = (messageId: number, type: 'positive' | 'negative') => {
//     setMessages(prev => prev.map(msg => 
//       msg.id === messageId ? { ...msg, feedback: type } : msg
//     ))
//   }

//   const toggleReferenceExpansion = (id: number) => {
//     setExpandedReference(expandedReference === id ? null : id)
//   }

//   const getSimilarityColor = (similarity: number) => {
//     if (similarity > 85) return 'text-green-600 font-bold'
//     if (similarity > 70) return 'text-green-500'
//     if (similarity > 55) return 'text-yellow-600'
//     if (similarity > 40) return 'text-orange-500'
//     if (similarity > 25) return 'text-red-500'
//     return 'text-red-400'
//   }

//   const getInitials = (name: string) =>
//     name
//       .split(' ')
//       .map(part => part.charAt(0).toUpperCase())
//       .join('')
//       .slice(0, 2)

//   const exampleQuestions = [
//     "Quels TFC parlent de l'intelligence artificielle ?",
//     "Trouvez-moi des travaux sur la blockchain",
//   ]

//   // 🔥 CORRECTION : Afficher le loader seulement pendant la vérification initiale
//   if (isCheckingAuth && !authChecked) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
//           <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
//         </div>
//       </div>
//     )
//   }

//   // 🔥 CORRECTION : Redirection seulement si la vérification est terminée ET user est null
//   if (user === null && authChecked) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
//           <p className="text-gray-600 dark:text-gray-400">Redirection vers la page de connexion...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//      <div className="flex h-screen  z-10 bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300">
//       {/* Dynamic Island Left - Menu */}
//      {/* Dynamic Island Left - Menu */}
// <motion.div
//   initial={{ opacity: 0, y: -20 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.3, delay: 0.1 }}
//   className="fixed left-4 lg:left-[100px] top-4 z-50"
// >
//   <button
//     onClick={() => {
//       if (window.innerWidth < 1024) { // lg breakpoint
//         setMobileView('conversations')
//       } else {
//         setShowConversations(!showConversations)
//       }
//     }}
//     className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
//   >
//     <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
//   </button>
// </motion.div>

//       {/* Dynamic Island Right - Actions */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.2 }}
//         className="fixed right-4 lg:right-[100px] top-4 z-50 flex gap-2"
//       >
//         {filteredReferences.length > 0 && (
//           <button
//             onClick={() => setShowReferences(!showReferences)}
//             className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 relative"
//           >
//             <BookOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
//             <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//               {filteredReferences.length}
//             </span>
//           </button>
//         )}
        
//         <button
//           onClick={startNewConversation}
//           className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
//         >
//           <PlusCircleIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
//         </button>
//       </motion.div>

//       {/* Overlay pour mobile et desktop */}
//       <AnimatePresence>
//         {(showConversations || mobileView === 'conversations') && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
//             onClick={() => {
//               setShowConversations(false)
//               setMobileView('chat')
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Sidebar des conversations - Desktop avec animation */}
//       <AnimatePresence>
//         {showConversations && (
//           <motion.div
//             initial={{ x: -300, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -300, opacity: 0 }}
//             transition={{ type: "spring", damping: 30, stiffness: 300 }}
//             className="hidde lg:block fixed overflow-auto left-0 top-0 h-full w-[30%] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col shadow-xl transition-colors duration-300"
//           >
//             {/* En-tête de la sidebar */}
//             <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
//               <h3 className="font-semibold text-gray-900 dark:text-white">Historique des conversations</h3>
//               <button
//                 onClick={() => setShowConversations(false)}
//                 className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
//               >
//                 <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//               </button>
//             </div>

//             {/* Section des actions */}
//             <div className="p-3 flex gap-3 items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//               <button
//                 onClick={startNewConversation}
//                 className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
//               >
//                 <PlusCircleIcon className="h-5 w-5" />
//                 <span>Nouvelle</span>
//               </button>
//               <Link 
//                 href="/" 
//                 className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
//               >
//                 <BarChart2 className="h-5 w-5"/>
//                 <span>Stats</span>
//               </Link>
//               <ThemeSwitch/>
//             </div>

//             {/* Liste des conversations */}
//             <div className="flex-1 overflow-y-auto">
//               {isLoadingConversations ? (
//                 <div className="flex items-center justify-center p-8">
//                   <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
//                   <span className="ml-2 text-gray-500 dark:text-gray-400">Chargement...</span>
//                 </div>
//               ) : conversations.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center p-8 text-center">
//                   <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
//                   <p className="text-gray-500 dark:text-gray-400 text-sm">
//                     Aucune conversation sauvegardée
//                   </p>
//                   <button
//                     onClick={startNewConversation}
//                     className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
//                   >
//                     Commencer une nouvelle conversation
//                   </button>
//                 </div>
//               ) : (
//                 <div className="p-2">
//                   {conversations.map(conv => (
//                     <div
//                       key={conv.id}
//                       className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 mb-2 ${
//                         conversationId === conv.id 
//                           ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
//                           : 'border border-transparent'
//                       }`}
//                       onClick={() => loadConversation(conv.id)}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 flex-1">
//                           {conv.title || "Conversation sans titre"}
//                         </div>
//                         {isLoadingConversation === conv.id && (
//                           <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
//                         )}
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
//                         <span className="flex items-center space-x-1">
//                           <MessageCircle className="h-3 w-3" />
//                           <span>{conv.chat_messages?.length || 0} messages</span>
//                         </span>
//                         <span>
//                           {new Date(conv.updated_at).toLocaleDateString('fr-FR', {
//                             day: 'numeric',
//                             month: 'short',
//                             year: 'numeric'
//                           })}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Pied de page avec informations utilisateur */}
//             <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//               {user && (
//                 <div className="flex items-center space-x-3">
//                   {user.profil_url ? (
//                     <img 
//                       src={user.profil_url} 
//                       alt="Photo de profil"
//                       className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
//                     />
//                   ) : (
//                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
//                       {getInitials(user.name)}
//                     </div>
//                   )}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                       {user.name}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                       {user.email}
//                     </p>
//                     <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
//                       {user.role}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Zone principale du chat */}
//       <div className="flex-1 flex flex-col min-w-0  relative">
//         {/* Vue mobile des conversations */}
//         <AnimatePresence>
//           {mobileView === 'conversations' && (
//             <motion.div
//               initial={{ x: -300, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: -300, opacity: 0 }}
//               transition={{ type: "spring", damping: 30, stiffness: 300 }}
//               className="lg:hidden fixed top-0 inset-0 z-50 flex flex-col"
//             >
//               <div 
//                 ref={mobileMenuRef}
//                 className="w-[75%] h-full  bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl transition-colors duration-300"
//               >
//                 <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
//                   <h3 className="font-semibold text-gray-900 dark:text-white">Historique </h3>
//                   <button
//                     onClick={() => setMobileView('chat')}
//                     className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
//                   >
//                     <PanelLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//                   </button>
//                 </div>

//                 {/* Section utilisateur dans le menu mobile */}
//                 <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//                   {user && (
//                     <div className="flex items-center space-x-3">
//                       {user.profil_url ? (
//                         <img 
//                           src={user.profil_url} 
//                           alt="Photo de profil"
//                           className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
//                         />
//                       ) : (
//                         <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
//                           {getInitials(user.name)}
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                           {user.name}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                           {user.email}
//                         </p>
//                         <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
//                           {user.role}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-3 gap-3 flex items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//                   <button
//                     onClick={startNewConversation}
//                     className="flex-1 text-sm bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
//                   >
//                     <PlusCircleIcon className="h-4 w-4" />
//                     <span>New</span>
//                   </button>
//                   <Link href="/" className="flex-1 text-sm bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium">
//                     <ArrowLongLeftIcon className="h-4 w-4"/>
//                     <span>exit</span>
//                   </Link>
//                   <ThemeSwitch/>
//                 </div>

//                 <div className="flex-1 overflow-y-auto hide-scrollbar">
//                   {isLoadingConversations ? (
//                     <div className="p-4 text-center">
//                       <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
//                     </div>
//                   ) : conversations.length === 0 ? (
//                     <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
//                       Aucune conversation sauvegardée
//                     </div>
//                   ) : (
//                     conversations.map(conv => (
//                       <div
//                         key={conv.id}
//                         className={`px-3 py-2 mx-2 border- border-gray-100 dark:border-gray-700 cursor-pointer rounded-xl my-1 hover:bg-g dark:hover:border-2  transition-colors duration-200 ${
//                           conversationId === conv.id ? 'bg-blue-100/70 dark:border-2 dark:bg-gray-700   rounded-xl  border-blue-200 dark:border-blue-800' : ''
//                         }`}
//                         onClick={() => loadConversation(conv.id)}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
//                             {conv.title}
//                           </div>
//                           {isLoadingConversation === conv.id && (
//                             <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
//                           )}
//                         </div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
//                           {/* <span>
//                             {conv.chat_messages?.length || 0} messages
//                           </span> */}
//                           {/* <span>
//                             {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
//                           </span> */}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Vue du chat (mobile et desktop) */}
//         {mobileView === 'chat' && (
//           <>
//             {/* Message d'erreur */}
//             {error && (
//               <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded flex-shrink-0 shadow-sm">
//                 <div className="flex items-center">
//                   <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
//                   <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
//                 </div>
//               </div>
//             )}

//             {/* Zone de messages avec défilement amélioré */}
//             <div 
//               ref={messagesContainerRef}
//               className="flex-1 hide-scrollbar overflow-auto md:overflow-y-auto py-4 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent transition-colors duration-300"
//               style={{ 
//                 scrollBehavior: 'smooth'
//               }}
//             >
//               <div className="w-full flex justify-center">
//                 <div className="md:w-[67%] hi pb-14 pt-11 mx-auto w-[86%] space-y-6">
//                   {messages.length === 0 ? (
//                     <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
//                       <LottieAnimation/>
//                       <p className="text-xl font-medium text-gray-900 dark:text-white mb-3">Bonjour {user?.name} ! 👋</p>
//                       <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Je suis votre assistant pour la recherche de Travaux de Fin de Cycle. Posez-moi vos questions !</p>
                      
//                       <div className="space-y-3 max-w-md mx-auto">
//                         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Exemples de questions :</p>
//                         {exampleQuestions.map((question, index) => (
//                           <button
//                             key={index}
//                             onClick={() => {
//                               setInput(question)
//                               textareaRef.current?.focus()
//                             }}
//                             className="block w-full text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 transition-all duration-200 text-left shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500"
//                           >
//                             {question}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     messages.map((message) => (
//                       <div
//                         key={message.id}
//                         className={`flex ${
//                           message.role === 'user' ? 'justify-end' : 'justify-start'
//                         }`}
//                       >
//                         {message.role === 'user' ? (
//                           // Message utilisateur avec bulle
//                           <div className="max-w-[80%] bg-gradient-to-br from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600 dark:text-gray-100 text-white rounded-s-2xl rounded-tr-2xl rounde p-4 relative group shadow-sm">
//                             <div className="whitespace-pre-wrap leading-relaxed text-sm text-gray-900 dark:text-white">
//                               {formatMessageContent(message.content)}
//                             </div>
//                             <div className="flex items-center justify-end mt-2 pt-2 border-white/20 border-t">
//                               <span className="text-xs text-gray-800 dark:text-gray-200 opacity-70">
//                                 {new Date(message.created_at).toLocaleTimeString()}
//                               </span>
//                             </div>
//                           </div>
//                         ) : (
//                           // Message assistant sans bulle - texte simple
//                           <div className="max-w-[100%] text-gray-900 dark:text-white relative group">
//                             <div className="whitespace-pre-wrap leading-relaxed text-sm">
//                               {message.content === '▊' ? (
//                                 <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
//                                   <div className="flex space-x-1">
//                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                                   </div>
//                                   <span className="text-sm">Assistant écrit...</span>
//                                 </div>
//                               ) : (
//                                 formatMessageContent(message.content)
//                               )}
//                             </div>
                            
//                             {message.content !== '▊' && (
//                               <div className="flex items-center justify-between mt-2">
//                                 <div className="flex space-x-1">
//                                   <button
//                                     onClick={() => handleFeedback(message.id, 'positive')}
//                                     className={`p-1 rounded transition-colors ${
//                                       message.feedback === 'positive' 
//                                         ? 'text-green-500' 
//                                         : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
//                                     }`}
//                                   >
//                                     <ThumbsUp className="h-3 w-3" />
//                                   </button>
//                                   <button
//                                     onClick={() => handleFeedback(message.id, 'negative')}
//                                     className={`p-1 rounded transition-colors ${
//                                       message.feedback === 'negative' 
//                                         ? 'text-red-500' 
//                                         : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
//                                     }`}
//                                   >
//                                     <ThumbsDown className="h-3 w-3" />
//                                   </button>
//                                   <button
//                                     onClick={() => copyToClipboard(message.content)}
//                                     className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
//                                     title="Copier le message"
//                                   >
//                                     <Copy className="h-3 w-3" />
//                                   </button>
//                                 </div>
//                                 <span className="text-xs text-gray-400 dark:text-gray-500">
//                                   {new Date(message.created_at).toLocaleTimeString()}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   )}

//                   {isLoading && (
//                     <div className="flex justify-start">
//                       <div className="text-gray-600 dark:text-gray-400">
//                         <div className="flex items-center space-x-3">
//                           <div className="flex space-x-1">
//                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                           </div>
//                           <span className="text-gray-600 dark:text-gray-400 text-sm">Assistant réfléchit...</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div ref={messagesEndRef} />
//                 </div>
//               </div>
//             </div>

//             {/* Références TFC avec slide-up animation */}
//             <AnimatePresence>
//               {showReferences && filteredReferences.length > 0 && (
//                 <>
//                   {/* Overlay */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
//                     onClick={() => setShowReferences(false)}
//                   />
                  
//                   {/* Panel des références */}
//                   <motion.div
//                     initial={{ y: "100%" }}
//                     animate={{ y: 0 }}
//                     exit={{ y: "100%" }}
//                     transition={{ type: "spring", damping: 30, stiffness: 300 }}
//                     className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 max-h-[70vh] flex flex-col shadow-2xl rounded-t-2xl overflow-hidden transition-colors duration-300"
//                   >
//                     {/* Header du panel */}
//                     <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
//                       <div className="flex items-center space-x-2">
//                         <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           TFC trouvés ({filteredReferences.length})
//                         </span>
//                       </div>
//                       <button
//                         onClick={() => setShowReferences(false)}
//                         className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
//                       >
//                         <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//                       </button>
//                     </div>

//                     {/* Filtre de pertinence */}
//                     <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center space-x-2">
//                           <Filter className="h-3 w-3 text-gray-600 dark:text-gray-400" />
//                           <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filtre de pertinence</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
//                         {similarityThresholds.map(threshold => (
//                           <button
//                             key={threshold}
//                             onClick={() => setSimilarityThreshold(threshold)}
//                             className={`px-2 py-1 text-xs rounded-full border transition-all duration-200 flex-shrink-0 ${
//                               similarityThreshold === threshold
//                                 ? 'bg-gray-900 dark:bg-gray-700 text-white border-gray-900 dark:border-gray-700 shadow-sm'
//                                 : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
//                             }`}
//                           >
//                             ≥ {threshold}%
//                           </button>
//                         ))}
//                       </div>
//                     </div>
                    
//                     {/* Liste des références */}
//                     <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//                       {filteredReferences.map((tfc) => (
//                         <div key={tfc.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
//                           <div 
//                             className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
//                             onClick={() => toggleReferenceExpansion(tfc.id)}
//                           >
//                             <div className="flex justify-between items-start">
//                               <div className="flex-1 min-w-0">
//                                 <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
//                                   {tfc.titre}
//                                 </div>
                       
//                                 <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                   <span>{tfc.auteur}</span>
//                                   {tfc.similarity && (
//                                     <>
//                                       <span>•</span>
//                                       <span className={`font-medium ${getSimilarityColor(tfc.similarity)}`}>
//                                         {Math.round(tfc.similarity)}%
//                                       </span>
//                                     </>
//                                   )}
//                                 </div>
//                               </div>
//                               {expandedReference === tfc.id ? (
//                                 <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
//                               ) : (
//                                 <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
//                               )}
//                             </div>
                            
//                             {expandedReference === tfc.id && tfc.abstract && (
//                               <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
//                                 {tfc.abstract}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 </>
//               )}
//             </AnimatePresence>

//             {/* Zone de saisie sans fade-in */}
//             <div className="w-full fixed bottom-0 left-0 rounded--xl border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 backdrop-blur-md p-4 flex-shrink-0 shadow-lg transition-colors duration-300">
//               <div className="flex justify-center">
//                 <div className="w-full lg:w-[70%] flex space-x-3">
//                   <div className="flex w-full relative">
//                     <textarea
//                       ref={textareaRef}
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       onKeyPress={handleKeyPress}
//                       placeholder="Posez votre question sur les TFC..."
//                       className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl p-4 pr-12 resize-none transition-all duration-200 text-sm shadow-sm focus:shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       rows={1}
//                       disabled={isLoading}
//                       style={{ 
//                         minHeight: '60px',
//                         maxHeight: '150px'
//                       }}
//                     />
//                     <button
//                       onClick={sendMessage}
//                       disabled={isLoading || !input.trim()}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
//                       title="Envoyer le message"
//                     >
//                       {isLoading ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         <Send className="h-4 w-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useRef, useEffect, JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Bot, User, Trash2, BookOpen, Loader2, AlertCircle, 
  ThumbsUp, ThumbsDown, Copy, ChevronDown, ChevronUp,
  Search, Filter, MessageCircle, UserCircle, History,
  Settings, X, Menu, ChevronLeft,
  LoaderIcon,
  BarChart2,
  PlusCircle,
  LucidePanelLeftOpen,
  PanelLeft
} from 'lucide-react'
import LottieAnimation from './LottieAnimation'
import { FaBars } from 'react-icons/fa'
import { FiMenu } from 'react-icons/fi'
import { ArrowLongLeftIcon, Bars2Icon, PlusCircleIcon } from '@heroicons/react/24/outline'
import ThemeSwitch from './ThemeSwitch'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  tfc_references?: number[]
  created_at: string
  feedback?: 'positive' | 'negative'
}

interface TFCReference {
  id: number
  titre: string
  auteur: string
  promoteur: string
  faculte: string
  annee: string
  technologies: string[]
  resume: string
  similarity: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  profil_url?: string
}

interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  chat_messages?: Message[]
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number>()
  const [references, setReferences] = useState<TFCReference[]>([])
  const [filteredReferences, setFilteredReferences] = useState<TFCReference[]>([])
  const [error, setError] = useState<string>('')
  const [showReferences, setShowReferences] = useState(false)
  const [expandedReference, setExpandedReference] = useState<number | null>(null)
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(5) // Changé à 5%
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showConversations, setShowConversations] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [mobileView, setMobileView] = useState<'chat' | 'conversations'>('chat')
  const [isLoadingConversation, setIsLoadingConversation] = useState<number | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // CORRECTION : Ajout du seuil 5%
  const similarityThresholds = [5, 20, 30, 40, 50]

  // Charger l'utilisateur et ses conversations au montage - UNE SEULE FOIS
  useEffect(() => {
    if (!authChecked) {
      loadUserAndConversations()
    }
  }, [authChecked])

  // Redirection seulement après avoir fini de vérifier l'authentification
  useEffect(() => {
    if (!isCheckingAuth && user === null && authChecked) {
      console.log('🔴 Utilisateur non connecté, redirection...')
      router.push('/auth/login')
    }
  }, [user, isCheckingAuth, router, authChecked])

  // Filtrage des références par seuil de similarité
  useEffect(() => {
    if (references.length > 0) {
      const filtered = references.filter(ref => 
        ref.similarity && ref.similarity >= similarityThreshold
      )
      setFilteredReferences(filtered)
    } else {
      setFilteredReferences([])
    }
  }, [references, similarityThreshold])

  // Gestion du clic en dehors du menu mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileView === 'conversations' && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileView('chat')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileView])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [input])

  const loadUserAndConversations = async () => {
    try {
      setIsLoadingConversations(true)
      setIsCheckingAuth(true)
      
      const response = await fetch('/api/chat')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Utilisateur connecté:', data.user)
        setUser(data.user)
        setConversations(data.conversations || [])
      } else if (response.status === 401) {
        console.log('🔴 Non authentifié, statut 401')
        setUser(null)
      } else {
        console.log('⚠️ Erreur autre que 401:', response.status)
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error)
      setUser(null)
    } finally {
      setIsLoadingConversations(false)
      setIsCheckingAuth(false)
      setAuthChecked(true)
    }
  }

  const loadConversation = async (convId: number) => {
    try {
      setIsLoadingConversation(convId)
      const response = await fetch(`/api/chat?conversationId=${convId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setConversationId(convId)
        setShowConversations(false)
        setMobileView('chat')
        // Réinitialiser les références quand on change de conversation
        setReferences([])
        setFilteredReferences([])
      } else if (response.status === 401) {
        console.log('Session expirée lors du chargement de la conversation')
      }
    } catch (error) {
      console.error('❌ Erreur chargement conversation:', error)
      setError('Erreur lors du chargement de la conversation')
    } finally {
      setIsLoadingConversation(null)
    }
  }

  // Formatage amélioré du markdown
  const formatMessageContent = (content: string) => {
    if (!content) return [<span key="empty"> </span>]
    
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let inList = false
    let inTable = false
    let inCodeBlock = false
    let codeLanguage = ''
    let codeContent: string[] = []
    let tableRows: string[][] = []
    let tableHeaders: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Gestion des blocs de code
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Début du bloc de code
          inCodeBlock = true
          codeLanguage = line.replace('```', '').trim()
          codeContent = []
        } else {
          // Fin du bloc de code
          inCodeBlock = false
          elements.push(
            <pre key={`code-${i}`} className="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 text-sm">
              <code>{codeContent.join('\n')}</code>
            </pre>
          )
          codeContent = []
        }
        continue
      }

      if (inCodeBlock) {
        codeContent.push(line)
        continue
      }

      // Titres
      if (line.startsWith('#### ')) {
        const titleText = line.replace('#### ', '')
        elements.push(<h4 key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">
          {formatInlineMarkdown(titleText)}
        </h4>)
        continue
      }

      if (line.startsWith('### ')) {
        const titleText = line.replace('### ', '')
        elements.push(<h3 key={i} className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
          {formatInlineMarkdown(titleText)}
        </h3>)
        continue
      }

      if (line.startsWith('## ')) {
        const titleText = line.replace('## ', '')
        elements.push(<h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
          {formatInlineMarkdown(titleText)}
        </h2>)
        continue
      }

      if (line.startsWith('# ')) {
        const titleText = line.replace('# ', '')
        elements.push(<h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
          {formatInlineMarkdown(titleText)}
        </h1>)
        continue
      }

      // Séparateurs
      if (line.startsWith('---')) {
        elements.push(<hr key={i} className="my-4 border-gray-300 dark:border-gray-600" />)
        continue
      }

      // Gestion des tableaux
      if (line.includes('|')) {
        if (line.includes('---')) {
          inTable = true
          continue
        } else {
          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
          if (inTable) {
            tableRows.push(cells)
          } else {
            tableHeaders = cells
            inTable = true
          }
          continue
        }
      } else if (inTable) {
        // Fin du tableau
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
              <tbody>
                {tableHeaders.length > 0 && (
                  <tr>
                    {tableHeaders.map((header, idx) => (
                      <td key={idx} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-left font-semibold">
                        {formatInlineMarkdown(header)}
                      </td>
                    ))}
                  </tr>
                )}
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                        {formatInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        inTable = false
        tableRows = []
        tableHeaders = []
      }

      // Listes
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) {
          elements.push(<ul key={`list-start-${i}`} className="list-disc pl-5 my-2 space-y-1" />)
          inList = true
        }
        const listItem = line.replace(/^[-*] /, '')
        elements.push(
          <li key={i} className="text-gray-700 dark:text-gray-300">
            {formatInlineMarkdown(listItem)}
          </li>
        )
        continue
      } else if (inList && line.trim() === '') {
        inList = false
      }

      // Citations
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 text-gray-600 dark:text-gray-400 italic">
            {formatInlineMarkdown(line.replace('> ', ''))}
          </blockquote>
        )
        continue
      }

      // Lignes vides
      if (line.trim() === '') {
        elements.push(<br key={i} />)
        continue
      }

      // Paragraphes normaux avec formatage inline
      elements.push(
        <p key={i} className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300">
          {formatInlineMarkdown(line)}
        </p>
      )
    }

    // Fermer le tableau si on arrive à la fin
    if (inTable) {
      elements.push(
        <div key="table-final" className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
            <tbody>
              {tableHeaders.length > 0 && (
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <td key={idx} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-left font-semibold">
                      {formatInlineMarkdown(header)}
                    </td>
                  ))}
                </tr>
              )}
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                      {formatInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return elements
  }

  // Formatage du markdown inline amélioré
  const formatInlineMarkdown = (text: string): (string | JSX.Element)[] => {
    if (!text) return ['']
    
    const elements: (string | JSX.Element)[] = []
    let currentIndex = 0
    let buffer = ''

    const flushBuffer = () => {
      if (buffer) {
        elements.push(buffer)
        buffer = ''
      }
    }

    const processFormatting = (startMarker: string, endMarker: string, Component: React.ComponentType<{children: React.ReactNode}>) => {
      const remaining = text.substring(currentIndex)
      
      if (remaining.startsWith(startMarker)) {
        flushBuffer()
        
        let endIndex = remaining.indexOf(endMarker, startMarker.length)
        let searchStart = startMarker.length
        
        // Chercher la prochaine occurrence qui n'est pas échappée
        while (endIndex !== -1) {
          // Vérifier si ce n'est pas échappé
          if (endIndex === 0 || remaining[endIndex - 1] !== '\\') {
            break
          }
          endIndex = remaining.indexOf(endMarker, endIndex + 1)
        }

        if (endIndex !== -1) {
          const content = remaining.substring(startMarker.length, endIndex)
          elements.push(
            <Component key={`${startMarker}-${currentIndex}`}>
              {formatInlineMarkdown(content)}
            </Component>
          )
          currentIndex += endIndex + endMarker.length
          return true
        }
      }
      return false
    }

    while (currentIndex < text.length) {
      // Échappement des caractères
      if (text[currentIndex] === '\\' && currentIndex < text.length - 1) {
        buffer += text[currentIndex + 1]
        currentIndex += 2
        continue
      }

      // Essayer les différents formats dans l'ordre de priorité
      if (processFormatting('***', '***', ({children}) => 
        <strong className="font-bold italic">{children}</strong>)) continue

      if (processFormatting('**', '**', ({children}) => 
        <strong className="font-bold">{children}</strong>)) continue

      if (processFormatting('*', '*', ({children}) => 
        <em className="italic">{children}</em>)) continue

      if (processFormatting('`', '`', ({children}) => 
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>)) continue

      if (processFormatting('__', '__', ({children}) => 
        <strong className="font-bold">{children}</strong>)) continue

      if (processFormatting('_', '_', ({children}) => 
        <em className="italic">{children}</em>)) continue

      // Aucun format trouvé, ajouter au buffer
      buffer += text[currentIndex]
      currentIndex++
    }

    flushBuffer()
    return elements
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setError('')

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId
        })
      })

      if (response.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.')
      }

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `Erreur ${response.status}`)
      }

      if (!responseData.success) {
        throw new Error(responseData.details || 'Erreur inconnue')
      }

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseData.response,
        created_at: new Date().toISOString(),
        tfc_references: responseData.references?.map((r: any) => r.id)
      }

      setMessages(prev => [...prev, assistantMsg])
      
      // CORRECTION : Stocker les objets TFC complets
      setReferences(responseData.references || [])
      
      if (responseData.conversationId) {
        setConversationId(responseData.conversationId)
        setTimeout(() => loadUserAndConversations(), 500)
      }

    } catch (error: any) {
      console.error('❌ Erreur chat:', error)
      
      const errorMessage = error.message || 'Erreur de connexion avec le serveur'
      setError(errorMessage)
      
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Désolé, une erreur s'est produite : ${errorMessage}. Veuillez réessayer.`,
        created_at: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMsg])

      if (errorMessage.includes('Session expirée')) {
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setReferences([])
    setFilteredReferences([])
    setConversationId(undefined)
    setError('')
    setExpandedReference(null)
    setSimilarityThreshold(5) // Réinitialiser à 5%
  }

  const startNewConversation = () => {
    clearConversation()
    setShowConversations(false)
    setMobileView('chat')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleFeedback = (messageId: number, type: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ))
  }

  const toggleReferenceExpansion = (id: number) => {
    setExpandedReference(expandedReference === id ? null : id)
  }

  // CORRECTION : Ajout du seuil 5%
  const getSimilarityColor = (similarity: number) => {
    if (similarity > 85) return 'text-green-600 font-bold'
    if (similarity > 70) return 'text-green-500'
    if (similarity > 55) return 'text-yellow-600'
    if (similarity > 40) return 'text-orange-500'
    if (similarity > 25) return 'text-red-500'
    if (similarity > 5) return 'text-red-400'
    return 'text-gray-400'
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)

  const exampleQuestions = [
    "Quels TFC parlent de l'intelligence artificielle ?",
    "Trouvez-moi des travaux sur la blockchain",
    "Propose un sujet en cybersécurité",
    "Recherche des TFC avec React et Node.js"
  ]

  if (isCheckingAuth && !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center ">
            <div className="loader-small"></div>
      
      <style jsx>{`
      .loader-small {
  width: 24px;
  height: 24px;
  margin: 0 auto 16px;
  display: grid;
  border-radius: 50%;
  background:
    linear-gradient(0deg, rgb(75 85 99 / 50%) 30%, #0000 0 70%, rgb(75 85 99 / 100%) 0) 50% / 8% 100%,
    linear-gradient(90deg, rgb(75 85 99 / 25%) 30%, #0000 0 70%, rgb(75 85 99 / 75%) 0) 50% / 100% 8%;
  background-repeat: no-repeat;
  animation: l23 1s infinite steps(12);
}

.loader-small::before,
.loader-small::after {
  content: "";
  grid-area: 1/1;
  border-radius: 50%;
  background: inherit;
  opacity: 0.915;
  transform: rotate(30deg);
}

.loader-small::after {
  opacity: 0.83;
  transform: rotate(60deg);
}

@keyframes l23 {
  100% {
    transform: rotate(1turn);
  }
}
     
      `}</style>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (user === null && authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen z-10 bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300">
      {/* Dynamic Island Left - Menu */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="fixed left-4 lg:left-[100px] top-4 z-50"
      >
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setMobileView('conversations')
            } else {
              setShowConversations(!showConversations)
            }
          }}
          className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </motion.div>

      {/* Dynamic Island Right - Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed right-4 lg:right-[100px] top-4 z-50 flex gap-2"
      >
        {filteredReferences.length > 0 && (
          <button
            onClick={() => setShowReferences(!showReferences)}
            className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 relative"
          >
            <BookOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {filteredReferences.length}
            </span>
          </button>
        )}
        
        <button
          onClick={startNewConversation}
          className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
        >
          <PlusCircleIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </motion.div>

      {/* Overlay pour mobile et desktop */}
      <AnimatePresence>
        {(showConversations || mobileView === 'conversations') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setShowConversations(false)
              setMobileView('chat')
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar des conversations - Desktop avec animation */}
      <AnimatePresence>
        {showConversations && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="hidden lg:block fixed overflow-auto left-0 top-0 h-full w-[30%] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col shadow-xl transition-colors duration-300"
          >
            {/* En-tête de la sidebar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white">Historique des conversations</h3>
              <button
                onClick={() => setShowConversations(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Section des actions */}
            <div className="p-3 flex  gap-3 items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={startNewConversation}
                className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Nouvelle</span>
              </button>
            
              <ThemeSwitch/>
            </div>

            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Chargement...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Aucune conversation sauvegardée
                  </p>
                  <button
                    onClick={startNewConversation}
                    className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Commencer une nouvelle conversation
                  </button>
                </div>
              ) : (
                <div className="p-2">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 mb-2 ${
                        conversationId === conv.id 
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                          : 'border border-transparent'
                      }`}
                      onClick={() => loadConversation(conv.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 flex-1">
                          {conv.title || "Conversation sans titre"}
                        </div>
                        {isLoadingConversation === conv.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{conv.chat_messages?.length || 0} messages</span>
                        </span>
                        <span>
                          {new Date(conv.updated_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied de page avec informations utilisateur */}
            <div className="p-3 flex items-center border-t fixed bottom-0 w-max rounded-tr-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {user && (
                <div className="flex items-center space-x-3">
                  {user.profil_url ? (
                    <img 
                      src={user.profil_url} 
                      alt="Photo de profil"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              )}
                <Link 
                href="/" 
                className="flex-1 ml-4 bg-gray-900 dark:bg-gray-700 text-white py-1   px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
              >
<ArrowLongLeftIcon className="h-4 w-4"/>
               <p>Exit</p>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone principale du chat */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Vue mobile des conversations */}
        <AnimatePresence>
          {mobileView === 'conversations' && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 inset-0 z-50 flex flex-col"
            >
              <div 
                ref={mobileMenuRef}
                className="w-[75%] h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl transition-colors duration-300"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Historique</h3>
                  <button
                    onClick={() => setMobileView('chat')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <PanelLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Section utilisateur dans le menu mobile */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  {user && (
                    <div className="flex items-center space-x-3">
                      {user.profil_url ? (
                        <img 
                          src={user.profil_url} 
                          alt="Photo de profil"
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 gap-3 flex items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={startNewConversation}
                    className="flex-1 text-sm bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    <span>New</span>
                  </button>
                  <Link href="/" className="flex-1 text-sm bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium">
                    <ArrowLongLeftIcon className="h-4 w-4"/>
                    <span>exit</span>
                  </Link>
                  <ThemeSwitch/>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                  {isLoadingConversations ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Aucune conversation sauvegardée
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <div
                        key={conv.id}
                        className={`px-3 py-2 mx-2 border border-gray-100 dark:border-gray-700 cursor-pointer rounded-xl my-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          conversationId === conv.id ? 'bg-blue-100/70 dark:border-2 dark:bg-gray-700 rounded-xl border-blue-200 dark:border-blue-800' : ''
                        }`}
                        onClick={() => loadConversation(conv.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {conv.title}
                          </div>
                          {isLoadingConversation === conv.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                          <span>{conv.chat_messages?.length || 0} messages</span>
                          <span>
                            {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vue du chat (mobile et desktop) */}
        {mobileView === 'chat' && (
          <>
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded flex-shrink-0 shadow-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Zone de messages avec défilement amélioré */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 hide-scrollbar overflow-auto md:overflow-y-auto py-4 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent transition-colors duration-300"
              style={{ 
                scrollBehavior: 'smooth'
              }}
            >
              <div className="w-full flex justify-center">
                <div className="md:w-[67%] pb-14 pt-11 mx-auto w-[86%] space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                      <LottieAnimation/>
                      <p className="text-xl font-medium text-gray-900 dark:text-white mb-3">Bonjour {user?.name} ! 👋</p>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Je suis votre assistant pour la recherche de Travaux de Fin de Cycle. Posez-moi vos questions !</p>
                      
                      <div className="space-y-3 max-w-md mx-auto">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Exemples de questions :</p>
                        {exampleQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInput(question)
                              textareaRef.current?.focus()
                            }}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 transition-all duration-200 text-left shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'user' ? (
                          // Message utilisateur avec bulle
                          <div className="max-w-[80%] bg-gradient-to-br from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600 dark:text-gray-100 text-white rounded-s-2xl rounded-tr-2xl rounde p-4 relative group shadow-sm">
                            <div className="whitespace-pre-wrap leading-relaxed text-sm text-gray-900 dark:text-white">
                              {formatMessageContent(message.content)}
                            </div>
                            <div className="flex items-center justify-end mt-2 pt-2 border-white/20 border-t">
                              <span className="text-xs text-gray-800 dark:text-gray-200 opacity-70">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Message assistant sans bulle - texte simple
                          <div className="max-w-[100%] text-gray-900 dark:text-white relative group">
                            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                              {message.content === '▊' ? (
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                  </div>
                                  <span className="text-sm">Assistant écrit...</span>
                                </div>
                              ) : (
                                formatMessageContent(message.content)
                              )}
                            </div>
                            
                            {message.content !== '▊' && (
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleFeedback(message.id, 'positive')}
                                    className={`p-1 rounded transition-colors ${
                                      message.feedback === 'positive' 
                                        ? 'text-green-500' 
                                        : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                                    }`}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(message.id, 'negative')}
                                    className={`p-1 rounded transition-colors ${
                                      message.feedback === 'negative' 
                                        ? 'text-red-500' 
                                        : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                                    }`}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(message.content)}
                                    className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="Copier le message"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Assistant réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Références TFC avec slide-up animation */}
            <AnimatePresence>
              {showReferences && filteredReferences.length > 0 && (
                <>
                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                    onClick={() => setShowReferences(false)}
                  />
                  
                  {/* Panel des références */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 max-h-[70vh] flex flex-col shadow-2xl rounded-t-2xl overflow-hidden transition-colors duration-300"
                  >
                    {/* Header du panel */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          TFC trouvés ({filteredReferences.length})
                        </span>
                      </div>
                      <button
                        onClick={() => setShowReferences(false)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Filtre de pertinence */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Filter className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filtre de pertinence</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                        {similarityThresholds.map(threshold => (
                          <button
                            key={threshold}
                            onClick={() => setSimilarityThreshold(threshold)}
                            className={`px-2 py-1 text-xs rounded-full border transition-all duration-200 flex-shrink-0 ${
                              similarityThreshold === threshold
                                ? 'bg-gray-900 dark:bg-gray-700 text-white border-gray-900 dark:border-gray-700 shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                            }`}
                          >
                            ≥ {threshold}%
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Liste des références */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {filteredReferences.map((tfc) => (
                        <div key={tfc.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={() => toggleReferenceExpansion(tfc.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {tfc.titre}
                                </div>
                       
                                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>{tfc.auteur}</span>
                                  <span>•</span>
                                  <span className={`font-medium ${getSimilarityColor(tfc.similarity)}`}>
                                    {Math.round(tfc.similarity)}% de pertinence
                                  </span>
                                </div>

                                {/* Afficher les technologies si disponibles */}
                                {tfc.technologies && tfc.technologies.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {tfc.technologies.slice(0, 3).map((tech, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                    {tfc.technologies.length > 3 && (
                                      <span className="text-xs text-gray-500">+{tfc.technologies.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {expandedReference === tfc.id ? (
                                <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                              )}
                            </div>
                            
                            {expandedReference === tfc.id && (
                              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
                                <div>
                                  <strong>Promoteur :</strong> {tfc.promoteur}
                                </div>
                                <div>
                                  <strong>Faculté :</strong> {tfc.faculte}
                                </div>
                                <div>
                                  <strong>Année :</strong> {tfc.annee}
                                </div>
                                <div>
                                  <strong>Résumé :</strong> {tfc.resume}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Zone de saisie */}
            <div className="w-full fixed bottom-0 left-0 rounded--xl border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 backdrop-blur-md p-4 flex-shrink-0 shadow-lg transition-colors duration-300">
              <div className="flex justify-center">
                <div className="w-full lg:w-[70%] flex space-x-3">
                  <div className="flex w-full relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Posez votre question sur les TFC..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl p-4 pr-12 resize-none transition-all duration-200 text-sm shadow-sm focus:shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows={1}
                      disabled={isLoading}
                      style={{ 
                        minHeight: '60px',
                        maxHeight: '150px'
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                      title="Envoyer le message"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}