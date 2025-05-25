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

    // Basic validation (can be expanded)
    if (empty($name) || empty($email) || empty($_POST['password'])) {
        $success_message = "Nom, email et mot de passe sont requis."; // Using success_message for error for now as per simplified focus
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$name, $email, $password, $token])) {
            $verifyLink = "http://localhost/Gallery360/admin/verify.php?token=" . $token; // Adjust domain as needed
            $subject = "Validez votre compte";
            $message = "Bonjour $name,\n\nMerci de vous être inscrit ! Cliquez sur ce lien pour activer votre compte :\n$verifyLink";
            $headers = "From: no-reply@gallery360.local"; // Adjust email as needed

            mail($email, $subject, $message, $headers); // Assumed configured or success not critical for this message display

            $success_message = "Un email de validation vous a été envoyé.";
        } else {
            $success_message = "Erreur lors de l'inscription. Veuillez réessayer."; 
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <style>
    body {
        font-family: 'Arial', sans-serif;
        background-color: #f0f2f5;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 20px;
        box-sizing: border-box;
    }
    .login-form-container {
        background-color: #ffffff;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
        text-align: center;
    }
    .login-form-container h2 {
        color: #1c1e21;
        font-size: 24px;
        margin-bottom: 20px;
    }
    .login-form-container input[type="text"],
    .login-form-container input[type="email"],
    .login-form-container input[type="password"] {
        width: calc(100% - 22px); /* Account for padding and border */
        padding: 12px 10px;
        margin-bottom: 15px;
        border: 1px solid #dddfe2;
        border-radius: 6px;
        font-size: 16px;
        box-sizing: border-box;
    }
    .login-form-container input[type="text"]:focus,
    .login-form-container input[type="email"]:focus,
    .login-form-container input[type="password"]:focus {
        border-color: #1877f2; /* Google blue for focus */
        box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.2);
        outline: none;
    }
    .login-form-container button[type="submit"] {
        background-color: #1877f2; /* Google blue */
        color: white;
        border: none;
        padding: 12px;
        width: 100%;
        border-radius: 6px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: 20px;
        transition: background-color 0.3s ease;
    }
    .login-form-container button[type="submit"]:hover {
        background-color: #166fe5;
    }
    .login-form-container a {
        color: #1877f2;
        text-decoration: none;
        font-size: 14px;
    }
    .login-form-container a:hover {
        text-decoration: underline;
    }
    .error-message { /* Kept for consistency if error handling is added later */
        background-color: #ffebe8;
        color: #c92a2a;
        padding: 10px;
        border: 1px solid #e0b4b4;
        border-radius: 6px;
        margin-bottom: 15px;
        text-align: center;
    }
    .success-message {
        background-color: #e6fffa; /* Light teal/green background */
        color: #004d40; /* Dark teal/green text */
        padding: 10px 15px;
        border: 1px solid #b2dfdb; /* Light teal/green border */
        border-radius: 6px;
        margin-bottom: 20px; /* More margin to separate from form */
        text-align: center;
        font-size: 15px;
    }
    </style>
</head>
<body>
    <div class="login-form-container">
        <?php if(!empty($success_message)): ?>
            <div class="success-message"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="register.php">
            <h2>Register</h2>
            Name: <input name="name" required value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>"><br>
            Email: <input name="email" type="email" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"><br>
            Password: <input name="password" type="password" required><br>
            <button type="submit">Register</button>
        </form>
        <a href="login.php">Already have an account? Login</a>
    </div>
</body>
</html>