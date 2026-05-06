'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSearch, 
  FaArrowRight, 
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaBoxOpen,
  FaBuilding
} from 'react-icons/fa';
import { getLots } from '@/app/lots/actions';
import { transfererLot } from './actions';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Lot } from '@/types';
import { FiBox } from 'react-icons/fi';

// Type pour les distributeurs (utilisateurs avec role = distributeur)
type DistributeurUser = {
  id: string;
  matricule: string;
  username: string;
  nom_entite: string;
  role: string;
};

export default function FournirLotPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [lots, setLots] = useState<Lot[]>([]);
  const [distributeurs, setDistributeurs] = useState<DistributeurUser[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<DistributeurUser | null>(null);
  const [quantite, setQuantite] = useState<number>(0);
  const [searchLot, setSearchLot] = useState('');
  const [searchDistributeur, setSearchDistributeur] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Vérifier que l'utilisateur est un fabricant
    if (user && user.role !== 'fabricant' && user.role !== 'admin') {
      alert('Seuls les fabricants peuvent accéder à cette page');
      router.push('/lots');
      return;
    }
    
    loadLots();
    loadDistributeurs();
  }, [user]);

  const loadLots = async () => {
    try {
      setLoading(true);
      const data = await getLots();
      
      // Filtrer les lots du fabricant connecté
      const fabricantLots = data.filter(lot => {
        // Pour admin, voir tous les lots
        if (user?.role === 'admin') {
          return lot.quantite_totale > 0 && new Date(lot.date_expiration) > new Date();
        }
        // Pour fabricant, voir seulement ses lots
        return lot.fabricant_id === user?.id && 
               lot.quantite_totale > 0 && 
               new Date(lot.date_expiration) > new Date();
      });
      
      setLots(fabricantLots);
    } catch (error) {
      console.error('Erreur chargement lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributeurs = async () => {
    try {
      // Récupérer tous les utilisateurs avec rôle 'distributeur'
      const { data, error } = await supabase
        .from('users')
        .select('id, matricule, username, nom_entite, role')
        .eq('role', 'distributeur');
        
      if (error) throw error;
      setDistributeurs(data || []);
    } catch (error) {
      console.error('Erreur chargement distributeurs:', error);
    }
  };

  const filteredLots = useMemo(() => {
    if (!searchLot) return lots;
    const term = searchLot.toLowerCase();
    return lots.filter(lot => 
      lot.numero_lot.toLowerCase().includes(term) ||
      lot.medicament?.nom.toLowerCase().includes(term)
    );
  }, [lots, searchLot]);

  const filteredDistributeurs = useMemo(() => {
    if (!searchDistributeur) return distributeurs;
    const term = searchDistributeur.toLowerCase();
    return distributeurs.filter(d => 
      d.nom_entite.toLowerCase().includes(term) ||
      d.username.toLowerCase().includes(term) ||
      d.matricule.toLowerCase().includes(term)
    );
  }, [distributeurs, searchDistributeur]);

  const handleSelectLot = (lot: Lot) => {
    if (lot.quantite_totale === 0) return;
    setSelectedLot(lot);
    setQuantite(lot.quantite_totale);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedLot || !selectedDestination || !user) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (quantite <= 0 || quantite > selectedLot.quantite_totale) {
      alert('Quantité invalide');
      return;
    }

    setSubmitting(true);
    
    try {
      await transfererLot({
        lot_id: selectedLot.id,
        destination_id: parseInt(selectedDestination.id),
        quantite: quantite,
        commentaire: `Transfert du lot ${selectedLot.numero_lot} vers ${selectedDestination.nom_entite}`,
        currentUser: {
          id: user.id,
          matricule: user.matricule,
          username: user.username,
          role: user.role,
          nom_entite: user.nom_entite,
          first_login: user.first_login,
          genre: user.genre,
        },
      });
      
      setStep(3);
      
      setTimeout(() => {
        router.push('/mouvements');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur transfert:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du transfert du lot');
    } finally {
      setSubmitting(false);
    }
  };

  // Si pas d'utilisateur ou mauvais rôle
  if (!user || (user.role !== 'fabricant' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">Seuls les fabricants peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* En-tête avec infos fabricant */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 full mb-4">
            <FiBox className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fournir un lot
          </h1>
          <p className="text-gray-600">
            Transférez vos lots vers un distributeur
          </p>
          
          {/* Info fabricant connecté */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 lg">
            <FaBuilding className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              <span className="font-medium">Fabricant :</span> {user.nom_entite}
            </span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex full items-center justify-center w-8 h-8 ${
                step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Lot</span>
            </div>
            <div className={`w-16 h-0.5 mx-4 ${
              step >= 2 ? 'bg-green-600' : 'bg-gray-200'
            }`} />
            <div className="flex items-center">
              <div className={`flex full items-center justify-center w-8 h-8 ${
                step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Destination</span>
            </div>
            <div className={`w-16 h-0.5 mx-4 ${
              step >= 3 ? 'bg-green-600' : 'bg-gray-200'
            }`} />
            <div className="flex items-center">
              <div className={`flex full items-center justify-center w-8 h-8 ${
                step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white 2xl shadow-xl p-8">
          {/* Étape 1: Sélection du lot */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sélectionnez un lot à transférer
              </h2>
              
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par numéro de lot ou médicament..."
                  value={searchLot}
                  onChange={(e) => setSearchLot(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 lg text-sm 
                           focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FaSpinner className="h-8 w-8 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-500">Chargement de vos lots...</p>
                  </div>
                ) : filteredLots.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBoxOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Aucun lot disponible</p>
                    <p className="text-gray-400 text-sm">
                      {searchLot ? 'Aucun résultat pour cette recherche' : 'Vous n\'avez pas de lots disponibles au transfert'}
                    </p>
                  </div>
                ) : (
                  filteredLots.map((lot) => {
                    const isExpired = new Date(lot.date_expiration) < new Date();
                    
                    return (
                      <button
                        key={lot.id}
                        onClick={() => handleSelectLot(lot)}
                        disabled={lot.quantite_totale === 0}
                        className={`w-full text-left p-4 border border-gray-200 lg transition-all
                                  ${lot.quantite_totale > 0 
                                    ? 'hover:border-green-500 hover:shadow-md cursor-pointer' 
                                    : 'opacity-50 cursor-not-allowed bg-gray-50'
                                  }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {lot.medicament?.nom}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Lot: {lot.numero_lot}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                                Expire le {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                              </span>
                              {isExpired && (
                                <FaExclamationTriangle className="ml-2 h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Créé par: {lot.created_by}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${lot.quantite_totale > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {lot.quantite_totale}
                            </div>
                            <div className="text-xs text-gray-500">unités</div>
                          </div>
                          <FaArrowRight className={`ml-4 h-5 w-5 ${lot.quantite_totale > 0 ? 'text-gray-400' : 'text-gray-300'}`} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Étape 2: Destination et quantité */}
          {step === 2 && selectedLot && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Détails du transfert
              </h2>

              {/* Résumé du lot */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 lg p-4 mb-6 border border-green-200">
                <div className="text-sm text-gray-600 mb-2">Lot sélectionné</div>
                <div className="font-medium text-gray-900 text-lg">{selectedLot.medicament?.nom}</div>
                <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                  <span>Lot: <strong>{selectedLot.numero_lot}</strong></span>
                  <span>•</span>
                  <span>Expire le {new Date(selectedLot.date_expiration).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Source - Fabricant (fixe) */}
              <div className="mb-6 p-4 bg-gray-50 lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source - Fabricant
                </label>
                <div className="flex items-center">
                  <FaBuilding className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{user.nom_entite}</div>
                    <div className="text-xs text-gray-500">Vous ({user.matricule})</div>
                  </div>
                </div>
              </div>

              {/* Destination - Distributeur */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination - Distributeur
                </label>
                
                {!selectedDestination ? (
                  <>
                    <div className="relative mb-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher un distributeur par nom, matricule..."
                        value={searchDistributeur}
                        onChange={(e) => setSearchDistributeur(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 lg text-sm 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div className="border border-gray-200 lg max-h-64 overflow-y-auto">
                      {filteredDistributeurs.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Aucun distributeur trouvé
                        </div>
                      ) : (
                        filteredDistributeurs.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => {
                              setSelectedDestination(d);
                              setSearchDistributeur('');
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors
                                     border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{d.nom_entite}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {d.username} • Matricule: {d.matricule}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-green-50 lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaBuilding className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{selectedDestination.nom_entite}</div>
                          <div className="text-xs text-gray-500">
                            {selectedDestination.username} • Matricule: {selectedDestination.matricule}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDestination(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantité */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité à transférer
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max={selectedLot.quantite_totale}
                    value={quantite}
                    onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
                    className="block w-40 px-4 py-3 border border-gray-300 lg 
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-sm text-gray-500">
                    / {selectedLot.quantite_totale} unités disponibles
                  </span>
                </div>
                {quantite > selectedLot.quantite_totale && (
                  <p className="mt-2 text-sm text-red-600">
                    La quantité ne peut pas dépasser le stock disponible
                  </p>
                )}
              </div>

              {/* Récapitulatif */}
              {selectedDestination && quantite > 0 && quantite <= selectedLot.quantite_totale && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 lg p-5 mb-6">
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                    <FaCheckCircle className="mr-2 h-4 w-4" />
                    Récapitulatif du transfert
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-700 text-xs block">EXPÉDITEUR</span>
                      <span className="font-medium">{user.nom_entite}</span>
                      <span className="text-xs text-gray-500 block">Fabricant</span>
                    </div>
                    <div>
                      <span className="text-green-700 text-xs block">DESTINATAIRE</span>
                      <span className="font-medium">{selectedDestination.nom_entite}</span>
                      <span className="text-xs text-gray-500 block">Distributeur</span>
                    </div>
                    <div>
                      <span className="text-green-700 text-xs block">QUANTITÉ</span>
                      <span className="font-medium text-lg">{quantite} unités</span>
                    </div>
                    <div>
                      <span className="text-green-700 text-xs block">LOT</span>
                      <span className="font-medium">{selectedLot.numero_lot}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedDestination(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 lg hover:bg-gray-200 
                           transition-colors font-medium"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedDestination || quantite <= 0 || 
                           quantite > selectedLot.quantite_totale || submitting}
                  className="px-6 py-3 text-white bg-green-600 lg hover:bg-green-700 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                           font-medium flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      <span>Transfert en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmer le transfert</span>
                      <FaArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 full mb-6">
                <FaCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Transfert effectué avec succès !
              </h3>
              <p className="text-gray-600 mb-6">
                Le lot a été transféré de <strong>{user.nom_entite}</strong> vers <strong>{selectedDestination?.nom_entite}</strong>
              </p>
              
              <div className="bg-gray-50 lg p-6 mb-6 max-w-md mx-auto">
                <div className="text-sm text-gray-600 mb-2">Détails de la transaction</div>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lot:</span>
                    <span className="font-mono text-sm text-gray-700">
                      {selectedLot?.numero_lot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantité:</span>
                    <span className="font-semibold">{quantite} unités</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{new Date().toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm none text-gray-500 flex items-center justify-center">
                <FaSpinner className="animate-spin h-3 w-3 mr-2" />
                Redirection vers l'historique dans 3 secondes...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}