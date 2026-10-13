/**
 * Gerador de Notas Fiscais e Definição de Níveis
 * SODIPROM - CAMP Diadema | Balcão Fiscal: Desafio da Nota Fiscal
 */

const FISCAL_LEVELS = [
  {
    id: 1,
    title: "Nível 1: Primeiro Dia no Faturamento",
    subtitle: "Treino de números simples (3 a 4 dígitos) para fixar a posição das mãos",
    targetGoal: 6,
    timeLimit: null,
    fieldType: "number_simple",
    badge: "Aprendiz Iniciante"
  },
  {
    id: 2,
    title: "Nível 2: Numeração Fiscal Padrão",
    subtitle: "Números de 5 a 6 dígitos com zeros à esquerda e pontos (Ex: 004.819)",
    targetGoal: 8,
    timeLimit: null,
    fieldType: "number_formatted",
    badge: "Conferente Ágil"
  },
  {
    id: 3,
    title: "Nível 3: Valores & Centavos (R$)",
    subtitle: "Digitação de valores monetários com vírgula e decimais (Ex: 150,00 / 1.240,50)",
    targetGoal: 8,
    timeLimit: null,
    fieldType: "currency",
    badge: "Operador Financeiro"
  },
  {
    id: 4,
    title: "Nível 4: Prazos e Datas de Emissão",
    subtitle: "Datas no formato dd/mm/aaaa com barras (Ex: 14/10/2026)",
    targetGoal: 8,
    timeLimit: null,
    fieldType: "date",
    badge: "Guardião dos Prazos"
  },
  {
    id: 5,
    title: "Nível 5: Lotes e Código de Barras",
    subtitle: "Sequências numéricas de 6 a 8 dígitos para agilidade contínua",
    targetGoal: 10,
    timeLimit: null,
    fieldType: "barcode",
    badge: "Especialista em Logística"
  },
  {
    id: 6,
    title: "Nível 6: Entrada Fiscal Completa (NF + Valor)",
    subtitle: "Digitação dupla: digite o Número da NF [ENTER] e depois o Valor Total [ENTER]!",
    targetGoal: 8,
    timeLimit: null,
    fieldType: "dual_input",
    badge: "Analista Fiscal Júnior"
  },
  {
    id: 7,
    title: "Nível 7: Maratona do Faturamento",
    subtitle: "Mix dinâmico com todos os formatos e tempo cronometrado!",
    targetGoal: 12,
    timeLimit: 120, // 2 minutos
    fieldType: "mixed",
    badge: "Mestre do Faturamento"
  }
];

const MOCK_COMPANIES = [
  { name: "Supermercado Estrela de Diadema Ltda", cnpj: "44.921.840/0001-92", logoEmoji: "⭐", cidade: "Diadema - SP" },
  { name: "Tech Soluções & Inovação Aprendiz", cnpj: "18.305.712/0001-44", logoEmoji: "💻", cidade: "São Paulo - SP" },
  { name: "Doceria & Salgados Delícia do Bairro", cnpj: "29.410.550/0001-83", logoEmoji: "🧁", cidade: "Diadema - SP" },
  { name: "Livraria Saber, Futuro & Educação", cnpj: "07.819.324/0001-15", logoEmoji: "📚", cidade: "São Bernardo - SP" },
  { name: "Auto Peças & Motores Turbo ABC", cnpj: "62.115.480/0001-08", logoEmoji: "🔧", cidade: "Santo André - SP" },
  { name: "Fábrica de Coxinhas Espaciais S/A", cnpj: "33.720.910/0001-67", logoEmoji: "🚀", cidade: "Diadema - SP" },
  { name: "Papelaria & Escritório Central CAMP", cnpj: "12.845.690/0001-30", logoEmoji: "📎", cidade: "Diadema - SP" },
  { name: "Distribuidora Frutolândia Tropical", cnpj: "51.290.418/0001-22", logoEmoji: "🍉", cidade: "São Paulo - SP" },
  { name: "Cafeteria Grão Real do Estagiário", cnpj: "09.145.870/0001-90", logoEmoji: "☕", cidade: "Diadema - SP" }
];

const MOCK_ITEMS = [
  { desc: "Resma Papel Sulfite A4 75g", precoMin: 22.50, precoMax: 35.00 },
  { desc: "Caneta Esferográfica Azul Cx c/ 50", precoMin: 38.00, precoMax: 54.90 },
  { desc: "Grampeador Metálico 26/6", precoMin: 18.90, precoMax: 29.50 },
  { desc: "Bloco Auto-Adesivo Amarelo 76x76", precoMin: 6.50, precoMax: 12.00 },
  { desc: "Café Torrado e Moído 500g", precoMin: 17.80, precoMax: 24.90 },
  { desc: "Mouse Óptico USB Ergonômico", precoMin: 35.00, precoMax: 65.00 },
  { desc: "Teclado Numérico USB Padrão ABNT2", precoMin: 42.00, precoMax: 89.90 },
  { desc: "Pasta Suspensa Kraft c/ 10 unid", precoMin: 28.00, precoMax: 45.00 },
  { desc: "Carimbo Automático Auto-Entintado", precoMin: 32.50, precoMax: 48.00 },
  { desc: "Fita Adesiva Transparente 45mm x 50m", precoMin: 7.90, precoMax: 14.50 },
  { desc: "Caixa Arquivo Morto Polionda", precoMin: 15.00, precoMax: 26.00 }
];

class InvoiceGenerator {
  /**
   * Gera uma nota fiscal dinâmica baseada no nível ou modo
   */
  static generateInvoice(levelConfig, mode = 'career') {
    const company = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
    
    // Sorteia itens da nota
    const numItems = Math.floor(Math.random() * 2) + 1; // 1 a 2 itens para visual limpo
    const items = [];
    let subtotal = 0;

    for (let i = 0; i < numItems; i++) {
      const itemTemplate = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)];
      const qtd = Math.floor(Math.random() * 5) + 1;
      const precoUnit = (Math.random() * (itemTemplate.precoMax - itemTemplate.precoMin) + itemTemplate.precoMin);
      const totalItem = qtd * precoUnit;
      subtotal += totalItem;

      items.push({
        desc: itemTemplate.desc,
        qtd: qtd,
        precoUnit: this.formatCurrency(precoUnit),
        total: this.formatCurrency(totalItem)
      });
    }

    const totalCalculado = subtotal;
    const formattedTotal = this.formatCurrency(totalCalculado);

    // Determina o tipo de campo a solicitar
    let fieldType = levelConfig.fieldType;
    if (fieldType === 'mixed') {
      const types = ['number_simple', 'number_formatted', 'currency', 'date', 'barcode'];
      fieldType = types[Math.floor(Math.random() * types.length)];
    }

    // Gera dados dos campos
    let invoiceNumberSimple = String(Math.floor(Math.random() * 9000) + 100); // 3 ou 4 dígitos
    let invoiceNumberFormatted = this.generateFormattedNumber();
    let dateStr = this.generateRandomDate();
    let barcodeStr = this.generateBarcode();

    // Define os campos que o jogador deverá digitar
    let fieldsToInput = [];

    switch (fieldType) {
      case 'number_simple':
        fieldsToInput.push({
          id: 'nf_num',
          label: 'NÚMERO DA NOTA FISCAL (DANFE)',
          targetValue: invoiceNumberSimple,
          highlightField: 'invoiceNumber',
          instruction: 'Digite o Número da Nota e pressione [ENTER]'
        });
        break;

      case 'number_formatted':
        fieldsToInput.push({
          id: 'nf_formatted',
          label: 'NÚMERO DA NOTA FISCAL',
          targetValue: invoiceNumberFormatted,
          highlightField: 'invoiceNumber',
          instruction: 'Digite os números com pontos e aperte [ENTER]'
        });
        break;

      case 'currency':
        // Extrai apenas o número com centavos (ex: "145,80" ou "1.250,00")
        const rawValue = formattedTotal.replace('R$ ', '').trim();
        fieldsToInput.push({
          id: 'nf_valor',
          label: 'VALOR TOTAL DA NOTA FISCAL',
          targetValue: rawValue,
          highlightField: 'totalValue',
          instruction: 'Digite o Valor Total (com vírgula) e aperte [ENTER]'
        });
        break;

      case 'date':
        fieldsToInput.push({
          id: 'nf_data',
          label: 'DATA DE EMISSÃO',
          targetValue: dateStr,
          highlightField: 'emissionDate',
          instruction: 'Digite a Data (com barras) e aperte [ENTER]'
        });
        break;

      case 'barcode':
        fieldsToInput.push({
          id: 'nf_barcode',
          label: 'LOTE / CÓDIGO FISCAL',
          targetValue: barcodeStr,
          highlightField: 'barcode',
          instruction: 'Digite a sequência numérica do Lote e aperte [ENTER]'
        });
        break;

      case 'dual_input':
        const rawVal = formattedTotal.replace('R$ ', '').trim();
        fieldsToInput.push({
          id: 'nf_num',
          label: '1º PASSO: NÚMERO DA NOTA',
          targetValue: invoiceNumberSimple,
          highlightField: 'invoiceNumber',
          instruction: '1º Digite o Número da Nota e aperte [ENTER]'
        });
        fieldsToInput.push({
          id: 'nf_valor',
          label: '2º PASSO: VALOR TOTAL',
          targetValue: rawVal,
          highlightField: 'totalValue',
          instruction: '2º Agora digite o Valor Total e aperte [ENTER]'
        });
        break;
    }

    return {
      company: company,
      invoiceNumber: fieldType === 'number_formatted' ? invoiceNumberFormatted : invoiceNumberSimple,
      series: "001",
      emissionDate: dateStr,
      barcode: barcodeStr,
      items: items,
      totalValue: formattedTotal,
      fieldsToInput: fieldsToInput,
      currentFieldIndex: 0
    };
  }

  static formatCurrency(val) {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  static generateFormattedNumber() {
    // Exemplo: 004.819 ou 082.415
    const p1 = String(Math.floor(Math.random() * 900) + 1).padStart(3, '0');
    const p2 = String(Math.floor(Math.random() * 900) + 100);
    return `${p1}.${p2}`;
  }

  static generateRandomDate() {
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = "2026";
    return `${day}/${month}/${year}`;
  }

  static generateBarcode() {
    // Sequência de 6 a 8 dígitos agrupados
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }
}

window.FISCAL_LEVELS = FISCAL_LEVELS;
window.InvoiceGenerator = InvoiceGenerator;
