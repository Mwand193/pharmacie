// types/index.ts
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

export interface Lot {
  id: number;
  medicament_id: number;
  numero_lot: string;
   created_by: string; // Contient le nom_entite du fabricant
  fabricant_id: number; 
  code_unique: string;
  hash_lot: string;
  qr_content: string | null;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
  created_at: string;
    hasMovements?: boolean;    // Ajouter cette propriété
  isDeletable?: boolean; 
  updated_at: string;
  medicament?: Medicament;
  statut?: 'disponible' | 'partiel' | 'epuise' | 'expire';
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
}