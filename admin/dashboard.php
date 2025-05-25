<?php require 'config.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>

<h1>Welcome, <?= htmlspecialchars($_SESSION['name']) ?>!</h1>
<a href="logout.php">Logout</a>

<h2>Your Projects</h2>
<?php
try {
    // Récupération et affichage des groupes
    $stmt = $pdo->query('SELECT * FROM groups');
    foreach ($stmt as $row) {
        echo htmlspecialchars($row['name']) . '<br>';
    }

    echo "<h2>Utilisateurs</h2>";

    // Récupération et affichage des utilisateurs
    $stmtUsers = $pdo->query('SELECT name, email FROM users');
    foreach ($stmtUsers as $user) {
        echo htmlspecialchars($user['name']) . ' - ' . htmlspecialchars($user['email']) . '<br>';
    }

} catch (PDOException $e) {
    echo 'Erreur lors de la récupération des données : ' . htmlspecialchars($e->getMessage());
}
?>

