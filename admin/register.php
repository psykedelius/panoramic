<?php require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name     = $_POST['name'];
    $email    = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $token    = bin2hex(random_bytes(32)); // Secure random token

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password, $token]);

    $verifyLink = "http://localhost/Gallery360/admin/verify.php?token=" . $token;
    $subject = "Validez votre compte";
    $message = "Bonjour $name,\n\nMerci de vous être inscrit ! Cliquez sur ce lien pour activer votre compte :\n$verifyLink";
    $headers = "From: no-reply@gallery360.local";

    mail($email, $subject, $message, $headers);

    echo "Un email de validation vous a été envoyé.";
}
?>

<form method="POST">
    <h2>Register</h2>
    Name: <input name="name" required><br>
    Email: <input name="email" type="email" required><br>
    Password: <input name="password" type="password" required><br>
    <button type="submit">Register</button>
</form>
<a href="login.php">Already have an account? Login</a>