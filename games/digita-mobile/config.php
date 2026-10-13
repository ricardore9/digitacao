<?php
header('Content-Type: application/json');

// Dados sensíveis das fases protegidos no servidor
$phases = [
    [
        "id" => 0, "name" => "Fase 1: Letras Soltas", 
        "desc" => "Aqueça os dedos! Apenas letras individuais caindo suavemente.",
        "items" => str_split('abcdefghijklmnopqrstuvwxyz'),
        "len" => 1, "count" => 12, "speed" => 1.2 
    ],
    [
        "id" => 1, "name" => "Fase 2: Duplas Dinâmicas", 
        "desc" => "Agora as coisas se juntam! Palavras de 2 letras.",
        "items" => ['ir','em','de','do','da','eu','tu','no','na','um','se','ja','vi','oi','ai','ou','me','te','os','as','ao','la','lo','si','so','su','ti','to','ta','pe','po','pa','bo','ba','bi','co','ca','ci','go','ga','gi'],
        "len" => 2, "count" => 15, "speed" => 1.4 
    ],
    [
        "id" => 2, "name" => "Fase 3: Trios de Ataque", 
        "desc" => "Palavras de 3 letras. Mantenha o ritmo!",
        "items" => ['sol','lua','rei','mar','paz','luz','cor','som','ver','ser','bom','dia','sal','rua','ler','voz','fim','sim','bem','mal','dor','rio','ave','ovo','uva','mel','gel','lei','vez','fez','dez','mil','cem','ano','mes','pai','mae','tio','tia','boi','dom','ato','uso','elo'],
        "len" => 3, "count" => 18, "speed" => 1.6 
    ],
    [
        "id" => 3, "name" => "Fase 4: Quartetos Rápidos", 
        "desc" => "O desafio aumenta! Palavras de 4 letras em queda livre.",
        "items" => ['casa','gato','amor','vida','flor','fogo','doce','frio','novo','azul','rosa','belo','feio','alto','rico','seco','sujo','duro','mole','liso','rato','pato','sapo','lobo','urso','leao','vaca','mesa','copo','faca','povo','puro','fala'],
        "len" => 4, "count" => 20, "speed" => 1.8 
    ],
    [
        "id" => 4, "name" => "Fase 5: Quinteto Fantástico", 
        "desc" => "Muita atenção agora! Palavras de 5 letras exigem precisão.",
        "items" => ['festa','verde','feliz','vento','pedra','chuva','calor','forte','sonho','letra','jogar','comer','beber','voar','achar','pagar','pegar','abrir','parar','ficar','peixe','cobra','mosca','ponte','porta','livro','corpo','mente'],
        "len" => 5, "count" => 22, "speed" => 2.0 
    ],
    [
        "id" => 5, "name" => "Fase 6: Sexteto de Elite", 
        "desc" => "Quase lá! Palavras de 6 letras para testar seu limite.",
        "items" => ['rapido','escola','brasil','amigo','futuro','musica','janela','viagem','beleza','pessoa','homem','mulher','cabelo','costas','pernas','sangue','queixo','alegre','animal','cidade','escada','frente','altura','modelo'],
        "len" => 6, "count" => 25, "speed" => 2.2 
    ],
    [
        "id" => 6, "name" => "Fase Final: Desafio Acentuado", 
        "desc" => "O teste final! Palavras com acentuação e complexas.",
        "items" => ['céu','mãe','pão','café','sofá','você','ótimo','música','coração','pássaro','manhã','lição','ação','nação','região','religião','avião','limão','mamão','melão','balão','botão','caminhão','açúcar','fácil','nível','útil','difícil'],
        "len" => null, "count" => 25, "speed" => 2.0 
    ]
];

echo json_encode($phases);
?>
