

-- =============================================
-- Table des médicaments (produits)
-- =============================================
CREATE TABLE medicaments (
  id SERIAL PRIMARY KEY,
  code_cis TEXT UNIQUE, -- Code Identifiant de Spécialité
  nom TEXT NOT NULL,
  dosage TEXT, -- ex: 500mg
  forme TEXT, -- ex: comprimé, gélule
  description TEXT,
  image_base64 TEXT,
  type_unite TEXT NOT NULL CHECK (type_unite IN ('boite', 'carton', 'palette')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Table des lots (UNIQUES, créés une seule fois)
-- =============================================
CREATE TABLE lots (
  id SERIAL PRIMARY KEY,
  medicament_id INTEGER NOT NULL REFERENCES medicaments(id),
  numero_lot TEXT UNIQUE NOT NULL,
  code_unique TEXT UNIQUE NOT NULL,
  hash_lot TEXT NOT NULL,
  qr_content TEXT,
  date_fabrication DATE NOT NULL,
  date_expiration DATE NOT NULL,
  quantite_totale INTEGER NOT NULL, -- Nombre total d'unités produites
  fabricant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


ALTER TABLE lots
ADD COLUMN IF NOT EXISTS created_by TEXT;
-- =============================================
-- Table des mouvements (historique complet de traçabilité)
-- =============================================
CREATE TABLE mouvements (
  id SERIAL PRIMARY KEY,
  lot_id INTEGER NOT NULL REFERENCES lots(id) ON DELETE CASCADE,

  source_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  destination_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  quantite INTEGER,
  type_unite TEXT CHECK (type_unite IN ('boite', 'carton', 'palette')),
  statut_avant TEXT,
  statut_apres TEXT,
  commentaire TEXT,
  hash_mouvement TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE mouvements
ADD COLUMN IF NOT EXISTS transaction_hash TEXT;


ALTER TABLE mouvements
ADD COLUMN IF NOT EXISTS type_mouvement TEXT;
-- Modifier la contrainte CHECK de la table mouvements

ALTER TABLE mouvements 
ADD CONSTRAINT mouvements_type_mouvement_check 
CHECK (type_mouvement IN (
  'creation_lot', 
  'transfert',
  'reception',
  'vente_grossiste',
  'vente_pharmacie',
  'vente_patient',
  'retrait_defectueux',
  'verification'
));

-- Mettre à jour les mouvements existants si nécessaire (si vous en avez déjà)
UPDATE mouvements 
SET type_mouvement = 'retrait_defectueux' 
WHERE type_mouvement = 'destruction';


-- =============================================
-- Index pour performances
-- =============================================
CREATE INDEX idx_lots_medicament ON lots(medicament_id);
CREATE INDEX idx_lots_numero ON lots(numero_lot);
CREATE INDEX idx_mouvements_lot ON mouvements(lot_id);
CREATE INDEX idx_mouvements_dates ON mouvements(created_at DESC);











-- Renommer les mouvements existants
UPDATE mouvements SET type_mouvement = 'distribution' WHERE type_mouvement = 'vente_pharmacie';

-- Mettre à jour la contrainte CHECK
ALTER TABLE mouvements DROP CONSTRAINT IF EXISTS mouvements_type_mouvement_check;

ALTER TABLE mouvements ADD CONSTRAINT mouvements_type_mouvement_check 
CHECK (type_mouvement IN (
  'creation_lot', 
  'transfert',
  'reception',
  'distribution',
  'vente_grossiste',
  'vente_patient',
  'retrait_defectueux',
  'verification'
));


ALTER TABLE anomalies 
ADD COLUMN IF NOT EXISTS hash_mouvement TEXT,
ADD COLUMN IF NOT EXISTS transaction_hash TEXT;