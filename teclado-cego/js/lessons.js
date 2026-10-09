/**
 * Currículo Pedagógico de Digitação ABNT2
 * Projetado para jovens aprendizes da SODIPROM - CAMP Diadema
 */

const LESSONS_DATABASE = [
  // ====================================================================
  // NÍVEL 1: POSTURA & LINHA GUIA CENTRAL (HOME ROW)
  // ====================================================================
  {
    id: 1,
    level: 1,
    levelName: "Nível 1: Postura & Linha Guia",
    title: "Teclas de Ancoragem (F e J)",
    desc: "Sinta os risquinhos em relevo nas teclas F e J. Repouse seus dedos indicadores nelas!",
    keysIntroduced: ["f", "j", " "],
    text: "f j f j ff jj f f j j fj jf f j fj jf ff jj fj jf f f j j ff jj fj jf"
  },
  {
    id: 2,
    level: 1,
    levelName: "Nível 1: Postura & Linha Guia",
    title: "Dedos Médios (D e K)",
    desc: "Mantenha os indicadores em F e J. Posicione o médio esquerdo no D e o médio direito no K.",
    keysIntroduced: ["d", "k"],
    text: "d k d k dd kk dk kd f d j k fd jk df kj d f k j df jk dd kk ff jj d k"
  },
  {
    id: 3,
    level: 1,
    levelName: "Nível 1: Postura & Linha Guia",
    title: "Dedos Anelares (S e L)",
    desc: "Posicione o anelar esquerdo no S e o anelar direito no L. Mantenha os pulsos retos!",
    keysIntroduced: ["s", "l"],
    text: "s l s l ss ll sl ls s d f j k l as df jk l sl dk fj ls kd jf s l s l"
  },
  {
    id: 4,
    level: 1,
    levelName: "Nível 1: Postura & Linha Guia",
    title: "Dedos Mínimos (A e Ç)",
    desc: "A mão esquerda pousa o dedo mínimo no A e a mão direita pousa o dedo mínimo no Ç.",
    keysIntroduced: ["a", "ç"],
    text: "a ç a ç aa çç aç ça a s d f j k l ç asdf jklç fa la da sa ça la da fa"
  },
  {
    id: 5,
    level: 1,
    levelName: "Nível 1: Postura & Linha Guia",
    title: "Extensão dos Indicadores (G e H)",
    desc: "Estique levemente o indicador esquerdo para o G e o indicador direito para o H.",
    keysIntroduced: ["g", "h"],
    text: "g h g h fg hj gh hg fg hj da ga la ha fada gaga haja gala sala fala"
  },
  {
    id: 6,
    level: 1,
    levelName: "Nível 1: Postura & Linha Guia",
    title: "Desafio da Linha Guia Completa",
    desc: "Treine palavras reais formadas exclusivamente com a linha central do teclado!",
    keysIntroduced: ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
    text: "fada fala sala gala gado laço caça façal açafada fada sala fala gado"
  },

  // ====================================================================
  // NÍVEL 2: LINHA SUPERIOR (ALCANCE PARA CIMA)
  // ====================================================================
  {
    id: 7,
    level: 2,
    levelName: "Nível 2: Linha Superior",
    title: "Dedos Médios no Topo (E e I)",
    desc: "Suba o dedo médio esquerdo de D para E, e o dedo médio direito de K para I.",
    keysIntroduced: ["e", "i"],
    text: "d e k i de ki ed ik de ki e i e i fe fi de ki leila feia ideia chefe dia"
  },
  {
    id: 8,
    level: 2,
    levelName: "Nível 2: Linha Superior",
    title: "Indicadores no Topo (R, U, T e Y)",
    desc: "O indicador esquerdo alcança R e T. O indicador direito alcança U e Y.",
    keysIntroduced: ["r", "u", "t", "y"],
    text: "f r j u f t j y fr ju ft jy rua tua rei tira rato tatu tiro tudo rua"
  },
  {
    id: 9,
    level: 2,
    levelName: "Nível 2: Linha Superior",
    title: "Dedos Anelares no Topo (W e O)",
    desc: "Suba o anelar esquerdo de S para W, e o anelar direito de L para O.",
    keysIntroduced: ["w", "o"],
    text: "s w l o sw lo so wo bolo sola foto olho loja trabalho folha voto ouro"
  },
  {
    id: 10,
    level: 2,
    levelName: "Nível 2: Linha Superior",
    title: "Dedos Mínimos no Topo (Q e P)",
    desc: "Suba o dedo mínimo esquerdo para o Q e o dedo mínimo direito para o P.",
    keysIntroduced: ["q", "p"],
    text: "a q ç p aq çp que para papel pato queijo quarto pedra prazo ponto pipa"
  },
  {
    id: 11,
    level: 2,
    levelName: "Nível 2: Linha Superior",
    title: "Linha Guia + Linha Superior Integradas",
    desc: "Excelente! Agora combine as duas linhas superiores em termos do cotidiano.",
    keysIntroduced: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    text: "equipe projeto tarefa futuro trabalho teoria projeto estudo qualidade"
  },

  // ====================================================================
  // NÍVEL 3: LINHA INFERIOR (ALCANCE PARA BAIXO)
  // ====================================================================
  {
    id: 12,
    level: 3,
    levelName: "Nível 3: Linha Inferior",
    title: "Indicadores Embaixo (V, M, B e N)",
    desc: "Desça o indicador esquerdo para V e B. Desça o indicador direito para M e N.",
    keysIntroduced: ["v", "m", "b", "n"],
    text: "f v f b j m j n fv fb jm jn vida bem mundo novo bom valor nome busca"
  },
  {
    id: 13,
    level: 3,
    levelName: "Nível 3: Linha Inferior",
    title: "Médios e Anelares Embaixo (C, X, vírgula e ponto)",
    desc: "Dedo médio esquerdo alcança C, anelar alcança X. Na mão direita: vírgula e ponto.",
    keysIntroduced: ["c", "x", ",", "."],
    text: "d c s x k , l . dc sx k, l. casa taxa caixa foco lucro, meta. texto, plano."
  },
  {
    id: 14,
    level: 3,
    levelName: "Nível 3: Linha Inferior",
    title: "Dedos Mínimos Embaixo (Z, barra e ponto-e-vírgula)",
    desc: "Dedo mínimo esquerdo alcança Z. Dedo mínimo direito alcança barra (/) e ponto e vírgula (;).",
    keysIntroduced: ["z", ";", "/"],
    text: "a z ç ; az ç; zero prazo zelo voz; luz/dia feliz; prazo; capaz; zelo;"
  },
  {
    id: 15,
    level: 3,
    levelName: "Nível 3: Linha Inferior",
    title: "Integração do Teclado Completo",
    desc: "Parabéns! Você já conhece todas as letras sem precisar olhar para baixo.",
    keysIntroduced: ["todas as letras"],
    text: "o jovem aprendiz constrói seu caminho com dedicação foco e muito treino"
  },

  // ====================================================================
  // NÍVEL 4: ACENTUAÇÃO BRASILEIRA & ABNT2
  // ====================================================================
  {
    id: 16,
    level: 4,
    levelName: "Nível 4: Acentuação ABNT2",
    title: "Acento Agudo (´) e Palavras com Ç",
    desc: "Tecle o acento agudo com o mínimo direito e depois tecle a vogal desejada.",
    keysIntroduced: ["´", "ç", "á", "é", "í", "ó", "ú"],
    text: "café saída fácil água líder vitória açúcar início rápido régua serviço ação"
  },
  {
    id: 17,
    level: 4,
    levelName: "Nível 4: Acentuação ABNT2",
    title: "O Til (~) e Vogais Nasaladas",
    desc: "Tecle a tecla ao lado do Ç para o til (~) e em seguida a vogal A ou O.",
    keysIntroduced: ["~", "ã", "õ"],
    text: "não são pão irmão coração lição atenção profissão cidadão capitão união"
  },
  {
    id: 18,
    level: 4,
    levelName: "Nível 4: Acentuação ABNT2",
    title: "Acento Circunflexo (^) e Maiúsculas com Shift",
    desc: "Segure Shift com a mão oposta para maiúsculas e para o acento circunflexo (^).",
    keysIntroduced: ["^", "Shift", "â", "ê", "ô"],
    text: "você avô mês três Sodiprom Camp Diadema Brasil Futuro Ética Responsabilidade"
  },

  // ====================================================================
  // NÍVEL 5: PRÁTICA PROFISSIONAL CORPORATIVA (SODIPROM)
  // ====================================================================
  {
    id: 19,
    level: 5,
    levelName: "Nível 5: Prática Corporativa",
    title: "Vocabulário de Escritório & Administração",
    desc: "Termos indispensáveis para o cotidiano no primeiro emprego e estágio.",
    keysIntroduced: ["termos corporativos"],
    text: "documento protocolo planilha relatório contrato reunião arquivo expediente"
  },
  {
    id: 20,
    level: 5,
    levelName: "Nível 5: Prática Corporativa",
    title: "Redação de E-mails Comerciais",
    desc: "Frases reais utilizadas na comunicação profissional com clientes e gestores.",
    keysIntroduced: ["frases formais"],
    text: "Prezados senhores, segue em anexo o relatório mensal solicitado. Atenciosamente,"
  },
  {
    id: 21,
    level: 5,
    levelName: "Nível 5: Prática Corporativa",
    title: "Cidadania e Jovem Aprendiz",
    desc: "Valores fundamentais da SODIPROM - CAMP Diadema para a formação do jovem.",
    keysIntroduced: ["cidadania"],
    text: "A capacitação profissional abre portas para a cidadania e transforma o futuro do jovem aprendiz."
  },
  {
    id: 22,
    level: 5,
    levelName: "Nível 5: Prática Corporativa",
    title: "Desafio Máximo: Teste de Fluência Oficial",
    desc: "Texto completo com pontuação, acentuação e números. Mostre seu domínio total do teclado!",
    keysIntroduced: ["fluência total"],
    text: "A SODIPROM comemora 50 anos de história formando jovens com ética, compromisso, técnica e cidadania em Diadema."
  }
];

/**
 * Funções auxiliares de progresso
 */
function getSavedProgress() {
  try {
    const raw = localStorage.getItem('sodiprom_teclado_progress');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLessonResult(lessonId, stats) {
  try {
    const progress = getSavedProgress();
    const existing = progress[lessonId] || { stars: 0, bestWpm: 0, bestAccuracy: 0 };

    // Calcula estrelas (1 a 3) com base em precisão e WPM
    let stars = 1;
    if (stats.accuracy >= 92 && stats.wpm >= 15) stars = 2;
    if (stats.accuracy >= 97 && stats.wpm >= 25) stars = 3;

    progress[lessonId] = {
      completed: true,
      stars: Math.max(existing.stars, stars),
      bestWpm: Math.max(existing.bestWpm, Math.round(stats.wpm)),
      bestAccuracy: Math.max(existing.bestAccuracy, Math.round(stats.accuracy)),
      lastPlayed: new Date().toISOString()
    };

    localStorage.setItem('sodiprom_teclado_progress', JSON.stringify(progress));
  } catch (e) {}
}
