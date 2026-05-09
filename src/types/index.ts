

export interface Medicament {
  id: number;
  code_cis: string | null;
  nom: string;
  dosage: string | null;
  forme: string | null;
  type_unite: 'boite' | 'carton' | 'palette';
  description: string | null;
  image_base64: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Distributeur {
  id: number;
  type_acteur: 'fabricant' | 'grossiste' | 'pharmacie' | 'depot';
  nom: string;
  adresse: string | null;
  licence: string | null;
  created_at: string;
  updated_at: string;
}

// export interface Lot {
//   id: number;
//   medicament_id: number;
//   numero_lot: string;
//   created_by: string;
//   fabricant_id: number;
//   code_unique: string;
//   hash_lot: string;
//   qr_content: string | null;
//   date_fabrication: string;
//   date_expiration: string;
//   quantite_totale: number;
//   quantite_transferee: number;
//   quantite_restante: number;
//   created_at: string;
//   updated_at: string;
  
//   // Relations
//   medicament?: Medicament;
  
//   // Statut
//   statut?: 'disponible' | 'partiel' | 'epuise' | 'expire';
//   hasMovements?: boolean;
//   isDeletable?: boolean;
  
//   // ✅ Blockchain
//   blockchain_lot_id?: string | null;
//   transaction_hash?: string | null;
// }

export interface Lot {
  id: number;
  medicament_id: number;
  numero_lot: string;
  created_by: string;
  fabricant_id: number;
  code_unique: string;
  hash_lot: string;
  qr_content: string | null;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
  quantite_transferee?: number;  // Make optional
  quantite_restante?: number;    // Make optional
  created_at: string;
  updated_at: string;
  
  // Relations
  medicament?: Medicament;
  
  // Statut
  statut?: 'disponible' | 'partiel' | 'epuise' | 'expire';
  hasMovements?: boolean;
  isDeletable?: boolean;
  
  // ✅ Blockchain
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
}

export interface Stock {
  id: number;
  lot_id: number;
  distributeur_id: number;
  quantite: number;
  type_unite: 'boite' | 'carton' | 'palette';
  coefficient: number;
  statut: 'disponible' | 'reserve' | 'vendu' | 'detruit';
  created_at: string;
  updated_at: string;
  lot?: Lot;
  distributeur?: Distributeur;
  
  // ✅ Blockchain
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
}

export interface Mouvement {
  id: number;
  lot_id: number;
  type_mouvement: string;
  source_id?: number;
  destination_id?: number;
  quantite?: number;
  type_unite?: string;
  statut_avant?: string;
  statut_apres?: string;
  commentaire?: string;
  hash_mouvement: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  lot?: Lot;
  source?: {
    id: string;
    matricule: string;
    username: string;
    nom_entite: string;
    role: string;
  };
  destination?: {
    id: string;
    matricule: string;
    username: string;
    nom_entite: string;
    role: string;
  };
  
  // ✅ Blockchain
  transaction_hash?: string | null;
  
  // ✅ Métadonnées blockchain ajoutées par le serveur
  _blockchain?: {
    has_blockchain_lot: boolean;
    blockchain_lot_id: string | null;
    has_transaction: boolean;
    transaction_hash: string | null;
    verified_on_blockchain: boolean;
    block_number?: number | null;
  };
}

export interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

export interface Winner {
  name: string;
  voteCount: string;
}

export interface Account {
  address: string;
  balance: string;
  hasVoted: boolean;
}

// ✅ Nouveau type pour les résultats de vérification blockchain
export interface BlockchainVerificationResult {
  mouvement_id: number;
  hash: string;
  verified: boolean;
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
  error?: string;
}

// ✅ Type pour les données de création de lot sur blockchain
export interface BlockchainLotData {
  numero_lot: string;
  code_unique: string;
  medicament_code: string;
  quantite_totale: number;
  date_fabrication: string;
  date_expiration: string;
}

// ✅ Type pour le résultat de création blockchain
export interface BlockchainTransactionResult {
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  blockchainLotId?: string;
}

// ✅ Type pour les données de mouvement sur blockchain
export interface BlockchainMouvementData {
  blockchainLotId: string;
  type_mouvement: string;
  quantite: number;
  commentaire: string;
}