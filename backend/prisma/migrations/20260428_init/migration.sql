-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle` ENUM('ADMIN', 'COACH', 'CLIENT') NOT NULL,

    UNIQUE INDEX `role_libelle_key`(`libelle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(180) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `maj_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateur_email_key`(`email`),
    INDEX `utilisateur_role_id_idx`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coach` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `specialite` VARCHAR(120) NOT NULL,
    `bio` TEXT NULL,

    UNIQUE INDEX `coach_utilisateur_id_key`(`utilisateur_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NOT NULL,
    `capacite_max` INTEGER NOT NULL,
    `lieu` VARCHAR(150) NULL,
    `coach_id` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `maj_le` DATETIME(3) NOT NULL,

    INDEX `seance_coach_id_idx`(`coach_id`),
    INDEX `seance_date_debut_date_fin_idx`(`date_debut`, `date_fin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `seance_id` INTEGER NOT NULL,
    `statut` ENUM('CONFIRMEE', 'ANNULEE') NOT NULL DEFAULT 'CONFIRMEE',
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `maj_le` DATETIME(3) NOT NULL,

    INDEX `reservation_client_id_idx`(`client_id`),
    INDEX `reservation_seance_id_idx`(`seance_id`),
    INDEX `reservation_statut_idx`(`statut`),
    UNIQUE INDEX `reservation_client_id_seance_id_key`(`client_id`, `seance_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `utilisateur` ADD CONSTRAINT `utilisateur_role_id_fkey`
    FOREIGN KEY (`role_id`) REFERENCES `role`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach` ADD CONSTRAINT `coach_utilisateur_id_fkey`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seance` ADD CONSTRAINT `seance_coach_id_fkey`
    FOREIGN KEY (`coach_id`) REFERENCES `coach`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `utilisateur`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_seance_id_fkey`
    FOREIGN KEY (`seance_id`) REFERENCES `seance`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
