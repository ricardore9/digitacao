<?php
$host = "localhost";
$user = "covesa26_gletracaindo";
$pass = "M@nancial";
$dbname = "covesa26_gletracaindo";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

$sql = "SELECT nome, pontos, data_jogo 
        FROM ranking 
        ORDER BY pontos DESC, data_jogo ASC 
        LIMIT 10";

$result = $conn->query($sql);

$ranking = [];
while ($row = $result->fetch_assoc()) {
    $ranking[] = $row;
}

header('Content-Type: application/json');
echo json_encode($ranking);

$conn->close();
?>
