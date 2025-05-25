<?php
require 'config.php'; // Provides $pdo and starts session via require in config.php

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated. Please login.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method. Only POST is accepted.']);
    exit;
}

$raw_json_data = file_get_contents('php://input');
$project_data = json_decode($raw_json_data, true); // true for associative array

if (json_last_error() !== JSON_ERROR_NONE || !is_array($project_data) || !isset($project_data['id']) || empty(trim($project_data['id']))) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Invalid or missing JSON data, or project ID is empty.']);
    exit;
}

$project_id = trim($project_data['id']);
$owner_id = (int)$_SESSION['user_id'];
$features_json = $raw_json_data; // Store the original raw JSON string of the project

try {
    $pdo->beginTransaction();

    $stmt_check = $pdo->prepare("SELECT owner FROM projects WHERE id = :id");
    $stmt_check->bindParam(':id', $project_id);
    $stmt_check->execute();
    $existing_project = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if ($existing_project) {
        // Project exists, check owner
        if ((int)$existing_project['owner'] !== $owner_id) {
            $pdo->rollBack();
            http_response_code(403); // Forbidden
            echo json_encode(['status' => 'error', 'message' => 'Authorization error: You do not own this project.']);
            exit;
        }
        // Owner matches, update features
        $stmt_update = $pdo->prepare("UPDATE projects SET features = :features WHERE id = :id AND owner = :owner");
        $stmt_update->bindParam(':features', $features_json);
        $stmt_update->bindParam(':id', $project_id);
        $stmt_update->bindParam(':owner', $owner_id);
        
        if ($stmt_update->execute()) {
            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Project updated successfully.']);
        } else {
            $pdo->rollBack();
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => 'Failed to update project.']);
        }
    } else {
        // Project does not exist, insert new
        $stmt_insert = $pdo->prepare("INSERT INTO projects (id, owner, features) VALUES (:id, :owner, :features)");
        $stmt_insert->bindParam(':id', $project_id);
        $stmt_insert->bindParam(':owner', $owner_id);
        $stmt_insert->bindParam(':features', $features_json);
        
        if ($stmt_insert->execute()) {
            $pdo->commit();
            http_response_code(201); // Created
            echo json_encode(['status' => 'success', 'message' => 'Project saved successfully.']);
        } else {
            $pdo->rollBack();
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => 'Failed to save new project.']);
        }
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500); // Internal Server Error
    // Log error to server log instead of echoing detailed SQL error to client for security
    error_log("Database error in saveToDatabase.php: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'A database error occurred. Please try again later.']);
}
?>
