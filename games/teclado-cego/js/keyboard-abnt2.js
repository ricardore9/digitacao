/**
 * Mapeamento Ergonômico do Teclado Brasileiro ABNT2
 * Associa cada tecla ao dedo correto e gera o layout físico na tela
 * SODIPROM - CAMP Diadema | Mestre do Teclado Cego
 */

const FINGER_DATA = {
  'left-pinky': {
    name: 'Mínimo Esquerdo',
    hand: 'left',
    color: '#ec4899', // Rosa vibrante
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)'
  },
  'left-ring': {
    name: 'Anelar Esquerdo',
    hand: 'left',
    color: '#f97316', // Laranja
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)'
  },
  'left-middle': {
    name: 'Médio Esquerdo',
    hand: 'left',
    color: '#eab308', // Âmbar
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)'
  },
  'left-index': {
    name: 'Indicador Esquerdo',
    hand: 'left',
    color: '#10b981', // Verde Esmeralda (Ancoragem F)
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)'
  },
  'thumbs': {
    name: 'Polegar',
    hand: 'both',
    color: '#0ea5e9', // Azul Céu
    bg: 'rgba(14, 165, 233, 0.15)',
    border: 'rgba(14, 165, 233, 0.4)'
  },
  'right-index': {
    name: 'Indicador Direito',
    hand: 'right',
    color: '#14b8a6', // Teal / Ciano (Ancoragem J)
    bg: 'rgba(20, 184, 166, 0.15)',
    border: 'rgba(20, 184, 166, 0.4)'
  },
  'right-middle': {
    name: 'Médio Direito',
    hand: 'right',
    color: '#6366f1', // Índigo
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.4)'
  },
  'right-ring': {
    name: 'Anelar Direito',
    hand: 'right',
    color: '#8b5cf6', // Violeta
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)'
  },
  'right-pinky': {
    name: 'Mínimo Direito',
    hand: 'right',
    color: '#a855f7', // Roxo / Púrpura
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)'
  }
};

/**
 * Definição completa das 5 fileiras do Teclado Físico ABNT2
 */
const ABNT2_KEYBOARD_LAYOUT = [
  // Linha 1 (Números e Símbolos)
  [
    { code: 'Quote', primary: "'", shift: '"', finger: 'left-pinky' },
    { code: 'Digit1', primary: '1', shift: '!', finger: 'left-pinky' },
    { code: 'Digit2', primary: '2', shift: '@', finger: 'left-ring' },
    { code: 'Digit3', primary: '3', shift: '#', finger: 'left-middle' },
    { code: 'Digit4', primary: '4', shift: '$', finger: 'left-index' },
    { code: 'Digit5', primary: '5', shift: '%', finger: 'left-index' },
    { code: 'Digit6', primary: '6', shift: '¨', finger: 'right-index' },
    { code: 'Digit7', primary: '7', shift: '&', finger: 'right-index' },
    { code: 'Digit8', primary: '8', shift: '*', finger: 'right-middle' },
    { code: 'Digit9', primary: '9', shift: '(', finger: 'right-ring' },
    { code: 'Digit0', primary: '0', shift: ')', finger: 'right-pinky' },
    { code: 'Minus', primary: '-', shift: '_', finger: 'right-pinky' },
    { code: 'Equal', primary: '=', shift: '+', finger: 'right-pinky' },
    { code: 'Backspace', primary: 'Backspace', display: '⌫ Apagar', width: 'w-bksp', finger: 'right-pinky', isModifier: true }
  ],

  // Linha 2 (Linha Superior / QWERTY)
  [
    { code: 'Tab', primary: 'Tab', display: '⇥ Tab', width: 'w-tab', finger: 'left-pinky', isModifier: true },
    { code: 'KeyQ', primary: 'q', shift: 'Q', finger: 'left-pinky' },
    { code: 'KeyW', primary: 'w', shift: 'W', finger: 'left-ring' },
    { code: 'KeyE', primary: 'e', shift: 'E', finger: 'left-middle' },
    { code: 'KeyR', primary: 'r', shift: 'R', finger: 'left-index' },
    { code: 'KeyT', primary: 't', shift: 'T', finger: 'left-index' },
    { code: 'KeyY', primary: 'y', shift: 'Y', finger: 'right-index' },
    { code: 'KeyU', primary: 'u', shift: 'U', finger: 'right-index' },
    { code: 'KeyI', primary: 'i', shift: 'I', finger: 'right-middle' },
    { code: 'KeyO', primary: 'o', shift: 'O', finger: 'right-ring' },
    { code: 'KeyP', primary: 'p', shift: 'P', finger: 'right-pinky' },
    { code: 'BracketLeft', primary: '´', shift: '`', display: '´ `', finger: 'right-pinky', isAccent: true },
    { code: 'BracketRight', primary: '[', shift: '{', finger: 'right-pinky' },
    { code: 'Enter', primary: 'Enter', display: '↵ Enter', width: 'w-enter', finger: 'right-pinky', isModifier: true }
  ],

  // Linha 3 (Linha Guia Central / Home Row - ASDF JKLÇ)
  [
    { code: 'CapsLock', primary: 'Caps', display: '⇪ Fixa', width: 'w-caps', finger: 'left-pinky', isModifier: true },
    { code: 'KeyA', primary: 'a', shift: 'A', finger: 'left-pinky' },
    { code: 'KeyS', primary: 's', shift: 'S', finger: 'left-ring' },
    { code: 'KeyD', primary: 'd', shift: 'D', finger: 'left-middle' },
    { code: 'KeyF', primary: 'f', shift: 'F', finger: 'left-index', isHoming: true },
    { code: 'KeyG', primary: 'g', shift: 'G', finger: 'left-index' },
    { code: 'KeyH', primary: 'h', shift: 'H', finger: 'right-index' },
    { code: 'KeyJ', primary: 'j', shift: 'J', finger: 'right-index', isHoming: true },
    { code: 'KeyK', primary: 'k', shift: 'K', finger: 'right-middle' },
    { code: 'KeyL', primary: 'l', shift: 'L', finger: 'right-ring' },
    { code: 'KeyCcedilla', primary: 'ç', shift: 'Ç', finger: 'right-pinky' },
    { code: 'Backquote', primary: '~', shift: '^', display: '~ ^', finger: 'right-pinky', isAccent: true },
    { code: 'Backslash', primary: ']', shift: '}', finger: 'right-pinky' }
  ],

  // Linha 4 (Linha Inferior / ZXCVBNM)
  [
    { code: 'ShiftLeft', primary: 'Shift', display: '⇧ Shift', width: 'w-shift-l', finger: 'left-pinky', isModifier: true },
    { code: 'IntlBackslash', primary: '\\', shift: '|', finger: 'left-pinky' },
    { code: 'KeyZ', primary: 'z', shift: 'Z', finger: 'left-pinky' },
    { code: 'KeyX', primary: 'x', shift: 'X', finger: 'left-ring' },
    { code: 'KeyC', primary: 'c', shift: 'C', finger: 'left-middle' },
    { code: 'KeyV', primary: 'v', shift: 'V', finger: 'left-index' },
    { code: 'KeyB', primary: 'b', shift: 'B', finger: 'left-index' },
    { code: 'KeyN', primary: 'n', shift: 'N', finger: 'right-index' },
    { code: 'KeyM', primary: 'm', shift: 'M', finger: 'right-index' },
    { code: 'Comma', primary: ',', shift: '<', finger: 'right-middle' },
    { code: 'Period', primary: '.', shift: '>', finger: 'right-ring' },
    { code: 'Semicolon', primary: ';', shift: ':', finger: 'right-pinky' },
    { code: 'Slash', primary: '/', shift: '?', finger: 'right-pinky' },
    { code: 'ShiftRight', primary: 'Shift', display: '⇧ Shift', width: 'w-shift-r', finger: 'right-pinky', isModifier: true }
  ],

  // Linha 5 (Barra de Espaço e Teclas de Controle)
  [
    { code: 'ControlLeft', primary: 'Ctrl', display: 'Ctrl', width: 'w-ctrl', finger: 'left-pinky', isModifier: true },
    { code: 'MetaLeft', primary: 'Win', display: '❖', width: 'w-win', finger: 'left-pinky', isModifier: true },
    { code: 'AltLeft', primary: 'Alt', display: 'Alt', width: 'w-alt', finger: 'left-ring', isModifier: true },
    { code: 'Space', primary: ' ', display: 'Espaço', width: 'w-space', finger: 'thumbs' },
    { code: 'AltRight', primary: 'AltGr', display: 'Alt Gr', width: 'w-alt', finger: 'right-ring', isModifier: true },
    { code: 'MetaRight', primary: 'Win', display: '❖', width: 'w-win', finger: 'right-pinky', isModifier: true },
    { code: 'ControlRight', primary: 'Ctrl', display: 'Ctrl', width: 'w-ctrl', finger: 'right-pinky', isModifier: true }
  ]
];

/**
 * Tabela de acentuação composta do português
 */
const ACCENTED_CHAR_MAP = {
  'á': { accent: '´', accentCode: 'BracketLeft', letter: 'a', letterCode: 'KeyA' },
  'é': { accent: '´', accentCode: 'BracketLeft', letter: 'e', letterCode: 'KeyE' },
  'í': { accent: '´', accentCode: 'BracketLeft', letter: 'i', letterCode: 'KeyI' },
  'ó': { accent: '´', accentCode: 'BracketLeft', letter: 'o', letterCode: 'KeyO' },
  'ú': { accent: '´', accentCode: 'BracketLeft', letter: 'u', letterCode: 'KeyU' },

  'â': { accent: '^', accentCode: 'Backquote', needsShift: true, letter: 'a', letterCode: 'KeyA' },
  'ê': { accent: '^', accentCode: 'Backquote', needsShift: true, letter: 'e', letterCode: 'KeyE' },
  'ô': { accent: '^', accentCode: 'Backquote', needsShift: true, letter: 'o', letterCode: 'KeyO' },

  'ã': { accent: '~', accentCode: 'Backquote', letter: 'a', letterCode: 'KeyA' },
  'õ': { accent: '~', accentCode: 'Backquote', letter: 'o', letterCode: 'KeyO' },

  'à': { accent: '`', accentCode: 'BracketLeft', needsShift: true, letter: 'a', letterCode: 'KeyA' },

  'Á': { accent: '´', accentCode: 'BracketLeft', letter: 'A', letterCode: 'KeyA', letterShift: true },
  'É': { accent: '´', accentCode: 'BracketLeft', letter: 'E', letterCode: 'KeyE', letterShift: true },
  'Í': { accent: '´', accentCode: 'BracketLeft', letter: 'I', letterCode: 'KeyI', letterShift: true },
  'Ó': { accent: '´', accentCode: 'BracketLeft', letter: 'O', letterCode: 'KeyO', letterShift: true },
  'Ú': { accent: '´', accentCode: 'BracketLeft', letter: 'U', letterCode: 'KeyU', letterShift: true },
  'Ã': { accent: '~', accentCode: 'Backquote', letter: 'A', letterCode: 'KeyA', letterShift: true },
  'Õ': { accent: '~', accentCode: 'Backquote', letter: 'O', letterCode: 'KeyO', letterShift: true }
};

/**
 * Resolve qualquer caractere para a respectiva tecla e instruções para o aluno
 */
function resolveKeyForChar(char) {
  if (char === ' ') {
    return {
      code: 'Space',
      label: 'Espaço',
      finger: 'thumbs',
      shiftCode: null,
      instruction: 'Pressione **Espaço** com o **Polegar**'
    };
  }

  // Verifica se é caractere com acento composto
  if (ACCENTED_CHAR_MAP[char]) {
    const info = ACCENTED_CHAR_MAP[char];
    return {
      isAccented: true,
      accent: info.accent,
      accentCode: info.accentCode,
      accentFinger: 'right-pinky',
      accentShift: info.needsShift ? 'ShiftLeft' : null,
      letter: info.letter,
      letterCode: info.letterCode,
      letterFinger: getFingerForCode(info.letterCode),
      letterShift: info.letterShift ? 'ShiftRight' : null,
      code: info.accentCode,
      finger: 'right-pinky',
      instruction: `Pressione primeiro o acento **${info.accent}** com o **Mínimo Direito**, depois a letra **${info.letter}**`
    };
  }

  // Procura no layout direto
  for (const row of ABNT2_KEYBOARD_LAYOUT) {
    for (const key of row) {
      if (key.primary === char) {
        return {
          code: key.code,
          label: key.primary,
          finger: key.finger,
          shiftCode: null,
          instruction: `Pressione **${key.primary.toUpperCase()}** com o **${FINGER_DATA[key.finger].name}**`
        };
      }
      if (key.shift === char) {
        // Para caracteres com Shift, usa o Shift da mão oposta (regra clássica ergonômica)
        const isLeftHand = FINGER_DATA[key.finger].hand === 'left';
        const shiftCode = isLeftHand ? 'ShiftRight' : 'ShiftLeft';
        const shiftHandName = isLeftHand ? 'Mão Direita' : 'Mão Esquerda';
        return {
          code: key.code,
          label: key.shift,
          finger: key.finger,
          shiftCode: shiftCode,
          instruction: `Segure **Shift** com a **${shiftHandName}** e tecle **${key.primary.toUpperCase()}** com o **${FINGER_DATA[key.finger].name}**`
        };
      }
    }
  }

  return null;
}

function getFingerForCode(code) {
  for (const row of ABNT2_KEYBOARD_LAYOUT) {
    for (const key of row) {
      if (key.code === code) return key.finger;
    }
  }
  return 'thumbs';
}
