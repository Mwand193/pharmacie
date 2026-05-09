
'use server';

import { createClient } from '@/lib/supabase/server';
import { generateMouvementHash } from '@/lib/utils/crypto';
import { revalidatePath } from 'next/cache';
import { blockchainService } from '@/lib/blockchain';
import { initBlockchainContract } from '@/lib/blockchain-init';
import type { Mouvement } from '@/types';
import Web3 from 'web3';

export async function getMouvements() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (
        *,
        medicament:medicament_id (*)
      ),
      source:source_id (
        id, matricule, username, nom_entite, role
      ),
      destination:destination_id (
        id, matricule, username, nom_entite, role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const mouvementsWithBlockchain = await Promise.all(
    data.map(async (mouvement) => {
      const hasBlockchain = mouvement.lot?.blockchain_lot_id ? true : false;
      const hasBlockchainTx = mouvement.transaction_hash ? true : false;
      
      // ✅ Récupérer le numéro de bloc si la transaction existe
      let blockNumber: number | null = null;
      
      if (hasBlockchainTx && mouvement.transaction_hash) {
        try {
          const web3 = new Web3(process.env.NEXT_PUBLIC_GANACHE_URL || 'http://127.0.0.1:7545');
          const tx = await web3.eth.getTransaction(mouvement.transaction_hash);
          if (tx && tx.blockNumber) {
            blockNumber = Number(tx.blockNumber);
          }
        } catch (error) {
          // Silencieux - le numéro de bloc n'est pas critique
        }
      }
      
      return {
        ...mouvement,
        _blockchain: {
          has_blockchain_lot: hasBlockchain,
          blockchain_lot_id: mouvement.lot?.blockchain_lot_id || null,
          has_transaction: hasBlockchainTx,
          transaction_hash: mouvement.transaction_hash || null,
          verified_on_blockchain: hasBlockchain && hasBlockchainTx,
          block_number: blockNumber, // ✅ Ajout du numéro de bloc
        }
      };
    })
  );
  
  return mouvementsWithBlockchain;
}

export async function createMouvement(data: {
  lot_id: number;
  type_mouvement: string;
  source_id?: number;
  destination_id?: number;
  quantite?: number;
  type_unite?: string;
  commentaire?: string;
  created_by: string;
}) {
  const supabase = await createClient();
  
  const hash_mouvement = generateMouvementHash({
  lot_id: data.lot_id,
  type: data.type_mouvement,
  source_id: data.source_id,
  destination_id: data.destination_id,
  quantite: data.quantite,
  commentaire: data.commentaire,
  created_by: data.created_by,
  timestamp: new Date().toISOString(),
});

  const { data: mouvement, error } = await supabase
    .from('mouvements')
    .insert([{
      ...data,
      hash_mouvement,
    }])
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/mouvements');
  return mouvement;
}

// ✅ Vérifier un mouvement sur la blockchain LOCALE (Ganache)
export async function verifyMouvementOnBlockchain(mouvementId: number) {
  const supabase = await createClient();
  
  // Récupérer le mouvement avec son lot
  const { data: mouvement, error } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id (
        id,
        blockchain_lot_id,
        transaction_hash
      )
    `)
    .eq('id', mouvementId)
    .single();
    
  if (error || !mouvement) {
    throw new Error('Mouvement non trouvé');
  }
  
  console.log('🔍 Vérification blockchain pour mouvement:', mouvementId);
  console.log('   Hash mouvement:', mouvement.hash_mouvement);
  console.log('   Blockchain Lot ID:', mouvement.lot?.blockchain_lot_id);
  
  try {
    // ✅ Initialiser la connexion à Ganache et le contrat
    const isContractReady = await initBlockchainContract();
    
    if (!isContractReady) {
      console.warn('⚠️ Contrat blockchain non disponible');
      return {
        mouvement_id: mouvementId,
        hash: mouvement.hash_mouvement,
        verified: false,
        blockchain_lot_id: mouvement.lot?.blockchain_lot_id || null,
        transaction_hash: mouvement.transaction_hash || null,
        block_number: null,
        error: 'Contrat blockchain non disponible. Vérifiez que Ganache est lancé.',
      };
    }
    
    // ✅ Vérifier le hash sur Ganache AVEC LES BONS PARAMÈTRES
    const hashExists = await blockchainService.verifyHashOnBlockchain(mouvement.hash_mouvement);
    
    console.log('   Résultat vérification:', hashExists ? '✅ Trouvé' : '❌ Non trouvé');
    console.log('   Hash recherché:', mouvement.hash_mouvement);
    
    // ✅ Récupérer le numéro de bloc si le hash existe
    let blockNumber: number | null = null;
    const transactionHash = mouvement.transaction_hash || null;
    
    if (hashExists && transactionHash) {
      try {
        const web3 = new Web3(process.env.NEXT_PUBLIC_GANACHE_URL || 'http://127.0.0.1:7545');
        const tx = await web3.eth.getTransaction(transactionHash);
        if (tx && tx.blockNumber) {
          blockNumber = Number(tx.blockNumber);
          console.log(`   📦 Bloc #${blockNumber}`);
        }
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer le numéro de bloc:', error);
      }
    }
    
    // Si le hash n'est pas trouvé directement, essayons de le vérifier via le lot
    if (!hashExists && mouvement.lot?.blockchain_lot_id) {
      console.log('   🔄 Tentative de vérification via le lot blockchain...');
      try {
        const lotVerified = await blockchainService.verifyLotOnBlockchain(
          parseInt(mouvement.lot.blockchain_lot_id)
        );
        console.log('   Lot vérifié:', lotVerified);
        
        if (lotVerified) {
          // ✅ Récupérer le bloc via la transaction du lot si disponible
          if (mouvement.lot?.transaction_hash) {
            try {
              const web3 = new Web3(process.env.NEXT_PUBLIC_GANACHE_URL || 'http://127.0.0.1:7545');
              const tx = await web3.eth.getTransaction(mouvement.lot.transaction_hash);
              if (tx && tx.blockNumber) {
                blockNumber = Number(tx.blockNumber);
                console.log(`   📦 Bloc #${blockNumber} (via lot parent)`);
              }
            } catch (error) {
              // Silencieux
            }
          }
          
          // Si le lot existe, le mouvement est considéré comme vérifié
          return {
            mouvement_id: mouvementId,
            hash: mouvement.hash_mouvement,
            verified: true,
            blockchain_lot_id: mouvement.lot.blockchain_lot_id,
            transaction_hash: transactionHash,
            verified_via_lot: true,
            block_number: blockNumber, // ✅ Ajout du numéro de bloc
          };
        }
      } catch (lotError) {
        console.error('   Erreur vérification lot:', lotError);
      }
    }
    
    return {
      mouvement_id: mouvementId,
      hash: mouvement.hash_mouvement,
      verified: hashExists,
      blockchain_lot_id: mouvement.lot?.blockchain_lot_id || null,
      transaction_hash: transactionHash,
      block_number: blockNumber, // ✅ Ajout du numéro de bloc
    };
  } catch (error: any) {
    console.error('❌ Erreur vérification blockchain:', error.message);
    return {
      mouvement_id: mouvementId,
      hash: mouvement.hash_mouvement,
      verified: false,
      blockchain_lot_id: mouvement.lot?.blockchain_lot_id || null,
      transaction_hash: mouvement.transaction_hash || null,
      block_number: null,
      error: error.message || 'Erreur de connexion à Ganache',
    };
  }
}