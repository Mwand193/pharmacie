// app/retirer-lot/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FaExclamationTriangle,
  FaBoxOpen,
  FaSearch,
  FaCalendar,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaIndustry,
  FaWarehouse,
  FaStore
} from 'react-icons/fa';
import { FiBox } from 'react-icons/fi';
import { getLotsDisponibles, retirerLotDefectueux } from './actions';
import { useAuth } from '@/context/AuthContext';

interface Lot {
  id: number;
  numero_lot: string;
  quantite_totale: number;
  date_expiration: string;
  fabricant_id: string;
  medicament: {
    id: number;
    nom: string;
  };
}


export default function RetirerLotPage() {
  const { user } = useAuth();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [raison, setRaison] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadLots();
    }
  }, [user]);

  const loadLots = async () => {
    try {
      setLoading(true);
      const data = await getLotsDisponibles(user?.id || '', user?.role || '');
      setLots(data);
    } catch (error) {
      console.error('Erreur chargement lots:', error);
    } finally {
      setLoading(false);
    }
  };
const filteredLots = useMemo(() => {
  if (!searchTerm) return lots.filter(lot => lot.quantite_totale > 0);
  
  const term = searchTerm.toLowerCase();
  return lots.filter(lot => 
    lot.quantite_totale > 0 && (
      lot.numero_lot.toLowerCase().includes(term) ||
      lot.medicament?.nom.toLowerCase().includes(term)
    )
  );
}, [lots, searchTerm]);


  const handleOpenModal = (lot: Lot) => {
    setSelectedLot(lot);
    setQuantite(1);
    setRaison('');
    setShowModal(true);
  };

  const handleRetirer = async () => {
    if (!selectedLot || !user) return;
    
    if (quantite <= 0 || quantite > selectedLot.quantite_totale) {
      alert(`Quantité invalide. Doit être entre 1 et ${selectedLot.quantite_totale}`);
      return;
    }

    if (!raison.trim()) {
      alert('Veuillez indiquer la raison du retrait');
      return;
    }

    setProcessing(true);
    try {
      await retirerLotDefectueux({
        lot_id: selectedLot.id,
        quantite,
        raison,
        currentUser: user
      });
      
      setSuccessMessage(`Lot ${selectedLot.numero_lot} retiré avec succès`);
      setShowModal(false);
      setSelectedLot(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadLots();
    } catch (error) {
      console.error('Erreur retrait:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du retrait');
    } finally {
      setProcessing(false);
    }
  };

  const isExpire = (date: string) => new Date(date) < new Date();
  const isBientotExpire = (date: string) => {
    const expiration = new Date(date);
    const dans3Mois = new Date();
    dans3Mois.setMonth(dans3Mois.getMonth() + 3);
    return expiration > new Date() && expiration < dans3Mois;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-16">
          <FaSpinner className="h-6 w-6 text-emerald-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Chargement des lots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Retirer un lot défectueux
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sélectionnez un lot à retirer pour défaut de qualité ou non-conformité
        </p>
      </div>

      {/* Info utilisateur */}
      <div className="mb-8">
        <div className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 border border-blue-200">
          <span className="font-medium">{user?.nom_entite}</span>
          <span className="mx-2">•</span>
          <span className="capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 rounded-md bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-center">
            <FaCheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white border border-slate-200 mb-8">
        <div className="p-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un lot par numéro ou médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-white text-sm
                       focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {filteredLots.length} lot{filteredLots.length > 1 ? 's' : ''} disponible{filteredLots.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Liste des lots */}
      {filteredLots.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16">
          <div className="text-center">
            <FaBoxOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-base font-medium text-slate-900 mb-1">
              {searchTerm ? 'Aucun lot trouvé' : 'Aucun lot disponible'}
            </h3>
            <p className="text-sm text-slate-500">
              {searchTerm ? 'Essayez de modifier votre recherche' : 'Tous vos lots ont été retirés ou épuisés'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredLots.map((lot) => (
            <div 
              key={lot.id} 
              className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 border border-rose-100">
                      <FiBox className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {lot.medicament?.nom || 'Médicament inconnu'}
                      </h3>
                      <p className="text-sm font-mono text-slate-500 mt-0.5">
                        Lot #{lot.numero_lot}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">
                      {lot.quantite_totale}
                    </div>
                    <div className="text-xs text-slate-500">unités</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <FaCalendar className="h-3 w-3" />
                    Expire le {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Badge de statut */}
                <div className="mb-4">
                  {isExpire(lot.date_expiration) ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      <FaExclamationTriangle className="mr-1 h-3 w-3" />
                      Expiré
                    </span>
                  ) : isBientotExpire(lot.date_expiration) ? (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      <FaExclamationTriangle className="mr-1 h-3 w-3" />
                      Expire bientôt
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <FaCheckCircle className="mr-1 h-3 w-3" />
                      Valide
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenModal(lot)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white
                           bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
                           transition-colors"
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Retirer ce lot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation */}
      {showModal && selectedLot && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
              onClick={() => !processing && setShowModal(false)}
            />

            {/* Modal */}
            <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              {/* En-tête du modal */}
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-100">
                    <FaExclamationTriangle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Confirmer le retrait
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Lot #{selectedLot.numero_lot} - {selectedLot.medicament?.nom}
                    </p>
                  </div>
                </div>
              </div>

              {/* Corps du modal */}
              <div className="bg-slate-50 px-6 py-4 space-y-4">
                {/* Info lot */}
                <div className="bg-white rounded-md border border-slate-200 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Quantité disponible:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{selectedLot.quantite_totale} unités</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Expiration:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {new Date(selectedLot.date_expiration).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantité à retirer */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Quantité à retirer
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedLot.quantite_totale}
                    value={quantite}
                    onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                    className="block w-full px-4 py-2.5 border border-slate-300 bg-white text-sm
                             focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Maximum: {selectedLot.quantite_totale} unités
                  </p>
                </div>

                {/* Raison */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Raison du retrait
                  </label>
                  <select
                    value={raison}
                    onChange={(e) => setRaison(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-300 bg-white text-sm
                             focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">Sélectionnez une raison...</option>
                    <option value="Produit défectueux">Produit défectueux</option>
                    <option value="Emballage endommagé">Emballage endommagé</option>
                    <option value="Date expiration courte">Date d'expiration trop courte</option>
                    <option value="Erreur de fabrication">Erreur de fabrication</option>
                    <option value="Non conforme aux normes">Non conforme aux normes</option>
                    <option value="Rappel fabricant">Rappel fabricant</option>
                    <option value="Conditions de stockage">Mauvaises conditions de stockage</option>
                    <option value="Autre">Autre raison</option>
                  </select>
                </div>

                {/* Avertissement */}
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                  <div className="flex">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Cette action est irréversible. Le lot sera marqué comme défectueux et retiré du stock.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions du modal */}
              <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300
                           hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                           disabled:opacity-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleRetirer}
                  disabled={processing || !raison}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white
                           bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
                           disabled:opacity-50 transition-colors"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2 h-4 w-4" />
                      Confirmer le retrait
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

