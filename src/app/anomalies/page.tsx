// app/anomalies/signaler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  signalerAnomalie, 
  getLotsReceptionnesPourSignalement,
  getAnomalies 
} from './actions';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimesCircle,
  FaHistory,
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaWarehouse,
  FaSearch,
  FaBox
} from 'react-icons/fa';
import Link from 'next/link';

const TYPES_ANOMALIES = [
  { value: 'produit_endommage', label: 'Produit endommagé', icon: '📦' },
  { value: 'quantite_erronee', label: 'Quantité erronée', icon: '🔢' },
  { value: 'produit_manquant', label: 'Produit manquant', icon: '❓' },
  { value: 'date_expiration_depassee', label: 'Date expiration dépassée', icon: '📅' },
  { value: 'produit_non_conforme', label: 'Produit non conforme', icon: '⚠️' },
  { value: 'code_invalide', label: 'Code invalide', icon: '🔍' },
  { value: 'lot_inconnu', label: 'Lot inconnu', icon: '🔎' },
  { value: 'rupture_stock', label: 'Rupture de stock', icon: '📉' },
  { value: 'erreur_etiquetage', label: 'Erreur d\'étiquetage', icon: '🏷️' },
  { value: 'autre', label: 'Autre', icon: '📝' },
];

const GRAVITES = [
  { value: 'faible', label: 'Faible', description: 'Impact mineur', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'moyenne', label: 'Moyenne', description: 'Nécessite attention', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'elevee', label: 'Élevée', description: 'Action rapide requise', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'critique', label: 'Critique', description: 'Urgent - Bloquant', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

const STATUTS: Record<string, { label: string; color: string }> = {
  signale: { label: 'Signalé', color: 'bg-yellow-100 text-yellow-800' },
  en_cours_traitement: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  resolu: { label: 'Résolu', color: 'bg-green-100 text-green-800' },
  rejete: { label: 'Rejeté', color: 'bg-gray-100 text-gray-800' },
};

export default function SignalerAnomaliePage() {
  const { user } = useAuth();
  const [etape, setEtape] = useState<'selection' | 'signalement' | 'succes'>('selection');
  const [lotsReceptionnes, setLotsReceptionnes] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Lot sélectionné pour signalement
  const [lotSelectionne, setLotSelectionne] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    type_anomalie: '',
    description: '',
    gravite: 'moyenne',
  });

  useEffect(() => {
    if (user) {
      chargerDonnees();
    }
  }, [user]);

  const chargerDonnees = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔄 Chargement des données pour l\'utilisateur:', user.id, user.role);
      
      const [lots, anomaliesData] = await Promise.all([
        getLotsReceptionnesPourSignalement(parseInt(user.id)),
        getAnomalies(parseInt(user.id), user.role)
      ]);
      
      console.log('📦 Lots réceptionnés:', lots?.length || 0);
      console.log('⚠️ Anomalies:', anomaliesData?.length || 0);
      
      setLotsReceptionnes(lots || []);
      setAnomalies(anomaliesData || []);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionLot = (lot: any) => {
    if (lot.a_anomalie_en_cours) {
      alert('Ce lot a déjà une anomalie en cours de traitement.');
      return;
    }
    setLotSelectionne(lot);
    setEtape('signalement');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type_anomalie || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user?.id || !lotSelectionne) {
      setError('Informations manquantes');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const result = await signalerAnomalie({
        lot_id: lotSelectionne.lot.id,
        type_anomalie: formData.type_anomalie,
        description: formData.description,
        gravite: formData.gravite,
        signale_par: parseInt(user.id),
      });

      setSuccessMessage(result.message);
      setEtape('succes');
      setFormData({ type_anomalie: '', description: '', gravite: 'moyenne' });
      await chargerDonnees();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du signalement');
    } finally {
      setProcessing(false);
    }
  };

  const reinitialiser = () => {
    setLotSelectionne(null);
    setFormData({ type_anomalie: '', description: '', gravite: 'moyenne' });
    setError('');
    setSuccessMessage('');
    setEtape('selection');
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

  // Vérifier si l'utilisateur est un distributeur
  if (user?.role !== 'distributeur' && user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Seuls les distributeurs peuvent signaler des anomalies sur les lots réceptionnés.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Non authentifié</h3>
          <p className="mt-1 text-sm text-gray-500">
            Veuillez vous connecter pour signaler une anomalie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <Link
          href="/reception"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Retour aux réceptions
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Signaler une anomalie
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Signalez un problème sur un lot que vous avez réceptionné
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-md">
            <FaWarehouse className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{user.nom_entite || user.username}</span>
            <span className="text-gray-300">|</span>
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: 'selection', label: 'Sélectionner un lot réceptionné' },
            { key: 'signalement', label: 'Décrire l\'anomalie' },
            { key: 'succes', label: 'Signalement enregistré' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                etape === step.key ? 'bg-blue-600 text-white' :
                etape === 'succes' && index <= 2 ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {etape === 'succes' ? (
                  <FaCheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-2 text-sm font-medium hidden sm:block">{step.label}</div>
              {index < 2 && <div className="mx-4 h-0.5 w-12 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {loading ? (
              <div className="text-center py-12">
                <FaBox className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
                <p className="mt-2 text-gray-500">Chargement des lots réceptionnés...</p>
              </div>
            ) : (
              <>
                {/* Étape 1: Sélection du lot réceptionné */}
                {etape === 'selection' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4 flex items-center">
                      <FaSearch className="mr-2 h-5 w-5 text-blue-600" />
                      Sélectionnez un lot réceptionné
                    </h2>
                    
                    <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                      <FaExclamationTriangle className="inline mr-2 h-4 w-4" />
                      Vous ne pouvez signaler une anomalie que sur les lots que vous avez réceptionnés.
                    </div>
                    
                    {lotsReceptionnes.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FaBox className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500 font-medium">Aucun lot réceptionné disponible</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Vous devez d'abord valider la réception de lots depuis la page Réception
                        </p>
                        <Link
                          href="/reception"
                          className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <FaArrowLeft className="mr-1 h-3 w-3" />
                          Aller aux réceptions
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {lotsReceptionnes.map((reception) => (
                          <button
                            key={reception.id}
                            onClick={() => handleSelectionLot(reception)}
                            disabled={reception.a_anomalie_en_cours}
                            className={`text-left p-4 border rounded-lg transition-all ${
                              reception.a_anomalie_en_cours
                                ? 'border-orange-200 bg-orange-50 opacity-75 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {reception.lot?.medicament?.nom || 'Médicament inconnu'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Lot: {reception.lot?.numero_lot || 'N/A'}
                                </p>
                              </div>
                              {reception.a_anomalie_en_cours && (
                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                  Anomalie en cours
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-3 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Quantité:</span>
                                <span className="font-medium">{reception.quantite} unités</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Reçu le:</span>
                                <span>{formatDate(reception.created_at)}</span>
                              </div>
                              {reception.source && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">De:</span>
                                  <span>{reception.source.nom_entite || reception.source.username}</span>
                                </div>
                              )}
                            </div>

                            {reception.anomalies_actives?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-orange-200">
                                <p className="text-xs text-orange-600">
                                  {reception.anomalies_actives.length} anomalie(s) en cours
                                </p>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 2: Formulaire de signalement */}
                {etape === 'signalement' && lotSelectionne && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium flex items-center">
                        <FaExclamationTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                        Décrire l'anomalie
                      </h2>
                      <button
                        onClick={() => setEtape('selection')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        ← Changer de lot
                      </button>
                    </div>

                    {/* Résumé du lot */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">
                        {lotSelectionne.lot?.medicament?.nom || 'Médicament'}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Lot:</span>{' '}
                          <span className="font-medium">{lotSelectionne.lot?.numero_lot || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantité:</span>{' '}
                          <span className="font-medium">{lotSelectionne.quantite} unités</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reçu le:</span>{' '}
                          <span>{formatDate(lotSelectionne.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Code CIS:</span>{' '}
                          <span className="font-mono text-xs">{lotSelectionne.lot?.medicament?.code_cis || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <FaTimesCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                          <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Type d'anomalie */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type d'anomalie *
                        </label>
                        <select
                          value={formData.type_anomalie}
                          onChange={(e) => setFormData({ ...formData, type_anomalie: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                          required
                        >
                          <option value="">Sélectionnez un type</option>
                          {TYPES_ANOMALIES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Gravité */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Niveau de gravité
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {GRAVITES.map((g) => (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, gravite: g.value })}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                formData.gravite === g.value
                                  ? `${g.color} border-current`
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-sm">{g.label}</div>
                              <div className="text-xs mt-1 opacity-75">{g.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description détaillée *
                        </label>
                        <textarea
                          rows={5}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border resize-vertical"
                          placeholder="Décrivez précisément l'anomalie constatée..."
                          required
                        />
                      </div>

                      {/* Boutons */}
                      <div className="flex space-x-3 pt-2">
                        <button
                          type="submit"
                          disabled={processing}
                          className="flex-1 inline-flex justify-center items-center rounded-md bg-yellow-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 disabled:opacity-50"
                        >
                          {processing ? (
                            'Signalement en cours...'
                          ) : (
                            <>
                              <FaExclamationTriangle className="mr-2 h-4 w-4" />
                              Signaler l'anomalie
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={reinitialiser}
                          className="inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Étape 3: Succès */}
                {etape === 'succes' && (
                  <div className="text-center py-8">
                    <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-xl font-medium text-gray-900">
                      Anomalie signalée avec succès !
                    </h2>
                    <p className="mt-2 text-gray-600">
                      {successMessage}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Votre signalement sera traité par un administrateur.
                    </p>
                    <div className="mt-6 space-x-3">
                      <button
                        onClick={reinitialiser}
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Signaler une autre anomalie
                      </button>
                      <Link
                        href="/reception"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Retour aux réceptions
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Colonne latérale: Historique des anomalies */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <FaHistory className="mr-2 h-5 w-5 text-gray-600" />
            Mes signalements
          </h2>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {anomalies.length === 0 ? (
              <div className="text-center py-8 px-4">
                <FaHistory className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Aucune anomalie signalée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {anomalies.map((anomalie) => (
                  <div key={anomalie.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUTS[anomalie.statut]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {STATUTS[anomalie.statut]?.label || anomalie.statut}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(anomalie.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900">
                      {TYPES_ANOMALIES.find(t => t.value === anomalie.type_anomalie)?.icon}{' '}
                      {TYPES_ANOMALIES.find(t => t.value === anomalie.type_anomalie)?.label}
                    </p>
                    
                    {anomalie.lot && (
                      <p className="text-xs text-gray-500 mt-1">
                        Lot: {anomalie.lot.numero_lot}
                        {anomalie.lot.medicament && ` - ${anomalie.lot.medicament.nom}`}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {anomalie.description}
                    </p>

                    {anomalie.commentaire_resolution && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {anomalie.commentaire_resolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}