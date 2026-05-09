

// app/verify/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server';
import { blockchainService } from '@/lib/blockchain';
import { initBlockchainContract } from '@/lib/blockchain-init';
import { generateLotHash, createMouvementHash } from '@/lib/utils/crypto';

export async function verifyLotAuthenticity(lotNumber: string) {
  const supabase = await createClient();
  const searchTerm = lotNumber.trim();

  try {
    console.log('🔍 Vérification du lot:', searchTerm);

    // 1. RECHERCHER LE LOT DANS LA DB
    const { data: lots, error } = await supabase
      .from('lots')
      .select(`
        *,
        medicament:medicament_id (nom, code_cis)
      `)
      .or(`numero_lot.eq.${searchTerm},blockchain_lot_id.eq.${searchTerm}`)
      .limit(1);

    if (error || !lots || lots.length === 0) {
      return {
        found: false,
        verified: false,
        integrity: null,
        error: `Lot "${searchTerm}" introuvable dans la base de données`,
        lot: null,
        modifications: [],
        blockchainMouvements: [],
        hashComparison: null
      };
    }

    const lot = lots[0];
    console.log('✅ Lot trouvé en DB:', lot.numero_lot);

    // 2. RECALCULER LE HASH DU LOT AVEC LES DONNÉES ACTUELLES DE LA DB
    const recalculatedHash = generateLotHash({
      medicament_id: lot.medicament_id,
      numero_lot: lot.numero_lot,
      code_unique: lot.code_unique,
      date_fabrication: lot.date_fabrication,
      date_expiration: lot.date_expiration,
      quantite_totale: lot.quantite_totale,
    });

    console.log('🔐 Hash lot recalculé:', recalculatedHash.substring(0, 40) + '...');
    console.log('🔐 Hash lot stocké DB:', lot.hash_lot?.substring(0, 40) + '...');
    console.log('🔐 Match hash lot:', recalculatedHash === lot.hash_lot ? '✅ OUI' : '❌ NON - MODIFIÉ');

    // 3. RÉCUPÉRER LE FABRICANT
    const { data: premierMouvement } = await supabase
      .from('mouvements')
      .select('source_id')
      .eq('lot_id', lot.id)
      .eq('type_mouvement', 'creation_lot')
      .single();

    let fabricantNom = 'Inconnu';
    if (premierMouvement?.source_id) {
      const { data: fabricant } = await supabase
        .from('users')
        .select('nom_entite, username')
        .eq('id', premierMouvement.source_id)
        .single();
      
      if (fabricant) {
        fabricantNom = fabricant.nom_entite || fabricant.username;
      }
    }

    // 4. VÉRIFIER SI LE LOT EST SUR LA BLOCKCHAIN
    if (!lot.blockchain_lot_id) {
      return {
        found: true,
        verified: false,
        integrity: null,
        error: 'Ce lot existe en base de données mais n\'est pas enregistré sur la blockchain',
        lot: {
          numero_lot: lot.numero_lot,
          medicament_nom: lot.medicament?.nom || 'Inconnu',
          medicament_code: lot.medicament?.code_cis,
          date_fabrication: lot.date_fabrication,
          date_expiration: lot.date_expiration,
          fabricant: fabricantNom,
          blockchain_lot_id: null,
          quantite: lot.quantite_totale,
        },
        modifications: [],
        blockchainMouvements: [],
        hashComparison: null
      };
    }

    // 5. CONNEXION À LA BLOCKCHAIN
    const isContractReady = await initBlockchainContract();

    if (!isContractReady) {
      return {
        found: true,
        verified: false,
        integrity: null,
        error: 'Blockchain non disponible. Vérifiez que Ganache est lancé.',
        lot: {
          numero_lot: lot.numero_lot,
          medicament_nom: lot.medicament?.nom || 'Inconnu',
          medicament_code: lot.medicament?.code_cis,
          date_fabrication: lot.date_fabrication,
          date_expiration: lot.date_expiration,
          fabricant: fabricantNom,
          blockchain_lot_id: lot.blockchain_lot_id,
          quantite: lot.quantite_totale,
        },
        modifications: [],
        blockchainMouvements: [],
        hashComparison: null
      };
    }

    // 6. RÉCUPÉRER LES DONNÉES ORIGINALES DU LOT DEPUIS LA BLOCKCHAIN
    let blockchainLotData;
    try {
      blockchainLotData = await blockchainService.getLotFromBlockchain(lot.blockchain_lot_id);
      
      if (!blockchainLotData || !blockchainLotData.exists) {
        return {
          found: true,
          verified: false,
          integrity: false,
          error: 'Lot introuvable sur la blockchain. Possible falsification.',
          lot: {
            numero_lot: lot.numero_lot,
            medicament_nom: lot.medicament?.nom || 'Inconnu',
            medicament_code: lot.medicament?.code_cis,
            date_fabrication: lot.date_fabrication,
            date_expiration: lot.date_expiration,
            fabricant: fabricantNom,
            blockchain_lot_id: lot.blockchain_lot_id,
            quantite: lot.quantite_totale,
          },
          modifications: ['Lot introuvable sur la blockchain'],
          blockchainMouvements: [],
          hashComparison: null
        };
      }
    } catch (error) {
      console.error('❌ Erreur lecture blockchain:', error);
      return {
        found: true,
        verified: false,
        integrity: null,
        error: 'Erreur lors de la lecture de la blockchain',
        lot: {
          numero_lot: lot.numero_lot,
          medicament_nom: lot.medicament?.nom || 'Inconnu',
          medicament_code: lot.medicament?.code_cis,
          date_fabrication: lot.date_fabrication,
          date_expiration: lot.date_expiration,
          fabricant: fabricantNom,
          blockchain_lot_id: lot.blockchain_lot_id,
          quantite: lot.quantite_totale,
        },
        modifications: [],
        blockchainMouvements: [],
        hashComparison: null
      };
    }

    // 7. COMPARER LES HASHES DU LOT
    const lotHashMatch = recalculatedHash === blockchainLotData.hashLot;
    const dbHashIntegrity = recalculatedHash === lot.hash_lot;

    console.log('🔐 Comparaison hash lot:');
    console.log('   Hash recalculé DB:', recalculatedHash.substring(0, 40) + '...');
    console.log('   Hash stocké DB:   ', lot.hash_lot?.substring(0, 40) + '...');
    console.log('   Hash blockchain:  ', blockchainLotData.hashLot?.substring(0, 40) + '...');
    console.log('   DB Hash intact:   ', dbHashIntegrity ? '✅' : '❌');
    console.log('   Match BC:         ', lotHashMatch ? '✅' : '❌');

    // 8. DÉTECTER CE QUI A ÉTÉ MODIFIÉ DANS LE LOT
    const modifications: string[] = [];
    
    if (!dbHashIntegrity) {
      modifications.push('Hash du lot modifié dans la base de données');
    }
    
    if (!lotHashMatch && blockchainLotData) {
      if (blockchainLotData.numeroLot && lot.numero_lot !== blockchainLotData.numeroLot) {
        modifications.push(`Numéro de lot: "${blockchainLotData.numeroLot}" → "${lot.numero_lot}"`);
      }
      
      if (blockchainLotData.codeUnique && lot.code_unique !== blockchainLotData.codeUnique) {
        modifications.push(`Code unique modifié`);
      }
      
      if (blockchainLotData.medicamentCode && lot.medicament?.code_cis !== blockchainLotData.medicamentCode) {
        modifications.push(`Code médicament: "${blockchainLotData.medicamentCode}" → "${lot.medicament?.code_cis}"`);
      }
      
      if (blockchainLotData.quantiteTotale !== undefined && lot.quantite_totale !== Number(blockchainLotData.quantiteTotale)) {
        modifications.push(`Quantité: ${blockchainLotData.quantiteTotale} → ${lot.quantite_totale}`);
      }
      
      if (blockchainLotData.dateFabrication) {
        const bcFabrication = new Date(Number(blockchainLotData.dateFabrication) * 1000).toISOString().split('T')[0];
        const dbFabrication = lot.date_fabrication.split('T')[0];
        if (dbFabrication !== bcFabrication) {
          modifications.push(`Date fabrication: ${bcFabrication} → ${dbFabrication}`);
        }
      }
      
      if (blockchainLotData.dateExpiration) {
        const bcExpiration = new Date(Number(blockchainLotData.dateExpiration) * 1000).toISOString().split('T')[0];
        const dbExpiration = lot.date_expiration.split('T')[0];
        if (dbExpiration !== bcExpiration) {
          modifications.push(`Date expiration: ${bcExpiration} → ${dbExpiration}`);
        }
      }
    }

    // 9. RÉCUPÉRER LES MOUVEMENTS DE LA DB
    const { data: dbMouvements } = await supabase
      .from('mouvements')
      .select('*')
      .eq('lot_id', lot.id)
      .order('created_at', { ascending: true });

    console.log(`📋 ${dbMouvements?.length || 0} mouvements trouvés en DB`);

    // 9.1 Récupérer les hashes des mouvements depuis la blockchain
    let blockchainMouvementHashes: string[] = [];
    try {
      blockchainMouvementHashes = await blockchainService.getMouvementHashes(lot.blockchain_lot_id);
      console.log(`🔗 ${blockchainMouvementHashes.length} hashes de mouvements sur la blockchain`);
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les hashes des mouvements on-chain');
    }

    // 9.2 Récupérer les données complètes des mouvements depuis la blockchain
    let blockchainMouvementsData: any[] = [];
    try {
      blockchainMouvementsData = await blockchainService.getMouvementsFromBlockchain(
        lot.blockchain_lot_id
      );
      console.log(`📦 ${blockchainMouvementsData.length} mouvements complets récupérés de la blockchain`);
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les données complètes des mouvements de la blockchain');
    }

    // 9.3 Recalculer et comparer chaque mouvement
    const mouvementsComparison = (dbMouvements || []).map((dbMvt, index) => {
      const blockchainMvt = index < blockchainMouvementsData.length 
        ? blockchainMouvementsData[index] 
        : null;

      console.log(`🔍 DONNÉES BRUTES DU MOUVEMENT DB #${index + 1}:`);
      console.log('   lot_id:', dbMvt.lot_id, typeof dbMvt.lot_id);
      console.log('   type_mouvement:', dbMvt.type_mouvement);
      console.log('   quantite:', dbMvt.quantite);
      console.log('   source_id:', dbMvt.source_id);
      console.log('   destination_id:', dbMvt.destination_id);
      console.log('   commentaire:', dbMvt.commentaire);
      console.log('   created_by:', dbMvt.created_by);
      console.log('   created_at:', dbMvt.created_at);

      // =============================================
      // DÉTERMINER LE TYPE ET EXTRAIRE LA RAISON
      // =============================================
      let hashType = dbMvt.type_mouvement;
      let raison = null;

      // Cas reception_rejet : détecté par le commentaire
      if (dbMvt.type_mouvement === 'reception' && dbMvt.commentaire?.includes('REJETÉ')) {
        hashType = 'reception_rejet';
        const match = dbMvt.commentaire.match(/REJETÉ:\s*(.+?)\s*\(Transfert/);
        if (match) {
          raison = match[1];
        }
      }

      // Cas retrait_defectueux : extraire la raison du commentaire
      if (dbMvt.type_mouvement === 'retrait_defectueux' && dbMvt.commentaire) {
        const match = dbMvt.commentaire.match(/Retrait lot défectueux - (.+?)\. Lot #/);
        if (match) {
          raison = match[1];
        }
      }

      // =============================================
      // RECALCULER LE HASH
      // =============================================
      const recalculatedHash = createMouvementHash({
        lot_id: dbMvt.lot_id,
        type: hashType,
        quantite: dbMvt.quantite,
        source_id: dbMvt.source_id,
        destination_id: dbMvt.destination_id,
        raison: raison,
        commentaire: dbMvt.commentaire,
        transfert_id: null,
      });

      // Vérifier l'intégrité du hash DB
      const hashDbIntact = dbMvt.hash_mouvement === recalculatedHash;
      
      // Vérifier la correspondance avec la blockchain
      let match: boolean | null = null;
      let existsOnBlockchain = false;
      
      if (blockchainMvt) {
        existsOnBlockchain = true;
        const blockchainHash = String(blockchainMvt.hash_mouvement).trim().toLowerCase();
        const recalculatedHashNormalized = recalculatedHash.trim().toLowerCase();
        
        match = hashDbIntact && (blockchainHash === recalculatedHashNormalized);
      } else if (blockchainMouvementHashes.length > 0) {
        existsOnBlockchain = blockchainMouvementHashes.includes(recalculatedHash);
        match = hashDbIntact && existsOnBlockchain;
      } else {
        match = null;
      }

      console.log(`🔍 Mouvement #${index + 1} (${hashType}):`);
      console.log(`   Hash DB stocké:    ${dbMvt.hash_mouvement?.substring(0, 40)}...`);
      console.log(`   Hash recalculé:    ${recalculatedHash.substring(0, 40)}...`);
      if (blockchainMvt) {
        console.log(`   Hash blockchain:   ${String(blockchainMvt.hash_mouvement).substring(0, 40)}...`);
      }
      console.log(`   Hash DB intact:    ${hashDbIntact ? '✅' : '❌ MODIFIÉ'}`);
      console.log(`   Existe sur BC:     ${existsOnBlockchain ? '✅' : '❌'}`);
      console.log(`   Match final:       ${match === true ? '✅ INTACT' : match === false ? '❌ ALTÉRÉ' : '— Non vérifié'}`);

      return {
        type: dbMvt.type_mouvement,
        date: dbMvt.created_at,
        quantite: dbMvt.quantite,
        commentaire: dbMvt.commentaire,
        source_id: dbMvt.source_id,
        destination_id: dbMvt.destination_id,
        raison: raison,
        db_hash: dbMvt.hash_mouvement,
        db_hash_recalculated: recalculatedHash,
        blockchain_hash: blockchainMvt?.hash_mouvement || null,
        hash_db_intact: hashDbIntact,
        match: match,
        exists_on_blockchain: existsOnBlockchain,
        blockchain_data: blockchainMvt
      };
    });

    // 9.4 Vérifier les mouvements supprimés
    const dbHashes = new Set(mouvementsComparison.map(m => m.db_hash_recalculated));
    const dbStoredHashes = new Set(mouvementsComparison.map(m => m.db_hash));
    const missingMovements = blockchainMouvementHashes.filter(hash => 
      !dbHashes.has(hash) && !dbStoredHashes.has(hash)
    );

    console.log(`🔍 Mouvements manquants en DB: ${missingMovements.length}`);

    // 10. DÉTECTER LES MOUVEMENTS MODIFIÉS AVEC DÉTAILS
    mouvementsComparison.forEach((m, index) => {
      if (m.match === false && m.blockchain_data) {
        const bc = m.blockchain_data;
        
        // Type de mouvement
        if (bc.type_mouvement && m.type !== bc.type_mouvement) {
          modifications.push(`Mouvement #${index + 1}: type "${bc.type_mouvement}" → "${m.type}"`);
        }
        
        // Quantité
        if (bc.quantite !== undefined && m.quantite !== Number(bc.quantite)) {
          modifications.push(`Mouvement #${index + 1}: quantité ${bc.quantite} → ${m.quantite}`);
        }
        
        // Source
        if (bc.emetteur && m.source_id && m.source_id !== bc.emetteur) {
          modifications.push(`Mouvement #${index + 1}: émetteur modifié`);
        }
        
        // Date (seulement si le hash est déjà corrompu)
        if (bc.timestamp && !m.hash_db_intact) {
          const bcDate = new Date(Number(bc.timestamp) * 1000);
          const dbDate = new Date(m.date);
          if (Math.abs(bcDate.getTime() - dbDate.getTime()) > 120000) {
            modifications.push(`Mouvement #${index + 1}: date modifiée (${bcDate.toLocaleString('fr-FR')} → ${dbDate.toLocaleString('fr-FR')})`);
          }
        }
        
        // Commentaire
        if (bc.commentaire && m.commentaire !== bc.commentaire) {
          modifications.push(`Mouvement #${index + 1}: commentaire modifié`);
        }
        
        // Si le hash est modifié mais aucun champ spécifique détecté
        if (!m.hash_db_intact && modifications.filter(mod => mod.includes(`Mouvement #${index + 1}`)).length === 0) {
          modifications.push(`Mouvement #${index + 1} (${m.type}): données modifiées (hash incohérent)`);
        }
      } else if (m.match === false && !m.blockchain_data) {
        if (!m.hash_db_intact) {
          modifications.push(`Mouvement #${index + 1} (${m.type}): données modifiées dans la base`);
        }
        if (!m.exists_on_blockchain) {
          modifications.push(`Mouvement #${index + 1} (${m.type}): absent de la blockchain`);
        }
      }
    });

    // Ajouter les mouvements supprimés
    if (missingMovements.length > 0) {
      modifications.push(`${missingMovements.length} mouvement(s) supprimé(s) de la base de données`);
    }

    // 11. DÉTERMINER L'INTÉGRITÉ GLOBALE
    const allMouvementsMatch = mouvementsComparison
      .filter(m => m.match !== null)
      .every(m => m.match === true);
    
    const noMissingMovements = missingMovements.length === 0;
    const integrity = lotHashMatch && dbHashIntegrity && allMouvementsMatch && noMissingMovements;

    console.log('📊 RÉSULTAT FINAL:');
    console.log(`   Hash lot match BC:     ${lotHashMatch ? '✅' : '❌'}`);
    console.log(`   Hash DB intact:        ${dbHashIntegrity ? '✅' : '❌'}`);
    console.log(`   Tous mouvements OK:    ${allMouvementsMatch ? '✅' : '❌'}`);
    console.log(`   Aucun mvts manquant:   ${noMissingMovements ? '✅' : '❌'}`);
    console.log(`   INTÉGRITÉ GLOBALE:     ${integrity ? '✅ AUTHENTIQUE' : '❌ ALTÉRÉ'}`);

    // 12. CONSTRUIRE LA RÉPONSE
    return {
      found: true,
      verified: true,
      integrity: integrity,
      modifications: modifications,
      blockchainMouvements: blockchainMouvementsData,
      error: integrity 
        ? null 
        : 'Incohérence détectée entre la base de données et la blockchain',
      lot: {
        numero_lot: lot.numero_lot,
        medicament_nom: lot.medicament?.nom || 'Inconnu',
        medicament_code: lot.medicament?.code_cis,
        date_fabrication: lot.date_fabrication,
        date_expiration: lot.date_expiration,
        fabricant: fabricantNom,
        blockchain_lot_id: lot.blockchain_lot_id,
        quantite: lot.quantite_totale,
      },
      hashComparison: {
        lot: {
          db_hash: lot.hash_lot,
          db_hash_recalculated: recalculatedHash,
          blockchain_hash: blockchainLotData.hashLot,
          match: lotHashMatch,
          db_hash_intact: dbHashIntegrity,
        },
        mouvements: mouvementsComparison,
        missing_movements: missingMovements,
      }
    };

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return {
      found: false,
      verified: false,
      integrity: null,
      error: 'Erreur technique lors de la vérification',
      lot: null,
      modifications: [],
      blockchainMouvements: [],
      hashComparison: null
    };
  }
}