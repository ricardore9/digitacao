<?php
$host = "localhost";
$user = "covesa26_gletracaindo";
$pass = "M@nancial";
$dbname = "covesa26_gletracaindo";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

$sql = "SELECT nome, pontos, modo, fase, data_jogo 
        FROM ranking 
        ORDER BY pontos DESC, data_jogo ASC 
        LIMIT 10";

$result = $conn->query($sql);

$ranking = [];
while ($row = $result->fetch_assoc()) {
    // Garantir compatibilidade com registros antigos
    if (!isset($row['modo']) || empty($row['modo'])) {
        $row['modo'] = 'beginner';
    }
    if (!isset($row['fase']) || empty($row['fase'])) {
        $row['fase'] = 1;
    }
    $ranking[] = $row;
}

header('Content-Type: application/json');
echo json_encode($ranking);

$conn->close();
?>

