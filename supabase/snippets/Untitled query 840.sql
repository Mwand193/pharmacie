-- Supprimer la table si elle existe
DROP TABLE IF EXISTS users CASCADE;

-- Recréer la table users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  matricule VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(50) NOT NULL,
  nom_entite varchar(50),
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (
    role IN ('admin', 'pharmacie', 'fabricant', 'distributeur')
  ),
  first_login BOOLEAN DEFAULT TRUE,
  genre VARCHAR(1) CHECK (genre IN ('M', 'F')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des 4 utilisateurs par défaut
INSERT INTO users (matricule, username, password, role, first_login, genre)
VALUES
  ('ADM001', 'Administrateur', '123456', 'admin', TRUE, 'M'),
  ('PHA001', 'Pharmacie Test', 'pharma123', 'pharmacie', TRUE, 'F'),
  ('FAB001', 'Fabricant Test', 'fab123', 'fabricant', TRUE, 'M'),
  ('DIS001', 'Distributeur Test', 'dist123', 'distributeur', TRUE, 'M');

-- Index sur matricule
CREATE INDEX IF NOT EXISTS idx_users_matricule
ON users (matricule);

-- Index sur genre
CREATE INDEX IF NOT EXISTS idx_users_genre
ON users (genre);

-- Index non unique sur username
CREATE INDEX IF NOT EXISTS idx_users_username
ON users (username);



















-- 1. Ajouter les colonnes pour la blockchain
ALTER TABLE users 
ADD COLUMN ethereum_address VARCHAR(42) UNIQUE,
ADD COLUMN ethereum_address_hash VARCHAR(64) UNIQUE,
ADD COLUMN ganache_account_index INTEGER,
ADD COLUMN role_ethereum VARCHAR(20) CHECK (role_ethereum IN (
    'admin',
    'fabricant', 
    'distributeur',
    'pharmacie'
));

-- 2. Créer un index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_users_ethereum_address 
ON users (ethereum_address);

CREATE INDEX IF NOT EXISTS idx_users_ethereum_hash 
ON users (ethereum_address_hash);

-- 3. Commentaire sur les colonnes
COMMENT ON COLUMN users.ethereum_address IS 'Adresse Ethereum publique du compte Ganache';
COMMENT ON COLUMN users.ethereum_address_hash IS 'Hash SHA-256 de l''adresse Ethereum (sécurité)';
COMMENT ON COLUMN users.ganache_account_index IS 'Index du compte Ganache (0-9)';









-- Supprimer la contrainte NOT NULL
ALTER TABLE users 
ALTER COLUMN nom_entite DROP NOT NULL;