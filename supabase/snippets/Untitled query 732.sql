-- =============================================
-- Table des anomalies (signalements)
-- =============================================
CREATE TABLE anomalies (
  id SERIAL PRIMARY KEY,
  lot_id INTEGER REFERENCES lots(id) ON DELETE SET NULL,
  mouvement_id INTEGER REFERENCES mouvements(id) ON DELETE SET NULL,
  type_anomalie TEXT NOT NULL CHECK (type_anomalie IN (
    'produit_endommage',
    'quantite_erronee',
    'produit_manquant',
    'date_expiration_depassee',
    'produit_non_conforme',
    'code_invalide',
    'lot_inconnu',
    'rupture_stock',
    'erreur_etiquetage',
    'autre'
  )),
  description TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'signale' CHECK (statut IN (
    'signale',
    'en_cours_traitement',
    'resolu',
    'rejete'
  )),
  gravite TEXT NOT NULL DEFAULT 'moyenne' CHECK (gravite IN (
    'faible',
    'moyenne',
    'elevee',
    'critique'
  )),
  signale_par TEXT NOT NULL, -- ID ou nom de l'utilisateur
  traite_par TEXT, -- ID ou nom de l'admin qui traite
  commentaire_resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les anomalies
CREATE INDEX idx_anomalies_lot ON anomalies(lot_id);
CREATE INDEX idx_anomalies_statut ON anomalies(statut);
CREATE INDEX idx_anomalies_date ON anomalies(created_at DESC);


