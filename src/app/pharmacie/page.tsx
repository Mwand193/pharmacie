// app/pharmacie/lots/page.tsx
'use client';
import RouteProtector from '@/components/RouteProtector'
import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimesCircle,
  FaMinusCircle,
  FaTruck,
  FaQrcode,
  FaCalendar,
  FaHistory,
  FaShoppingCart,
  FaStore
} from 'react-icons/fa';
import { Package, Store } from 'lucide-react';
import QRCodeModal from '@/components/Modals/QRCodeModal';
import { getPharmacienLots } from './actions';
import { useAuth } from '@/context/AuthContext';
import type { DistributeurLot } from '@/types';
import { FiBox } from "react-icons/fi";

export default function PharmacienLotsPage() {
  const { user } = useAuth();
  const [lots, setLots] = useState<DistributeurLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [selectedLot, setSelectedLot] = useState<DistributeurLot | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLots();
    }
  }, [user]);

  const loadLots = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getPharmacienLots(user.id);
      console.log('Lots chargés:', data);
      setLots(data);
    } catch (error) {
      console.error('Erreur chargement lots:', error);
    } finally {
      setLoading(false);
    }
  };

 // app/pharmacie/lots/page.tsx

const getLotStatusConfig = (lot: DistributeurLot) => {
  const statut = lot.statut_distributeur || 'disponible';
  
  const configs: Record<string, {
    label: string;
    color: string;
    icon: any;
    iconColor: string;
    bgColor: string;
    description: string;
  }> = {
    disponible: {
      label: 'Disponible',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: FaCheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Lot disponible pour la vente'
    },
    partiel: {
      label: 'Partiellement vendu',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: FaMinusCircle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Une partie du lot a été vendue'
    },
    epuise: {
      label: 'Épuisé',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: FaTimesCircle,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Toutes les unités ont été vendues'
    },
    expire: {
      label: 'Expiré',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: FaExclamationTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'La date d\'expiration est dépassée'
    },
    en_attente: {
      label: 'En attente',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FaHistory,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'En attente de traitement'
    }
  };
  
  return configs[statut] || configs.disponible;
};

  const getDerniereActiviteIcon = (type: string) => {
    switch (type) {
      case 'reception':
        return <FaTruck className="h-4 w-4 text-blue-500" />;
      case 'vente':
        return <FaShoppingCart className="h-4 w-4 text-green-500" />;
      case 'retrait':
        return <FaExclamationTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FaHistory className="h-4 w-4 text-gray-500" />;
    }
  };

  const generateTraceabilityCodeForLot = (lot: DistributeurLot) => {
    const numeroCourt = (lot.numero_lot || '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(-4)
      .toUpperCase()
      .padEnd(4, 'X');
    
    const codeUniqueCourt = (lot.code_unique || '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(-6)
      .toUpperCase()
      .padEnd(6, '0');
    
    const hashCourt = (lot.hash_lot || '')
      .replace(/[^A-F0-9]/g, '')
      .substring(0, 6)
      .toUpperCase()
      .padEnd(6, '0');
    
    return `TRC-${numeroCourt}-${codeUniqueCourt}-${hashCourt}`;
  };

  // Filtrage des lots
  const filteredLots = lots.filter(lot => {
    const matchesSearch = 
      lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.medicament?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.fabriquant_nom || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'tous') return matchesSearch;
    return matchesSearch && lot.statut_distributeur === filterStatus;
  });

  // Statistiques globales
  const stats = {
    total: lots.length,
    disponibles: lots.filter(l => l.statut_distributeur === 'disponible').length,
    partiels: lots.filter(l => l.statut_distributeur === 'partiel').length,
    epuises: lots.filter(l => l.statut_distributeur === 'epuise').length,
    expires: lots.filter(l => l.statut_distributeur === 'expire').length,
  };

  return (
    <RouteProtector roles={['pharmacie', 'admin']} showUnauthorized={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Mes Lots</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gérez vos lots de médicaments reçus des distributeurs avec traçabilité blockchain complète
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={loadLots}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <FaHistory className="mr-2 h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Total</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="text-sm font-medium text-green-700">Disponibles</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">{stats.disponibles}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="text-sm font-medium text-yellow-700">Partiels</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">{stats.partiels}</div>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-700">Épuisés</div>
            <div className="mt-1 text-2xl font-semibold text-gray-600">{stats.epuises}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-sm font-medium text-red-700">Expirés</div>
            <div className="mt-1 text-2xl font-semibold text-red-600">{stats.expires}</div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par numéro de lot, médicament ou distributeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
          >
            <option value="tous">Tous les statuts</option>
            <option value="disponible">Disponibles</option>
            <option value="partiel">Partiels</option>
            <option value="epuise">Épuisés</option>
            <option value="expire">Expirés</option>
          </select>
        </div>

        {/* Grille des lots */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement de vos lots...</h3>
            </div>
          ) : filteredLots.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Aucun lot ne correspond à votre recherche.' 
                  : 'Vous n\'avez pas encore reçu de lots. Les lots distribués apparaîtront ici.'}
              </p>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const statusConfig = getLotStatusConfig(lot);
              const StatusIcon = statusConfig.icon;
              const quantiteRestante = lot.quantite_restante ?? lot.quantite_recue ?? 0;
              const isExpired = lot.date_expiration ? new Date(lot.date_expiration) < new Date() : false;
              const pourcentageUtilise = (lot.quantite_recue && lot.quantite_recue > 0)
                ? ((lot.quantite_recue - quantiteRestante) / lot.quantite_recue) * 100 
                : 0;

              return (
                <div
                  key={lot.id}
                  className={`relative flex flex-col rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${statusConfig.bgColor}`}
                >
                  <div className="p-6 pb-4">
                    {/* En-tête de la carte */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <FiBox className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {lot.medicament?.nom || 'Médicament inconnu'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {lot.medicament?.dosage} - {lot.medicament?.forme}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLot(lot);
                            setIsQRModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-700"
                          title="Voir QR Code"
                        >
                          <FaQrcode className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Informations du lot */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">N° Lot:</span>
                        <span className="font-mono font-medium text-gray-900">
                          {lot.numero_lot}
                        </span>
                      </div>

                      {/* Distributeur source */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          <FaTruck className="inline mr-1 text-orange-500" />
                          Distributeur:
                        </span>
                        <span className="font-medium text-gray-900">
                          {lot.fabriquant_nom || 'Non spécifié'}
                        </span>
                      </div>

                      {/* Détail des quantités */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quantité reçue:</span>
                          <span className="font-semibold text-green-600">
                            {lot.quantite_recue || lot.quantite_totale} unités
                          </span>
                        </div>

                        {/* Ventes effectuées */}
                        {(lot.quantite_distribuee ?? 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              <FaShoppingCart className="inline mr-1 text-green-500" />
                              Vendue:
                            </span>
                            <span className="font-medium text-green-600">
                              {lot.quantite_distribuee} unités
                              {lot.mouvementsDetail?.distributions && lot.mouvementsDetail.distributions > 1 && 
                                ` (${lot.mouvementsDetail.distributions} ventes)`
                              }
                            </span>
                          </div>
                        )}

                        {/* Retraits */}
                        {(lot.quantite_retiree ?? 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              <FaExclamationTriangle className="inline mr-1 text-red-500" />
                              Retirés:
                            </span>
                            <span className="font-medium text-red-600">
                              {lot.quantite_retiree} unités
                              {lot.mouvementsDetail?.retraits && lot.mouvementsDetail.retraits > 1 && 
                                ` (${lot.mouvementsDetail.retraits} retraits)`
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* Reste disponible */}
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                          <span className="text-gray-700 font-medium">Reste disponible:</span>
                          <span className={`font-bold text-lg ${
                            quantiteRestante > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {quantiteRestante} unités
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          <FaCalendar className="inline mr-1" />
                          Réception:
                        </span>
                        <span className="text-gray-900">
                          {lot.date_reception 
                            ? new Date(lot.date_reception).toLocaleDateString('fr-FR')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expiration:</span>
                        <span className={`font-medium ${
                          isExpired ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {/* Statut du lot */}
                    <div className="mt-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        <StatusIcon className={`mr-1.5 h-3.5 w-3.5 ${statusConfig.iconColor}`} />
                        {statusConfig.label}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{statusConfig.description}</p>
                    </div>

                    {/* Barre de progression */}
                    {pourcentageUtilise > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Utilisation</span>
                          <span>{pourcentageUtilise.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              pourcentageUtilise >= 100 ? 'bg-red-600' :
                              pourcentageUtilise >= 75 ? 'bg-yellow-500' :
                              pourcentageUtilise >= 50 ? 'bg-blue-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(pourcentageUtilise, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Dernière activité */}
                    {lot.derniere_activite && (
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        {getDerniereActiviteIcon(lot.derniere_activite.type)}
                        <span className="ml-1">
                          Dernière: {lot.derniere_activite.type === 'reception' ? 'réception' : 
                                     lot.derniere_activite.type === 'vente' ? 'vente' : 
                                     lot.derniere_activite.type} le{' '}
                          {new Date(lot.derniere_activite.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {/* Hash blockchain */}
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <div className="text-xs font-mono text-gray-500 truncate">
                        Hash: {lot.hash_lot?.substring(0, 32)}...
                      </div>
                    </div>

                    {/* Code traçabilité */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Code traçabilité:</span>
                      <button
                        onClick={() => {
                          const code = generateTraceabilityCodeForLot(lot);
                          navigator.clipboard.writeText(code);
                          alert(`Code copié: ${code}`);
                        }}
                        className="text-xs font-mono text-green-600 hover:text-green-800 cursor-pointer"
                        title="Cliquer pour copier"
                      >
                        {generateTraceabilityCodeForLot(lot)}
                      </button>
                    </div>

                    {/* Badge d'expiration */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isExpired 
                          ? 'bg-red-100 text-red-800'
                          : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isExpired 
                          ? 'Expiré'
                          : new Date(lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                          ? 'Expire bientôt'
                          : 'Valide'}
                      </span>
                    </div>

                    {/* Détail des mouvements */}
                    {lot.mouvementsDetail && lot.mouvementsDetail.total > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between font-medium">
                            <span>Total mouvements:</span>
                            <span>{lot.mouvementsDetail.total}</span>
                          </div>
                          {lot.mouvementsDetail.distributions > 0 && (
                            <div className="flex justify-between">
                              <span>Ventes:</span>
                              <span className="text-green-600">{lot.mouvementsDetail.distributions}</span>
                            </div>
                          )}
                          {lot.mouvementsDetail.retraits > 0 && (
                            <div className="flex justify-between">
                              <span>Retraits:</span>
                              <span className="text-red-600">{lot.mouvementsDetail.retraits}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal QR Code */}
        {selectedLot && (
          <QRCodeModal
            isOpen={isQRModalOpen}
            onClose={() => {
              setIsQRModalOpen(false);
              setSelectedLot(null);
            }}
            lot={selectedLot}
          />
        )}
      </div>
    </RouteProtector>
  );
}