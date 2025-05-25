<?php
require 'config.php';

if (isset($_GET['token'])) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE verification_token = ?");
    $stmt->execute([$_GET['token']]);
    $user = $stmt->fetch();

    if ($user) {
        $pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?")
            ->execute([$user['id']]);
        echo "✅ Votre compte a été activé avec succès.";
    } else {
        echo "❌ Lien de validation invalide.";
    }
}