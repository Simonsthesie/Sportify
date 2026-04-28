-- Migration: ajout liste_attente, avis, notification

CREATE TABLE `liste_attente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `seance_id` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `uq_attente_client_seance`(`client_id`, `seance_id`),
    INDEX `liste_attente_seance_id_position_idx`(`seance_id`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `avis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `seance_id` INTEGER NOT NULL,
    `note` INTEGER NOT NULL,
    `commentaire` TEXT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `uq_avis_client_seance`(`client_id`, `seance_id`),
    INDEX `avis_seance_id_idx`(`seance_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `lu` BOOLEAN NOT NULL DEFAULT false,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `notification_user_id_lu_idx`(`user_id`, `lu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `liste_attente` ADD CONSTRAINT `liste_attente_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `liste_attente` ADD CONSTRAINT `liste_attente_seance_id_fkey`
    FOREIGN KEY (`seance_id`) REFERENCES `seance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `avis` ADD CONSTRAINT `avis_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `avis` ADD CONSTRAINT `avis_seance_id_fkey`
    FOREIGN KEY (`seance_id`) REFERENCES `seance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
