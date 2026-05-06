'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Pill, Package, Truck, LogOut, MapPin, 
  CheckCircle, Clock, Search 
} from 'lucide-react';

export default function DistributeurDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [shipments, setShipments] = useState([
    { 
      id: 'EXP-001', 
      lot: 'LOT-FAB-001', 
      origin: 'Laboratoire ABC', 
      destination: 'Pharmacie Centrale',
      status: 'in_transit',
      date: '2024-01-15'
    },
    { 
      id: 'EXP-002', 
      lot: 'LOT-FAB-002', 
      origin: 'Laboratoire XYZ', 
      destination: 'Hôpital Saint-Louis',
      status: 'pending',
      date: '2024-01-14'
    },
    { 
      id: 'EXP-003', 
      lot: 'LOT-FAB-001', 
      origin: 'Laboratoire ABC', 
      destination: 'Clinique du Parc',
      status: 'delivered',
      date: '2024-01-13'
    },
  ]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered':
        return (
          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs flex items-center gap-1">
            <CheckCircle className="w-2 h-2" />
            Livré
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs flex items-center gap-1">
            <Truck className="w-2 h-2" />
            En transit
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs flex items-center gap-1">
            <Clock className="w-2 h-2" />
            En attente
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
                <h1 className="text-sm font-medium tracking-wider">MEDTRACK DISTRIBUTEUR</h1>
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
              <Truck className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-light">
                {shipments.filter(s => s.status === 'in_transit').length}
              </span>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">EN TRANSIT</p>
          </div>
          <div className="bg-white border border-black p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-light">
                {shipments.filter(s => s.status === 'pending').length}
              </span>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">EN ATTENTE</p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-light">
                {shipments.filter(s => s.status === 'delivered').length}
              </span>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">LIVRÉS</p>
          </div>
        </div>

        {/* Liste des expéditions */}
        <div className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium tracking-wider text-gray-500">
                EXPÉDITIONS EN COURS
              </h2>
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-7 pr-3 py-1 text-xs border border-gray-200 focus:border-black focus:outline-none w-48"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border border-gray-100 p-4 hover:border-gray-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium mb-1">{shipment.id}</p>
                      <p className="text-xs text-gray-500">Lot: {shipment.lot}</p>
                    </div>
                    {getStatusBadge(shipment.status)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">De: {shipment.origin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">À: {shipment.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{shipment.date}</span>
                    <button className="text-xs text-black border border-gray-200 px-3 py-1 hover:bg-gray-50">
                      SUIVRE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carte de suivi */}
        <div className="mt-6 bg-white border border-gray-200 p-6">
          <h2 className="text-xs font-medium tracking-wider text-gray-500 mb-4">
            SUIVI EN TEMPS RÉEL
          </h2>
          <div className="h-48 bg-gray-50 border border-gray-200 flex items-center justify-center">
            <p className="text-xs text-gray-400">Carte de suivi GPS</p>
          </div>
        </div>
      </main>
    </div>
  );
}