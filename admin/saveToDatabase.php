<?php
$debug_log_file_path = __DIR__ . '/save_debug.log'; // Log file in the same admin directory
$current_timestamp = date('Y-m-d H:i:s');
$log_init_message = "[{$current_timestamp}] ATTEMPTING TO START SCRIPT saveToDatabase.php. PHP_EOL Checkpoint 1: Script accessed." . PHP_EOL;

// Attempt to write the initial message to the local debug log
if (file_put_contents($debug_log_file_path, $log_init_message, FILE_APPEND | LOCK_EX) === false) {
    // If writing to local debug log fails, try to log this failure to the main PHP error log
    error_log("FATAL ERROR in saveToDatabase.php: Could not write to local debug log file: " . $debug_log_file_path . ". Check path and web server write permissions for the 'admin' directory. Checkpoint 1 Failed.", 0);
} else {
    // If successful, also note this in the main PHP error log for easier cross-referencing if needed
    error_log("INFO in saveToDatabase.php: Successfully wrote initial entry to local debug log: " . $debug_log_file_path . ". Checkpoint 1 OK.", 0);
}
// END OF NEW INITIAL LOGGING BLOCK

require 'config.php'; // Provides $pdo and starts session via require in config.php

// Old log file definition and rotation logic removed.
// $timestamp variable is now $current_timestamp, defined above.
$log_entry_start = "[{$current_timestamp}] --- New Request Start (after initial log) ---" . PHP_EOL; // Modified message
file_put_contents($debug_log_file_path, $log_entry_start, FILE_APPEND | LOCK_EX);

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated. Please login.']);
    file_put_contents($debug_log_file_path, "[{$current_timestamp}] Request End - Auth Error" . PHP_EOL . PHP_EOL, FILE_APPEND | LOCK_EX);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method. Only POST is accepted.']);
    file_put_contents($debug_log_file_path, "[{$current_timestamp}] Request End - Method Error" . PHP_EOL . PHP_EOL, FILE_APPEND | LOCK_EX);
    exit;
}

$raw_json_data = file_get_contents('php://input');
$project_data = json_decode($raw_json_data, true); // true for associative array

if (json_last_error() !== JSON_ERROR_NONE || !is_array($project_data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or missing JSON data.']);
    file_put_contents($debug_log_file_path, "[{$current_timestamp}] Request End - JSON Data Error (generic)" . PHP_EOL . PHP_EOL, FILE_APPEND | LOCK_EX);
    exit;
}

$is_new_project = !isset($project_data['id']); // A project is new if no 'id' is provided by client
$client_temp_id = $project_data['clientTempId'] ?? null; // Client might send this for correlation

if (!$is_new_project && (empty($project_data['id']) || !is_numeric($project_data['id']))) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Project ID for update is missing or invalid.']);
    file_put_contents($debug_log_file_path, "[{$current_timestamp}] Request End - Invalid Project ID for Update" . PHP_EOL . PHP_EOL, FILE_APPEND | LOCK_EX);
    exit;
}
    
$owner_id = (int)$_SESSION['user_id'];
$features_json = $raw_json_data; 

$log_data_initial = "[{$current_timestamp}] User ID: {$owner_id}" . PHP_EOL;
$log_data_initial .= "[{$current_timestamp}] Raw POST data: {$raw_json_data}" . PHP_EOL;
$log_data_initial .= "[{$current_timestamp}] Operation type: " . ($is_new_project ? "INSERT (New Project)" : "UPDATE (Existing Project)") . PHP_EOL;
if ($is_new_project && $client_temp_id) {
    $log_data_initial .= "[{$current_timestamp}] Client Temporary ID: {$client_temp_id}" . PHP_EOL;
}
if (!$is_new_project) {
    $log_data_initial .= "[{$current_timestamp}] Project ID for Update: " . $project_data['id'] . PHP_EOL;
}
file_put_contents($debug_log_file_path, $log_data_initial, FILE_APPEND | LOCK_EX);

try {
    $pdo->beginTransaction();

    if (!$is_new_project) { // UPDATE existing project
        $project_id_from_client = (int)$project_data['id'];
        file_put_contents($debug_log_file_path, "[{$current_timestamp}] Attempting UPDATE for project ID: {$project_id_from_client}" . PHP_EOL, FILE_APPEND | LOCK_EX);

        $stmt_check = $pdo->prepare("SELECT owner FROM projects WHERE id = :id");
        $stmt_check->bindParam(':id', $project_id_from_client, PDO::PARAM_INT);
        $stmt_check->execute();
        $existing_project_owner_data = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if (!$existing_project_owner_data) {
            $pdo->rollBack();
            http_response_code(404); // Not Found
            echo json_encode(['status' => 'error', 'message' => 'Project not found for update.']);
            file_put_contents($debug_log_file_path, "[{$current_timestamp}] Project ID {$project_id_from_client} not found for update. Request End." . PHP_EOL . PHP_EOL, FILE_APPEND | LOCK_EX);
            exit;
        }

        if ((int)$existing_project_owner_data['owner'] !== $owner_id) {
            $pdo->rollBack();
            http_response_code(403); // Forbidden
            echo json_encode(['status' => 'error', 'message' => 'Authorization error: You do not own this project.']);
            file_put_contents($debug_log_file_path, "[{$current_timestamp}] Authorization error for update on Project ID {$project_id_from_client}. Request End." . PHP_EOL . PHP_EOL, FILE_APPEND | LOCK_EX);
            exit;
        }
        
        $stmt_update = $pdo->prepare("UPDATE projects SET features = :features WHERE id = :id AND owner = :owner");
        $stmt_update->bindParam(':features', $features_json);
        $stmt_update->bindParam(':id', $project_id_from_client, PDO::PARAM_INT);
        $stmt_update->bindParam(':owner', $owner_id, PDO::PARAM_INT);
        
        if ($stmt_update->execute()) {
            $pdo->commit();
            file_put_contents($debug_log_file_path, "[{$current_timestamp}] UPDATE for ID {$project_id_from_client} reported success. Rows affected: " . $stmt_update->rowCount() . PHP_EOL, FILE_APPEND | LOCK_EX);
            echo json_encode(['status' => 'success', 'message' => 'Project updated successfully.', 'id' => $project_id_from_client]);
        } else {
            $pdo->rollBack();
            file_put_contents($debug_log_file_path, "[{$current_timestamp}] UPDATE for ID {$project_id_from_client} reported failure." . PHP_EOL, FILE_APPEND | LOCK_EX);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to update project.']);
        }

    } else { // INSERT new project
        file_put_contents($debug_log_file_path, "[{$current_timestamp}] Attempting INSERT for new project. Client temp ID: " . ($client_temp_id ?? 'N/A') . PHP_EOL, FILE_APPEND | LOCK_EX);

        $stmt_insert = $pdo->prepare("INSERT INTO projects (owner, features) VALUES (:owner, :features)");
        $stmt_insert->bindParam(':owner', $owner_id, PDO::PARAM_INT);
        $stmt_insert->bindParam(':features', $features_json);
        
        if ($stmt_insert->execute()) {
            $new_database_id = $pdo->lastInsertId();
            $pdo->commit();
            file_put_contents($debug_log_file_path, "[{$current_timestamp}] INSERT reported success. New DB ID: {$new_database_id}" . PHP_EOL, FILE_APPEND | LOCK_EX);
            http_response_code(201); // Created
            echo json_encode([
                'status' => 'success', 
                'message' => 'Project saved successfully.', 
                'new_project_id' => $new_database_id,
                'clientTempId' => $client_temp_id 
            ]);
        } else {
            $pdo->rollBack();
            file_put_contents($debug_log_file_path, "[{$current_timestamp}] INSERT reported failure." . PHP_EOL, FILE_APPEND | LOCK_EX);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save new project.']);
        }
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500); 
    $error_log_message = "[{$current_timestamp}] Database error: " . $e->getMessage() . ". Raw JSON received: " . $raw_json_data . PHP_EOL;
    file_put_contents($debug_log_file_path, $error_log_message, FILE_APPEND | LOCK_EX);
    error_log("Database error in saveToDatabase.php: " . $e->getMessage()); // Also log to main PHP error log
    echo json_encode(['status' => 'error', 'message' => 'A database error occurred. Please try again later.']);
}

$log_entry_end = "[{$current_timestamp}] --- Request End ---" . PHP_EOL . PHP_EOL;
file_put_contents($debug_log_file_path, $log_entry_end, FILE_APPEND | LOCK_EX);
?>
