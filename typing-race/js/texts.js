/**
 * Biblioteca de Textos Educacionais e Inspiradores para Corrida de Digitação
 * SODIPROM - CAMP Diadema | Typing Race
 */

const RACE_TEXTS = [
  // --- ARRANCADA RÁPIDA (Sprint: ~20-30 palavras) ---
  {
    id: "sprint_1",
    category: "sprint",
    title: "Atitude e Determinação",
    text: "O sucesso profissional comeca com dedicação diária, pontualidade e vontade de aprender coisas novas a cada oportunidade."
  },
  {
    id: "sprint_2",
    category: "sprint",
    title: "O Poder da Comunicação",
    text: "Comunicar com clareza, empatia e respeito abre portas em qualquer empresa e fortalece a confiança de toda a equipe."
  },
  {
    id: "sprint_3",
    category: "sprint",
    title: "Foco no Teclado",
    text: "A velocidade dos seus dedos acompanha a agilidade do seu raciocinio quando voce mantem a calma e o ritmo constante."
  },
  {
    id: "sprint_4",
    category: "sprint",
    title: "Tecnologia e Futuro",
    text: "Dominar ferramentas digitais e digitar com precisao transforma jovens aprendizes em profissionais prontos para liderar."
  },
  {
    id: "sprint_5",
    category: "sprint",
    title: "Trabalho em Equipe",
    text: "Nenhum grande projeto e construido sozinho. Quando unimos talentos diferentes, alcancamos metas extraordinarias juntos."
  },

  // --- CIRCUITO CLÁSSICO (Médio: ~40-60 palavras) ---
  {
    id: "classic_1",
    category: "classic",
    title: "O Aprendiz do Século XXI",
    text: "Ingressar no mercado de trabalho exige mais do que conhecimento tecnico; exige pontualidade, etica, adaptabilidade e proatividade. Cada tarefa concluida com esmero constroi uma reputacao solida para toda a vida profissional."
  },
  {
    id: "classic_2",
    category: "classic",
    title: "A Importância da Postura",
    text: "Manter a postura correta na cadeira e posicionar os dez dedos sobre a linha guia do teclado evita lesoes e aumenta consideravelmente a sua velocidade de digitacao no ambiente de escritorio moderno."
  },
  {
    id: "classic_3",
    category: "classic",
    title: "Construindo Oportunidades",
    text: "A capacitacao profissional na SODIPROM transforma vidas ao abrir as portas para o primeiro emprego. Com dedicacao aos estudos e foco no futuro, cada jovem pode conquistar seus maiores sonhos e inspirar sua comunidade."
  },
  {
    id: "classic_4",
    category: "classic",
    title: "Inovação e Produtividade",
    text: "No mundo corporativo conectado, responder e-mails rapidamente, preencher planilhas com exatidao e produzir relatorios claros sao diferenciais que destacam os profissionais mais competentes e preparados."
  },

  // --- GRANDE PRÊMIO (Desafio Completo: ~70-90 palavras) ---
  {
    id: "grandprix_1",
    category: "grandprix",
    title: "O Caminho da Excelência Profissional",
    text: "A diferenca entre o comum e o extraordinario esta na atencao aos pequenos detalhes. No trabalho de escritorio, digitar sem erros de portugues, conferir dados fiscais e entregar resultados antes do prazo estabelecido demonstram compromisso genuino com a carreira. Cultive a paciencia, pratique todos os dias e veja suas habilidades decolarem rumo a grandes conquistas."
  },
  {
    id: "grandprix_2",
    category: "grandprix",
    title: "Superando Desafios Diários",
    text: "Todos os grandes lideres comecaram como aprendizes curiosos e determinados. Enfrentar novos desafios com coragem, pedir orientacao quando necessario e aprender com cada erro sao atitudes fundamentais para quem deseja crescer de verdade. Mantenha o foco nos seus objetivos e nunca pare de aprimorar suas habilidades tecnicas e humanas."
  }
];

class RaceTextManager {
  static getAllTexts() {
    return RACE_TEXTS;
  }

  static getTextById(id) {
    return RACE_TEXTS.find(t => t.id === id) || RACE_TEXTS[0];
  }

  static getRandomText(category = 'classic') {
    const filtered = RACE_TEXTS.filter(t => t.category === category);
    if (filtered.length === 0) return RACE_TEXTS[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
}

window.RACE_TEXTS = RACE_TEXTS;
window.RaceTextManager = RaceTextManager;
