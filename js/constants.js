// Operators
export const operators = ['+', '-', '*', '/', '^'];
export const operatorsSet = new Set(operators);

export const root = '√';
export const decimal = '.';
export const percent = '%';
export const factorial = '!';

// Precedence and associativity
export const precedence = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
  '√': 4, // highest, unary
  'log': 4,
  'ln': 4,
  'sin': 4,
};

export const associativity = {
  '+': 'L',
  '-': 'L',
  '*': 'L',
  '/': 'L',
  '^': 'R',
  '√': 'R', // unary, right-associative
  'sin': 'R',
};

// Superscript mapping
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

export const superscripts = new Set(Object.values(normalToSuperscript));
export const subscripts = new Set(Object.values(normalToSubscript));

