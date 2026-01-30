



/**
 * Classifies a calculator button value into a semantic token type.
 *
 * Determines the appropriate token type based on exact matches and
 * pattern-based rules (functions, operators, roots, powers, digits, etc.).
 * This classification is used to drive parsing, input handling, and
 * expression construction logic.
 *
 * @param {string} newValue - The raw value of the pressed calculator button.
 * @returns {{ type: string, value: string }} An object describing the token type and its value.
 */


export function classifyButtonValue(newValue) {

  // --- 1. Exact matches ---
  const exactMap = {
    '!': 'factorial',
    'π': 'pi',
    'e': 'E',
    '+': 'plus',
    '-': 'minus',
    '×': 'multiply',
    '⋅': 'multiplicationDot',
    '/': 'divide',
    '.': 'decimal',
    '%': 'percent',
    'AC': 'ac',
    '=': 'equal',
    '√': 'singleRoot',
    'rad': 'radian',
    'deg': 'degree',
    'dark': 'dark', 
    'light': 'light',
  };

  // --- exact single values ---
  if (exactMap[newValue]) {
    return { type: exactMap[newValue], value: newValue };
  }

  // --- log with box ---
  if (/^(log)□$/.test(newValue)) {
    return { type: 'logWithBox', value: newValue };
  }

  // --- function keywords ---
  if (/^(log|ln|sin|cos|tan|cot|sec|csc)$/.test(newValue)) {
    return { type: 'function', value: newValue };
  }

  // --- base(x) with supers(2 or 3) ---
  if (/^x[2-3]$/.test(newValue)) {
    return { type: 'baseWithSupers', value: newValue };
  }

  // --- base(x) with box ---
  if (/^(x)□$/.test(newValue)) {
    return { type: 'baseWithBox', value: newValue };
  }

  // --- box with root symbol ---
  if (/^□√$/.test(newValue)) {
    return { type: 'boxWithRoot', value: newValue };
  }

  // --- combination or permutation ---
  if (/^n[CP]r$/.test(newValue)) {
    return { type: 'combOrPerm', value: newValue };
  }

  // --- single digits ---
  if (/^[0-9]$/.test(newValue)) {
    return { type: 'number', value: newValue };
  }

  // --- parentheses ---
  if (newValue === '()') {
    return { type: 'parentheses', value: newValue };
  }

  // --- fallback ---
  return { type: 'unknown', value: newValue };
}



/**
 * Classifies a calculator button element into an action or input token.
 *
 * Determines the button’s semantic type based on its DOM attributes
 * (CSS classes and dataset/text value). Special control buttons such as
 * delete and caret navigation are handled explicitly; all other buttons
 * are classified using `classifyButtonValue`.
 *
 * @param {HTMLElement} btn - The calculator button element.
 * @returns {{ type: string, value: string }} An object describing the button action or token.
 */


export function classifyButton(btn){
  const btnValue = btn.dataset.value || btn.textContent;
  const value = classifyButtonValue(btnValue);
  
  if (btn.classList.contains('delete_btn')) return { type: 'delete', value: btnValue };
  if (btn.classList.contains('left_arrow')) return { type: 'leftArrow', value: btnValue };
  if (btn.classList.contains('right_arrow')) return { type: 'rightArrow', value: btnValue };
  
  return value; // type like 'ac', 'number', 'operator'
}

