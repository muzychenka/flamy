-- CreateTable
CREATE TABLE `attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `file` VARCHAR(255) NOT NULL,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(16) NOT NULL,
    `time` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstUserId` INTEGER NOT NULL,
    `secondUserId` INTEGER NOT NULL,
    `isConfirmed` BOOLEAN NULL,
    `message` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(32) NULL,
    `age` INTEGER NULL,
    `description` TEXT NULL,
    `city` VARCHAR(64) NULL,
    `sex` INTEGER NULL,
    `lookingFor` INTEGER NULL,
    `ageRange` VARCHAR(16) NULL,
    `disabled` BOOLEAN NOT NULL DEFAULT false,
    `lat` FLOAT NULL,
    `lng` FLOAT NULL,
    `premium` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
