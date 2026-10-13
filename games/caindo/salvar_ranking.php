<?php
$host = "localhost";
$user = "covesa26_gletracaindo";
$pass = "M@nancial";
$dbname = "covesa26_gletracaindo";

// Conexão
$conn = new mysqli($host, $user, $pass, $dbname);

// Verifica erro
if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Recebe dados via POST
$nome = $_POST['nome'] ?? '';
$pontos = $_POST['pontos'] ?? 0;

if (!empty($nome) && is_numeric($pontos)) {
    $stmt = $conn->prepare("INSERT INTO ranking (nome, pontos) VALUES (?, ?)");
    $stmt->bind_param("si", $nome, $pontos);
    $stmt->execute();
    echo "ok";
} else {
    echo "dados inválidos";
}

$conn->close();
?>
