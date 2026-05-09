
// app/verify/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaSearch, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSpinner,
  FaPills,
  FaCalendar,
  FaBarcode,
  FaIndustry,
  FaCube,
  FaClock,
  FaExchangeAlt,
  FaBox,
  FaTimesCircle,
  FaQuestionCircle,
  FaPen
} from 'react-icons/fa';
import { verifyLotAuthenticity } from './actions';

export default function VerifyPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [lotNumber, setLotNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotNumber.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const res = await verifyLotAuthenticity(lotNumber.trim());
      setResult(res);
    } catch (error) {
      setResult({
        found: false,
        verified: false,
        integrity: null,
        error: 'Erreur lors de la vérification',
        lot: null
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Extraire les modifications du lot uniquement (pas les mouvements)
  const lotModifications = result?.modifications?.filter((m: string) => 
    !m.toLowerCase().includes('mouvement #')
  ) || [];

  // Extraire les modifications des mouvements
  const mouvementModifications = result?.modifications?.filter((m: string) => 
    m.toLowerCase().includes('mouvement #')
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4">
            <FaShieldAlt className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            Vérifier l'authenticité d'un lot
          </h1>
          <p className="text-sm text-gray-500">
            Comparaison des hashs entre la base de données et la blockchain
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleVerify} className="mb-10">
          <div className="flex gap-2">
            <input
              type="text"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              placeholder="Numéro de lot (ex: LOT-2605-2H28)"
              className="flex-1 px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={verifying || !lotNumber.trim()}
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {verifying ? (
                <FaSpinner className="animate-spin h-4 w-4" />
              ) : (
                <FaSearch className="h-4 w-4" />
              )}
              Vérifier
            </button>
          </div>
        </form>

        {/* Résultat */}
        {result && (
          <div>
            {/* Cas 1 : Lot introuvable en DB */}
            {!result.found && (
              <div className="border border-gray-200 bg-gray-50 p-8 text-center">
                <FaQuestionCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h2 className="text-lg font-medium text-gray-700 mb-1">Lot introuvable</h2>
                <p className="text-sm text-gray-500">{result.error}</p>
              </div>
            )}

            {/* Cas 2 : Lot trouvé mais pas sur blockchain */}
            {result.found && !result.verified && result.integrity === null && (
              <div className="border border-amber-200 bg-amber-50 p-8 text-center">
                <FaExclamationTriangle className="mx-auto h-10 w-10 text-amber-500 mb-3" />
                <h2 className="text-lg font-medium text-amber-800 mb-1">Vérification incomplète</h2>
                <p className="text-sm text-amber-600">{result.error}</p>
                
                {result.lot && (
                  <div className="border-t border-amber-200 pt-4 mt-4 text-left">
                    <InfoLot lot={result.lot} lotModifications={[]} />
                  </div>
                )}
              </div>
            )}

            {/* Cas 3 : Lot intègre */}
            {result.found && result.verified && result.integrity === true && (
              <div className="border border-emerald-200 bg-emerald-50 p-8">
                <div className="text-center mb-6">
                  <FaCheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                  <h2 className="text-xl font-medium text-emerald-800 mb-1">Lot authentique ✓</h2>
                  <p className="text-sm text-emerald-600">Tous les hashs correspondent. Aucune altération.</p>
                </div>

                {result.lot && <InfoLot lot={result.lot} lotModifications={[]} />}

                {result.hashComparison?.mouvements && (
                  <InfoMouvements 
                    mouvements={result.hashComparison.mouvements}
                    modifications={mouvementModifications}
                    blockchainMouvements={result.blockchainMouvements || []}
                  />
                )}

                <HashComparison comparison={result.hashComparison} />
              </div>
            )}

            {/* Cas 4 : Lot altéré */}
            {result.found && result.verified && result.integrity === false && (
              <div className="border border-red-200 bg-red-50 p-8">
                <div className="text-center mb-6">
                  <FaTimesCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                  <h2 className="text-xl font-medium text-red-800 mb-1">⚠️ Lot altéré</h2>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>

                {/* Afficher uniquement les modifications du LOT en haut */}
                {lotModifications.length > 0 && (
                  <div className="bg-white border border-red-200 p-4 mb-4">
                    <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                      <FaPen className="h-3 w-3" />
                      Modifications détectées sur le lot :
                    </h3>
                    <ul className="space-y-2">
                      {lotModifications.map((modif: string, i: number) => (
                        <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                          <FaExclamationTriangle className="h-3 w-3 flex-shrink-0 mt-1" />
                          <span>{modif}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.lot && (
                  <InfoLot lot={result.lot} lotModifications={lotModifications} />
                )}

                {/* Les modifications de mouvements s'affichent dans InfoMouvements */}
                {result.hashComparison?.mouvements && (
                  <InfoMouvements 
                    mouvements={result.hashComparison.mouvements}
                    modifications={mouvementModifications}
                    blockchainMouvements={result.blockchainMouvements || []}
                  />
                )}

                <HashComparison comparison={result.hashComparison} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// COMPOSANT INFOLOT
// =============================================
function InfoLot({ lot, lotModifications }: { lot: any; lotModifications: string[] }) {
  const isModified = (fieldPattern: string) => {
    return lotModifications.some(m => m.toLowerCase().includes(fieldPattern.toLowerCase()));
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <FaBarcode className="h-4 w-4 text-gray-400 flex-shrink-0" />
        {isModified('numéro de lot') || isModified('numero de lot') ? (
          <span className="font-mono text-red-600 line-through">{lot.numero_lot}</span>
        ) : (
          <span className="font-mono text-gray-700">{lot.numero_lot}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <FaPills className="h-4 w-4 text-gray-400 flex-shrink-0" />
        {isModified('médicament') || isModified('code médicament') ? (
          <div>
            <span className="text-red-600 line-through">{lot.medicament_nom}</span>
            {lot.medicament_code && (
              <span className="text-red-500 text-xs ml-1 line-through">({lot.medicament_code})</span>
            )}
          </div>
        ) : (
          <div>
            <span className="text-gray-900">{lot.medicament_nom}</span>
            {lot.medicament_code && (
              <span className="text-gray-500 text-xs ml-1">({lot.medicament_code})</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <FaIndustry className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="text-gray-700">{lot.fabricant}</span>
      </div>

      <div className="flex items-center gap-2">
        <FaBox className="h-4 w-4 text-gray-400 flex-shrink-0" />
        {isModified('quantité') || isModified('quantite') ? (
          <span className="text-red-600 line-through">{lot.quantite} unités</span>
        ) : (
          <span className="text-gray-700">{lot.quantite} unités</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <FaCalendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
        {isModified('expiration') ? (
          <span className="text-red-600 line-through">
            Exp: {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
          </span>
        ) : (
          <span className="text-gray-700">
            Exp: {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>

      {lot.date_fabrication && (
        <div className="flex items-center gap-2">
          <FaCalendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {isModified('fabrication') ? (
            <span className="text-red-600 line-through">
              Fab: {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
            </span>
          ) : (
            <span className="text-gray-700">
              Fab: {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}

      {lot.blockchain_lot_id && (
        <div className="flex items-center gap-2">
          <FaCube className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <span className="font-mono text-purple-600">#{lot.blockchain_lot_id}</span>
        </div>
      )}
    </div>
  );
}

// =============================================
// COMPOSANT INFOMOUVEMENTS
// =============================================
function InfoMouvements({ 
  mouvements, 
  modifications,
  blockchainMouvements = []
}: { 
  mouvements: any[]; 
  modifications: string[];
  blockchainMouvements?: any[];
}) {
  if (!mouvements || mouvements.length === 0) return null;

  const isMouvementModified = (index: number) => {
    return modifications.some(m => m.toLowerCase().includes(`mouvement #${index + 1}`));
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <FaExchangeAlt className="h-4 w-4" />
        Mouvements ({mouvements.length})
      </h3>
      
      <div className="space-y-2">
        {mouvements.map((mouvement: any, index: number) => {
          const isModified = isMouvementModified(index);
          const hashModified = !mouvement.hash_db_intact;
          const changes = findMouvementChanges(mouvement, blockchainMouvements[index]);
          
          return (
            <div 
              key={index}
              className={`p-4 border rounded-lg transition-all ${
                isModified || hashModified 
                  ? 'bg-red-50 border-red-300 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* En-tête */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    ${mouvement.type === 'creation_lot' ? 'bg-blue-100 text-blue-800' :
                      mouvement.type === 'transfert' ? 'bg-purple-100 text-purple-800' :
                      mouvement.type === 'reception' ? 'bg-teal-100 text-teal-800' :
                      mouvement.type === 'distribution' ? 'bg-green-100 text-green-800' :
                      mouvement.type === 'retrait_defectueux' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {mouvement.type.replace(/_/g, ' ')}
                  </span>
                  
                  {(isModified || hashModified) && (
                    <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {(isModified || hashModified) ? (
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      ⚠️ Altéré
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      ✓ Intact
                    </span>
                  )}
                </div>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <FaClock className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Date</div>
                    <span className="text-sm text-gray-700">
                      {new Date(mouvement.date).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaBox className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Quantité</div>
                    <span className="text-sm font-medium text-gray-900">
                      {mouvement.quantite} unités
                    </span>
                  </div>
                </div>

                {mouvement.commentaire && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-400 mb-1">Commentaire</div>
                    <div className="text-sm p-2 rounded bg-gray-50 text-gray-600">
                      {mouvement.commentaire}
                    </div>
                  </div>
                )}
              </div>

              {/* Détails des modifications (seulement si modifié) */}
              {changes.length > 0 && (
                <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div className="text-xs font-medium text-red-800 mb-2">
                    🔍 Modifications détectées :
                  </div>
                  <ul className="space-y-1">
                    {changes.map((change, ci) => (
                      <li key={ci} className="text-xs text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hashs */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2">🔐 Vérification des hashs</div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-24 flex-shrink-0">DB (stocké):</span>
                    <code className={`text-xs break-all ${hashModified ? 'text-red-600 line-through bg-red-50 px-1 rounded' : 'text-gray-500'}`}>
                      {mouvement.db_hash?.substring(0, 40)}...
                    </code>
                  </div>
                  
                  {hashModified && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-400 w-24 flex-shrink-0">DB (recalculé):</span>
                      <code className="text-xs text-orange-600 break-all bg-orange-50 px-1 rounded">
                        {mouvement.db_hash_recalculated?.substring(0, 40)}...
                      </code>
                    </div>
                  )}
                  
                  {mouvement.blockchain_hash && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-400 w-24 flex-shrink-0">Blockchain:</span>
                      <code className="text-xs text-purple-600 break-all bg-purple-50 px-1 rounded">
                        {mouvement.blockchain_hash?.substring(0, 40)}...
                      </code>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Statut:</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      mouvement.match === true ? 'bg-emerald-100 text-emerald-700' :
                      mouvement.match === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {mouvement.match === true ? '✓ Vérifié' : mouvement.match === false ? '✗ Altéré' : '— N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================
// FONCTION FINDMOUVEMENTCHANGES
// =============================================
function findMouvementChanges(dbMouvement: any, blockchainMouvement?: any): string[] {
  const changes: string[] = [];
  
  if (!blockchainMouvement) {
    if (!dbMouvement.hash_db_intact) {
      changes.push('Données modifiées (hash incohérent)');
    }
    return changes;
  }

  // Quantité
  if (blockchainMouvement.quantite !== undefined && 
      dbMouvement.quantite !== Number(blockchainMouvement.quantite)) {
    changes.push(`Quantité: ${blockchainMouvement.quantite} → ${dbMouvement.quantite}`);
  }

  // Type de mouvement
  if (blockchainMouvement.type_mouvement && 
      dbMouvement.type !== blockchainMouvement.type_mouvement) {
    changes.push(`Type: "${blockchainMouvement.type_mouvement}" → "${dbMouvement.type}"`);
  }

  // Source
  if (blockchainMouvement.source_id && 
      String(dbMouvement.source_id) !== String(blockchainMouvement.source_id)) {
    changes.push(`Source modifiée`);
  }

  // Destination
  if (blockchainMouvement.destination_id && 
      String(dbMouvement.destination_id) !== String(blockchainMouvement.destination_id)) {
    changes.push(`Destination modifiée`);
  }

  // Date (tolérance 2h pour fuseau horaire)
  if (blockchainMouvement.timestamp && dbMouvement.date) {
    const bcDate = new Date(Number(blockchainMouvement.timestamp) * 1000);
    const dbDate = new Date(dbMouvement.date);
    const diffMs = Math.abs(bcDate.getTime() - dbDate.getTime());
    
    if (diffMs > 7200000) {
      changes.push(`Date: ${bcDate.toLocaleString('fr-FR')} → ${dbDate.toLocaleString('fr-FR')}`);
    }
  }

  // Si le hash est modifié mais aucun changement spécifique trouvé
  if (!dbMouvement.hash_db_intact && changes.length === 0) {
    changes.push('Hash modifié (champ non identifié)');
  }

  return changes;
}

// =============================================
// COMPOSANT HASHCOMPARISON
// =============================================
function HashComparison({ comparison }: { comparison: any }) {
  if (!comparison) return null;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Comparaison des hashs</h3>
      
      <div className={`p-3 mb-3 border ${comparison.lot.match ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">HASH DU LOT</span>
          {comparison.lot.match ? (
            <span className="text-xs text-emerald-600 font-medium">✓ OK</span>
          ) : (
            <span className="text-xs text-red-600 font-medium">✗ MODIFIÉ</span>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-xs font-mono">
            <span className="text-gray-400">DB: </span>
            <span className={comparison.lot.match ? 'text-gray-600' : 'text-red-600 line-through'}>
              {comparison.lot.db_hash?.substring(0, 40)}...
            </span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-gray-400">BC: </span>
            <span className="text-purple-600">
              {comparison.lot.blockchain_hash?.substring(0, 40)}...
            </span>
          </div>
        </div>
      </div>

      {comparison.mouvements?.map((m: any, i: number) => (
        <div key={i} className={`p-3 mb-2 border ${
          m.match === true ? 'bg-white border-gray-200' : 
          m.match === false ? 'bg-red-50 border-red-200' : 
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Mouvement #{i + 1} - {m.type}</span>
            {m.match === true && <span className="text-xs text-emerald-600">✓ OK</span>}
            {m.match === false && <span className="text-xs text-red-600 font-medium">✗ ALTÉRÉ</span>}
            {m.match === null && <span className="text-xs text-gray-400">— non vérifié</span>}
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            <div>
              <span className="text-gray-400">DB: </span>
              <span className={m.match === false ? 'text-red-600 line-through' : 'text-gray-500'}>
                {m.db_hash?.substring(0, 40)}...
              </span>
            </div>
            {m.blockchain_hash && (
              <div>
                <span className="text-gray-400">BC: </span>
                <span className="text-purple-600">{m.blockchain_hash?.substring(0, 40)}...</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}