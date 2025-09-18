// Operators
export const operators = ['+', '-', '*', '/'];
export const operatorsSet = new Set(operators);

export const root = '√';
export const decimal = '.';

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

export const superscripts = new Set(Object.values(normalToSuperscript));

