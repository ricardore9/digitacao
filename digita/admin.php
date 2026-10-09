<?php
/**
 * Painel Administrativo de Gerenciamento de Ranking
 * SODIPROM - CAMP Diadema | Desafio de Digitação
 */
session_start();

// Configurações de Conexão com o Banco de Dados
$host = "localhost";
$user = "covesa26_gletracaindo";
$pass = "M@nancial";
$dbname = "covesa26_gletracaindo";

// Senha mestra de acesso ao painel
define('ADMIN_PASSWORD', '@Sodiprom@');

// Tratamento de Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION['sodiprom_admin_logged']);
    session_destroy();
    header("Location: admin.php");
    exit;
}

// Tratamento de Login
$login_error = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_password'])) {
    if ($_POST['login_password'] === ADMIN_PASSWORD) {
        $_SESSION['sodiprom_admin_logged'] = true;
        header("Location: admin.php");
        exit;
    } else {
        $login_error = "Senha incorreta. Tente novamente.";
    }
}

// Se não estiver logado, exibe tela de login
$is_logged = isset($_SESSION['sodiprom_admin_logged']) && $_SESSION['sodiprom_admin_logged'] === true;

// Conexão com o banco (somente se logado ou para testar)
$db_error = "";
$conn = null;

if ($is_logged) {
    try {
        $conn = new mysqli($host, $user, $pass, $dbname);
        if ($conn->connect_error) {
            $db_error = "Erro de conexão com o banco de dados: " . $conn->connect_error;
        } else {
            $conn->set_charset("utf8mb4");

            // Garantir que a tabela 'ranking' possua uma coluna 'id' autoincrementável para exclusões seguras
            $colCheck = $conn->query("SHOW COLUMNS FROM ranking LIKE 'id'");
            if ($colCheck && $colCheck->num_rows === 0) {
                $conn->query("ALTER TABLE ranking ADD id INT AUTO_INCREMENT PRIMARY KEY FIRST");
            }
        }
    } catch (Exception $e) {
        $db_error = "Exceção ao conectar no banco: " . $e->getMessage();
    }
}

$flash_msg = "";
$flash_type = "success";

// ==========================================
// PROCESSAMENTO DE AÇÕES ADMINISTRATIVAS
// ==========================================
if ($is_logged && $conn && !$db_error && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['admin_action'] ?? '';

    // 1. EXCLUIR REGISTRO ESPECÍFICO
    if ($action === 'delete_single') {
        $id = intval($_POST['id'] ?? 0);
        if ($id > 0) {
            $stmt = $conn->prepare("DELETE FROM ranking WHERE id = ?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                $flash_msg = "Registro #$id removido com sucesso!";
            } else {
                $flash_msg = "Erro ao remover registro: " . $conn->error;
                $flash_type = "error";
            }
            $stmt->close();
        } else {
            $flash_msg = "ID de registro inválido.";
            $flash_type = "error";
        }
    }

    // 2. EXCLUIR MÚLTIPLOS REGISTROS SELECIONADOS
    else if ($action === 'delete_multiple') {
        $ids = $_POST['selected_ids'] ?? [];
        if (!is_array($ids)) {
            $ids = explode(',', $ids);
        }
        $cleanIds = [];
        foreach ($ids as $idVal) {
            $cId = intval($idVal);
            if ($cId > 0) {
                $cleanIds[] = $cId;
            }
        }
        if (!empty($cleanIds)) {
            $inList = implode(',', $cleanIds);
            $delQuery = "DELETE FROM ranking WHERE id IN ($inList)";
            if ($conn->query($delQuery)) {
                $count = $conn->affected_rows;
                $flash_msg = "$count registro(s) selecionado(s) removido(s) com sucesso!";
            } else {
                $flash_msg = "Erro ao remover registros selecionados: " . $conn->error;
                $flash_type = "error";
            }
        } else {
            $flash_msg = "Nenhum registro selecionado para exclusão.";
            $flash_type = "error";
        }
    }

    // 3. EDITAR REGISTRO
    else if ($action === 'edit_single') {
        $id = intval($_POST['edit_id'] ?? 0);
        $nome = trim($_POST['edit_nome'] ?? '');
        $pontos = intval($_POST['edit_pontos'] ?? 0);
        $modo = trim($_POST['edit_modo'] ?? 'beginner');
        $fase = intval($_POST['edit_fase'] ?? 1);

        if ($id > 0 && !empty($nome)) {
            $stmt = $conn->prepare("UPDATE ranking SET nome = ?, pontos = ?, modo = ?, fase = ? WHERE id = ?");
            $stmt->bind_param("sisii", $nome, $pontos, $modo, $fase, $id);
            if ($stmt->execute()) {
                $flash_msg = "Registro #$id atualizado com sucesso!";
            } else {
                $flash_msg = "Erro ao atualizar: " . $conn->error;
                $flash_type = "error";
            }
            $stmt->close();
        } else {
            $flash_msg = "Dados incompletos para edição.";
            $flash_type = "error";
        }
    }

    // 4. ZERAR TODO O RANKING
    else if ($action === 'reset_all') {
        $confirmText = trim($_POST['confirm_keyword'] ?? '');
        if (strtoupper($confirmText) === 'ZERAR') {
            if ($conn->query("TRUNCATE TABLE ranking") || $conn->query("DELETE FROM ranking")) {
                $flash_msg = "Todos os registros do ranking foram apagados com sucesso! O ranking está zerado.";
            } else {
                $flash_msg = "Erro ao zerar ranking: " . $conn->error;
                $flash_type = "error";
            }
        } else {
            $flash_msg = "Palavra-chave incorreta. O ranking não foi alterado.";
            $flash_type = "error";
        }
    }
}

// 5. EXPORTAR BACKUP EM CSV
if ($is_logged && $conn && !$db_error && isset($_GET['action']) && $_GET['action'] === 'export_csv') {
    $orderParam = $_GET['order'] ?? 'score_desc';
    $orderBy = "pontos DESC, data_jogo ASC";
    if ($orderParam === 'date_desc') {
        $orderBy = "data_jogo DESC, pontos DESC";
    } else if ($orderParam === 'date_asc') {
        $orderBy = "data_jogo ASC, pontos DESC";
    } else if ($orderParam === 'score_asc') {
        $orderBy = "pontos ASC, data_jogo ASC";
    }

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="ranking_sodiprom_backup_' . date('Y-m-d_His') . '.csv"');
    
    // Output UTF-8 BOM para compatibilidade com Microsoft Excel
    echo "\xEF\xBB\xBF";
    
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Nome', 'Pontos', 'Modo', 'Fase', 'Data e Hora'], ';');

    $res = $conn->query("SELECT id, nome, pontos, modo, fase, data_jogo FROM ranking ORDER BY $orderBy");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            fputcsv($output, [
                $row['id'] ?? '',
                $row['nome'] ?? '',
                $row['pontos'] ?? 0,
                $row['modo'] ?? 'beginner',
                $row['fase'] ?? 1,
                $row['data_jogo'] ?? ''
            ], ';');
        }
    }
    fclose($output);
    exit;
}

// ==========================================
// CONSULTA DE DADOS E ESTATÍSTICAS
// ==========================================
$records = [];
$stats = [
    'total' => 0,
    'top_score' => 0,
    'top_player' => '-',
    'avg_score' => 0,
    'total_today' => 0
];

$orderParam = $_GET['order'] ?? 'score_desc';
$orderBy = "pontos DESC, data_jogo ASC";
if ($orderParam === 'date_desc') {
    $orderBy = "data_jogo DESC, pontos DESC";
} else if ($orderParam === 'date_asc') {
    $orderBy = "data_jogo ASC, pontos DESC";
} else if ($orderParam === 'score_asc') {
    $orderBy = "pontos ASC, data_jogo ASC";
}

if ($is_logged && $conn && !$db_error) {
    // Estatísticas
    $qStats = $conn->query("SELECT COUNT(*) as total, MAX(pontos) as max_pts, AVG(pontos) as avg_pts FROM ranking");
    if ($qStats && $rStats = $qStats->fetch_assoc()) {
        $stats['total'] = intval($rStats['total']);
        $stats['top_score'] = intval($rStats['max_pts'] ?? 0);
        $stats['avg_score'] = round($rStats['avg_pts'] ?? 0);
    }

    $qTop = $conn->query("SELECT nome FROM ranking ORDER BY pontos DESC LIMIT 1");
    if ($qTop && $rTop = $qTop->fetch_assoc()) {
        $stats['top_player'] = $rTop['nome'];
    }

    $qToday = $conn->query("SELECT COUNT(*) as total_today FROM ranking WHERE DATE(data_jogo) = CURDATE()");
    if ($qToday && $rToday = $qToday->fetch_assoc()) {
        $stats['total_today'] = intval($rToday['total_today']);
    }

    // Lista de registros com a ordenação solicitada
    $qList = $conn->query("SELECT id, nome, pontos, modo, fase, data_jogo FROM ranking ORDER BY $orderBy");
    if ($qList) {
        while ($row = $qList->fetch_assoc()) {
            $records[] = $row;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel Admin • Gerenciar Ranking | SODIPROM - CAMP Diadema</title>
  <link rel="icon" type="image/png" href="img/logo-icon-sodiprom.png" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="img-assets.js"></script>
  <script>
    function fallbackImg(el, name) {
      if (typeof SODIPROM_ASSETS !== 'undefined' && SODIPROM_ASSETS[name]) {
        el.src = SODIPROM_ASSETS[name];
        el.removeAttribute('onerror');
      } else {
        const paths = ['img/' + name, name, '../' + name, 'imgs/' + name, '../img/' + name];
        let idx = parseInt(el.getAttribute('data-err') || '0', 10);
        if (idx < paths.length) {
          el.setAttribute('data-err', (idx + 1).toString());
          el.src = paths[idx];
        }
      }
    }
  </script>
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background: #f8fafc;
      color: #1e293b;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }
    .badge-expert {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .badge-beginner {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .badge-mobile {
      background-color: #e0e7ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between">

  <!-- ==================================================== -->
  <!-- TELA 1: LOGIN ADMINISTRATIVO (SE NÃO AUTENTICADO) -->
  <!-- ==================================================== -->
  <?php if (!$is_logged): ?>
  <div class="flex-1 flex items-center justify-center p-4">
    <div class="glass-card max-w-md w-full p-8 rounded-3xl shadow-xl text-center border-t-4 border-indigo-600">
      
      <div class="flex justify-center items-center gap-3 mb-6">
        <a href="https://sodiprom.com.br" target="_blank" rel="noopener noreferrer">
          <img src="img/sodiprom-logo50anos.png" onerror="fallbackImg(this, 'sodiprom-logo50anos.png')" alt="SODIPROM" class="h-16 object-contain">
        </a>
      </div>

      <span class="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-indigo-100 text-indigo-700 mb-2">
        ÁREA RESTRITA
      </span>
      <h1 class="text-2xl font-black text-gray-800 mb-1">Painel do Ranking</h1>
      <p class="text-xs text-gray-500 mb-6">Digite a senha de administrador para gerenciar e zerar registros.</p>

      <?php if (!empty($login_error)): ?>
      <div class="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 border border-red-200">
        ⚠️ <?php echo htmlspecialchars($login_error); ?>
      </div>
      <?php endif; ?>

      <form method="POST" action="admin.php" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Senha de Acesso</label>
          <input type="password" name="login_password" required placeholder="Digite a senha..." autofocus
                 class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm">
        </div>

        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2">
          <span>🔒</span>
          <span>ENTRAR NO PAINEL</span>
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <a href="index.html" class="hover:text-indigo-600 font-semibold flex items-center gap-1">
          ← Voltar ao Jogo
        </a>
        <a href="ranking_completo_final.php" class="hover:text-indigo-600 font-semibold">
          Ranking Público 🏆
        </a>
      </div>
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- TELA 2: PAINEL ADMINISTRATIVO (AUTENTICADO) -->
  <!-- ==================================================== -->
  <?php else: ?>
  
  <!-- CABEÇALHO SUPERIOR -->
  <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      
      <div class="flex items-center gap-3">
        <a href="https://sodiprom.com.br" target="_blank" rel="noopener noreferrer" class="transition-transform hover:scale-105">
          <img src="img/sodiprom-logo.png" onerror="fallbackImg(this, 'sodiprom-logo.png')" alt="SODIPROM" class="h-10 object-contain">
        </a>
        <div class="h-7 w-[1px] bg-gray-200 hidden sm:block"></div>
        <div>
          <h1 class="text-base sm:text-lg font-black text-indigo-900 leading-tight flex items-center gap-2">
            <span>⚙️ Gerenciador de Ranking</span>
            <span class="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">ADMIN ATIVO</span>
          </h1>
          <span class="text-[10px] text-orange-600 font-semibold tracking-wider uppercase block">SODIPROM • CAMP Diadema</span>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <a href="index.html" target="_blank" class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition flex items-center gap-1">
          <span>🎮</span> <span class="hidden sm:inline">Jogar</span>
        </a>
        <a href="ranking_completo_final.php" target="_blank" class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold transition flex items-center gap-1">
          <span>🏆</span> <span class="hidden sm:inline">Ranking Público</span>
        </a>
        <a href="admin.php?action=logout" class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition flex items-center gap-1 border border-red-200">
          <span>🚪</span> <span>Sair</span>
        </a>
      </div>

    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
    
    <!-- NOTIFICAÇÕES FLASH -->
    <?php if (!empty($flash_msg)): ?>
    <div class="mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold <?php echo $flash_type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'; ?>">
      <div class="flex items-center gap-2">
        <span><?php echo $flash_type === 'error' ? '❌' : '✅'; ?></span>
        <span><?php echo htmlspecialchars($flash_msg); ?></span>
      </div>
      <button onclick="this.parentElement.remove()" class="text-xs opacity-70 hover:opacity-100 font-bold">✕ Fechar</button>
    </div>
    <?php endif; ?>

    <?php if (!empty($db_error)): ?>
    <div class="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs">
      <strong>Aviso de Banco de Dados:</strong> <?php echo htmlspecialchars($db_error); ?>
      <br><span class="opacity-80">Se estiver rodando em ambiente local sem MySQL ativo, certifique-se de configurar o MySQL ou testar no servidor de hospedagem.</span>
    </div>
    <?php endif; ?>

    <!-- CARDS DE ESTATÍSTICAS (KPIs) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      <div class="glass-card p-4 rounded-2xl">
        <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Total de Partidas</span>
        <div class="flex items-baseline justify-between">
          <span class="text-3xl font-black text-indigo-900"><?php echo number_format($stats['total']); ?></span>
          <span class="text-lg">📊</span>
        </div>
      </div>

      <div class="glass-card p-4 rounded-2xl border-l-4 border-amber-400">
        <span class="text-[10px] uppercase font-bold text-amber-700 tracking-wider block mb-1">Recorde Máximo</span>
        <div class="flex items-baseline justify-between">
          <div>
            <span class="text-3xl font-black text-amber-600"><?php echo number_format($stats['top_score']); ?></span>
            <span class="text-[11px] text-gray-500 block truncate max-w-[120px]">por <strong><?php echo htmlspecialchars($stats['top_player']); ?></strong></span>
          </div>
          <span class="text-lg">👑</span>
        </div>
      </div>

      <div class="glass-card p-4 rounded-2xl">
        <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Média de Pontos</span>
        <div class="flex items-baseline justify-between">
          <span class="text-3xl font-black text-blue-700"><?php echo number_format($stats['avg_score']); ?></span>
          <span class="text-lg">📈</span>
        </div>
      </div>

      <div class="glass-card p-4 rounded-2xl">
        <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Partidas Hoje</span>
        <div class="flex items-baseline justify-between">
          <span class="text-3xl font-black text-emerald-700"><?php echo number_format($stats['total_today']); ?></span>
          <span class="text-lg">📅</span>
        </div>
      </div>

    </div>

    <!-- BARRA DE AÇÕES E FILTROS -->
    <div class="glass-card p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4">
      
      <!-- Busca e Filtros -->
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <div class="relative flex-1 min-w-[180px]">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs">🔍</span>
          <input type="text" id="filter-search" placeholder="Buscar por jogador..."
                 class="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-200 outline-none">
        </div>

        <!-- Seletor de Ordenação (Data e Pontos) -->
        <select id="filter-sort-select" class="py-2 px-3 text-xs rounded-xl border border-gray-300 bg-white font-semibold text-gray-700 focus:border-indigo-600 outline-none shadow-sm">
          <option value="score_desc" <?php echo $orderParam === 'score_desc' ? 'selected' : ''; ?>>🏆 Pontos (Maior → Menor)</option>
          <option value="date_desc" <?php echo $orderParam === 'date_desc' ? 'selected' : ''; ?>>📅 Data (Mais Recente → Mais Antiga)</option>
          <option value="date_asc" <?php echo $orderParam === 'date_asc' ? 'selected' : ''; ?>>📅 Data (Mais Antiga → Mais Recente)</option>
          <option value="score_asc" <?php echo $orderParam === 'score_asc' ? 'selected' : ''; ?>>📉 Pontos (Menor → Maior)</option>
        </select>

        <!-- Filtro por Período de Data -->
        <select id="filter-period-select" class="py-2 px-3 text-xs rounded-xl border border-gray-300 bg-white font-medium text-gray-700 focus:border-indigo-600 outline-none shadow-sm">
          <option value="all">📅 Todo o Período</option>
          <option value="today">Somente Hoje</option>
          <option value="week">Últimos 7 Dias</option>
          <option value="month">Este Mês</option>
        </select>

        <!-- Filtro por Modo -->
        <select id="filter-mode-select" class="py-2 px-3 text-xs rounded-xl border border-gray-300 bg-white font-medium text-gray-700 focus:border-indigo-600 outline-none shadow-sm">
          <option value="all">Todos os Modos</option>
          <option value="beginner">🌱 Iniciante</option>
          <option value="expert">👑 Rei Digitador</option>
          <option value="mobile">📱 Mobile</option>
        </select>
      </div>

      <!-- Botões de Ação Geral -->
      <div class="flex items-center gap-2">
        <!-- Botão de Exclusão Múltipla (visível dinamicamente quando itens são marcados) -->
        <button id="btn-delete-selected" type="button" onclick="openDeleteMultipleModal()" class="hidden px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 animate-pulse" title="Excluir registros selecionados">
          <span>🗑️</span> <span id="btn-delete-selected-text">Excluir Selecionados (0)</span>
        </button>

        <a id="btn-export-csv" href="admin.php?action=export_csv&order=<?php echo htmlspecialchars($orderParam); ?>" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5" title="Baixar planilha de backup">
          <span>📥</span> <span>Exportar Backup (CSV)</span>
        </a>

        <button type="button" onclick="openResetModal()" class="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5">
          <span>⚠️</span> <span>Zerar Todo o Ranking</span>
        </button>
      </div>

    </div>

    <!-- TABELA DE REGISTROS -->
    <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs" id="table-ranking">
          <thead class="bg-indigo-900 text-white uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th class="py-3 px-3 w-10 text-center">
                <input type="checkbox" id="check-all" class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" title="Selecionar Todos / Nenhum">
              </th>
              <th class="py-3 px-3"># ID</th>
              <th class="py-3 px-3">Jogador</th>
              <th class="py-3 px-3 cursor-pointer select-none hover:bg-indigo-800 transition" onclick="toggleSort('score')" title="Clique para alternar ordenação por pontos">
                <div class="flex items-center gap-1">
                  <span>Pontuação</span>
                  <span id="sort-icon-score">↕️</span>
                </div>
              </th>
              <th class="py-3 px-3">Modo</th>
              <th class="py-3 px-3">Fase</th>
              <th class="py-3 px-3 cursor-pointer select-none hover:bg-indigo-800 transition" onclick="toggleSort('date')" title="Clique para alternar ordenação por data (maior/menor)">
                <div class="flex items-center gap-1">
                  <span>Data e Hora</span>
                  <span id="sort-icon-date"><?php echo $orderParam === 'date_desc' ? '⬇️' : ($orderParam === 'date_asc' ? '⬆️' : '↕️'); ?></span>
                </div>
              </th>
              <th class="py-3 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700 font-medium">
            <?php if (empty($records)): ?>
            <tr>
              <td colspan="8" class="py-8 text-center text-gray-400 italic">
                Nenhum registro encontrado no ranking.
              </td>
            </tr>
            <?php else: ?>
              <?php foreach ($records as $idx => $r): 
                $rId = $r['id'] ?? ($idx + 1);
                $isExpert = strpos($r['modo'], 'expert') !== false;
                $isMobile = strpos($r['modo'], 'mobile') !== false;
                $modeBadgeClass = $isExpert ? 'badge-expert' : ($isMobile ? 'badge-mobile' : 'badge-beginner');
                $modeLabel = $isExpert ? '👑 Rei Digitador' : '🌱 Iniciante';
                if ($isMobile) $modeLabel .= ' 📱';
                $timestamp = !empty($r['data_jogo']) ? strtotime($r['data_jogo']) : 0;
              ?>
              <tr class="hover:bg-slate-50 transition ranking-row" 
                  data-name="<?php echo strtolower(htmlspecialchars($r['nome'])); ?>" 
                  data-mode="<?php echo htmlspecialchars($r['modo']); ?>"
                  data-date="<?php echo $timestamp; ?>"
                  data-score="<?php echo intval($r['pontos']); ?>">
                <td class="py-3 px-3 text-center">
                  <input type="checkbox" class="row-checkbox w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" 
                         value="<?php echo intval($rId); ?>"
                         data-name="<?php echo htmlspecialchars($r['nome']); ?>"
                         data-points="<?php echo intval($r['pontos']); ?>">
                </td>
                <td class="py-3 px-3 text-gray-400 font-mono text-[11px]">#<?php echo htmlspecialchars($rId); ?></td>
                <td class="py-3 px-3 font-bold text-gray-900 flex items-center gap-1.5">
                  <?php if ($idx === 0 && $orderParam === 'score_desc'): ?><span>🥇</span>
                  <?php elseif ($idx === 1 && $orderParam === 'score_desc'): ?><span>🥈</span>
                  <?php elseif ($idx === 2 && $orderParam === 'score_desc'): ?><span>🥉</span>
                  <?php endif; ?>
                  <span class="player-name"><?php echo htmlspecialchars($r['nome']); ?></span>
                </td>
                <td class="py-3 px-3 font-black text-indigo-700 text-sm">
                  <?php echo number_format($r['pontos']); ?>
                </td>
                <td class="py-3 px-3">
                  <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold <?php echo $modeBadgeClass; ?>">
                    <?php echo $modeLabel; ?>
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold text-[10px]">
                    Fase <?php echo htmlspecialchars($r['fase'] ?? 1); ?>
                  </span>
                </td>
                <td class="py-3 px-3 text-gray-500 font-mono text-[11px]">
                  <?php echo !empty($r['data_jogo']) ? date('d/m/Y H:i', strtotime($r['data_jogo'])) : '-'; ?>
                </td>
                <td class="py-3 px-3 text-right">
                  <div class="inline-flex items-center gap-1">
                    <button onclick='openEditModal(<?php echo json_encode($r); ?>)' class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar este registro">
                      ✏️
                    </button>
                    <button onclick="confirmDelete(<?php echo intval($rId); ?>, '<?php echo addslashes(htmlspecialchars($r['nome'])); ?>', <?php echo intval($r['pontos']); ?>)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir este registro">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
      
      <div id="no-search-results" class="py-8 text-center text-gray-400 italic hidden">
        Nenhum registro corresponde aos filtros selecionados.
      </div>
    </div>

  </main>

  <!-- ==================================================== -->
  <!-- MODAL 1: EXCLUSÃO INDIVIDUAL -->
  <!-- ==================================================== -->
  <div id="modal-delete" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border-t-4 border-red-600 animate-in fade-in zoom-in duration-150">
      <span class="text-4xl block mb-2">🗑️</span>
      <h3 class="text-lg font-black text-gray-900 mb-1">Excluir Registro?</h3>
      <p class="text-xs text-gray-600 mb-4 leading-relaxed">
        Você tem certeza que deseja remover o registro do jogador <strong id="del-name" class="text-red-600 font-bold"></strong> (<span id="del-points"></span> pts)? Esta ação não pode ser desfeita.
      </p>

      <form method="POST" action="admin.php">
        <input type="hidden" name="admin_action" value="delete_single">
        <input type="hidden" name="id" id="del-id" value="">

        <div class="flex gap-2">
          <button type="button" onclick="closeModal('modal-delete')" class="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition">
            CANCELAR
          </button>
          <button type="submit" class="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition">
            SIM, EXCLUIR
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- MODAL 2: ZERAR TODO O RANKING (PROTEÇÃO DUPLA) -->
  <!-- ==================================================== -->
  <div id="modal-reset" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-t-8 border-red-600">
      <span class="text-5xl block mb-2">⚠️</span>
      <h3 class="text-xl font-black text-red-600 mb-2">ZERAR TODO O RANKING?</h3>
      <p class="text-xs text-gray-600 mb-4 leading-relaxed">
        <strong>ATENÇÃO MÁXIMA:</strong> Esta ação apagará permanentemente <strong>TODOS OS REGISTROS</strong> do banco de dados (histórico de jogadas, recordes e pontuações de todos os alunos).
      </p>

      <div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700 text-left">
        <strong>Para confirmar a exclusão total:</strong><br>
        Digite exatamente a palavra <span class="bg-red-200 px-1 py-0.5 rounded font-mono font-bold text-red-900">ZERAR</span> no campo abaixo:
      </div>

      <form method="POST" action="admin.php" onsubmit="return validateResetKeyword()">
        <input type="hidden" name="admin_action" value="reset_all">

        <input type="text" name="confirm_keyword" id="reset-keyword" required placeholder="Digite ZERAR" autocomplete="off"
               class="w-full text-center tracking-widest font-mono font-bold px-4 py-2.5 rounded-xl border-2 border-red-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-sm mb-4 uppercase">

        <div class="flex gap-2">
          <button type="button" onclick="closeModal('modal-reset')" class="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition">
            CANCELAR
          </button>
          <button type="submit" id="btn-submit-reset" class="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition">
            LIMPAR TUDO
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- MODAL 3: EDITAR REGISTRO -->
  <!-- ==================================================== -->
  <div id="modal-edit" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border-t-4 border-indigo-600">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-black text-indigo-900 flex items-center gap-1.5">
          <span>✏️</span> <span>Editar Registro de Ranking</span>
        </h3>
        <button onclick="closeModal('modal-edit')" class="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
      </div>

      <form method="POST" action="admin.php" class="space-y-3 text-xs">
        <input type="hidden" name="admin_action" value="edit_single">
        <input type="hidden" name="edit_id" id="edit-id" value="">

        <div>
          <label class="block font-bold text-gray-700 uppercase mb-1">Nome do Jogador</label>
          <input type="text" name="edit_nome" id="edit-nome" required maxlength="15"
                 class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-600 outline-none font-semibold">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 uppercase mb-1">Pontuação</label>
            <input type="number" name="edit_pontos" id="edit-pontos" required min="0"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-600 outline-none font-bold text-indigo-700">
          </div>
          <div>
            <label class="block font-bold text-gray-700 uppercase mb-1">Fase Máxima</label>
            <input type="number" name="edit_fase" id="edit-fase" required min="1" max="8"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-600 outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 uppercase mb-1">Modo de Jogo</label>
          <select name="edit_modo" id="edit-modo" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-600 outline-none bg-white">
            <option value="beginner">🌱 Iniciante (beginner)</option>
            <option value="expert">👑 Rei Digitador (expert)</option>
            <option value="mobile_beginner">📱 Mobile Iniciante</option>
            <option value="mobile_expert">📱 Mobile Especialista</option>
          </select>
        </div>

        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <button type="button" onclick="closeModal('modal-edit')" class="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition">
            CANCELAR
          </button>
          <button type="submit" class="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition">
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- MODAL 4: EXCLUSÃO MÚLTIPLA DE REGISTROS -->
  <!-- ==================================================== -->
  <div id="modal-delete-multiple" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border-t-4 border-rose-600 animate-in fade-in zoom-in duration-150">
      <span class="text-4xl block mb-2">🗑️</span>
      <h3 class="text-lg font-black text-gray-900 mb-1">Excluir Registros Selecionados?</h3>
      <p class="text-xs text-gray-600 mb-3 leading-relaxed">
        Você selecionou <strong id="del-mult-count" class="text-rose-600 font-bold">0</strong> registro(s) para remoção simultânea. Esta ação não poderá ser desfeita.
      </p>

      <div class="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
        Registros marcados:
      </div>
      <div id="del-mult-preview" class="max-h-36 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-xl text-left text-[11px] text-gray-700 border border-gray-200">
        <!-- Lista gerada dinamicamente via JS -->
      </div>

      <form method="POST" action="admin.php" id="form-delete-multiple">
        <input type="hidden" name="admin_action" value="delete_multiple">
        <div id="del-mult-hidden-inputs"></div>

        <div class="flex gap-2">
          <button type="button" onclick="closeModal('modal-delete-multiple')" class="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition">
            CANCELAR
          </button>
          <button type="submit" class="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition">
            SIM, EXCLUIR
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    // Gerenciador de Modais
    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    function confirmDelete(id, name, points) {
      document.getElementById('del-id').value = id;
      document.getElementById('del-name').textContent = name;
      document.getElementById('del-points').textContent = points;
      document.getElementById('modal-delete').classList.remove('hidden');
    }

    function openResetModal() {
      document.getElementById('reset-keyword').value = '';
      document.getElementById('modal-reset').classList.remove('hidden');
      setTimeout(() => document.getElementById('reset-keyword').focus(), 100);
    }

    function validateResetKeyword() {
      const val = document.getElementById('reset-keyword').value.trim().toUpperCase();
      if (val !== 'ZERAR') {
        alert("Digite exatamente a palavra ZERAR para confirmar!");
        return false;
      }
      return confirm("Atenção final: Você confirma o apagamento de TODOS os dados de ranking?");
    }

    function openEditModal(record) {
      document.getElementById('edit-id').value = record.id;
      document.getElementById('edit-nome').value = record.nome;
      document.getElementById('edit-pontos').value = record.pontos;
      document.getElementById('edit-fase').value = record.fase || 1;
      document.getElementById('edit-modo').value = record.modo || 'beginner';
      document.getElementById('modal-edit').classList.remove('hidden');
    }

    // Filtragem e Ordenação em tempo real na tabela
    const filterInput = document.getElementById('filter-search');
    const filterSort = document.getElementById('filter-sort-select');
    const filterPeriod = document.getElementById('filter-period-select');
    const filterMode = document.getElementById('filter-mode-select');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const iconSortScore = document.getElementById('sort-icon-score');
    const iconSortDate = document.getElementById('sort-icon-date');
    const noResults = document.getElementById('no-search-results');

    function updateSortIcons(currentSort) {
      if (iconSortScore) {
        if (currentSort === 'score_desc') iconSortScore.textContent = '⬇️';
        else if (currentSort === 'score_asc') iconSortScore.textContent = '⬆️';
        else iconSortScore.textContent = '↕️';
      }
      if (iconSortDate) {
        if (currentSort === 'date_desc') iconSortDate.textContent = '⬇️';
        else if (currentSort === 'date_asc') iconSortDate.textContent = '⬆️';
        else iconSortDate.textContent = '↕️';
      }
    }

    function toggleSort(type) {
      const current = filterSort ? filterSort.value : 'score_desc';
      let next = 'score_desc';

      if (type === 'date') {
        next = (current === 'date_desc') ? 'date_asc' : 'date_desc';
      } else if (type === 'score') {
        next = (current === 'score_desc') ? 'score_asc' : 'score_desc';
      }

      if (filterSort) {
        filterSort.value = next;
      }
      applyFiltersAndSort();
    }

    function applyFiltersAndSort() {
      const query = filterInput ? filterInput.value.toLowerCase().trim() : '';
      const mode = filterMode ? filterMode.value : 'all';
      const period = filterPeriod ? filterPeriod.value : 'all';
      const currentSort = filterSort ? filterSort.value : 'score_desc';

      // Atualiza ícones do cabeçalho da tabela
      updateSortIcons(currentSort);

      // Atualiza link de exportação CSV para refletir ordenação selecionada
      if (btnExportCsv) {
        btnExportCsv.href = `admin.php?action=export_csv&order=${encodeURIComponent(currentSort)}`;
      }

      // Cálculo de períodos de data em segundos (compatível com PHP strtotime)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
      const weekStart = todayStart - (6 * 86400); // 7 dias incluindo hoje
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;

      // Ordenar linhas no DOM
      const tbody = document.querySelector('#table-ranking tbody');
      if (tbody) {
        const rowsArray = Array.from(document.querySelectorAll('.ranking-row'));
        
        rowsArray.sort((a, b) => {
          const scoreA = parseInt(a.dataset.score) || 0;
          const scoreB = parseInt(b.dataset.score) || 0;
          const dateA = parseInt(a.dataset.date) || 0;
          const dateB = parseInt(b.dataset.date) || 0;

          if (currentSort === 'date_desc') {
            return dateB - dateA;
          } else if (currentSort === 'date_asc') {
            return dateA - dateB;
          } else if (currentSort === 'score_asc') {
            return scoreA - scoreB;
          } else { // score_desc default
            return scoreB - scoreA;
          }
        });

        rowsArray.forEach(row => tbody.appendChild(row));
      }

      // Filtrar visibilidade
      const tableRows = document.querySelectorAll('.ranking-row');
      let visibleCount = 0;

      tableRows.forEach(row => {
        const rowName = row.dataset.name || '';
        const rowMode = row.dataset.mode || '';
        const rowDate = parseInt(row.dataset.date) || 0;

        const matchesQuery = query === '' || rowName.includes(query);
        const matchesMode = mode === 'all' || rowMode.includes(mode);

        let matchesPeriod = true;
        if (period === 'today') {
          matchesPeriod = rowDate >= todayStart;
        } else if (period === 'week') {
          matchesPeriod = rowDate >= weekStart;
        } else if (period === 'month') {
          matchesPeriod = rowDate >= monthStart;
        }

        if (matchesQuery && matchesMode && matchesPeriod) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      if (noResults) {
        if (visibleCount === 0 && tableRows.length > 0) {
          noResults.classList.remove('hidden');
        } else {
          noResults.classList.add('hidden');
        }
      }

      // Atualiza o estado da seleção com base nos filtros
      updateSelectedCount();
    }

    // Gerenciador de Seleção Individual e Múltipla
    const checkAll = document.getElementById('check-all');
    const btnDeleteSelected = document.getElementById('btn-delete-selected');
    const btnDeleteSelectedText = document.getElementById('btn-delete-selected-text');

    function getVisibleRows() {
      return Array.from(document.querySelectorAll('.ranking-row')).filter(r => r.style.display !== 'none');
    }

    function getCheckedBoxes() {
      return Array.from(document.querySelectorAll('.row-checkbox:checked'));
    }

    function updateSelectedCount() {
      const checkedBoxes = getCheckedBoxes();
      const count = checkedBoxes.length;

      if (btnDeleteSelected && btnDeleteSelectedText) {
        if (count > 0) {
          btnDeleteSelected.classList.remove('hidden');
          btnDeleteSelectedText.textContent = `Excluir Selecionados (${count})`;
        } else {
          btnDeleteSelected.classList.add('hidden');
        }
      }

      if (checkAll) {
        const visibleRows = getVisibleRows();
        const visibleBoxes = visibleRows.map(r => r.querySelector('.row-checkbox')).filter(Boolean);
        const visibleChecked = visibleBoxes.filter(b => b.checked);

        if (visibleBoxes.length > 0 && visibleChecked.length === visibleBoxes.length) {
          checkAll.checked = true;
          checkAll.indeterminate = false;
        } else if (visibleChecked.length > 0) {
          checkAll.checked = false;
          checkAll.indeterminate = true;
        } else {
          checkAll.checked = false;
          checkAll.indeterminate = false;
        }
      }
    }

    function toggleSelectAll(checked) {
      const visibleRows = getVisibleRows();
      visibleRows.forEach(row => {
        const cb = row.querySelector('.row-checkbox');
        if (cb) cb.checked = checked;
      });
      updateSelectedCount();
    }

    if (checkAll) {
      checkAll.addEventListener('change', function() {
        toggleSelectAll(this.checked);
      });
    }

    document.querySelectorAll('.row-checkbox').forEach(cb => {
      cb.addEventListener('change', updateSelectedCount);
    });

    function openDeleteMultipleModal() {
      const checkedBoxes = getCheckedBoxes();
      if (checkedBoxes.length === 0) {
        alert("Nenhum registro selecionado. Marque ao menos uma caixa de seleção.");
        return;
      }

      const count = checkedBoxes.length;
      document.getElementById('del-mult-count').textContent = count;

      const previewContainer = document.getElementById('del-mult-preview');
      previewContainer.innerHTML = '';
      const listEl = document.createElement('ul');
      listEl.className = 'divide-y divide-gray-100';

      const hiddenContainer = document.getElementById('del-mult-hidden-inputs');
      hiddenContainer.innerHTML = '';

      checkedBoxes.forEach(cb => {
        const id = cb.value;
        const name = cb.dataset.name || 'Jogador';
        const points = cb.dataset.points || '0';

        const li = document.createElement('li');
        li.className = 'py-1 flex justify-between items-center text-xs';
        li.innerHTML = `<span><strong>${name}</strong> <span class="text-gray-400 font-mono text-[10px]">#${id}</span></span> <span class="font-bold text-indigo-700">${Number(points).toLocaleString()} pts</span>`;
        listEl.appendChild(li);

        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = 'selected_ids[]';
        inp.value = id;
        hiddenContainer.appendChild(inp);
      });

      previewContainer.appendChild(listEl);
      document.getElementById('modal-delete-multiple').classList.remove('hidden');
    }

    if (filterInput) filterInput.addEventListener('input', applyFiltersAndSort);
    if (filterSort) filterSort.addEventListener('change', applyFiltersAndSort);
    if (filterPeriod) filterPeriod.addEventListener('change', applyFiltersAndSort);
    if (filterMode) filterMode.addEventListener('change', applyFiltersAndSort);

    // Fechar modais ao clicar no fundo
    ['modal-delete', 'modal-reset', 'modal-edit', 'modal-delete-multiple'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) closeModal(id);
        });
      }
    });
  </script>
  <?php endif; ?>

  <!-- RODAPÉ INSTITUCIONAL -->
  <footer class="bg-white border-t border-gray-200 py-4 mt-8">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
      <div class="flex items-center gap-2">
        <a href="https://sodiprom.com.br" target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 font-semibold flex items-center gap-1.5">
          <img src="img/logo-icon-sodiprom.png" onerror="fallbackImg(this, 'logo-icon-sodiprom.png')" alt="SODIPROM" class="h-4 w-4 object-contain">
          <span>SODIPROM - CAMP Diadema</span>
        </a>
        <span>•</span>
        <span>Capacitação e Inclusão Digital</span>
      </div>
      <div>
        <span>Desafio de Digitação • Painel Administrativo</span>
      </div>
    </div>
  </footer>

</body>
</html>
