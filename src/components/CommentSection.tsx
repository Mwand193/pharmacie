
// 'use client'
// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Comment, CommentFormData } from '@/types/comment'
// import { useRouter } from 'next/navigation'
// import { 
//   FaHeart, 
//   FaRegHeart, 
//   FaReply, 
//   FaEdit, 
//   FaTrash, 
//   FaUser, 
//   FaCheck, 
//   FaTimes,
//   FaCaretDown,
//   FaCaretUp,
//   FaSignInAlt,
//   FaPlus,
//   FaComment,
//   FaRegComment,
//   FaLock
// } from 'react-icons/fa'

// interface CommentSectionProps {
//   tfcId: number
//   currentUser: {
//     id: string
//     name: string
//     profil_url?: string
//     role: string
//     privileged?: boolean
//   } | null
// }

// export default function CommentSection({ tfcId, currentUser }: CommentSectionProps) {
//   const router = useRouter()
//   const [comments, setComments] = useState<Comment[]>([])
//   const [loading, setLoading] = useState(true)
//   const [replyingTo, setReplyingTo] = useState<string | null>(null)
//   const [editingComment, setEditingComment] = useState<string | null>(null)
//   const [editContent, setEditContent] = useState('')
//   const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
//   const [replies, setReplies] = useState<Record<string, Comment[]>>({})
//   const [showCommentForm, setShowCommentForm] = useState(false)
//   const [isMobile, setIsMobile] = useState(false)

//   // Détection mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
    
//     checkMobile()
//     window.addEventListener('resize', checkMobile)
    
//     return () => window.removeEventListener('resize', checkMobile)
//   }, [])

//   // Fonction pour obtenir les initiales
//   const getInitials = (name: string) =>
//     name
//       .split(' ')
//       .map(part => part.charAt(0).toUpperCase())
//       .join('')
//       .slice(0, 2)

//   // Fonction pour gérer les actions nécessitant une connexion
//   const requireAuth = (action: string, callback: () => void) => {
//     if (!currentUser) {
//       const confirmLogin = window.confirm(
//         `Veuillez vous connecter pour ${action}. Souhaitez-vous être redirigé vers la page de connexion ?`
//       )
//       if (confirmLogin) {
//         router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
//       }
//       return
//     }
    
//     // Vérifier les privilèges pour commenter
//     if (action.includes('commenter') && !currentUser.privileged) {
//       alert('Seuls les utilisateurs privilégiés peuvent ajouter des commentaires.')
//       return
//     }
    
//     callback()
//   }

//   // Vérifier si l'utilisateur peut commenter
//   const canComment = currentUser?.privileged || false

//   // Charger les commentaires
//   const loadComments = async () => {
//     try {
//       setLoading(true)
      
//       console.log('🔍 Chargement des commentaires pour TFC:', tfcId)
      
//       const { data: commentsData, error } = await supabase
//         .from('tfc_comments_with_users')
//         .select('*')
//         .eq('tfc_id', tfcId)
//         .is('parent_id', null)
//         .order('created_at', { ascending: false })

//       if (error) {
//         console.error('❌ Erreur Supabase:', error)
//         throw error
//       }

//       const enrichedComments = await Promise.all(
//         (commentsData || []).map(async (comment) => {
//           let has_liked = false
          
//           if (currentUser) {
//             try {
//               const { data: likeData } = await supabase
//                 .from('tfc_comment_likes')
//                 .select('id')
//                 .eq('comment_id', comment.id)
//                 .eq('user_id', currentUser.id)
//                 .single()

//               if (likeData) {
//                 has_liked = true
//               }
//             } catch (likeErr) {
//               console.log('ℹ️ Pas de like pour ce commentaire:', comment.id)
//             }
//           }

//           return {
//             id: comment.id,
//             content: comment.content,
//             likes_count: comment.likes_count || 0,
//             created_at: comment.created_at,
//             updated_at: comment.updated_at,
//             user_id: comment.user_id,
//             user_name: comment.user_name,
//             user_profil_url: comment.user_profil_url,
//             user_role: comment.user_role,
//             parent_id: comment.parent_id,
//             has_liked,
//             current_user_id: currentUser?.id || null,
//             replies_count: comment.replies_count || 0
//           }
//         })
//       )

//       console.log('✅ Commentaires enrichis:', enrichedComments)
//       setComments(enrichedComments)
      
//     } catch (error) {
//       console.error('❌ Erreur lors du chargement des commentaires:', error)
//       await loadCommentsFallback()
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fallback si la vue n'existe pas
//   const loadCommentsFallback = async () => {
//     try {
//       console.log('🔄 Utilisation du fallback...')
      
//       const { data: commentsData, error } = await supabase
//         .from('tfc_comments')
//         .select(`
//           *,
//           users:user_id (id, name, profil_url, role)
//         `)
//         .eq('tfc_id', tfcId)
//         .is('parent_id', null)
//         .order('created_at', { ascending: false })

//       if (error) throw error

//       const enrichedComments = await Promise.all(
//         (commentsData || []).map(async (comment) => {
//           const { count: repliesCount } = await supabase
//             .from('tfc_comments')
//             .select('id', { count: 'exact' })
//             .eq('parent_id', comment.id)

//           let has_liked = false
//           if (currentUser) {
//             const { data: likeData } = await supabase
//               .from('tfc_comment_likes')
//               .select('id')
//               .eq('comment_id', comment.id)
//               .eq('user_id', currentUser.id)
//               .single()
            
//             has_liked = !!likeData
//           }

//           return {
//             id: comment.id,
//             content: comment.content,
//             likes_count: comment.likes_count || 0,
//             created_at: comment.created_at,
//             updated_at: comment.updated_at,
//             user_id: comment.user_id,
//             user_name: comment.users.name,
//             user_profil_url: comment.users.profil_url,
//             user_role: comment.users.role,
//             parent_id: comment.parent_id,
//             has_liked,
//             current_user_id: currentUser?.id || null,
//             replies_count: repliesCount || 0
//           }
//         })
//       )

//       setComments(enrichedComments)
//     } catch (fallbackError) {
//       console.error('❌ Erreur lors du chargement de fallback:', fallbackError)
//       setComments([])
//     }
//   }

//   // Charger les réponses d'un commentaire
//   const loadReplies = async (commentId: string) => {
//     try {
//       const { data: repliesData, error } = await supabase
//         .from('tfc_comments')
//         .select(`
//           *,
//           users:user_id (id, name, profil_url, role)
//         `)
//         .eq('parent_id', commentId)
//         .order('created_at', { ascending: true })

//       if (error) throw error

//       const formattedReplies: Comment[] = await Promise.all(
//         (repliesData || []).map(async (reply) => {
//           let has_liked = false
//           if (currentUser) {
//             const { data: likeData } = await supabase
//               .from('tfc_comment_likes')
//               .select('id')
//               .eq('comment_id', reply.id)
//               .eq('user_id', currentUser.id)
//               .single()
            
//             has_liked = !!likeData
//           }

//           return {
//             id: reply.id,
//             content: reply.content,
//             likes_count: reply.likes_count || 0,
//             created_at: reply.created_at,
//             updated_at: reply.updated_at,
//             user_id: reply.user_id,
//             user_name: reply.users.name,
//             user_profil_url: reply.users.profil_url,
//             user_role: reply.users.role,
//             parent_id: reply.parent_id,
//             has_liked,
//             current_user_id: currentUser?.id || null,
//             replies_count: 0
//           }
//         })
//       )

//       setReplies(prev => ({
//         ...prev,
//         [commentId]: formattedReplies
//       }))
//     } catch (error) {
//       console.error('Erreur lors du chargement des réponses:', error)
//     }
//   }

//   useEffect(() => {
//     loadComments()
//   }, [tfcId, currentUser?.id])

//   // Ajouter un commentaire
//   const addComment = async (formData: CommentFormData) => {
//     requireAuth('commenter', async () => {
//       try {
//         const { data, error } = await supabase
//           .from('tfc_comments')
//           .insert({
//             tfc_id: tfcId,
//             user_id: currentUser!.id,
//             content: formData.content,
//             parent_id: formData.parent_id || null
//           })
//           .select()
//           .single()

//         if (error) throw error

//         await loadComments()
        
//         if (formData.parent_id) {
//           await loadReplies(formData.parent_id)
//         }

//         setReplyingTo(null)
//         setShowCommentForm(false)
//       } catch (error) {
//         console.error('Erreur lors de l\'ajout du commentaire:', error)
//         alert('Erreur lors de l\'ajout du commentaire')
//       }
//     })
//   }

//   // Modifier un commentaire
//   const updateComment = async (commentId: string) => {
//     try {
//       const { error } = await supabase
//         .from('tfc_comments')
//         .update({
//           content: editContent,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', commentId)

//       if (error) throw error

//       await loadComments()
//       setEditingComment(null)
//       setEditContent('')
//     } catch (error) {
//       console.error('Erreur lors de la modification du commentaire:', error)
//       alert('Erreur lors de la modification du commentaire')
//     }
//   }

//   // Supprimer un commentaire
//   const deleteComment = async (commentId: string) => {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
//       return
//     }

//     try {
//       const { error } = await supabase
//         .from('tfc_comments')
//         .delete()
//         .eq('id', commentId)

//       if (error) throw error

//       await loadComments()
//     } catch (error) {
//       console.error('Erreur lors de la suppression du commentaire:', error)
//       alert('Erreur lors de la suppression du commentaire')
//     }
//   }

//   // Like/Unlike un commentaire
//   const toggleLike = async (commentId: string) => {
//     requireAuth('aimer un commentaire', async () => {
//       try {
//         const { data: existingLike } = await supabase
//           .from('tfc_comment_likes')
//           .select('id')
//           .eq('comment_id', commentId)
//           .eq('user_id', currentUser!.id)
//           .single()

//         if (existingLike) {
//           const { error } = await supabase
//             .from('tfc_comment_likes')
//             .delete()
//             .eq('comment_id', commentId)
//             .eq('user_id', currentUser!.id)
          
//           if (error) throw error
//         } else {
//           const { error } = await supabase
//             .from('tfc_comment_likes')
//             .insert({
//               comment_id: commentId,
//               user_id: currentUser!.id
//             })
          
//           if (error) throw error
//         }

//         await loadComments()
//       } catch (error) {
//         console.error('Erreur lors du like:', error)
//       }
//     })
//   }

//   // Répondre à un commentaire
//   const handleReply = (commentId: string) => {
//     requireAuth('répondre', () => {
//       setReplyingTo(commentId)
//     })
//   }

//   // Basculer l'affichage des réponses
//   const toggleReplies = async (commentId: string) => {
//     const newShowReplies = new Set(showReplies)
    
//     if (newShowReplies.has(commentId)) {
//       newShowReplies.delete(commentId)
//     } else {
//       newShowReplies.add(commentId)
//       if (!replies[commentId]) {
//         await loadReplies(commentId)
//       }
//     }
    
//     setShowReplies(newShowReplies)
//   }

//   // Fonction pour gérer le focus sur mobile
//   const handleMobileFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
//     if (isMobile) {
//       // Délai pour laisser le clavier s'ouvrir
//       setTimeout(() => {
//         const element = e.target
//         const rect = element.getBoundingClientRect()
//         const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight
        
//         if (!isInView) {
//           element.scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'center',
//             inline: 'nearest'
//           })
//         }
//       }, 500)
//     }
//   }

//   // Composant pour le formulaire de commentaire
//   const CommentForm = ({ 
//     onSubmit, 
//     onCancel, 
//     initialContent = '', 
//     placeholder = 'Ajouter un commentaire...',
//     autoFocus = false,
//     compact = false
//   }: {
//     onSubmit: (content: string) => void
//     onCancel?: () => void
//     initialContent?: string
//     placeholder?: string
//     autoFocus?: boolean
//     compact?: boolean
//   }) => {
//     const [content, setContent] = useState(initialContent)

//     const handleSubmit = (e: React.FormEvent) => {
//       e.preventDefault()
//       if (content.trim()) {
//         onSubmit(content)
//         setContent('')
//       }
//     }

//     return (
//       <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? 'bg-gray-50 dark:bg-gray-700 p-3 rounded-lg' : ''}`}>
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder={placeholder}
//           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//           style={{ 
//             minHeight: compact ? '60px' : '80px',
//           }}
//           autoFocus={autoFocus}
//           onFocus={handleMobileFocus}
//         />
//         <div className="flex justify-end space-x-2">
//           {onCancel && (
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
//             >
//               <FaTimes className="inline mr-1" />
//               Annuler
//             </button>
//           )}
//           <button
//             type="submit"
//             disabled={!content.trim()}
//             className="px-4 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
//           >
//             <FaCheck className="inline mr-1" />
//             Publier
//           </button>
//         </div>
//       </form>
//     )
//   }

//   // Composant pour un commentaire individuel
//   const CommentItem = ({ 
//     comment, 
//     isReply = false,
//     onReply
//   }: { 
//     comment: Comment
//     isReply?: boolean
//     onReply: (commentId: string) => void
//   }) => {
//     const isOwner = currentUser && comment.user_id === currentUser.id
//     const canEdit = isOwner
//     const canDelete = isOwner || currentUser?.role === 'admin'

//     return (
//       <div className={`${isReply ? 'ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-800' : ''} transition-all duration-200`}>
//         <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-sm ${
//           isReply ? 'border-l-4 border-l-blue-300 dark:border-l-blue-600' : 'shadow-sm dark:shadow-gray-900'
//         }`}>
//           {/* En-tête du commentaire */}
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex items-center space-x-3">
//               {comment.user_profil_url ? (
//                 <img 
//                   src={comment.user_profil_url} 
//                   alt="Photo de profil"
//                   className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
//                 />
//               ) : (
//                 <div 
//                   className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm bg-blue-600 dark:bg-blue-700"
//                 >
//                   {getInitials(comment.user_name)}
//                 </div>
//               )}
              
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center space-x-2 flex-wrap">
//                   <span className="font-semibold text-gray-900 dark:text-white truncate">
//                     {comment.user_name}
//                   </span>
//                   {comment.user_role === 'admin' && (
//                     <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
//                       Admin
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-xs flex items-center space-x-2 text-gray-500 dark:text-gray-400 flex-wrap">
//                   <span>
//                     {new Date(comment.created_at).toLocaleDateString('fr-FR', {
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </span>
//                   {comment.updated_at !== comment.created_at && (
//                     <span className="italic">(modifié)</span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Actions */}
//             {(canEdit || canDelete) && (
//               <div className="flex items-center space-x-1">
//                 {canEdit && (
//                   <button
//                     onClick={() => {
//                       setEditingComment(comment.id)
//                       setEditContent(comment.content)
//                     }}
//                     className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm text-blue-600 dark:text-blue-400"
//                     title="Modifier"
//                   >
//                     <FaEdit size={14} />
//                   </button>
//                 )}
                
//                 {canDelete && (
//                   <button
//                     onClick={() => deleteComment(comment.id)}
//                     className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm text-red-600 dark:text-red-400"
//                     title="Supprimer"
//                   >
//                     <FaTrash size={14} />
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Contenu du commentaire */}
//           {editingComment === comment.id ? (
//             <CommentForm
//               onSubmit={(content) => updateComment(comment.id)}
//               onCancel={() => setEditingComment(null)}
//               initialContent={editContent}
//               placeholder="Modifier votre commentaire..."
//               autoFocus
//               compact
//             />
//           ) : (
//             <>
//               <div className="mb-4">
//                 <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
//                   {comment.content}
//                 </p>
//               </div>

//               {/* Actions du commentaire */}
//               <div className="flex items-center justify-between flex-wrap gap-2">
//                 <div className="flex items-center space-x-2 md:space-x-4">
//                   <button
//                     onClick={() => toggleLike(comment.id)}
//                     className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
//                       comment.has_liked 
//                         ? 'text-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm' 
//                         : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700'
//                     }`}
//                     title="Aimer"
//                   >
//                     {comment.has_liked ? <FaHeart /> : <FaRegHeart />}
//                     <span className="text-sm font-medium">{comment.likes_count}</span>
//                   </button>

//                   {!isReply && (
//                     <button
//                       onClick={() => onReply(comment.id)}
//                       className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
//                       title="Répondre"
//                     >
//                       <FaReply />
//                       <span className="text-sm font-medium hidden sm:inline">Répondre</span>
//                     </button>
//                   )}
//                 </div>

//                 {/* Bouton pour afficher/masquer les réponses */}
//                 {!isReply && comment.replies_count > 0 && (
//                   <button
//                     onClick={() => toggleReplies(comment.id)}
//                     className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
//                   >
//                     {showReplies.has(comment.id) ? <FaCaretUp /> : <FaCaretDown />}
//                     <span className="text-sm font-medium">
//                       {showReplies.has(comment.id) ? 'Masquer' : 'Afficher'} {comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}
//                     </span>
//                   </button>
//                 )}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Réponses */}
//         {!isReply && showReplies.has(comment.id) && replies[comment.id] && (
//           <div className="mt-4 space-y-4">
//             {replies[comment.id].map(reply => (
//               <CommentItem
//                 key={reply.id}
//                 comment={reply}
//                 isReply={true}
//                 onReply={onReply}
//               />
//             ))}
            
//             {/* Formulaire de réponse */}
//             {replyingTo === comment.id && (
//               <div className="ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-800">
//                 <CommentForm
//                   onSubmit={(content) => addComment({ content, parent_id: comment.id })}
//                   onCancel={() => setReplyingTo(null)}
//                   placeholder={`Répondre à ${comment.user_name}...`}
//                   autoFocus
//                   compact
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
//             <div className="flex items-center space-x-3 mb-3">
//               <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
//               <div className="space-y-2 flex-1">
//                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
//                 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
//               </div>
//             </div>
//             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
//             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 dark:bg-gray-900 min-h-screen">
//       {/* En-tête de la section commentaires */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
//             <FaComment className="text-blue-600 dark:text-blue-400" size={12} />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Commentaires
//             </h2>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {comments.length} commentaire{comments.length !== 1 ? 's' : ''} • Participez à la conversation
//             </p>
//           </div>
//         </div>

//         {/* Bouton pour ajouter un commentaire */}
//         {currentUser && canComment && (
//           <button
//             onClick={() => setShowCommentForm(!showCommentForm)}
//             className="flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm"
//           >
//             <FaPlus size={12} />
//             <span className="hidden sm:inline">Commenter</span>
//             <span className="sm:hidden">+</span>
//           </button>
//         )}
//       </div>

//       {/* Formulaire principal de commentaire */}
//       {(showCommentForm || comments.length === 0) && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
//           <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
//             <FaRegComment />
//             <span>
//               {comments.length === 0 ? 'Commencer la discussion' : 'Laisser un commentaire'}
//             </span>
//           </h3>
          
//           {currentUser ? (
//             canComment ? (
//               <CommentForm
//                 onSubmit={(content) => addComment({ content })}
//                 placeholder={`Partagez vos pensées sur ce mémoire, ${currentUser.name}...`}
//               />
//             ) : (
//               <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 transition-all duration-200">
//                 <FaLock size={40} className="mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
//                 <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
//                   Commentaires réservés
//                 </h4>
//                 <p className="mb-4 max-w-md mx-auto text-gray-600 dark:text-gray-400 px-4">
//                   Seuls les utilisateurs privilégiés peuvent ajouter des commentaires. 
//                   Contactez l'administration pour obtenir des droits de commentaire.
//                 </p>
//                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                   <p>Vous pouvez toujours :</p>
//                   <ul className="mt-2 space-y-1">
//                     <li>• Lire les commentaires existants</li>
//                     <li>• Aimer les commentaires</li>
//                     <li>• Voir les réponses</li>
//                   </ul>
//                 </div>
//               </div>
//             )
//           ) : (
//             <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
//               <FaSignInAlt size={40} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
//               <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
//                 Discussion en cours
//               </h4>
//               <p className="mb-6 max-w-md mx-auto text-gray-600 dark:text-gray-400 px-4">
//                 Connectez-vous pour rejoindre la conversation, partager vos insights et poser vos questions sur ce mémoire.
//               </p>
//               <button
//                 onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
//                 className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
//               >
//                 <FaSignInAlt />
//                 <span>Se connecter pour commenter</span>
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Liste des commentaires */}
//       <div className="space-y-6 pb-8">
//         {comments.length === 0 && !showCommentForm ? (
//           <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
//             <FaComment size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
//             <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
//               Aucun commentaire pour le moment
//             </h3>
//             <p className="mb-6 max-w-md mx-auto text-gray-600 dark:text-gray-400 px-4">
//               {currentUser && canComment 
//                 ? "Soyez le premier à partager vos réflexions sur ce mémoire. Votre commentaire pourrait aider d'autres lecteurs."
//                 : "Les commentaires seront visibles ici une fois que les utilisateurs privilégiés auront commencé la discussion."
//               }
//             </p>
//             {currentUser && canComment && (
//               <button
//                 onClick={() => setShowCommentForm(true)}
//                 className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
//               >
//                 <FaPlus />
//                 <span>Commencer la discussion</span>
//               </button>
//             )}
//           </div>
//         ) : (
//           comments.map(comment => (
//             <CommentItem
//               key={comment.id}
//               comment={comment}
//               onReply={handleReply}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   )
// }
'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Comment, CommentFormData } from '@/types/comment'
import { useRouter } from 'next/navigation'
import { 
  FaHeart, 
  FaRegHeart, 
  FaReply, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaCheck, 
  FaTimes,
  FaCaretDown,
  FaCaretUp,
  FaSignInAlt,
  FaPlus,
  FaComment,
  FaRegComment,
  FaLock
} from 'react-icons/fa'

interface CommentSectionProps {
  tfcId: number
  currentUser: {
    id: string
    name: string
    profil_url?: string
    role: string
    privileged?: boolean
  } | null
}

export default function CommentSection({ tfcId, currentUser }: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
  const [replies, setReplies] = useState<Record<string, Comment[]>>({})
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Références pour les textareas
  const textareaRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({})

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Focus automatique pour mobile
  useEffect(() => {
    if (isMobile && (replyingTo || editingComment || showCommentForm)) {
      // Délai pour s'assurer que le composant est rendu
      setTimeout(() => {
        const key = replyingTo || editingComment || 'main'
        const textarea = textareaRefs.current[key]
        if (textarea) {
          textarea.focus()
          // Scroll vers le textarea
          textarea.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          })
        }
      }, 100)
    }
  }, [isMobile, replyingTo, editingComment, showCommentForm])

  // Fonction pour obtenir les initiales
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)

  // Fonction pour gérer les actions nécessitant une connexion
  const requireAuth = (action: string, callback: () => void) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(
        `Veuillez vous connecter pour ${action}. Souhaitez-vous être redirigé vers la page de connexion ?`
      )
      if (confirmLogin) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
      return
    }
    
    // Vérifier les privilèges pour commenter
    if (action.includes('commenter') && !currentUser.privileged) {
      alert('Seuls les utilisateurs privilégiés peuvent ajouter des commentaires.')
      return
    }
    
    callback()
  }

  // Vérifier si l'utilisateur peut commenter
  const canComment = currentUser?.privileged || false

  // Charger les commentaires
  const loadComments = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Chargement des commentaires pour TFC:', tfcId)
      
      const { data: commentsData, error } = await supabase
        .from('tfc_comments_with_users')
        .select('*')
        .eq('tfc_id', tfcId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        throw error
      }

      const enrichedComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          let has_liked = false
          
          if (currentUser) {
            try {
              const { data: likeData } = await supabase
                .from('tfc_comment_likes')
                .select('id')
                .eq('comment_id', comment.id)
                .eq('user_id', currentUser.id)
                .single()

              if (likeData) {
                has_liked = true
              }
            } catch (likeErr) {
              console.log('ℹ️ Pas de like pour ce commentaire:', comment.id)
            }
          }

          return {
            id: comment.id,
            content: comment.content,
            likes_count: comment.likes_count || 0,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user_id: comment.user_id,
            user_name: comment.user_name,
            user_profil_url: comment.user_profil_url,
            user_role: comment.user_role,
            parent_id: comment.parent_id,
            has_liked,
            current_user_id: currentUser?.id || null,
            replies_count: comment.replies_count || 0
          }
        })
      )

      console.log('✅ Commentaires enrichis:', enrichedComments)
      setComments(enrichedComments)
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commentaires:', error)
      await loadCommentsFallback()
    } finally {
      setLoading(false)
    }
  }

  // Fallback si la vue n'existe pas
  const loadCommentsFallback = async () => {
    try {
      console.log('🔄 Utilisation du fallback...')
      
      const { data: commentsData, error } = await supabase
        .from('tfc_comments')
        .select(`
          *,
          users:user_id (id, name, profil_url, role)
        `)
        .eq('tfc_id', tfcId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { count: repliesCount } = await supabase
            .from('tfc_comments')
            .select('id', { count: 'exact' })
            .eq('parent_id', comment.id)

          let has_liked = false
          if (currentUser) {
            const { data: likeData } = await supabase
              .from('tfc_comment_likes')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', currentUser.id)
              .single()
            
            has_liked = !!likeData
          }

          return {
            id: comment.id,
            content: comment.content,
            likes_count: comment.likes_count || 0,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user_id: comment.user_id,
            user_name: comment.users.name,
            user_profil_url: comment.users.profil_url,
            user_role: comment.users.role,
            parent_id: comment.parent_id,
            has_liked,
            current_user_id: currentUser?.id || null,
            replies_count: repliesCount || 0
          }
        })
      )

      setComments(enrichedComments)
    } catch (fallbackError) {
      console.error('❌ Erreur lors du chargement de fallback:', fallbackError)
      setComments([])
    }
  }

  // Charger les réponses d'un commentaire
  const loadReplies = async (commentId: string) => {
    try {
      const { data: repliesData, error } = await supabase
        .from('tfc_comments')
        .select(`
          *,
          users:user_id (id, name, profil_url, role)
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedReplies: Comment[] = await Promise.all(
        (repliesData || []).map(async (reply) => {
          let has_liked = false
          if (currentUser) {
            const { data: likeData } = await supabase
              .from('tfc_comment_likes')
              .select('id')
              .eq('comment_id', reply.id)
              .eq('user_id', currentUser.id)
              .single()
            
            has_liked = !!likeData
          }

          return {
            id: reply.id,
            content: reply.content,
            likes_count: reply.likes_count || 0,
            created_at: reply.created_at,
            updated_at: reply.updated_at,
            user_id: reply.user_id,
            user_name: reply.users.name,
            user_profil_url: reply.users.profil_url,
            user_role: reply.users.role,
            parent_id: reply.parent_id,
            has_liked,
            current_user_id: currentUser?.id || null,
            replies_count: 0
          }
        })
      )

      setReplies(prev => ({
        ...prev,
        [commentId]: formattedReplies
      }))
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error)
    }
  }

  useEffect(() => {
    loadComments()
  }, [tfcId, currentUser?.id])

  // Ajouter un commentaire
  const addComment = async (formData: CommentFormData) => {
    requireAuth('commenter', async () => {
      try {
        const { data, error } = await supabase
          .from('tfc_comments')
          .insert({
            tfc_id: tfcId,
            user_id: currentUser!.id,
            content: formData.content,
            parent_id: formData.parent_id || null
          })
          .select()
          .single()

        if (error) throw error

        await loadComments()
        
        if (formData.parent_id) {
          await loadReplies(formData.parent_id)
        }

        setReplyingTo(null)
        setShowCommentForm(false)
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error)
        alert('Erreur lors de l\'ajout du commentaire')
      }
    })
  }

  // Modifier un commentaire
  const updateComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('tfc_comments')
        .update({
          content: editContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (error) throw error

      await loadComments()
      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Erreur lors de la modification du commentaire:', error)
      alert('Erreur lors de la modification du commentaire')
    }
  }

  // Supprimer un commentaire
  const deleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tfc_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await loadComments()
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error)
      alert('Erreur lors de la suppression du commentaire')
    }
  }

  // Like/Unlike un commentaire
  const toggleLike = async (commentId: string) => {
    requireAuth('aimer un commentaire', async () => {
      try {
        const { data: existingLike } = await supabase
          .from('tfc_comment_likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', currentUser!.id)
          .single()

        if (existingLike) {
          const { error } = await supabase
            .from('tfc_comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', currentUser!.id)
          
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('tfc_comment_likes')
            .insert({
              comment_id: commentId,
              user_id: currentUser!.id
            })
          
          if (error) throw error
        }

        await loadComments()
      } catch (error) {
        console.error('Erreur lors du like:', error)
      }
    })
  }

  // Répondre à un commentaire
  const handleReply = (commentId: string) => {
    requireAuth('répondre', () => {
      setReplyingTo(commentId)
    })
  }

  // Basculer l'affichage des réponses
  const toggleReplies = async (commentId: string) => {
    const newShowReplies = new Set(showReplies)
    
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId)
    } else {
      newShowReplies.add(commentId)
      if (!replies[commentId]) {
        await loadReplies(commentId)
      }
    }
    
    setShowReplies(newShowReplies)
  }

  // Composant pour le formulaire de commentaire
  const CommentForm = ({ 
    onSubmit, 
    onCancel, 
    initialContent = '', 
    placeholder = 'Ajouter un commentaire...',
    autoFocus = false,
    compact = false,
    formKey = 'main'
  }: {
    onSubmit: (content: string) => void
    onCancel?: () => void
    initialContent?: string
    placeholder?: string
    autoFocus?: boolean
    compact?: boolean
    formKey?: string
  }) => {
    const [content, setContent] = useState(initialContent)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (content.trim()) {
        onSubmit(content)
        setContent('')
      }
    }

    // Référence pour le textarea
    const textareaRef = (el: HTMLTextAreaElement | null) => {
      textareaRefs.current[formKey] = el
    }

    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? 'bg-gray-50 dark:bg-gray-700 p-3 rounded-lg' : ''}`}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          style={{ 
            minHeight: compact ? '60px' : '80px',
          }}
          // On utilise l'autoFocus seulement sur desktop
          autoFocus={autoFocus && !isMobile}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
            >
              <FaTimes className="inline mr-1" />
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <FaCheck className="inline mr-1" />
            Publier
          </button>
        </div>
      </form>
    )
  }

  // Composant pour un commentaire individuel
  const CommentItem = ({ 
    comment, 
    isReply = false,
    onReply
  }: { 
    comment: Comment
    isReply?: boolean
    onReply: (commentId: string) => void
  }) => {
    const isOwner = currentUser && comment.user_id === currentUser.id
    const canEdit = isOwner
    const canDelete = isOwner || currentUser?.role === 'admin'

    return (
      <div className={`${isReply ? 'ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-800' : ''} transition-all duration-200`}>
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-sm ${
          isReply ? 'border-l-4 border-l-blue-300 dark:border-l-blue-600' : 'shadow-sm dark:shadow-gray-900'
        }`}>
          {/* En-tête du commentaire */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {comment.user_profil_url ? (
                <img 
                  src={comment.user_profil_url} 
                  alt="Photo de profil"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                />
              ) : (
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm bg-blue-600 dark:bg-blue-700"
                >
                  {getInitials(comment.user_name)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {comment.user_name}
                  </span>
                  {comment.user_role === 'admin' && (
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-xs flex items-center space-x-2 text-gray-500 dark:text-gray-400 flex-wrap">
                  <span>
                    {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="italic">(modifié)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {(canEdit || canDelete) && (
              <div className="flex items-center space-x-1">
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditingComment(comment.id)
                      setEditContent(comment.content)
                    }}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm text-blue-600 dark:text-blue-400"
                    title="Modifier"
                  >
                    <FaEdit size={14} />
                  </button>
                )}
                
                {canDelete && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm text-red-600 dark:text-red-400"
                    title="Supprimer"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contenu du commentaire */}
          {editingComment === comment.id ? (
            <CommentForm
              onSubmit={(content) => updateComment(comment.id)}
              onCancel={() => setEditingComment(null)}
              initialContent={editContent}
              placeholder="Modifier votre commentaire..."
              autoFocus
              compact
              formKey={comment.id}
            />
          ) : (
            <>
              <div className="mb-4">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                  {comment.content}
                </p>
              </div>

              {/* Actions du commentaire */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 md:space-x-4">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      comment.has_liked 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Aimer"
                  >
                    {comment.has_liked ? <FaHeart /> : <FaRegHeart />}
                    <span className="text-sm font-medium">{comment.likes_count}</span>
                  </button>

                  {!isReply && (
                    <button
                      onClick={() => onReply(comment.id)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Répondre"
                    >
                      <FaReply />
                      <span className="text-sm font-medium hidden sm:inline">Répondre</span>
                    </button>
                  )}
                </div>

                {/* Bouton pour afficher/masquer les réponses */}
                {!isReply && comment.replies_count > 0 && (
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                  >
                    {showReplies.has(comment.id) ? <FaCaretUp /> : <FaCaretDown />}
                    <span className="text-sm font-medium">
                      {showReplies.has(comment.id) ? 'Masquer' : 'Afficher'} {comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Réponses */}
        {!isReply && showReplies.has(comment.id) && replies[comment.id] && (
          <div className="mt-4 space-y-4">
            {replies[comment.id].map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                onReply={onReply}
              />
            ))}
            
            {/* Formulaire de réponse */}
            {replyingTo === comment.id && (
              <div className="ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                <CommentForm
                  onSubmit={(content) => addComment({ content, parent_id: comment.id })}
                  onCancel={() => setReplyingTo(null)}
                  placeholder={`Répondre à ${comment.user_name}...`}
                  autoFocus
                  compact
                  formKey={`reply-${comment.id}`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      {/* En-tête de la section commentaires */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <FaComment className="text-blue-600 dark:text-blue-400" size={12} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Commentaires
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {comments.length} commentaire{comments.length !== 1 ? 's' : ''} • Participez à la conversation
            </p>
          </div>
        </div>

        {/* Bouton pour ajouter un commentaire */}
        {currentUser && canComment && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm"
          >
            <FaPlus size={12} />
            <span className="hidden sm:inline">Commenter</span>
            <span className="sm:hidden">+</span>
          </button>
        )}
      </div>

      {/* Formulaire principal de commentaire */}
      {(showCommentForm || comments.length === 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
            <FaRegComment />
            <span>
              {comments.length === 0 ? 'Commencer la discussion' : 'Laisser un commentaire'}
            </span>
          </h3>
          
          {currentUser ? (
            canComment ? (
              <CommentForm
                onSubmit={(content) => addComment({ content })}
                placeholder={`Partagez vos pensées sur ce mémoire, ${currentUser.name}...`}
                autoFocus={comments.length === 0}
                formKey="main"
              />
            ) : (
              <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 transition-all duration-200">
                <FaLock size={40} className="mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
                <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Commentaires réservés
                </h4>
                <p className="mb-4 max-w-md mx-auto text-gray-600 dark:text-gray-400 px-4">
                  Seuls les utilisateurs privilégiés peuvent ajouter des commentaires. 
                  Contactez l'administration pour obtenir des droits de commentaire.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Vous pouvez toujours :</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Lire les commentaires existants</li>
                    <li>• Aimer les commentaires</li>
                    <li>• Voir les réponses</li>
                  </ul>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
              <FaSignInAlt size={40} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Discussion en cours
              </h4>
              <p className="mb-6 max-w-md mx-auto text-gray-600 dark:text-gray-400 px-4">
                Connectez-vous pour rejoindre la conversation, partager vos insights et poser vos questions sur ce mémoire.
              </p>
              <button
                onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
              >
                <FaSignInAlt />
                <span>Se connecter pour commenter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-6 pb-8">
        {comments.length === 0 && !showCommentForm ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
            <FaComment size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Aucun commentaire pour le moment
            </h3>
            <p className="mb-6 max-w-md mx-auto text-gray-600 dark:text-gray-400 px-4">
              {currentUser && canComment 
                ? "Soyez le premier à partager vos réflexions sur ce mémoire. Votre commentaire pourrait aider d'autres lecteurs."
                : "Les commentaires seront visibles ici une fois que les utilisateurs privilégiés auront commencé la discussion."
              }
            </p>
            {currentUser && canComment && (
              <button
                onClick={() => setShowCommentForm(true)}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
              >
                <FaPlus />
                <span>Commencer la discussion</span>
              </button>
            )}
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  )
}