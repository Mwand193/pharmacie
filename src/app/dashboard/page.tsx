// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Package, AlertTriangle, TrendingUp, Clock,
  CheckCircle, XCircle, Truck, Pill,
  ArrowUp, ArrowDown, Activity
} from 'lucide-react';

interface DashboardStats {
  totalLots: number;
  lotsActifs: number;
  lotsExpires: number;
  lotsEpuises: number;
  transfertsEnCours: number;
  anomalies: number;
  derniereActivite: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLots: 0,
    lotsActifs: 0,
    lotsExpires: 0,
    lotsEpuises: 0,
    transfertsEnCours: 0,
    anomalies: 0,
    derniereActivite: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Statistiques des lots
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

      // Mouvements récents
      const { data: mouvements } = await supabase
        .from('mouvements')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (mouvements && mouvements.length > 0) {
        setStats(prev => ({
          ...prev,
          derniereActivite: mouvements[0].created_at
        }));
      }

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center animate-pulse flex-cols justify-center min-h-screen">
       <Package className='w-12 h-12 text-gray-500'/>
       <>
       Chargement...
       </>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto ">
      {/* En-tête */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 -lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Lots</p>
              <p className="text-2xl font-bold mt-1">{stats.totalLots}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 -full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span>{stats.lotsActifs} lots actifs</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 -lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lots Actifs</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.lotsActifs}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 -full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Disponibles</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 -lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lots Expirés</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.lotsExpires}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 -full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-red-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>Action requise</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 -lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transferts</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">{stats.transfertsEnCours}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 -full flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <Activity className="w-3 h-3 mr-1" />
            <span>En transit</span>
          </div>
        </div>
      </div>

      {/* Stats détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Distribution des lots */}
        <div className="bg-white border border-gray-200 -lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">État des lots</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Actifs</span>
                <span className="font-medium">{stats.lotsActifs}</span>
              </div>
              <div className="w-full bg-gray-100 -full h-2">
                <div 
                  className="bg-green-500 h-2 -full" 
                  style={{ width: `${(stats.lotsActifs / stats.totalLots) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Expirés</span>
                <span className="font-medium">{stats.lotsExpires}</span>
              </div>
              <div className="w-full bg-gray-100 -full h-2">
                <div 
                  className="bg-red-500 h-2 -full" 
                  style={{ width: `${(stats.lotsExpires / stats.totalLots) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Épuisés</span>
                <span className="font-medium">{stats.lotsEpuises}</span>
              </div>
              <div className="w-full bg-gray-100 -full h-2">
                <div 
                  className="bg-gray-400 h-2 -full" 
                  style={{ width: `${(stats.lotsEpuises / stats.totalLots) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières activités */}
        <div className="bg-white border border-gray-200 -lg p-6">
          <h3 className="text-lg font-medium mb-4">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-green-500 -full flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Dernière mise à jour</p>
                <p className="text-xs text-gray-500">
                  {stats.derniereActivite 
                    ? new Date(stats.derniereActivite).toLocaleString('fr-FR')
                    : 'Aucune activité'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white border border-gray-200 -lg p-6">
        <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === 'fabricant' && (
            <>
              <button className="p-4 border border-gray-200 -lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
                <Pill className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm">Nouveau lot</span>
              </button>
              <button className="p-4 border border-gray-200 -lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm">Fournir lot</span>
              </button>
            </>
          )}
          {user?.role === 'distributeur' && (
            <>
              <button className="p-4 border border-gray-200 -lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm">Réception</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}