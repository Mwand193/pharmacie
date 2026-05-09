// app/admin/acteurs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaUsers, 
  FaUser, 
  FaUserMd, 
  FaIndustry, 
  FaTruck, 
  FaUserShield,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCheck,
  FaMars,
  FaVenus,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaKey,
  FaEthereum,
  FaShieldAlt,
  FaSync,
  FaCopy,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaCoins
} from 'react-icons/fa';
import { Edit, Trash2 } from 'lucide-react';
import { 
  assignEthereumAddress, 
  verifyAddressIntegrity, 
  assignAllMissingAddresses 
} from './actions';



type User = {
  id: number;
  matricule: string;
  username: string;
  password?: string;
  role: 'admin' | 'pharmacie' | 'fabricant' | 'distributeur';
  first_login: boolean;
  genre: 'M' | 'F' | null;
  nom_entite: string;
  ethereum_address?: string;
  ethereum_address_hash?: string;
  ganache_account_index?: number;
  created_at: string;
  updated_at: string;

};

const ROLES = {
  admin: { 
    label: 'Administrateur', 
    icon: FaUserShield, 
    color: 'bg-purple-100 text-purple-800',
    badge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  pharmacie: { 
    label: 'Pharmacie', 
    icon: FaUserMd, 
    color: 'bg-green-100 text-green-800',
    badge: 'bg-green-50 text-green-700 border-green-200'
  },
  fabricant: { 
    label: 'Fabricant', 
    icon: FaIndustry, 
    color: 'bg-blue-100 text-blue-800',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  distributeur: { 
    label: 'Distributeur', 
    icon: FaTruck, 
    color: 'bg-orange-100 text-orange-800',
    badge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
};

export default function ActeursPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreRole, setFiltreRole] = useState<string>('tous');
  const [filtreGenre, setFiltreGenre] = useState<string>('tous');
  const [filtreFirstLogin, setFiltreFirstLogin] = useState<string>('tous');
  const [filtreBlockchain, setFiltreBlockchain] = useState<string>('tous');
  // app/admin/acteurs/page.tsx

// 1. Ajoutez cet état avec les autres états
const [reassigningAll, setReassigningAll] = useState(false);

// 2. Ajoutez cette fonction avec les autres fonctions
const handleReassignAllAddresses = async () => {
  if (!confirm('⚠️ ATTENTION : Cette action va supprimer TOUTES les adresses blockchain existantes et en créer de nouvelles pour TOUS les utilisateurs. Les transactions liées aux anciennes adresses ne seront plus accessibles. Cette action est IRRÉVERSIBLE. Continuer ?')) {
    return;
  }
  
  // Double confirmation pour une action aussi sensible
  if (!confirm('❗ CONFIRMATION FINALE : Voulez-vous vraiment réassigner toutes les adresses blockchain ?')) {
    return;
  }
  
  setReassigningAll(true);
  setError(null);
  setSuccess(null);
  
  try {
    // Étape 1 : Récupérer tous les utilisateurs qui ont une adresse
    const { data: usersWithAddress, error: fetchError } = await supabase
      .from('users')
      .select('id, username, ethereum_address')
      .not('ethereum_address', 'is', null);

    if (fetchError) throw fetchError;

    if (!usersWithAddress || usersWithAddress.length === 0) {
      setSuccess('ℹ️ Aucun utilisateur avec adresse blockchain à réassigner');
      return;
    }

    // Étape 2 : Supprimer toutes les anciennes adresses
    const { error: resetError } = await supabase
      .from('users')
      .update({
        ethereum_address: null,
        ethereum_address_hash: null,
        ganache_account_index: null,
        updated_at: new Date().toISOString()
      })
      .not('ethereum_address', 'is', null);

    if (resetError) throw resetError;

    // Étape 3 : Assigner de nouvelles adresses à tous les utilisateurs
    let assignedCount = 0;
    const errors: string[] = [];
    const results: string[] = [];

    for (const user of usersWithAddress) {
      try {
        const result = await assignEthereumAddress(user.id);
        if (result.success) {
          assignedCount++;
          results.push(`${user.username}: ✅`);
        } else {
          errors.push(`${user.username}: ${result.error}`);
        }
      } catch (error: any) {
        errors.push(`${user.username}: ${error.message}`);
      }
    }

    // Étape 4 : Message de résultat
    if (errors.length === 0) {
      setSuccess(`✅ ${assignedCount}/${usersWithAddress.length} adresses réassignées avec succès !`);
    } else {
      setError(
        `⚠️ ${assignedCount}/${usersWithAddress.length} réassignées. Erreurs:\n${errors.join('\n')}`
      );
    }

    await chargerUtilisateurs();
  } catch (error: any) {
    setError(error.message || 'Erreur lors de la réassignation en masse');
  } finally {
    setReassigningAll(false);
  }
};

// 3. Dans le JSX, ajoutez ce bouton à côté du bouton "Assigner tous les comptes"
// Remplacez cette section :



  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    matricule: '',
    username: '',
    password: '',
    role: 'distributeur' as User['role'],
    genre: '' as 'M' | 'F' | '',
    nom_entite: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  // Blockchain
  const [assigningAddress, setAssigningAddress] = useState<number | null>(null);
  const [assigningAll, setAssigningAll] = useState(false);
  const [verifyingAddress, setVerifyingAddress] = useState<number | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    pharmacie: 0,
    fabricant: 0,
    distributeur: 0,
    firstLogin: 0,
    hommes: 0,
    femmes: 0,
    withBlockchain: 0,
    withoutBlockchain: 0,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      chargerUtilisateurs();
    }
  }, [user]);

  useEffect(() => {
    filtrerUtilisateurs();
  }, [users, searchTerm, filtreRole, filtreGenre, filtreFirstLogin, filtreBlockchain]);

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      calculerStats(data || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (usersData: User[]) => {
    setStats({
      total: usersData.length,
      admin: usersData.filter(u => u.role === 'admin').length,
      pharmacie: usersData.filter(u => u.role === 'pharmacie').length,
      fabricant: usersData.filter(u => u.role === 'fabricant').length,
      distributeur: usersData.filter(u => u.role === 'distributeur').length,
      firstLogin: usersData.filter(u => u.first_login).length,
      hommes: usersData.filter(u => u.genre === 'M').length,
      femmes: usersData.filter(u => u.genre === 'F').length,
      withBlockchain: usersData.filter(u => u.ethereum_address).length,
      withoutBlockchain: usersData.filter(u => !u.ethereum_address).length,
    });
  };

  const filtrerUtilisateurs = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.matricule?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        (u.nom_entite && u.nom_entite.toLowerCase().includes(term)) ||
        u.ethereum_address?.toLowerCase().includes(term)
      );
    }

    if (filtreRole !== 'tous') {
      filtered = filtered.filter(u => u.role === filtreRole);
    }

    if (filtreGenre !== 'tous') {
      filtered = filtered.filter(u => u.genre === filtreGenre);
    }

    if (filtreFirstLogin === 'oui') {
      filtered = filtered.filter(u => u.first_login);
    } else if (filtreFirstLogin === 'non') {
      filtered = filtered.filter(u => !u.first_login);
    }

    if (filtreBlockchain === 'avec') {
      filtered = filtered.filter(u => u.ethereum_address);
    } else if (filtreBlockchain === 'sans') {
      filtered = filtered.filter(u => !u.ethereum_address);
    }

    setFilteredUsers(filtered);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      matricule: '',
      username: '',
      password: '',
      role: 'distributeur',
      genre: '',
      nom_entite: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      matricule: user.matricule,
      username: user.username,
      password: '',
      role: user.role,
      genre: user.genre || '',
       nom_entite: user.nom_entite || '', 
    });
    setShowModal(true);
  };

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ✅ Ajouter nom_entite dans la validation
  if (!formData.matricule || !formData.username || !formData.role || !formData.nom_entite) {
    setError('Veuillez remplir tous les champs obligatoires (matricule, nom, entité et rôle)');
    return;
  }

  if (!editingUser && !formData.password) {
    setError('Le mot de passe est obligatoire pour un nouvel utilisateur');
    return;
  }

  setSaving(true);
  setError(null);

  try {
    if (editingUser) {
      const updateData: any = {
        matricule: formData.matricule,
        username: formData.username,
        role: formData.role,
        genre: formData.genre || null,
        nom_entite: formData.nom_entite, // ← AJOUTÉ
        updated_at: new Date().toISOString(),
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('users')
        .insert([{
          matricule: formData.matricule,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          genre: formData.genre || null,
          nom_entite: formData.nom_entite, // ← AJOUTÉ
          first_login: true,
        }]);

      if (error) throw error;
    }

    setShowModal(false);
    await chargerUtilisateurs();
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err);
    setError(err.message || 'Erreur lors de la sauvegarde');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setDeleteConfirm(null);
      await chargerUtilisateurs();
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

// Remplace la fonction handleAssignEthereum par celle-ci :

const handleAssignEthereum = async (userId: number) => {
  setAssigningAddress(userId);
  setError(null);
  setSuccess(null);
  
  try {
    const result = await assignEthereumAddress(userId);
    
    if (result.success && result.data) {
      // ✅ On vérifie que result.data existe
      const address = result.data.ethereum_address;
      setSuccess(`✅ Adresse assignée : ${address.substring(0, 10)}...`);
      await chargerUtilisateurs();
    } else if (result.success && !result.data) {
      // Succès mais pas de données (ne devrait pas arriver)
      setSuccess('✅ Adresse assignée avec succès');
      await chargerUtilisateurs();
    } else {
      setError(result.error || 'Erreur assignation');
    }
  } catch (error: any) {
    setError(error.message || 'Erreur lors de l\'assignation');
  } finally {
    setAssigningAddress(null);
  }
};

  // Fonction pour assigner des adresses à TOUS les utilisateurs
  const handleAssignAllAddresses = async () => {
    setAssigningAll(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Appel DIRECT de la Server Action
      const result = await assignAllMissingAddresses();
      
      if (result.success) {
        setSuccess(`✅ ${result.count} adresse(s) assignée(s) avec succès !`);
        await chargerUtilisateurs(); // Recharge la liste
      } else {
        setError(result.error || 'Erreur assignation en masse');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'assignation en masse');
    } finally {
      setAssigningAll(false);
    }
  };

  // Fonction pour vérifier l'intégrité d'une adresse
  const handleVerifyIntegrity = async (userId: number) => {
    setVerifyingAddress(userId);
    setError(null);
    setSuccess(null);
    
    try {
      // Appel DIRECT de la Server Action
      const result = await verifyAddressIntegrity(userId);
      
      if (result.success) {
        if (result.isValid) {
          setSuccess('✅ Adresse vérifiée : INTÈGRE');
        } else {
          setError('❌ Adresse CORROMPUE ! Le hash ne correspond pas.');
        }
      } else {
        setError(result.error || 'Erreur vérification');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la vérification');
    } finally {
      setVerifyingAddress(null);
      // Efface le message après 5 secondes
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    }
  };


  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setSuccess('✅ Adresse copiée dans le presse-papier');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Erreur lors de la copie');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FaUsers className="mr-3 h-6 w-6 text-blue-600" />
            Gestion des acteurs
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les utilisateurs du système et leurs comptes blockchain
          </p>
        </div>
      <div className="sm:flex mt-4 sm:items-center sm:justify-between mb-8">
     
<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
  <div className="flex space-x-2">
    {/* Bouton assigner toutes les adresses */}
    <button
      onClick={handleAssignAllAddresses}
      disabled={assigningAll || reassigningAll}
      className="inline-flex items-center -md bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
      title="Assigner des adresses aux utilisateurs qui n'en ont pas"
    >
      {assigningAll ? (
        <>
          <FaSync className="mr-2 h-4 w-4 animate-spin" />
          Assignation...
        </>
      ) : (
        <>
          <FaEthereum className="mr-2 h-4 w-4" />
          Assigner nouveaux comptes
        </>
      )}
    </button>
    
    {/* ✅ NOUVEAU BOUTON RÉASSIGNER TOUS */}
    <button
      onClick={handleReassignAllAddresses}
      disabled={assigningAll || reassigningAll}
      className="inline-flex items-center -md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
      title="Supprimer toutes les adresses existantes et en créer de nouvelles"
    >
      {reassigningAll ? (
        <>
          <FaSync className="mr-2 h-4 w-4 animate-spin" />
          Réassignation...
        </>
      ) : (
        <>
          <FaSync className="mr-2 h-4 w-4" />
          Réassigner tous les comptes
        </>
      )}
    </button>
  </div>
  
  {/* Bouton ajouter un acteur */}
  <button
    onClick={handleAdd}
    disabled={assigningAll || reassigningAll}
    className="inline-flex items-center -md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
  >
    <FaPlus className="mr-2 h-4 w-4" />
    Ajouter un acteur
  </button>
</div>
      </div>

      {/* Stats rapides */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Object.entries(ROLES).map(([key, role]) => {
          const Icon = role.icon;
          const count = stats[key as keyof typeof stats] || 0;
          return (
            <div key={key} className="-lg bg-white p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`flex-shrink-0 -full p-2 ${role.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{role.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Stats Blockchain */}
        <div className="-lg bg-white p-4 shadow-sm border border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 -full p-2 bg-purple-100">
              <FaEthereum className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avec Blockchain</p>
              <p className="text-xl font-semibold text-gray-900">{stats.withBlockchain}/{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 -md bg-red-50 p-4">
          <div className="flex">
            <FaTimesCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 -md bg-green-50 p-4">
          <div className="flex">
            <FaCheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-green-500" />
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 bg-white -lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full -md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={filtreRole}
              onChange={(e) => setFiltreRole(e.target.value)}
              className="block w-full -md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="pharmacie">Pharmacies</option>
              <option value="fabricant">Fabricants</option>
              <option value="distributeur">Distributeurs</option>
            </select>
          </div>

          <div>
            <select
              value={filtreGenre}
              onChange={(e) => setFiltreGenre(e.target.value)}
              className="block w-full -md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les genres</option>
              <option value="M">Hommes</option>
              <option value="F">Femmes</option>
            </select>
          </div>

          <div>
            <select
              value={filtreFirstLogin}
              onChange={(e) => setFiltreFirstLogin(e.target.value)}
              className="block w-full -md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="oui">Première connexion</option>
              <option value="non">Déjà connecté</option>
            </select>
          </div>

          <div>
            <select
              value={filtreBlockchain}
              onChange={(e) => setFiltreBlockchain(e.target.value)}
              className="block w-full -md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous (Blockchain)</option>
              <option value="avec">Avec adresse ETH</option>
              <option value="sans">Sans adresse ETH</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          </span>
          {(searchTerm || filtreRole !== 'tous' || filtreGenre !== 'tous' || filtreFirstLogin !== 'tous' || filtreBlockchain !== 'tous') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFiltreRole('tous');
                setFiltreGenre('tous');
                setFiltreFirstLogin('tous');
                setFiltreBlockchain('tous');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaTimes className="mr-1 h-3 w-3" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white -lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filtreRole !== 'tous' ? 'Essayez de modifier vos filtres' : 'Ajoutez un nouvel acteur'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🔗 Blockchain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((utilisateur) => {
                  const RoleIcon = ROLES[utilisateur.role]?.icon || FaUser;
                  return (
                    <tr key={utilisateur.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 -full flex items-center justify-center ${
                            utilisateur.role === 'admin' ? 'bg-purple-100' :
                            utilisateur.role === 'pharmacie' ? 'bg-green-100' :
                            utilisateur.role === 'fabricant' ? 'bg-blue-100' :
                            'bg-orange-100'
                          }`}>
                            <RoleIcon className={`h-5 w-5 ${
                              utilisateur.role === 'admin' ? 'text-purple-600' :
                              utilisateur.role === 'pharmacie' ? 'text-green-600' :
                              utilisateur.role === 'fabricant' ? 'text-blue-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {utilisateur.username}
                            </div>
                            {utilisateur.nom_entite && (
                              <div className="text-xs text-gray-500">
                                {utilisateur.nom_entite}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {utilisateur.matricule}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center -full px-2.5 py-0.5 text-xs font-medium border ${
                          ROLES[utilisateur.role]?.badge
                        }`}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {ROLES[utilisateur.role]?.label}
                        </span>
                      </td>
                     
                      
                      {/* 🔗 COLONNE BLOCKCHAIN */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {utilisateur.ethereum_address ? (
                          <div className="space-y-2">
                            {/* Adresse avec icône copier */}
                            <div className="flex items-center space-x-2">
                              <FaEthereum className="h-4 w-4 text-purple-600 flex-shrink-0" />
                              <div className="flex items-center space-x-1">
                                <span 
                                  className="font-mono text-sm text-gray-900 cursor-pointer hover:text-purple-600"
                                  title={utilisateur.ethereum_address}
                                >
                                  {utilisateur.ethereum_address.substring(0, 8)}...
                                  {utilisateur.ethereum_address.substring(38)}
                                </span>
                                <button
                                  onClick={() => handleCopyAddress(utilisateur.ethereum_address!)}
                                  className="text-gray-400 hover:text-purple-600 p-1"
                                  title="Copier l'adresse complète"
                                >
                                  <FaCopy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Index Ganache */}
                            {utilisateur.ganache_account_index !== null && utilisateur.ganache_account_index !== undefined && (
                              <div className="flex items-center text-xs text-gray-500">
                                <FaWallet className="mr-1 h-3 w-3" />
                                <span>Ganache #{utilisateur.ganache_account_index}</span>
                              </div>
                            )}
                            
                            {/* Hash (tronqué) */}
                            {utilisateur.ethereum_address_hash && (
                              <div className="text-xs text-gray-400 font-mono">
                                Hash: {utilisateur.ethereum_address_hash.substring(0, 12)}...
                              </div>
                            )}
                            
                            {/* Bouton vérification */}
                            <button
                              onClick={() => handleVerifyIntegrity(utilisateur.id)}
                              disabled={verifyingAddress === utilisateur.id}
                              className="inline-flex items-center text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              {verifyingAddress === utilisateur.id ? (
                                <FaSync className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <FaShieldAlt className="mr-1 h-3 w-3" />
                              )}
                              Vérifier intégrité
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignEthereum(utilisateur.id)}
                            disabled={assigningAddress === utilisateur.id}
                            className="inline-flex items-center -md bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors"
                          >
                            {assigningAddress === utilisateur.id ? (
                              <>
                                <FaSync className="mr-1 h-3 w-3 animate-spin" />
                                Assignation...
                              </>
                            ) : (
                              <>
                                <FaEthereum className="mr-1 h-3 w-3" />
                                Assigner compte ETH
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                          {formatDate(utilisateur.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(utilisateur)}
                            className="text-blue-600 hover:text-blue-900 p-1  hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {utilisateur.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteConfirm(utilisateur.id)}
                              className="text-red-600 hover:text-red-900 p-1  hover:bg-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination simple */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Affichage de {filteredUsers.length} sur {users.length} utilisateurs
          </span>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative transform overflow-hidden -lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {editingUser ? (
                      <>
                        <FaEdit className="mr-2 h-5 w-5 text-blue-600" />
                        Modifier l'acteur
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-2 h-5 w-5 text-green-600" />
                        Ajouter un acteur
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 -md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  {/* ✅ NOUVEAU CHAMP : Nom de l'entité */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Nom de l'entité *
  </label>
  <input
    type="text"
    value={formData.nom_entite}
    onChange={(e) => setFormData({ ...formData, nom_entite: e.target.value })}
    className="block w-full -md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
    placeholder="Ex: PharmaPlus SA, Laboratoire XYZ..."
    required
  />
</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matricule *
                    </label>
                    <input
                      type="text"
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                      className="block w-full -md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder="Ex: DIS002"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full -md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder="Ex: Pharmacie Centrale"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe {!editingUser && '*'}
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full -md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder={editingUser ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                      required={!editingUser}
                    />
                    {editingUser && (
                      <p className="mt-1 text-xs text-gray-500">
                        Laissez vide pour conserver le mot de passe actuel
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                      className="block w-full -md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      required
                    >
                      <option value="admin">Administrateur</option>
                      <option value="pharmacie">Pharmacie</option>
                      <option value="fabricant">Fabricant</option>
                      <option value="distributeur">Distributeur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="genre"
                          value="M"
                          checked={formData.genre === 'M'}
                          onChange={(e) => setFormData({ ...formData, genre: 'M' })}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <FaMars className="mr-1 h-4 w-4 text-blue-500" />
                          Homme
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="genre"
                          value="F"
                          checked={formData.genre === 'F'}
                          onChange={(e) => setFormData({ ...formData, genre: 'F' })}
                          className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <FaVenus className="mr-1 h-4 w-4 text-pink-500" />
                          Femme
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="genre"
                          value=""
                          checked={formData.genre === ''}
                          onChange={(e) => setFormData({ ...formData, genre: '' })}
                          className="h-4 w-4 border-gray-300 text-gray-600 focus:ring-gray-500"
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          Non spécifié
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex justify-center items-center -md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? (
                        'Enregistrement...'
                      ) : editingUser ? (
                        <>
                          <FaCheck className="mr-2 h-4 w-4" />
                          Mettre à jour
                        </>
                      ) : (
                        <>
                          <FaPlus className="mr-2 h-4 w-4" />
                          Ajouter
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 inline-flex justify-center items-center -md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setDeleteConfirm(null)} />
            
            <div className="relative transform overflow-hidden -lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center -full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmer la suppression
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="inline-flex w-full justify-center -md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto"
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Supprimer
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 inline-flex w-full justify-center -md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
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