ALTER TABLE mouvements
DROP CONSTRAINT IF EXISTS mouvements_type_mouvement_check;

-- Recréer contrainte complète
ALTER TABLE mouvements
ADD CONSTRAINT mouvements_type_mouvement_check
CHECK (
  type_mouvement IN (
    'creation_lot',
    'transfert',
    'transfert_pharmacie',
    'transfert_distributeur',
    'reception',
    'distribution',
    'vente_pharmacie',
    'vente_grossiste',
    'vente_patient',
    'retrait_defectueux',
    'verification'
  )
);