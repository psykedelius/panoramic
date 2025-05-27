<?php
// Database connection
$pdo = new PDO('mysql:host=localhost;dbname=pano360', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false // Good practice
]);

// Create 'users' table if it doesn't exist
$sql_users = "
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100),
    `email` VARCHAR(100) UNIQUE,
    `password` VARCHAR(255),
    `is_verified` TINYINT(1) DEFAULT 0,
    `verification_token` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$pdo->exec($sql_users);

// Create 'groups' table if it doesn't exist
$result_groups_exist = $pdo->query("SHOW TABLES LIKE 'groups'");
if ($result_groups_exist->rowCount() === 0) {
    $sql_groups_table = "
    CREATE TABLE `groups` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(50) UNIQUE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $pdo->exec($sql_groups_table);

    // Insert default group names only when 'groups' table is first created
    $groupNames = ['visitor', 'user', 'admin'];
    foreach ($groupNames as $name) {
        $stmt = $pdo->prepare("
            INSERT INTO `groups` (`name`)
            SELECT :name FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 FROM `groups` WHERE `name` = :name_check
            )
        ");
        $stmt->execute(['name' => $name, 'name_check' => $name]);
    }
}


// Create 'projects' table if it doesn't exist
$sql_projects = "
CREATE TABLE IF NOT EXISTS `projects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `owner` INT NOT NULL,
    `features` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$pdo->exec($sql_projects);

session_start();
?>