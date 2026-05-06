'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Pill, Package, CheckCircle, XCircle, Clock, 
  LogOut, Search, Filter, Eye 
} from 'lucide-react';

export default function PharmacieDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pendingLots, setPendingLots] = useState<any[]>([]);
  const [validatedLots, setValidatedLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    // Simulé - À remplacer par vraie requête Supabase
    setPendingLots([
      { id: 'LOT-2024-001', fabricant: 'LAB001', date: '2024-01-15', status: 'pending' },
      { id: 'LOT-2024-002', fabricant: 'LAB002', date: '2024-01-14', status: 'pending' },
    ]);
    setValidatedLots([
      { id: 'LOT-2024-000', fabricant: 'LAB001', date: '2024-01-10', status: 'validated' },
    ]);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium tracking-wider">MEDTRACK PHARMACIE</h1>
                <p className="text-xs text-gray-500">{user?.matricule}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 hover:bg-gray-50"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs tracking-wide">DÉCONNEXION</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-light">{pendingLots.length}</span>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">EN ATTENTE</p>
          </div>
          <div className="bg-white border border-black p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-light">{validatedLots.length}</span>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">VALIDÉS</p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-light">0</span>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">REFUSÉS</p>
          </div>
        </div>

        {/* Lots en attente de validation */}
        <div className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium tracking-wider text-gray-500">
                LOTS EN ATTENTE DE VALIDATION
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-7 pr-3 py-1 text-xs border border-gray-200 focus:border-black focus:outline-none w-48"
                  />
                </div>
                <button className="p-1 border border-gray-200 hover:bg-gray-50">
                  <Filter className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {pendingLots.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">
                Aucun lot en attente
              </p>
            ) : (
              <div className="space-y-3">
                {pendingLots.map((lot) => (
                  <div key={lot.id} className="flex items-center justify-between p-3 border border-gray-100 hover:border-gray-300">
                    <div className="flex items-center gap-4">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium">{lot.id}</p>
                        <p className="text-xs text-gray-500">{lot.fabricant} · {lot.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-black text-white text-xs hover:bg-gray-800">
                        VALIDER
                      </button>
                      <button className="px-3 py-1 border border-gray-200 text-xs hover:bg-gray-50">
                        REFUSER
                      </button>
                      <button className="p-1 border border-gray-200 hover:bg-gray-50">
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Historique des validations */}
        <div className="mt-6 bg-white border border-gray-200 p-6">
          <h2 className="text-xs font-medium tracking-wider text-gray-500 mb-4">
            DERNIÈRES VALIDATIONS
          </h2>
          <div className="space-y-2">
            {validatedLots.map((lot) => (
              <div key={lot.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs">{lot.id}</span>
                </div>
                <span className="text-xs text-gray-500">{lot.date}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}