
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    div
</body>
</html>



<?php
try {
    echo 'try to connect  : ';
    $pdo = new PDO('mysql:host=localhost;dbname=pano360', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    //on cré la table user si elle n'existe pas
    ($pdo->query('CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255)')
    );
    //on cré la projects  si elle n'existe pas
    ($pdo->query('CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255)')
    );

    echo 'try to connect  : '.$pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS).'<br>';
    foreach ($pdo->query('SELECT * FROM users', PDO::FETCH_ASSOC) as $user) {

        echo htmlspecialchars($user['name']) . ' ' . htmlspecialchars($user['email']) . '<br>';
    }
} catch (PDOException $e) {
    echo 'Impossible de récupérer la liste des utilisateurs : ' . $e->getMessage();
}