
// app/reception/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTruck,
  FaCalendar,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaHistory,
  FaTimesCircle,
  FaEthereum
} from 'react-icons/fa';
import { getTransfertsEnAttente, getReceptions, validerReception, rejeterReception } from './actions';
import type { Mouvement } from '@/types';
import { FiBox } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

export default function ReceptionPage() {
  const { user } = useAuth();
  const [transferts, setTransferts] = useState<any[]>([]);
  const [receptions, setReceptions] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'historique'>('attente');
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{open: boolean, transfert: any | null}>({
    open: false,
    transfert: null
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [transfertsData, receptionsData] = await Promise.all([
        getTransfertsEnAttente(user.id, user.nom_entite),
        getReceptions(user.id)
      ]);
      setTransferts(transfertsData);
      setReceptions(receptionsData);
    } catch (error) {
      console.error('Erreur chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValiderReception = async (transfert: any) => {
    if (!confirm(`Confirmer la réception du lot ${transfert.lot?.numero_lot} ?\n\nQuantité: ${transfert.quantite} ${transfert.type_unite || 'boite'}(s)\nDe: ${transfert.source?.nom_entite || 'Fabricant'}`)) return;
    
    setProcessing(true);
    setProcessingId(transfert.id);
    
    try {
      const result = await validerReception(
        transfert.id, 
        user?.id, 
        user?.nom_entite,
        user?.ganache_account_index
      );
      
      console.log('✅ Réception validée:', result);
      
      // Afficher un message de succès avec les infos blockchain
      if (result.blockchain_enregistre) {
        alert(`✅ Réception validée avec succès !\n\nTransaction blockchain: ${result.blockchain_transaction_hash?.substring(0, 20)}...`);
      } else {
        alert('✅ Réception validée avec succès ! (sans blockchain)');
      }
      
      await loadData();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la validation');
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const handleRejectReception = async () => {
    if (!rejectModal.transfert) return;
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer un motif de rejet');
      return;
    }
    
    setProcessing(true);
    
    try {
      const result = await rejeterReception(
        rejectModal.transfert.id,
        rejectReason,
        user?.id,
        user?.nom_entite,
        user?.ganache_account_index
      );
      
      console.log('❌ Réception rejetée:', result);
      
      if (result.blockchain_transaction_hash) {
        alert(`❌ Réception rejetée.\n\nTransaction blockchain: ${result.blockchain_transaction_hash.substring(0, 20)}...`);
      } else {
        alert('❌ Réception rejetée.');
      }
      
      setRejectModal({ open: false, transfert: null });
      setRejectReason('');
      await loadData();
    } catch (error) {
      console.error('Erreur rejet:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du rejet');
    } finally {
      setProcessing(false);
    }
  };

  // Filtrer les transferts pour le distributeur connecté
  const transfertsEnAttente = transferts.filter(t => 
    !t.hasReception && !t.isRejete && 
    t.destination_id === user?.id
  );
  
  const transfertsTraites = transferts.filter(t => 
    (t.hasReception || t.isRejete) && 
    t.destination_id === user?.id
  );

  const TransfertCard = ({ transfert, showActions = true }: { transfert: any, showActions?: boolean }) => {
    const isExpire = new Date(transfert.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isProcessing = processingId === transfert.id;
    
    return (
      <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              transfert.hasReception ? 'bg-green-100' : 
              transfert.isRejete ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <FaTruck className={`h-6 w-6 ${
                transfert.hasReception ? 'text-green-600' : 
                transfert.isRejete ? 'text-red-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {transfert.lot?.medicament?.nom}
              </h3>
              <p className="text-xs text-gray-500">
                Lot: {transfert.lot?.numero_lot}
              </p>
              {transfert.lot?.blockchain_lot_id && (
                <p className="text-xs text-purple-600 font-mono">
                  <FaEthereum className="inline mr-1 h-3 w-3" />
                  BC: {transfert.lot.blockchain_lot_id}
                </p>
              )}
            </div>
          </div>
          
          {showActions && !transfert.hasReception && !transfert.isRejete && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleValiderReception(transfert)}
                disabled={processing}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validation...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2 h-4 w-4" />
                    Valider la réception
                  </>
                )}
              </button>
              <button
                onClick={() => setRejectModal({ open: true, transfert })}
                disabled={processing}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                <FaTimesCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Quantité:</span>
            <span className="font-medium text-gray-900">
              {transfert.quantite} {transfert.type_unite}s
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Expédition:</span>
            <span className="text-gray-900">
              {new Date(transfert.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          <div className="flex items-start space-x-2 text-sm">
            <FaMapMarkerAlt className="mt-0.5 h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-gray-500">
                De: {transfert.source?.nom_entite || transfert.source?.username || 'Fabricant'}
              </div>
              <div className="text-gray-500">
                À: {transfert.destination?.nom_entite || transfert.destination?.username || 'Destination'}
              </div>
            </div>
          </div>

          {/* Informations du distributeur destinataire */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Distributeur:</span>
            <span className="font-medium text-gray-900">
              {transfert.destination?.nom_entite || transfert.destination?.username || 'Non spécifié'}
            </span>
          </div>

          {transfert.commentaire && (
            <div className="mt-2 rounded-md bg-gray-50 p-2">
              <p className="text-xs text-gray-600">{transfert.commentaire}</p>
            </div>
          )}
        </div>

        {/* Statut */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          {transfert.hasReception && transfert.reception && (
            <>
              <div className="mb-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <FaCheckCircle className="mr-1 h-3 w-3" />
                Reçu le {new Date(transfert.reception.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="text-xs font-mono text-gray-500 truncate">
                Hash: {transfert.reception.hash_mouvement?.substring(0, 32)}...
              </div>
              {transfert.reception.transaction_hash && (
                <div className="text-xs font-mono text-purple-600 truncate mt-1">
                  <FaEthereum className="inline mr-1 h-3 w-3" />
                  Tx: {transfert.reception.transaction_hash.substring(0, 20)}...
                </div>
              )}
            </>
          )}
          
          {transfert.isRejete && (
            <div className="mb-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              <FaExclamationTriangle className="mr-1 h-3 w-3" />
              Rejeté
            </div>
          )}

          {!transfert.hasReception && !transfert.isRejete && (
            <>
              {isExpire ? (
                <div className="mb-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  <FaExclamationTriangle className="mr-1 h-3 w-3" />
                  En attente depuis +7 jours
                </div>
              ) : (
                <div className="mb-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  <FaTruck className="mr-1 h-3 w-3" />
                  En attente de réception
                </div>
              )}
              <div className="text-xs font-mono text-gray-500 truncate">
                Hash: {transfert.hash_mouvement?.substring(0, 32)}...
              </div>
            </>
          )}
        </div>

        {/* Badge d'expiration du lot */}
        {transfert.lot?.date_expiration && (
          <div className="mt-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              new Date(transfert.lot.date_expiration) < new Date() 
                ? 'bg-red-100 text-red-800'
                : new Date(transfert.lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              <FaCalendar className="mr-1 h-3 w-3" />
              {new Date(transfert.lot.date_expiration) < new Date() 
                ? 'Lot expiré'
                : new Date(transfert.lot.date_expiration) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                ? 'Expire bientôt'
                : 'Lot valide'}
            </span>
          </div>
        )}

        {/* Info blockchain */}
        {transfert.lot?.blockchain_lot_id && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-purple-600">
              <FaEthereum className="mr-1 h-3 w-3" />
              <span className="font-mono">
                Blockchain Lot ID: {transfert.lot.blockchain_lot_id}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Chargement
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est un distributeur
  if (user?.role !== 'distributeur') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Accès non autorisé
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée aux distributeurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Réception des lots
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Validez la réception des transferts de lots destinés à votre entité
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col items-end space-y-2">
          <div className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <span className="font-medium">{user?.nom_entite}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{user?.role}</span>
          </div>
          {user?.ethereum_address && (
            <div className="text-xs text-gray-500 font-mono truncate max-w-xs" title={user.ethereum_address}>
              <FaEthereum className="inline mr-1 h-3 w-3 text-purple-600" />
              {user.ethereum_address.substring(0, 10)}...{user.ethereum_address.substring(38)}
            </div>
          )}
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaTruck className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">
                {transfertsEnAttente.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Réceptionnés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {transfertsTraites.filter(t => t.hasReception).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaClipboardCheck className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total transferts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {transferts.filter(t => t.destination_id === user?.id).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('attente')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'attente'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaTruck className="inline mr-2 h-4 w-4" />
            En attente de réception
            {transfertsEnAttente.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {transfertsEnAttente.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'historique'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaHistory className="inline mr-2 h-4 w-4" />
            Historique des réceptions
            {transfertsTraites.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {transfertsTraites.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Contenu */}
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12">
            <FiBox className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement des transferts...</h3>
            <p className="mt-1 text-sm text-gray-500">Veuillez patienter</p>
          </div>
        ) : (
          <>
            {activeTab === 'attente' && (
              <>
                {transfertsEnAttente.length === 0 ? (
                  <div className="text-center py-12">
                    <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Aucun transfert en attente
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tous les transferts destinés à {user?.nom_entite} ont été réceptionnés.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {transfertsEnAttente.map((transfert) => (
                      <TransfertCard 
                        key={transfert.id} 
                        transfert={transfert} 
                        showActions={true} 
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'historique' && (
              <>
                {transfertsTraites.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Aucun historique
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Les transferts réceptionnés pour {user?.nom_entite} apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {transfertsTraites.map((transfert) => (
                      <TransfertCard 
                        key={transfert.id} 
                        transfert={transfert} 
                        showActions={false} 
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de rejet */}
      {rejectModal.open && rejectModal.transfert && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rejeter la réception
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Lot: <span className="font-medium">{rejectModal.transfert.lot?.numero_lot}</span>
              </p>
              <p className="text-sm text-gray-600">
                Quantité: <span className="font-medium">{rejectModal.transfert.quantite} {rejectModal.transfert.type_unite || 'boite'}(s)</span>
              </p>
              <p className="text-sm text-gray-600">
                De: <span className="font-medium">{rejectModal.transfert.source?.nom_entite || 'Fabricant'}</span>
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du rejet
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Indiquez la raison du rejet..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setRejectModal({ open: false, transfert: null });
                  setRejectReason('');
                }}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRejectReception}
                disabled={processing || !rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}