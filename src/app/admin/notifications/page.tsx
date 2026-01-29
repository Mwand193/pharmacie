// // app/admin/notifications/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { Send, Users, Search, User, Building, Info } from 'lucide-react'

// interface User {
//   id: string
//   username: string
//   name: string
//   email: string
//   role: string
//   departement?: string
// }

// interface NotificationForm {
//   title: string
//   message: string
//   type: 'info' | 'warning' | 'success' | 'error' | 'system'
//   priority: 'low' | 'normal' | 'high' | 'urgent'
//   targetType: 'all' | 'role' | 'department' | 'user'
//   targetRole?: string
//   targetDepartment?: string
//   targetUserId?: string
//   expiresIn: number // en heures
//   actionUrl?: string
//   actionLabel?: string
// }

// export default function AdminNotificationsPage() {
//   const [users, setUsers] = useState<User[]>([])
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [sending, setSending] = useState(false)
//   const [message, setMessage] = useState('')

//   const [form, setForm] = useState<NotificationForm>({
//     title: '',
//     message: '',
//     type: 'info',
//     priority: 'normal',
//     targetType: 'all',
//     expiresIn: 24,
//     actionUrl: '',
//     actionLabel: ''
//   })

//   useEffect(() => {
//     fetchUsers()
//   }, [])

//   useEffect(() => {
//     if (searchTerm) {
//       const filtered = users.filter(u =>
//         u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         u.username.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       setFilteredUsers(filtered)
//     } else {
//       setFilteredUsers(users.slice(0, 10))
//     }
//   }, [searchTerm, users])

//   const fetchUsers = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch('/api/admin/users')
//       if (response.ok) {
//         const data = await response.json()
//         setUsers(data.users)
//         setFilteredUsers(data.users.slice(0, 10))
//       }
//     } catch (error) {
//       console.error('Erreur chargement utilisateurs:', error)
//       setMessage('Erreur lors du chargement des utilisateurs')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!form.title || !form.message) {
//       setMessage('Veuillez remplir le titre et le message')
//       return
//     }

//     try {
//       setSending(true)
//       setMessage('')

//       const response = await fetch('/api/admin/notifications', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form)
//       })

//       if (response.ok) {
//         setMessage('Notification envoyée avec succès!')
//         setForm({
//           title: '',
//           message: '',
//           type: 'info',
//           priority: 'normal',
//           targetType: 'all',
//           expiresIn: 24,
//           actionUrl: '',
//           actionLabel: ''
//         })
//       } else {
//         const error = await response.json()
//         setMessage(error.error || 'Erreur lors de l\'envoi')
//       }
//     } catch (error) {
//       console.error('Erreur envoi notification:', error)
//       setMessage('Erreur lors de l\'envoi de la notification')
//     } finally {
//       setSending(false)
//     }
//   }

//   const getTargetDescription = () => {
//     switch (form.targetType) {
//       case 'all':
//         return 'Tous les utilisateurs'
//       case 'role':
//         return `Rôle: ${form.targetRole}`
//       case 'department':
//         return `Département: ${form.targetDepartment}`
//       case 'user':
//         const targetUser = users.find(u => u.id === form.targetUserId)
//         return `Utilisateur: ${targetUser?.name || form.targetUserId}`
//       default:
//         return ''
//     }
//   }

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">
//           Gestion des Notifications
//         </h1>
//         <p className="text-gray-600">
//           Envoyez des messages et notifications aux utilisateurs
//         </p>
//       </div>

//       {message && (
//         <div className={`p-4 rounded-lg mb-6 ${
//           message.includes('succès') 
//             ? 'bg-green-50 text-green-800 border border-green-200'
//             : 'bg-red-50 text-red-800 border border-red-200'
//         }`}>
//           {message}
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Formulaire d'envoi */}
//         <div className="lg:col-span-2">
//           <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Titre de la notification *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Titre de la notification..."
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Message *
//                 </label>
//                 <textarea
//                   value={form.message}
//                   onChange={(e) => setForm({ ...form, message: e.target.value })}
//                   rows={4}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Message de la notification..."
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Type
//                   </label>
//                   <select
//                     value={form.type}
//                     onChange={(e) => setForm({ ...form, type: e.target.value as any })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="info">Information</option>
//                     <option value="success">Succès</option>
//                     <option value="warning">Avertissement</option>
//                     <option value="error">Erreur</option>
//                     <option value="system">Système</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Priorité
//                   </label>
//                   <select
//                     value={form.priority}
//                     onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="low">Basse</option>
//                     <option value="normal">Normale</option>
//                     <option value="high">Haute</option>
//                     <option value="urgent">Urgente</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Destinataires
//                 </label>
//                 <select
//                   value={form.targetType}
//                   onChange={(e) => setForm({ ...form, targetType: e.target.value as any })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
//                 >
//                   <option value="all">Tous les utilisateurs</option>
//                   <option value="role">Par rôle</option>
//                   <option value="department">Par département</option>
//                   <option value="user">Utilisateur spécifique</option>
//                 </select>

//                 {form.targetType === 'role' && (
//                   <select
//                     value={form.targetRole}
//                     onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Sélectionnez un rôle</option>
//                     <option value="student">Étudiant</option>
//                     <option value="teacher">Enseignant</option>
//                     <option value="admin">Administrateur</option>
//                     <option value="alumni">Alumni</option>
//                     <option value="check_in_admin">Responsable Check-in</option>
//                   </select>
//                 )}

//                 {form.targetType === 'department' && (
//                   <select
//                     value={form.targetDepartment}
//                     onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Sélectionnez un département</option>
//                     <option value="Informatique">Informatique</option>
//                     <option value="Sciences">Sciences</option>
//                     <option value="Gestion">Gestion</option>
//                     <option value="Administration">Administration</option>
//                     <option value="Accueil">Accueil</option>
//                   </select>
//                 )}

//                 {form.targetType === 'user' && (
//                   <div>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                       <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Rechercher un utilisateur..."
//                       />
//                     </div>
                    
//                     <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
//                       {filteredUsers.map(user => (
//                         <div
//                           key={user.id}
//                           className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
//                             form.targetUserId === user.id ? 'bg-blue-50 border-blue-200' : ''
//                           }`}
//                           onClick={() => setForm({ ...form, targetUserId: user.id })}
//                         >
//                           <div className="font-medium text-sm">{user.name}</div>
//                           <div className="text-xs text-gray-500">
//                             {user.email} • {user.role}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Lien d'action (optionnel)
//                   </label>
//                   <input
//                     type="url"
//                     value={form.actionUrl}
//                     onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="https://..."
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Libellé du lien
//                   </label>
//                   <input
//                     type="text"
//                     value={form.actionLabel}
//                     onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Voir plus..."
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Expire dans (heures)
//                 </label>
//                 <select
//                   value={form.expiresIn}
//                   onChange={(e) => setForm({ ...form, expiresIn: parseInt(e.target.value) })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value={1}>1 heure</option>
//                   <option value={6}>6 heures</option>
//                   <option value={24}>24 heures</option>
//                   <option value={168}>7 jours</option>
//                   <option value={720}>30 jours</option>
//                   <option value={0}>Jamais</option>
//                 </select>
//               </div>

//               <button
//                 type="submit"
//                 disabled={sending}
//                 className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 <Send className="w-4 h-4" />
//                 {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Aperçu */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Aperçu</h3>
            
//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-sm font-medium text-gray-700">Destinataires</h4>
//                 <p className="text-sm text-gray-600 mt-1">{getTargetDescription()}</p>
//               </div>

//               {form.title && (
//                 <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
//                   <div className="flex gap-3">
                    
//                     <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h5 className="font-medium text-gray-900 text-sm">
//                         {form.title}
//                       </h5>
//                       {form.message && (
//                         <p className="text-gray-600 text-sm mt-1">
//                           {form.message}
//                         </p>
//                       )}
//                       {form.actionUrl && (
//                         <a href={form.actionUrl} className="text-blue-600 text-xs mt-2 inline-block">
//                           {form.actionLabel || 'Voir plus'}
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="text-xs text-gray-500 space-y-1">
//                 <p>• Les notifications apparaîtront dans le panneau des notifications</p>
//                 <p>• Les utilisateurs recevront une alerte en temps réel</p>
//                 <p>• Les notifications expireront automatiquement</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// app/admin/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Send, 
  Users, 
  Search, 
  User, 
  Building, 
  Info, 
  Bell, 
  Trash2,
  Eye,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  MessageCircle
} from 'lucide-react'

interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  departement?: string
}

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  user_id: string
  created_by: string
  is_read: boolean
  expires_at: string | null
  action_url?: string
  action_label?: string
  created_at: string
  users?: {
    name: string
    email: string
  }
}

interface NotificationForm {
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  targetType: 'all' | 'role' | 'department' | 'user'
  targetRole?: string
  targetDepartment?: string
  targetUserId?: string
  expiresIn: number
  actionUrl?: string
  actionLabel?: string
}

type TabType = 'create' | 'manage'

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('create')
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    targetType: 'all',
    expiresIn: 24,
    actionUrl: '',
    actionLabel: ''
  })

  useEffect(() => {
    fetchUsers()
    if (activeTab === 'manage') {
      fetchNotifications()
    }
  }, [activeTab])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users.slice(0, 10))
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setFilteredUsers(data.users.slice(0, 10))
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setMessage('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/all-notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.message) {
      setMessage('Veuillez remplir le titre et le message')
      return
    }

    try {
      setSending(true)
      setMessage('')

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setMessage('Notification envoyée avec succès!')
        setForm({
          title: '',
          message: '',
          type: 'info',
          priority: 'normal',
          targetType: 'all',
          expiresIn: 24,
          actionUrl: '',
          actionLabel: ''
        })
      } else {
        const error = await response.json()
        setMessage(error.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur envoi notification:', error)
      setMessage('Erreur lors de l\'envoi de la notification')
    } finally {
      setSending(false)
    }
  }

  const deleteNotification = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id))
        setMessage('Notification supprimée avec succès')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const getTargetDescription = () => {
    switch (form.targetType) {
      case 'all':
        return 'Tous les utilisateurs'
      case 'role':
        return `Rôle: ${form.targetRole}`
      case 'department':
        return `Département: ${form.targetDepartment}`
      case 'user':
        const targetUser = users.find(u => u.id === form.targetUserId)
        return `Utilisateur: ${targetUser?.name || form.targetUserId}`
      default:
        return ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'system': return <Info className="w-4 h-4 text-blue-500" />
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'normal': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Gestion des Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Créez et gérez les notifications des utilisateurs
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700">
              <Bell className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {notifications.length} notifications
              </span>
            </div>
          </div>
        </div>

        {/* Message d'alerte */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('succès') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Créer 
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Gérer les notifications
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire d'envoi */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Send className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nouvelle notification
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remplissez les détails de la notification
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titre de la notification *
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Titre important..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type
                        </label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        >
                          <option value="info">Information</option>
                          <option value="success">Succès</option>
                          <option value="warning">Avertissement</option>
                          <option value="error">Erreur</option>
                          <option value="system">Système</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priorité
                        </label>
                        <select
                          value={form.priority}
                          onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        >
                          <option value="low">Basse</option>
                          <option value="normal">Normale</option>
                          <option value="high">Haute</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Décrivez le contenu de la notification..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destinataires
                    </label>
                    <select
                      value={form.targetType}
                      onChange={(e) => setForm({ ...form, targetType: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white mb-4"
                    >
                      <option value="all">Tous les utilisateurs</option>
                      <option value="role">Par rôle</option>
                      <option value="department">Par département</option>
                      <option value="user">Utilisateur spécifique</option>
                    </select>

                    {form.targetType === 'role' && (
                      <select
                        value={form.targetRole}
                        onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionnez un rôle</option>
                        <option value="student">Étudiant</option>
                        <option value="teacher">Enseignant</option>
                        <option value="admin">Administrateur</option>
                        <option value="alumni">Alumni</option>
                        <option value="check_in_admin">Responsable Check-in</option>
                      </select>
                    )}

                    {form.targetType === 'department' && (
                      <select
                        value={form.targetDepartment}
                        onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionnez un département</option>
                        <option value="Informatique">Informatique</option>
                        <option value="Sciences">Sciences</option>
                        <option value="Gestion">Gestion</option>
                        <option value="Administration">Administration</option>
                        <option value="Accueil">Accueil</option>
                      </select>
                    )}

                    {form.targetType === 'user' && (
                      <div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Rechercher un utilisateur..."
                          />
                        </div>
                        
                        <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                          {filteredUsers.map(user => (
                            <div
                              key={user.id}
                              className={`p-3 border-b border-gray-100 dark:border-gray-600 cursor-pointer transition-colors ${
                                form.targetUserId === user.id 
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                              onClick={() => setForm({ ...form, targetUserId: user.id })}
                            >
                              <div className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email} • {user.role}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lien d'action
                      </label>
                      <input
                        type="url"
                        value={form.actionUrl}
                        onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Libellé du lien
                      </label>
                      <input
                        type="text"
                        value={form.actionLabel}
                        onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Voir plus..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expire dans
                      </label>
                      <select
                        value={form.expiresIn}
                        onChange={(e) => setForm({ ...form, expiresIn: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value={1}>1 heure</option>
                        <option value={6}>6 heures</option>
                        <option value={24}>24 heures</option>
                        <option value={168}>7 jours</option>
                        <option value={720}>30 jours</option>
                        <option value={0}>Jamais</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
                  </button>
                </form>
              </div>
            </div>

            {/* Aperçu */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Eye className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Aperçu
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visualisez votre notification
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destinataires</h4>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{getTargetDescription()}</p>
                  </div>

                  {form.title && (
                    <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex gap-3">
                        {getTypeIcon(form.type)}
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {form.title}
                          </h5>
                          {form.message && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                              {form.message}
                            </p>
                          )}
                          {form.actionUrl && (
                            <a href={form.actionUrl} className="text-blue-600 dark:text-blue-400 text-xs font-medium mt-2 inline-block hover:underline">
                              {form.actionLabel || 'Voir plus'} →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Informations</h4>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <Bell className="w-3 h-3" />
                        Apparaîtra dans le panneau des notifications
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {form.expiresIn > 0 ? `Expire dans ${form.expiresIn}h` : 'N\'expire jamais'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        Mises à jour en temps réel
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab Gérer les notifications */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Eye className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications envoyées
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gérez et surveillez toutes les notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchNotifications}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                >
                  Actualiser
                </button>
              </div>
            </div>

            <div className="p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune notification n'a été envoyée pour le moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(notification.type)}
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Envoyé le {formatDate(notification.created_at)}</span>
                            <span>•</span>
                            <span className={notification.is_read ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                              {notification.is_read ? 'Lu' : 'Non lu'}
                            </span>
                            {notification.expires_at && (
                              <>
                                <span>•</span>
                                <span>Expire le {formatDate(notification.expires_at)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer la notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}