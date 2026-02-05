
// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import Link from 'next/link';
// import { Edit, Trash2, Search } from 'lucide-react';

// interface User {
//   id: number;
//   matricule: string;
//   username: string;
//   role: 'admin' | 'student';
//   genre: 'M' | 'F';
//   created_at: string;
// }

// export default function UsersPage() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [message, setMessage] = useState('');
  
//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [newPassword, setNewPassword] = useState('');
//   const [modalLoading, setModalLoading] = useState(false);
//   const [modalError, setModalError] = useState('');

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('users')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setUsers(data || []);
//     } catch (error) {
//       console.error('Erreur:', error);
//       setMessage('Erreur chargement');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const deleteUser = async (id: number) => {
//     if (!confirm('Supprimer cet utilisateur ?')) return;

//     try {
//       const { error } = await supabase
//         .from('users')
//         .delete()
//         .eq('id', id);

//       if (error) throw error;

//       setUsers(users.filter(u => u.id !== id));
//       setMessage('Utilisateur supprimé');
//       setTimeout(() => setMessage(''), 3000);
//     } catch (error) {
//       console.error('Erreur:', error);
//       setMessage('Erreur suppression');
//     }
//   };

//   const openModal = (user: User) => {
//     setSelectedUser(user);
//     setNewPassword('');
//     setModalError('');
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedUser(null);
//     setNewPassword('');
//     setModalError('');
//   };

//   const updatePassword = async () => {
//     if (!selectedUser || !newPassword.trim()) {
//       setModalError('Mot de passe requis');
//       return;
//     }

//     if (newPassword.length < 4) {
//       setModalError('Minimum 4 caractères');
//       return;
//     }

//     setModalLoading(true);
//     setModalError('');

//     try {
//       const { error } = await supabase
//         .from('users')
//         .update({ 
//           password: newPassword,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', selectedUser.id);

//       if (error) throw error;

//       setMessage(`Mot de passe mis à jour pour ${selectedUser.username}`);
//       closeModal();
//       setTimeout(() => setMessage(''), 3000);
//     } catch (error) {
//       console.error('Erreur:', error);
//       setModalError('Erreur mise à jour');
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const filteredUsers = users.filter(user =>
//     user.matricule.toLowerCase().includes(search.toLowerCase()) ||
//     user.username.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     total: users.length,
//     admins: users.filter(u => u.role === 'admin').length,
//     students: users.filter(u => u.role === 'student').length
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-xl font-medium">Utilisateurs</h1>
//             </div>
//             <Link
//               href="/admin/users/create"
//               className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
//             >
//               Nouvel utilisateur
//             </Link>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-4 mb-8">
//           <div className="border rounded p-4">
//             <div className="text-sm text-gray-600">Total</div>
//             <div className="text-2xl font-bold">{stats.total}</div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-sm text-gray-600">Admins</div>
//             <div className="text-2xl font-bold">{stats.admins}</div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-sm text-gray-600">Étudiants</div>
//             <div className="text-2xl font-bold">{stats.students}</div>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="mb-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Rechercher..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 border rounded px-3 py-2 focus:outline-none focus:border-black"
//             />
//           </div>
//         </div>

//         {/* Message */}
//         {message && (
//           <div className={`p-3 rounded mb-6 text-sm ${
//             message.includes('mis à jour') || message.includes('supprimé') 
//               ? 'bg-green-50 text-green-700'
//               : 'bg-red-50 text-red-700'
//           }`}>
//             {message}
//           </div>
//         )}

//         {/* Table */}
//         <div className="border rounded overflow-hidden">
//           {loading ? (
//             <div className="p-8 text-center">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="p-8 text-center text-gray-600">
//               {search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Matricule</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rôle</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Genre</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {filteredUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 text-sm">
//                         {user.matricule}
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {user.username}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2 py-1 text-xs rounded ${
//                           user.role === 'admin'
//                             ? 'bg-gray-100 text-gray-800'
//                             : 'bg-gray-50 text-gray-700'
//                         }`}>
//                           {user.role === 'admin' ? 'Admin' : 'Étudiant'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2 py-1 text-xs rounded ${
//                           user.genre === 'M'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-pink-100 text-pink-800'
//                         }`}>
//                           {user.genre === 'M' ? 'M' : 'F'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-600">
//                         {new Date(user.created_at).toLocaleDateString('fr-FR')}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => openModal(user)}
//                             className="text-gray-600 hover:text-blue-600 p-1"
//                             title="Modifier mot de passe"
//                           >
//                             <Edit size={18} />
//                           </button>
//                           <button
//                             onClick={() => deleteUser(user.id)}
//                             className="text-gray-600 hover:text-red-600 p-1"
//                             title="Supprimer"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && selectedUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded max-w-md w-full">
//             <div className="p-6">
//               <h2 className="text-lg font-medium mb-4">
//                 Modifier mot de passe
//               </h2>
              
//               <div className="mb-4 p-3 bg-gray-50 rounded">
//                 <div className="font-medium">{selectedUser.username}</div>
//                 <div className="text-sm text-gray-600">{selectedUser.matricule}</div>
//               </div>

//               <div className="mb-6">
//                 <div className="text-sm text-gray-600 mb-1">Nouveau mot de passe</div>
//                 <input
//                   type="password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full border rounded px-3 py-2 focus:outline-none focus:border-black"
//                   placeholder="••••••••"
//                 />
//                 {modalError && (
//                   <div className="text-red-500 text-sm mt-1">{modalError}</div>
//                 )}
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   onClick={updatePassword}
//                   disabled={modalLoading}
//                   className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
//                 >
//                   {modalLoading ? 'Mise à jour...' : 'Mettre à jour'}
//                 </button>
//                 <button
//                   onClick={closeModal}
//                   className="flex-1 py-2 border rounded hover:bg-gray-50"
//                 >
//                   Annuler
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Edit, Trash2, Search } from 'lucide-react';

interface User {
  id: number;
  matricule: string;
  username: string;
  role: 'admin' | 'student';
  genre: 'M' | 'F';
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== id));
      setMessage('Utilisateur supprimé');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur suppression');
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setModalError('');
  };

  const updatePassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      setModalError('Mot de passe requis');
      return;
    }

    if (newPassword.length < 4) {
      setModalError('Minimum 4 caractères');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setMessage(`Mot de passe mis à jour pour ${selectedUser.username}`);
      closeModal();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setModalError('Erreur mise à jour');
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrer et trier les utilisateurs
  const filteredUsers = users
    .filter(user =>
      user.matricule.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.username.localeCompare(b.username));

  // Calculer les statistiques
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    students: users.filter(u => u.role === 'student').length,
    male: users.filter(u => u.genre === 'M').length,
    female: users.filter(u => u.genre === 'F').length
  };

  // Calculer les pourcentages
  const malePercentage = stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0;
  const femalePercentage = stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-medium">Utilisateurs</h1>
            </div>
            <Link
              href="/admin/users/create"
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
            >
              Nouvel utilisateur
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 grid-cols-2 gap-4 mb-8">
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Admins</div>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Étudiants</div>
            <div className="text-2xl font-bold">{stats.students}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Garçons (M)</div>
            <div className="text-2xl font-bold text-blue-600">{stats.male}</div>
            <div className="text-xs text-gray-500 mt-1">
              {malePercentage}% du total
            </div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Filles (F)</div>
            <div className="text-2xl font-bold text-pink-600">{stats.female}</div>
            <div className="text-xs text-gray-500 mt-1">
              {femalePercentage}% du total
            </div>
          </div>
        </div>

        {/* Ratio de genre en pourcentage */}
        {stats.total > 0 && (
          <div className="mb-8 p-4 border rounded bg-gray-50">
            <div className="text-sm text-gray-600 mb-3">Répartition par genre</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-medium">Masculin (M)</span>
                  <span className="text-gray-700">{malePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${malePercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {stats.male} utilisateur{stats.male > 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600 font-medium">Féminin (F)</span>
                  <span className="text-gray-700">{femalePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: `${femalePercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {stats.female} utilisateur{stats.female > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par matricule ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 border rounded px-3 py-2 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded mb-6 text-sm ${
            message.includes('mis à jour') || message.includes('supprimé') 
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Table */}
        <div className="border rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Nom
                        <span className="text-xs text-gray-400">(A-Z)</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Matricule</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rôle</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Genre</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.matricule}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          user.role === 'admin'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Étudiant'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          user.genre === 'M'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {user.genre}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(user)}
                            className="text-gray-600 hover:text-blue-600 p-1"
                            title="Modifier mot de passe"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-gray-600 hover:text-red-600 p-1"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">
                Modifier mot de passe
              </h2>
              
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-sm text-gray-600">{selectedUser.matricule}</div>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    selectedUser.role === 'admin'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    {selectedUser.role === 'admin' ? 'Admin' : 'Étudiant'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                    selectedUser.genre === 'M'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {selectedUser.genre === 'M' ? 'M' : 'F'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Nouveau mot de passe</div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-black"
                  placeholder="••••••••"
                />
                {modalError && (
                  <div className="text-red-500 text-sm mt-1">{modalError}</div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={updatePassword}
                  disabled={modalLoading}
                  className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {modalLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}