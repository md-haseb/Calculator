
/**
 * operator symbols.
 */
export const root = '√';
export const decimal = '.';
export const percent = '%';
export const factorial = '!';
export const pi = 'π';
export const E = 'e';
export const plus = '+';
export const minus = '-';
export const unaryMinus = 'NEG';
export const multiplyBy = '*';
export const multiplySymbol = '×';
export const divideBy = '/';
export const expBox = '□';
export const expBase = 'x';
export const parenOpen = '(';
export const parenClose = ')';


// -------------------------------
// Operators
// -------------------------------

/**
 * List of arithmetic operators supported by the expression parser.
 * Used primarily during tokenization and Shunting-Yard processing.
 */
export const operators = [plus, minus, multiplyBy, multiplySymbol, divideBy];

/**
 * Set version of the operators array.
 */
export const operatorsSet = new Set(operators);


/**
 * Operators Map.
 */
export const operatorsMap = {
  plus: '+',
  minus: '-',
  multiply: '×',
  divide: '/',
}


/**
 * trigonometric functions
 */
export const trigFunctions = [
  'sin',
  'cos',
  'tan',
  'cot',
  'sec',
  'csc'
];


/**
 * combinatorics values inside array
 */
export const combinatoricsArr = ['C', 'P'];



/**
 * log functions inside array
 */
export const logFunctionsArr = ['log', 'ln'];



/**
 * combinatorics values
 */
export const combinatorics = {
  combination: 'C',
  permutation: 'P'
};

/**
 * log functions
 */
export const logFunctions = {
  log: 'log',
  ln: 'ln'
};

/**
 * parentheses
 */
export const paren = {
  open: '(',
  close: ')'
};

/**
 * constants
 */
export const constantsValue = {
  ten: '10',
  E: Math.E,
  pi: Math.PI,
};

// -------------------------------
// Operator Precedence & Associativity
// -------------------------------

/**
 * Operator precedence mapping.
 * Higher numbers represent higher priority during parsing.
 * Unary functions like √, sin, log, ln have highest precedence.
 */
export const precedence = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
  'NEG': 3,
  '√': 4, // highest, unary
  'log': 4,
  'ln': 4,
  'sin': 4,
};

/**
 * Operator associativity rules.
 * L = Left-to-right, R = Right-to-left.
 * Exponentiation and unary operators are right-associative.
 */
export const associativity = {
  '+': 'L',
  '-': 'L',
  '*': 'L',
  '/': 'L',
  'NEG': 'R', 
  '^': 'R',
  '√': 'R', // unary, right-associative
  'sin': 'R',
};

// -------------------------------
// Superscript / Subscript Mapping
// -------------------------------

/**
 * Mapping from normal digits (0–9) to their Unicode superscript equivalents.
 * Example: "2" → "²".
 */
export const normalToSuperscript = {
  "0": "\u2070",
  "1": "\u00B9",
  "2": "\u00B2",
  "3": "\u00B3",
  "4": "\u2074",
  "5": "\u2075",
  "6": "\u2076",
  "7": "\u2077",
  "8": "\u2078",
  "9": "\u2079"
};

/**
 * Reverse mapping from superscript digits back to normal digits.
 * Example: "²" → "2".
 */
export const superscriptToNormal = {
  "\u2070": "0",
  "\u00B9": "1",
  "\u00B2": "2",
  "\u00B3": "3",
  "\u2074": "4",
  "\u2075": "5",
  "\u2076": "6",
  "\u2077": "7",
  "\u2078": "8",
  "\u2079": "9"
};

/**
 * Mapping from normal digits (0–9) to their Unicode subscript equivalents.
 * Example: "2" → "₂".
 */
export const normalToSubscript = {
  "0": "\u2080",
  "1": "\u2081",
  "2": "\u2082",
  "3": "\u2083",
  "4": "\u2084",
  "5": "\u2085",
  "6": "\u2086",
  "7": "\u2087",
  "8": "\u2088",
  "9": "\u2089"
};

/**
 * Reverse mapping from subscript digits back to normal digits.
 * Example: "₂" → "2".
 */
export const subscriptToNormal = {
  "\u2080": "0",
  "\u2081": "1",
  "\u2082": "2",
  "\u2083": "3",
  "\u2084": "4",
  "\u2085": "5",
  "\u2086": "6",
  "\u2087": "7",
  "\u2088": "8",
  "\u2089": "9"
};

/**
 * A Set of all superscript characters for quick membership checks.
 */
export const superscripts = new Set(Object.values(normalToSuperscript));

/**
 * A Set of all subscript characters for quick membership checks.
 */
export const subscripts = new Set(Object.values(normalToSubscript));

//string of superscript and subscript numbers
export const superscriptChars = Array.from(superscripts).join('');
export const subscriptChars = Array.from(subscripts).join('');

