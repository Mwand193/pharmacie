'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Pill, Package, Plus, LogOut, QrCode, 
  Calendar, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';

export default function FabricantDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showNewLotForm, setShowNewLotForm] = useState(false);
  const [myLots, setMyLots] = useState([
    { id: 'LOT-FAB-001', date: '2024-01-15', status: 'validated', quantity: 1000 },
    { id: 'LOT-FAB-002', date: '2024-01-14', status: 'pending', quantity: 500 },
    { id: 'LOT-FAB-003', date: '2024-01-13', status: 'shipped', quantity: 750 },
  ]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'validated':
        return (
          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs flex items-center gap-1">
            <CheckCircle className="w-2 h-2" />
            Validé
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs flex items-center gap-1">
            <Clock className="w-2 h-2" />
            En attente
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs flex items-center gap-1">
            <Package className="w-2 h-2" />
            Expédié
          </span>
        );
      default:
        return null;
    }
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
                <h1 className="text-sm font-medium tracking-wider">MEDTRACK FABRICANT</h1>
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
        {/* Actions rapides */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewLotForm(!showNewLotForm)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs tracking-wide">NOUVEAU LOT</span>
          </button>
        </div>

        {/* Formulaire nouveau lot */}
        {showNewLotForm && (
          <div className="mb-6 bg-white border border-gray-200 p-6">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 mb-4">
              CRÉER UN NOUVEAU LOT
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MÉDICAMENT</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none"
                    placeholder="Nom du médicament"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">QUANTITÉ</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">DATE DE FABRICATION</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">DATE D'EXPIRATION</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs hover:bg-gray-800"
                >
                  CRÉER LE LOT
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewLotForm(false)}
                  className="px-4 py-2 border border-gray-200 text-xs hover:bg-gray-50"
                >
                  ANNULER
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des lots */}
        <div className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xs font-medium tracking-wider text-gray-500">
              MES LOTS DE FABRICATION
            </h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-medium text-gray-500">ID LOT</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">DATE</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">QUANTITÉ</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">STATUT</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">QR CODE</th>
                </tr>
              </thead>
              <tbody>
                {myLots.map((lot) => (
                  <tr key={lot.id} className="border-b border-gray-100">
                    <td className="py-2 text-xs font-medium">{lot.id}</td>
                    <td className="py-2 text-xs text-gray-600">{lot.date}</td>
                    <td className="py-2 text-xs">{lot.quantity} unités</td>
                    <td className="py-2">{getStatusBadge(lot.status)}</td>
                    <td className="py-2">
                      <button className="p-1 border border-gray-200 hover:bg-gray-50">
                        <QrCode className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">TOTAL LOTS</p>
            <p className="text-2xl font-light">{myLots.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">EN ATTENTE</p>
            <p className="text-2xl font-light">
              {myLots.filter(l => l.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">VALIDÉS</p>
            <p className="text-2xl font-light">
              {myLots.filter(l => l.status === 'validated').length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}