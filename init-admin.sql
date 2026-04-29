INSERT INTO utilisateur (email, mot_de_passe, type_compte, statut, date_creation)
VALUES (
  'admin@gmail.com',
  '$2a$10$rzgBjaXvyKFZ.QVBRMd4LORL.WRmKUpx.bjndvSQC2DvDtmlFaZ2C',
  'ADMINISTRATEUR',
  'ACTIF',
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET mot_de_passe = EXCLUDED.mot_de_passe,
    type_compte = EXCLUDED.type_compte,
    statut = EXCLUDED.statut;
