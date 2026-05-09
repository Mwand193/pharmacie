
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Package, AlertTriangle, TrendingUp, Clock,
  CheckCircle, XCircle, Truck, Pill,
  ArrowUp, ArrowDown, Activity, Users,
  FileBox, ClipboardList, BarChart3,
  ShoppingCart, Building2, History
} from 'lucide-react';

interface DashboardStats {
  // Stats communes
  totalLots: number;
  lotsActifs: number;
  lotsExpires: number;
  lotsEpuises: number;
  
  // Stats fabricant
  lotsProduits: number;
  transfertsEnAttente: number;
  
  // Stats distributeur
  lotsEnStock: number;
  receptionsEnAttente: number;
  transfertsEffectues: number;
  
  // Stats pharmacie
  lotsDisponibles: number;
  lotsVendus: number;
  anomaliesSignalees: number;
  
  // Stats admin
  totalUtilisateurs: number;
  totalMouvements: number;
  anomaliesEnCours: number;
  
  derniereActivite: string;
  mouvementsRecents: any[];
  lotsProches: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalLots: 0,
    lotsActifs: 0,
    lotsExpires: 0,
    lotsEpuises: 0,
    lotsProduits: 0,
    transfertsEnAttente: 0,
    lotsEnStock: 0,
    receptionsEnAttente: 0,
    transfertsEffectues: 0,
    lotsDisponibles: 0,
    lotsVendus: 0,
    anomaliesSignalees: 0,
    totalUtilisateurs: 0,
    totalMouvements: 0,
    anomaliesEnCours: 0,
    derniereActivite: '',
    mouvementsRecents: [],
    lotsProches: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Stats communes à tous les rôles
      const { data: lots } = await supabase
        .from('lots')
        .select('*');

      if (lots) {
        const now = new Date();
        setStats(prev => ({
          ...prev,
          totalLots: lots.length,
          lotsActifs: lots.filter(l => 
            l.quantite_totale > 0 && new Date(l.date_expiration) > now
          ).length,
          lotsExpires: lots.filter(l => 
            new Date(l.date_expiration) <= now
          ).length,
          lotsEpuises: lots.filter(l => l.quantite_totale === 0).length,
        }));
      }

      // Stats spécifiques selon le rôle
      if (user?.role === 'fabricant') {
        await fetchFabricantStats();
      } else if (user?.role === 'distributeur') {
        await fetchDistributeurStats();
      } else if (user?.role === 'pharmacie') {
        await fetchPharmacieStats();
      } else if (user?.role === 'admin') {
        await fetchAdminStats();
      }

      // Mouvements récents (5 derniers)
      const { data: mouvements } = await supabase
        .from('mouvements')
        .select(`
          *,
          lots (numero_lot, medicament_id, medicaments (nom))
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (mouvements) {
        setStats(prev => ({
          ...prev,
          mouvementsRecents: mouvements,
          derniereActivite: mouvements[0]?.created_at || ''
        }));
      }

      // Lots proches de l'expiration (30 jours)
      const { data: lotsProches } = await supabase
        .from('lots')
        .select(`
          *,
          medicaments (nom)
        `)
        .gte('date_expiration', new Date().toISOString())
        .lte('date_expiration', new Date(Date.now() + 30*24*60*60*1000).toISOString())
        .order('date_expiration')
        .limit(5);

      if (lotsProches) {
        setStats(prev => ({ ...prev, lotsProches }));
      }

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFabricantStats = async () => {
    // Lots créés par le fabricant
    const { data: lotsFabricant } = await supabase
      .from('lots')
      .select('id')
      .eq('fabricant_id', user?.id);

    setStats(prev => ({
      ...prev,
      lotsProduits: lotsFabricant?.length || 0
    }));
  };

  const fetchDistributeurStats = async () => {
    // Mouvements de réception en attente
    const { count: receptionsCount } = await supabase
      .from('mouvements')
      .select('*', { count: 'exact' })
      .eq('destination_id', user?.id)
      .eq('type_mouvement', 'reception')
      .is('statut_apres', null);

    setStats(prev => ({
      ...prev,
      receptionsEnAttente: receptionsCount || 0
    }));
  };

  const fetchPharmacieStats = async () => {
    // Anomalies signalées par la pharmacie
    const { count: anomaliesCount } = await supabase
      .from('anomalies')
      .select('*', { count: 'exact' })
      .eq('signale_par', user?.username);

    setStats(prev => ({
      ...prev,
      anomaliesSignalees: anomaliesCount || 0
    }));
  };

  const fetchAdminStats = async () => {
    // Nombre total d'utilisateurs
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Nombre total de mouvements
    const { count: mouvementsCount } = await supabase
      .from('mouvements')
      .select('*', { count: 'exact' });

    // Anomalies en cours
    const { count: anomaliesCount } = await supabase
      .from('anomalies')
      .select('*', { count: 'exact' })
      .eq('statut', 'en_cours');

    setStats(prev => ({
      ...prev,
      totalUtilisateurs: usersCount || 0,
      totalMouvements: mouvementsCount || 0,
      anomaliesEnCours: anomaliesCount || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 text-green-500 mx-auto animate-bounce" />
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleDashboard = () => {
    switch(user?.role) {
      case 'fabricant':
        return <FabricantDashboard stats={stats} user={user} />;
      case 'distributeur':
        return <DistributeurDashboard stats={stats} user={user} />;
      case 'pharmacie':
        return <PharmacieDashboard stats={stats} user={user} />;
      case 'admin':
        return <AdminDashboard stats={stats} user={user} />;
      default:
        return <DefaultDashboard stats={stats} user={user} />;
    }
  };

  return getRoleDashboard();
}

// Dashboard Fabricant
function FabricantDashboard({ stats, user }: { stats: DashboardStats; user: any }) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900">
          Dashboard Fabricant
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user.nom_entite} • Gestion de production
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Lots Produits" 
          value={stats.lotsProduits} 
          icon={Package} 
          color="blue"
          subtitle="Total créé"
        />
        <KPICard 
          title="Lots Actifs" 
          value={stats.lotsActifs} 
          icon={CheckCircle} 
          color="green"
          subtitle="En circulation"
        />
        <KPICard 
          title="Transferts" 
          value={stats.transfertsEnAttente} 
          icon={Truck} 
          color="purple"
          subtitle="En attente"
        />
        <KPICard 
          title="Anomalies" 
          value={stats.anomaliesSignalees} 
          icon={AlertTriangle} 
          color="red"
          subtitle="Signalées"
        />
      </div>

      {/* Lots proches expiration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity stats={stats} />
        <NearExpiryLots lots={stats.lotsProches} />
      </div>
    </div>
  );
}

// Dashboard Distributeur
function DistributeurDashboard({ stats, user }: { stats: DashboardStats; user: any }) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900">
          Dashboard Distributeur
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user.nom_entite} • Gestion des stocks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Stock Actuel" 
          value={stats.lotsEnStock} 
          icon={Package} 
          color="blue"
          subtitle="Lots en stock"
        />
        <KPICard 
          title="Réceptions" 
          value={stats.receptionsEnAttente} 
          icon={Truck} 
          color="orange"
          subtitle="En attente"
        />
        <KPICard 
          title="Transferts" 
          value={stats.transfertsEffectues} 
          icon={ArrowUp} 
          color="green"
          subtitle="Effectués"
        />
        <KPICard 
          title="Anomalies" 
          value={stats.anomaliesSignalees} 
          icon={AlertTriangle} 
          color="red"
          subtitle="À traiter"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity stats={stats} />
        <ActionsRapides role="distributeur" />
      </div>
    </div>
  );
}

// Dashboard Pharmacie
function PharmacieDashboard({ stats, user }: { stats: DashboardStats; user: any }) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900">
          Dashboard Pharmacie
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user.nom_entite} • Point de vente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Stock Disponible" 
          value={stats.lotsDisponibles} 
          icon={Package} 
          color="blue"
          subtitle="Lots en rayon"
        />
        <KPICard 
          title="Ventes" 
          value={stats.lotsVendus} 
          icon={ShoppingCart} 
          color="green"
          subtitle="Aujourd'hui"
        />
        <KPICard 
          title="Vérifications" 
          value={stats.lotsActifs} 
          icon={CheckCircle} 
          color="purple"
          subtitle="Lots vérifiés"
        />
        <KPICard 
          title="Anomalies" 
          value={stats.anomaliesSignalees} 
          icon={AlertTriangle} 
          color="red"
          subtitle="Signalées"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity stats={stats} />
        <NearExpiryLots lots={stats.lotsProches} />
      </div>
    </div>
  );
}

// Dashboard Admin
function AdminDashboard({ stats, user }: { stats: DashboardStats; user: any }) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900">
          Dashboard Administration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Supervision globale du système
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Utilisateurs" 
          value={stats.totalUtilisateurs} 
          icon={Users} 
          color="blue"
          subtitle="Acteurs"
        />
        <KPICard 
          title="Total Lots" 
          value={stats.totalLots} 
          icon={Package} 
          color="green"
          subtitle="Dans le système"
        />
        <KPICard 
          title="Mouvements" 
          value={stats.totalMouvements} 
          icon={Activity} 
          color="purple"
          subtitle="Transactions"
        />
        <KPICard 
          title="Anomalies" 
          value={stats.anomaliesEnCours} 
          icon={AlertTriangle} 
          color="red"
          subtitle="En cours"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Distribution des rôles</h3>
          <div className="bg-white border rounded-lg p-6">
            <div className="space-y-4">
              <ProgressBar label="Fabricants" value={2} max={stats.totalUtilisateurs} color="bg-blue-500" />
              <ProgressBar label="Distributeurs" value={3} max={stats.totalUtilisateurs} color="bg-orange-500" />
              <ProgressBar label="Pharmacies" value={5} max={stats.totalUtilisateurs} color="bg-green-500" />
            </div>
          </div>
        </div>
        <ActionsRapides role="admin" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity stats={stats} />
        <NearExpiryLots lots={stats.lotsProches} />
      </div>
    </div>
  );
}

// Dashboard par défaut
function DefaultDashboard({ stats, user }: { stats: DashboardStats; user: any }) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.nom_entite} • {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Total Lots" 
          value={stats.totalLots} 
          icon={Package} 
          color="blue"
          subtitle={`${stats.lotsActifs} actifs`}
        />
        <KPICard 
          title="Lots Actifs" 
          value={stats.lotsActifs} 
          icon={CheckCircle} 
          color="green"
          subtitle="Disponibles"
        />
        <KPICard 
          title="Lots Expirés" 
          value={stats.lotsExpires} 
          icon={AlertTriangle} 
          color="red"
          subtitle="Action requise"
        />
        <KPICard 
          title="Transferts" 
          value={stats.transfertsEnAttente} 
          icon={Truck} 
          color="purple"
          subtitle="En transit"
        />
      </div>
    </div>
  );
}

// Composants réutilisables
function KPICard({ title, value, icon: Icon, color, subtitle }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-3 flex items-center text-xs text-gray-500">
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: any) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RecentActivity({ stats }: { stats: DashboardStats }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <History className="w-5 h-5 mr-2 text-gray-500" />
        Activité récente
      </h3>
      <div className="space-y-3">
        {stats.mouvementsRecents?.length > 0 ? (
          stats.mouvementsRecents.map((mouv: any, idx: number) => (
            <div key={idx} className="flex items-start space-x-3 pb-3 border-b last:border-0">
              <div className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{mouv.type_mouvement}</p>
                <p className="text-xs text-gray-500">
                  Lot: {mouv.lots?.numero_lot} • 
                  {new Date(mouv.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Aucune activité récente</p>
        )}
      </div>
    </div>
  );
}

function NearExpiryLots({ lots }: { lots: any[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-orange-500" />
        Lots proches expiration
      </h3>
      <div className="space-y-3">
        {lots?.length > 0 ? (
          lots.map((lot: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between pb-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{lot.medicaments?.nom}</p>
                <p className="text-xs text-gray-500">Lot: {lot.numero_lot}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                Expire le {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Aucun lot n'expire prochainement</p>
        )}
      </div>
    </div>
  );
}

function ActionsRapides({ role }: { role: string }) {
  const router = useRouter();
  
  const actions: any = {
    fabricant: [
      { label: 'Nouveau Lot', icon: Pill, href: '/lots/create', color: 'green' },
      { label: 'Voir Production', icon: Package, href: '/lots', color: 'blue' },
    ],
    distributeur: [
      { label: 'Réception', icon: Truck, href: '/reception', color: 'orange' },
      { label: 'Transfert', icon: ArrowUp, href: '/transfert-pharmacie', color: 'green' },
    ],
    pharmacie: [
      { label: 'Vérifier Lot', icon: CheckCircle, href: '/verify', color: 'blue' },
      { label: 'Signaler Anomalie', icon: AlertTriangle, href: '/anomalies/create', color: 'red' },
    ],
    admin: [
      { label: 'Gérer Utilisateurs', icon: Users, href: '/acteurs', color: 'purple' },
      { label: 'Voir Anomalies', icon: AlertTriangle, href: '/anomalies', color: 'red' },
    ]
  };

  const roleActions = actions[role] || [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 gap-3">
        {roleActions.map((action: any, idx: number) => (
          <button
            key={idx}
            onClick={() => router.push(action.href)}
            className={`flex items-center p-3 border border-gray-200 rounded-lg hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all`}
          >
            <action.icon className={`w-5 h-5 mr-3 text-${action.color}-600`} />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}