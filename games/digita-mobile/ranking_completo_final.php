<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranking Completo - Jogo de Digitação</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .ranking-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 12px 24px rgba(0,0,0,0.2);
        }
        .mode-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .mode-beginner {
            background-color: #c6f6d5;
            color: #22543d;
        }
        .mode-expert {
            background-color: #fed7d7;
            color: #742a2a;
        }
        .phase-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 600;
            background-color: #e2e8f0;
            color: #4a5568;
            margin-left: 4px;
        }
        .position-medal {
            font-size: 1.5rem;
            margin-right: 8px;
        }
        .table-row:nth-child(even) {
            background-color: rgba(247, 250, 252, 0.5);
        }
        .table-row:hover {
            background-color: rgba(237, 242, 247, 0.8);
            transform: translateY(-1px);
            transition: all 0.2s ease;
        }
    </style>
</head>
<body class="p-4">
    <div class="max-w-6xl mx-auto">
        <div class="ranking-card p-6 mb-6">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-3xl font-bold text-purple-700">🏆 Ranking Completo</h1>
                <button onclick="window.close()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                    Fechar
                </button>
            </div>
            
            <div class="mb-4 flex gap-4">
                <button id="filter-all" class="filter-btn bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
                    Todos
                </button>
                <button id="filter-beginner" class="filter-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">
                    🌱 Iniciante
                </button>
                <button id="filter-expert" class="filter-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">
                    👑 Rei Digitador
                </button>
            </div>
        </div>

        <div class="ranking-card p-6">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-purple-200">
                            <th class="text-left py-3 px-2 font-bold text-purple-700">Posição</th>
                            <th class="text-left py-3 px-2 font-bold text-purple-700">Nome</th>
                            <th class="text-left py-3 px-2 font-bold text-purple-700">Pontos</th>
                            <th class="text-left py-3 px-2 font-bold text-purple-700">Modo</th>
                            <th class="text-left py-3 px-2 font-bold text-purple-700">Fase</th>
                            <th class="text-left py-3 px-2 font-bold text-purple-700">Data</th>
                        </tr>
                    </thead>
                    <tbody id="ranking-tbody">
                        <!-- Dados serão carregados via JavaScript -->
                    </tbody>
                </table>
            </div>
            
            <div id="loading" class="text-center py-8 text-gray-600">
                Carregando ranking...
            </div>
            
            <div id="no-results" class="text-center py-8 text-gray-600" style="display: none;">
                Nenhum resultado encontrado para este filtro.
            </div>
        </div>
    </div>

    <script>
        let allRankingData = [];
        let currentFilter = 'all';

        function getMedalIcon(position) {
            switch(position) {
                case 1: return '🥇';
                case 2: return '🥈';
                case 3: return '🥉';
                default: return `${position}º`;
            }
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        }

        function renderRanking(data) {
            const tbody = document.getElementById('ranking-tbody');
            const loading = document.getElementById('loading');
            const noResults = document.getElementById('no-results');
            
            loading.style.display = 'none';
            
            if (data.length === 0) {
                tbody.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }
            
            noResults.style.display = 'none';
            
            tbody.innerHTML = data.map((item, index) => {
                const position = index + 1;
                const modeClass = item.modo === 'expert' ? 'mode-expert' : 'mode-beginner';
                const modeText = item.modo === 'expert' ? '👑 Rei Digitador' : '🌱 Iniciante';
                const phaseText = `Fase ${item.fase}`;
                
                return `
                    <tr class="table-row">
                        <td class="py-3 px-2">
                            <span class="position-medal">${getMedalIcon(position)}</span>
                        </td>
                        <td class="py-3 px-2 font-semibold">${item.nome}</td>
                        <td class="py-3 px-2 font-bold text-green-600">${item.pontos}</td>
                        <td class="py-3 px-2">
                            <span class="mode-badge ${modeClass}">${modeText}</span>
                        </td>
                        <td class="py-3 px-2">
                            <span class="phase-badge">${phaseText}</span>
                        </td>
                        <td class="py-3 px-2 text-gray-600">${formatDate(item.data_jogo)}</td>
                    </tr>
                `;
            }).join('');
        }

        function filterRanking(mode) {
            currentFilter = mode;
            
            // Atualizar botões
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-purple-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            const activeBtn = document.getElementById(`filter-${mode}`);
            activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
            activeBtn.classList.add('bg-purple-600', 'text-white');
            
            // Filtrar dados
            let filteredData = allRankingData;
            if (mode !== 'all') {
                filteredData = allRankingData.filter(item => item.modo === mode);
            }
            
            renderRanking(filteredData);
        }

        function loadRanking() {
            fetch('listar_ranking_completo_final.php')
                .then(res => res.json())
                .then(data => {
                    allRankingData = data;
                    filterRanking(currentFilter);
                })
                .catch(err => {
                    console.error('Erro ao carregar ranking:', err);
                    document.getElementById('loading').textContent = 'Erro ao carregar dados.';
                });
        }

        // Event listeners
        document.getElementById('filter-all').addEventListener('click', () => filterRanking('all'));
        document.getElementById('filter-beginner').addEventListener('click', () => filterRanking('beginner'));
        document.getElementById('filter-expert').addEventListener('click', () => filterRanking('expert'));

        // Carregar dados ao abrir a página
        loadRanking();
    </script>
</body>
</html>

