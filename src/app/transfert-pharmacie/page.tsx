// app/transfert-pharmacie/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getLotsReceptionnes, 
  getPharmaciens, 
  transfererVersPharmacie,
  getHistoriqueDistributions 
} from './actions';
import { 
  FaPills, 
  FaUserMd, 
  FaCheckCircle, 
  FaTimesCircle,
 
  FaHistory,
  FaExclamationTriangle,
  FaTruck,
  FaWarehouse,
  FaArrowRight
} from 'react-icons/fa';
import { Package } from 'lucide-react';
type Etape = 'selection' | 'pharmacien' | 'verification' | 'succes' | 'erreur';

export default function DistributionPharmaciePage() {
  const { user } = useAuth();
  const [etape, setEtape] = useState<Etape>('selection');
  const [lots, setLots] = useState<any[]>([]);
  const [pharmaciens, setPharmaciens] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Formulaire
  const [lotSelectionne, setLotSelectionne] = useState<any>(null);
  const [pharmacienSelectionne, setPharmacienSelectionne] = useState<any>(null);
  const [quantite, setQuantite] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  
  // Erreur
  const [erreurMessage, setErreurMessage] = useState('');

  useEffect(() => {
    if (user) {
      chargerDonnees();
    }
  }, [user]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [lotsData, pharmaciensData, historiqueData] = await Promise.all([
        getLotsReceptionnes(user?.id || ''),
        getPharmaciens(),
        getHistoriqueDistributions(user?.id || '')
      ]);
      setLots(lotsData);
      setPharmaciens(pharmaciensData);
      setHistorique(historiqueData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionLot = (lot: any) => {
    setLotSelectionne(lot);
    setQuantite(0);
    setEtape('pharmacien');
  };

  const handleSelectionPharmacien = (pharmacien: any) => {
    setPharmacienSelectionne(pharmacien);
    setEtape('verification');
  };

  const handleValiderDistribution = async () => {
    if (!lotSelectionne || !pharmacienSelectionne || quantite <= 0) return;
    
    setProcessing(true);
    try {
      const resultat = await transfererVersPharmacie({
        lot_id: lotSelectionne.lot_id,
        pharmacien_id: pharmacienSelectionne.id,
        quantite: quantite,
        commentaire: commentaire,
        currentUser: user as any
      });
      
      setEtape('succes');
      await chargerDonnees();
    } catch (error) {
      setErreurMessage(error instanceof Error ? error.message : 'Erreur lors de la distribution');
      setEtape('erreur');
    } finally {
      setProcessing(false);
    }
  };

  const reinitialiser = () => {
    setLotSelectionne(null);
    setPharmacienSelectionne(null);
    setQuantite(0);
    setCommentaire('');
    setErreurMessage('');
    setEtape('selection');
  };

  // Vérifier l'accès
  if (user?.role !== 'distributeur' && user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée aux distributeurs pour distribuer aux pharmacies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Distribution aux Pharmacies
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Distribuez les lots réceptionnés vers les pharmacies
        </p>
        <div className="mt-2 inline-flex items-center -md bg-blue-50 px-3 py-1 text-sm text-blue-700">
          <FaWarehouse className="mr-2 h-4 w-4" />
          Distributeur: {user?.nom_entite}
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lots disponibles</p>
              <p className="text-2xl font-semibold text-gray-900">{lots.length}</p>
            </div>
          </div>
        </div>
        
        <div className="-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaTruck className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Distributions</p>
              <p className="text-2xl font-semibold text-gray-900">{historique.length}</p>
            </div>
          </div>
        </div>
        
        <div className="-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUserMd className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pharmacies</p>
              <p className="text-2xl font-semibold text-gray-900">{pharmaciens.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: 'selection', label: 'Sélectionner lot' },
            { key: 'pharmacien', label: 'Indiquer pharmacien' },
            { key: 'verification', label: 'Vérifier données' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 -full text-sm font-medium ${
                etape === step.key ? 'bg-blue-600 text-white' :
                etape === 'succes' ? 'bg-green-600 text-white' :
                etape === 'erreur' && index <= ['selection', 'pharmacien', 'verification'].indexOf(etape) ? 'bg-red-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {etape === 'succes' && index <= ['selection', 'pharmacien', 'verification'].indexOf(etape) ? (
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
      <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Étape 1: Sélection du lot réceptionné */}
            {etape === 'selection' && (
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-600" />
                  Sélectionnez un lot réceptionné à distribuer
                </h2>
                
                {lots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 -lg">
                    <FaWarehouse className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Aucun lot disponible à distribuer</p>
                    <p className="text-sm text-gray-400">
                      Réceptionnez d'abord des lots depuis la page Réception
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lots.map((reception) => (
                      <button
                        key={reception.id}
                        onClick={() => handleSelectionLot(reception)}
                        className="text-left p-4 border border-gray-200 -lg hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-gray-900">
                            {reception.lot?.medicament?.nom}
                          </h3>
                          <span className="inline-flex items-center -full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            <FaCheckCircle className="mr-1 h-3 w-3" />
                            Réceptionné
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Lot: {reception.lot?.numero_lot}
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reçu:</span>
                            <span className="font-medium">{reception.quantite_recue} unités</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Déjà distribué:</span>
                            <span className="font-medium text-orange-600">
                              {reception.quantite_distribuee} unités
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="text-gray-700 font-medium">Disponible:</span>
                            <span className={`font-bold ${
                              reception.quantite_disponible > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {reception.quantite_disponible} unités
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Reçu le {new Date(reception.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        {reception.source && (
                          <div className="mt-1 text-xs text-gray-500">
                            De: {reception.source.nom_entite || reception.source.username}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Étape 2: Sélection du pharmacien */}
            {etape === 'pharmacien' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium flex items-center">
                    <FaUserMd className="mr-2 h-5 w-5 text-green-600" />
                    Sélectionnez la pharmacie destinataire
                  </h2>
                  <button
                    onClick={() => setEtape('selection')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Retour
                  </button>
                </div>

                {/* Lot sélectionné - résumé */}
                <div className="mb-4 p-4 bg-blue-50 -lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-blue-900">
                        {lotSelectionne?.lot?.medicament?.nom}
                      </p>
                      <p className="text-sm text-blue-700">
                        Lot: {lotSelectionne?.lot?.numero_lot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">
                        Disponible: <span className="font-bold">{lotSelectionne?.quantite_disponible} unités</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité à distribuer (max: {lotSelectionne?.quantite_disponible} unités)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={lotSelectionne?.quantite_disponible}
                    value={quantite || ''}
                    onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
                    className="block w -md border-b - w-max p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Quantité..."
                  />
                  {quantite > lotSelectionne?.quantite_disponible && (
                    <p className="mt-1 text-sm text-red-600">
                      La quantité ne peut pas dépasser {lotSelectionne?.quantite_disponible} unités
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pharmaciens.map((pharmacien) => (
                    <button
                      key={pharmacien.id}
                      onClick={() => handleSelectionPharmacien(pharmacien)}
                      disabled={quantite <= 0 || quantite > (lotSelectionne?.quantite_disponible || 0)}
                      className="text-left p-4 border border-gray-200 -lg hover:border-green-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaUserMd className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="font-medium text-gray-900">
                        {pharmacien.nom_entite}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {pharmacien.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        Matricule: {pharmacien.matricule}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 3: Vérification */}
            {etape === 'verification' && (
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <FaCheckCircle className="mr-2 h-5 w-5 text-yellow-600" />
                  Vérification des données de distribution
                </h2>

                <div className="bg-gray-50 -lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Médicament</p>
                      <p className="font-medium">{lotSelectionne?.lot?.medicament?.nom}</p>
                      <p className="text-sm text-gray-600">
                        Lot N° {lotSelectionne?.lot?.numero_lot}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantité à distribuer</p>
                      <p className="font-medium text-lg text-green-600">{quantite} unités</p>
                      <p className="text-xs text-gray-500">
                        Sur {lotSelectionne?.quantite_disponible} disponibles
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pharmacie destinataire</p>
                      <p className="font-medium">{pharmacienSelectionne?.nom_entite}</p>
                      <p className="text-sm text-gray-600">{pharmacienSelectionne?.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Distributeur</p>
                      <p className="font-medium">{user?.nom_entite}</p>
                      <p className="text-sm text-gray-600">Lot réceptionné et vérifié</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      className="block w-full  border-b p-3  border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Ajouter un commentaire..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleValiderDistribution}
                      disabled={processing}
                      className="flex-1 inline-flex justify-center items-center -md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing ? (
                        'Distribution en cours...'
                      ) : (
                        <>
                          <FaCheckCircle className="mr-2 h-4 w-4" />
                          Valider la distribution
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setEtape('pharmacien')}
                      className="flex-1 inline-flex justify-center items-center -md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      <FaTimesCircle className="mr-2 h-4 w-4" />
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Succès */}
            {etape === 'succes' && (
              <div className="text-center py-8">
                <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-xl font-medium text-gray-900">
                  Distribution effectuée avec succès !
                </h2>
                <p className="mt-2 text-gray-500">
                  {quantite} unités du lot {lotSelectionne?.lot?.numero_lot} ont été distribuées à {pharmacienSelectionne?.nom_entite}
                </p>
                <p className="text-sm text-gray-400">
                  Lot: {lotSelectionne?.lot?.medicament?.nom}
                </p>
                <button
                  onClick={reinitialiser}
                  className="mt-6 inline-flex items-center -md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Nouvelle distribution
                </button>
              </div>
            )}

            {/* Erreur */}
            {etape === 'erreur' && (
              <div className="text-center py-8">
                <FaTimesCircle className="mx-auto h-16 w-16 text-red-500" />
                <h2 className="mt-4 text-xl font-medium text-gray-900">
                  Erreur lors de la distribution
                </h2>
                <p className="mt-2 text-red-600">
                  {erreurMessage}
                </p>
                <div className="mt-6 space-x-3">
                  <button
                    onClick={() => setEtape('verification')}
                    className="inline-flex items-center -md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={reinitialiser}
                    className="inline-flex items-center -md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Historique des distributions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaHistory className="mr-2 h-5 w-5 text-gray-600" />
          Historique des distributions aux pharmacies
        </h2>
        
        <div className="bg-white -lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Médicament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pharmacie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historique.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FaHistory className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      Aucune distribution effectuée
                    </td>
                  </tr>
                ) : (
                  historique.map((transfert) => (
                    <tr key={transfert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transfert.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {transfert.lot?.numero_lot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfert.lot?.medicament?.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transfert.quantite} unités
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUserMd className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-900">
                            {transfert.destination?.nom_entite || transfert.destination?.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6  py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                        <span title={transfert.hash_mouvement}>
                          {transfert.hash_mouvement?.substring(0, 16)}...
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}