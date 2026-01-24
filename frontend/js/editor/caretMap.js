


export function getCurrTokenIndexFromCaret(map, caretPos) {
  if (caretPos <= 0) return -1;
  const i = Math.min(caretPos - 1, map.length - 1);
  return map[i];
}

export function getPrevTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos - 2; i >= 0; i--) {
    if (map[i] !== current) {
      return map[i];
    }
  }
  return -1;
}

export function getGreaterPrevTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);
  const prev = getPrevTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos - 2; i >= 0; i--) {
    if (map[i] !== current && map[i] !== prev) {
      return map[i];
    }
  }
  return -1;
}


export function getNextTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos; i < map.length; i++) {
    if (map[i] !== current) {
      return map[i];
    }
  }
  return -1;
}

export function getGreaterNextTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);
  const next = getNextTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos; i < map.length; i++) {
    if (map[i] !== current && map[i] !== next) {
      return map[i];
    }
  }
  return -1;
}


export function getCaretAfterToken(map, targetTokenIndex) {
  if (targetTokenIndex < 0) return 0;

  let lastIndex = -1;
  
  for (let i = 0; i < map.length; i++) {
    if (map[i] === targetTokenIndex) {
      lastIndex = i;
    }
  }
  
  return lastIndex === -1 ? 0 : lastIndex + 1;
}


export function isAtStartOfCurrentToken(map, caretPos) {
  if (caretPos <= 0) return true; // caret at very beginning is start of token

  const idx = caretPos - 1;
  const curr = map[idx];
  const prev = map[idx - 1];

  // previous display index belongs to a different token
  return prev !== curr;
}

export function isAtEndOfCurrentToken(map, caretPos) {
  if (caretPos <= 0) return false;

  const idx = caretPos - 1;
  const curr = map[idx];
  const next = map[idx + 1];

  // next display index belongs to a different token
  return next !== curr;
}