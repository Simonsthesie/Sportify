-- Migration: ajout colonne categorie sur seance

ALTER TABLE `seance` ADD COLUMN `categorie` VARCHAR(50) NULL;
