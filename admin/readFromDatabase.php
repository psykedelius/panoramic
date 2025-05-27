<?php
require 'config.php'; // Provides $pdo and starts session via require in config.php

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated. Please login.']);
    exit;
}

$owner_id = (int)$_SESSION['user_id'];
$output_projects = [];

try {
    $stmt = $pdo->prepare("SELECT id, features FROM projects WHERE owner = :owner_id ORDER BY created_at DESC");
    $stmt->bindParam(':owner_id', $owner_id, PDO::PARAM_INT);
    $stmt->execute();

    $db_projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($db_projects as $db_project) {
        $project_features = json_decode($db_project['features'], true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($project_features)) {
            // Ensure the authoritative ID from the database 'id' column is used
            $project_to_send = $project_features;
            $project_to_send['id'] = (int)$db_project['id']; 
            
            // Ensure other critical fields expected by client are present, even if missing in older JSON blobs
            // (This is defensive coding, ideally features blob is always consistent)
            $project_to_send['name'] = $project_features['name'] ?? 'Untitled Project';
            $project_to_send['panoramicPoints'] = $project_features['panoramicPoints'] ?? [];
            $project_to_send['acces'] = $project_features['acces'] ?? 'private';
            $project_to_send['authorizedUsers'] = $project_features['authorizedUsers'] ?? [];
            
            $output_projects[] = $project_to_send;
        } else {
            // Log error for corrupted JSON in features for this project
            error_log("Failed to decode features JSON for project ID: " . $db_project['id'] . " for owner ID: " . $owner_id . ". Error: " . json_last_error_msg());
            // Optionally, you could add a placeholder or error object to $output_projects here
            // For now, we just skip corrupted records from being sent to client.
        }
    }

    echo json_encode($output_projects);

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    error_log("Database error in readFromDatabase.php: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'A database error occurred while fetching projects.']);
}
?>
