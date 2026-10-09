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
$modo = $_POST['modo'] ?? 'beginner'; // 'beginner' ou 'expert'
$fase = $_POST['fase'] ?? 1; // Fase em que o jogador terminou

if (!empty($nome) && is_numeric($pontos) && is_numeric($fase)) {
    $stmt = $conn->prepare("INSERT INTO ranking (nome, pontos, modo, fase) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sisi", $nome, $pontos, $modo, $fase);
    $stmt->execute();
    echo "ok";
} else {
    echo "dados inválidos";
}

$conn->close();
?>

