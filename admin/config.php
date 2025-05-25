<?php
$pdo = new PDO('mysql:host=localhost;dbname=pano360', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);
    //on cré la table user si elle n'existe pas
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        is_verified TINYINT(1) DEFAULT 0,
        verification_token VARCHAR(255) DEFAULT NULL
    ) ENGINE=InnoDB
    "; 
    $pdo->query($sql);
    
    // Vérifie si la table 'groups' existe
    $result = $pdo->query("SHOW TABLES LIKE 'groups'");
    if ($result->rowCount() === 0) {
        // Création de la table
        $pdo->exec("
            CREATE TABLE groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    }

    // Vide la table
    $pdo->exec("DELETE FROM groups");
    $pdo->exec("ALTER TABLE groups AUTO_INCREMENT = 1");

    // Insertion sans doublons
    $groupNames = ['visitor', 'user', 'admin'];
    foreach ($groupNames as $name) {
        $stmt = $pdo->prepare("
            INSERT INTO groups (name)
            SELECT :name FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 FROM groups WHERE name = :name
            )
        ");
        $stmt->execute(['name' => $name]);
    }

    echo "Groupes créés avec succès.";

session_start();
?>