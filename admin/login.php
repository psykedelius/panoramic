<?php require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$_POST['email']]);
    $user = $stmt->fetch();

    if (empty($_POST['email']) || empty($_POST['password'])) {
        $error_message = "Email and password are required.";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$_POST['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($_POST['password'], $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['name'] = $user['name'];
            header("Location: adminPage.php");
            exit;
        } else {
            $error_message = "Invalid credentials.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
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
    .error-message {
        background-color: #ffebe8;
        color: #c92a2a;
        padding: 10px;
        border: 1px solid #e0b4b4;
        border-radius: 6px;
        margin-bottom: 15px;
        text-align: center;
    }
    /* Basic label styling if form had separate labels */
    /* For current structure, "Email: " text is outside input */
    /* Consider wrapping "Email: " and "Password: " in <label> for better semantics if further refactoring */
    </style>
</head>
<body>
    <div class="login-form-container">
        <?php if(!empty($error_message)): ?>
            <div class="error-message"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="login.php">
            <h2>Login</h2>
            Email: <input name="email" type="email" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"><br>
            Password: <input name="password" type="password" required><br>
            <button type="submit">Login</button>
        </form>
        <a href="register.php">Don't have an account? Register</a>
    </div>
</body>
</html>