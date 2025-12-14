import {superscriptToNormal, subscriptToNormal, superscriptChars} from './constants.js';

/**
 * Performs division and rounds to 10 decimal places.
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
export function divide(a, b){
  const result = a / b;
  const tenDigitResult = Number(result.toFixed(10));
  return tenDigitResult;
}

/**
 * Checks if a token is a superscripted number.
 * @param {string} token
 * @returns {boolean}
 */
export function isNumWithSuperscript(token) {
  return new RegExp(`\\d+[${superscriptChars}]+`).test(token);
}

/**
 * Checks if a token is a superscripted number.
 * @param {string} token
 * @returns {boolean}
 */
export function isSuperscriptedNumber(token){
  return new RegExp(`^[${superscriptChars}]+$`).test(token);
}

/**
 * Checks if a token is a subscripted number.
 * @param {string} token
 * @returns {boolean}
 */
export function isSubscriptedNumber(token){
  return new RegExp(`^[₀-₉]+$`).test(token);
}

/**
 * Calculate exponents: base^exp.
 * @param {number} base 
 * @param {number} exp 
 * @returns {number}
 */
export function calculateExponent(base, exp){
  return base ** exp;
}

/**
 * Calculates factorial of a non-negative integer.
 * @param {number} num
 * @returns {number}
 */
export function calculateFactorial(num){
  let result = 1;
  for(let i = 2; i <= num; i++){
    result *= i;
  }
  return result;
}

/**
 * Normalize an angle to the range [-π, π].
 * @param {number} angle
 * @returns {number}
 */
export function reduceRadian(angle){
  return angle - Math.round(angle / (2 * Math.PI)) * 2 * Math.PI;
}

/**
 * Compute sin(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateSin(degreeToRadian){
    const sinResult = degreeToRadian 
                      - (calculateExponent(degreeToRadian, 3)/calculateFactorial(3)) 
                      + (calculateExponent(degreeToRadian, 5)/calculateFactorial(5)) 
                      - (calculateExponent(degreeToRadian, 7)/calculateFactorial(7)) 
                      + (calculateExponent(degreeToRadian, 9)/calculateFactorial(9)) 
                      - (calculateExponent(degreeToRadian, 11)/calculateFactorial(11)) 
                      + (calculateExponent(degreeToRadian, 13)/calculateFactorial(13));
    const tenDigitResult = Number(sinResult.toFixed(10));
    return tenDigitResult;
}

/**
 * Compute cos(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateCos(degreeToRadian){
    const cosResult = 1 
                      - (calculateExponent(degreeToRadian, 2)/calculateFactorial(2)) 
                      + (calculateExponent(degreeToRadian, 4)/calculateFactorial(4)) 
                      - (calculateExponent(degreeToRadian, 6)/calculateFactorial(6)) 
                      + (calculateExponent(degreeToRadian, 8)/calculateFactorial(8)) 
                      - (calculateExponent(degreeToRadian, 10)/calculateFactorial(10)) 
                      + (calculateExponent(degreeToRadian, 12)/calculateFactorial(12));
    const tenDigitResult = Number(cosResult.toFixed(10));
    return tenDigitResult;
}

/**
 * Compute tan(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateTan(degreeToRadian){
  const tanResult = calculateSin(degreeToRadian)/calculateCos(degreeToRadian);
  const tenDigitResult = Number(tanResult.toFixed(10));
  return tenDigitResult;
}

/**
 * Compute cot(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateCot(degreeToRadian){
  const cotResult = calculateCos(degreeToRadian)/calculateSin(degreeToRadian);
  const tenDigitResult = Number(cotResult.toFixed(10));
  return tenDigitResult;
}

/**
 * Compute sec(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateSec(degreeToRadian){
  const secResult = 1/calculateCos(degreeToRadian);
  const tenDigitResult = Number(secResult.toFixed(10));
  return tenDigitResult;
}

function calculateCsc(degreeToRadian){
  const cscResult = 1/calculateSin(degreeToRadian);
  const tenDigitResult = Number(cscResult.toFixed(10));
  return tenDigitResult;
}

/**
 * Calculates trigonometric function based on mode ('deg' or 'rad').
 * @param {'sin'|'cos'|'tan'} func 
 * @param {number} angle 
 * @param {'deg'|'rad'} mode 
 * @returns {number}
 */
export function calculateTrig(func, angle, mode){
  let rad = mode === 'deg' ? (angle * Math.PI)/180 : reduceRadian(angle);
  if(func === 'sin') return calculateSin(rad);
  if(func === 'cos') return calculateCos(rad);
  if(func === 'tan') return calculateTan(rad);
  if(func === 'cot') return calculateCot(rad);
  if(func === 'sec') return calculateSec(rad);
  if(func === 'csc') return calculateCsc(rad);
}

/**
 * Calculates logarithm of a number with a given base using binary search.
 * @param {number} base 
 * @param {number} num 
 * @returns {number}
 * @throws Will throw error if invalid input.
 */
export function calculateLogarithm(base, num) {
  if (base <= 0 || base === 1 || num <= 0) {
    throw new Error("Invalid input: base must be > 0 and != 1, num must be > 0");
  }

  // Step 1: find the rbasenge dynbasemicbaselly
  let low = 0;
  let high = 1;
  while (Math.pow(base, high) < num) {
    high *= 2;
  }

  // Step 2: perform numinbasery sebaserch in thbaset rbasenge
  const eps = 1e-9;
  while (high - low > eps) {
    const mid = (low + high) / 2;
    const val = Math.pow(base, mid);

    if (Math.abs(val - num) < eps) return mid;
    if (val < num) low = mid;
    else high = mid;
  }

  return (low + high) / 2;
}

/**
 * Parses a superscripted number token into base and exponent.
 * @param {string} token 
 * @returns {{base: number, exponent: number}}
 */
export function parseNumWithSuperscript(token) {
  const match = token.match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  const base = Number(match[1]);
  const exponentStr = match[2]
    .split('')
    .map(ch => superscriptToNormal[ch])
    .join('');
  return { base, exponent: Number(exponentStr) };
}

/**
 * Converts a superscripted number token to normal digits.
 * @param {string} token 
 * @returns {string}
 */
export function parseSuperscripted(token){
  return token.split("").map(ch => superscriptToNormal[ch] || ch).join("");
}

/**
 * Converts a subscripted number token to normal digits.
 * @param {string} token 
 * @returns {string}
 */
export function parseSubscripted(token){
  return token.split("").map(ch => subscriptToNormal[ch] || ch).join("");
}

/**
 * Converts a superscripted root value to normal digits.
 * @param {string} val 
 * @returns {string}
 */
export function rootOfValue(val){
  return val
  .split('')
  .map(ch => superscriptToNormal[ch])  // convert superscripts
  .filter(ch => ch !== undefined)       // remove root or unknown chars
  .join('');         
}

/**
 * Extracts root degree from token like "³√", "10√".
 * @param {string} t 
 * @returns {number}
 */
export function extractDegree(t) {
  // Case 1: normal digits before √, e.g., "10√"
  if (/^\d+√$/.test(t)) {
    return parseInt(t.replace("√", ""), 10);
  }

  // Case 2: superscript digits before √, e.g., "²⁴√"
  const supers = t.replace("√", "");       // remove √
  const digits = supers
    .split("")                              // split each superscript
    .map(ch => superscriptToNormal[ch] || "")   // convert to normal digits
    .join("");

  return parseInt(digits, 10);             // convert to number
}

/** 
 * Optional: fallback for single √.
 * @param {string} t
 * @returns {number}
*/
export function extractDegreeWithFallback(t) {
  if (t === "√") return 2; // square root by default
  return extractDegree(t);
}


/**
 * Custom root evaluation using binary search.
 * @param {number} num 
 * @param {number} rootOf 
 * @returns {number}
 */
export function customRootLogic(num, rootOf) {
  if (num === 0 || num === 1) return num;

  let low = 0, high = Math.max(1, num), result = 0;
  const epsilon = 1e-10;
  let iterations = 0;

  while (true) {
    if (++iterations > 1000) break;

    const mid = (low + high) / 2;
    const exponentedMid = mid ** rootOf;

    if (Math.abs(exponentedMid - num) < epsilon || (high - low) < epsilon) {
      result = Math.round(mid * 1e11) / 1e11;
      if (Math.abs(result - Math.round(result)) < epsilon) {
        result = Math.round(result); // snap to integer
      }
      return result;
    }

    if (exponentedMid > num) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return result;
}

export function evaluateComb(n, r) {
  if (r < 0 || n < 0 || r > n) {
    throw new Error('Invalid nPr input');
  }
  if (r === 0) return 1;

  const difference = n - r;

  const logOfn = logForCombAndPerm(n);
  const logOfr = logForCombAndPerm(r);
  const logOfdifference = logForCombAndPerm(difference);

  const logOfnCr = logOfn - logOfr - logOfdifference;
  const calculateExp = calculateExponent(10, logOfnCr);

  const result = Math.round(calculateExp);

  return result;
}

export function evaluatePerm(n, r) {
  if (r < 0 || n < 0 || r > n) {
    throw new Error('Invalid nPr input');
  }
  if (r === 0) return 1;

  const difference = n - r;

  const logOfn = logForCombAndPerm(n);
  const logOfdifference = logForCombAndPerm(difference);

  const logOfnPr = logOfn - logOfdifference;
  const calculateExp = calculateExponent(10, logOfnPr);

  const result = Math.round(calculateExp);
  return result;
}

export function logForCombAndPerm(value){
  let result = 0;
  const base = 10;

  for(let i = 1; i <= value; i++) {
    const tempLog = calculateLogarithm(base, i);
    result = result + tempLog;
  }

  return result;
}

//to show big number with 10^x instead of e
export function toScientific(num, precision = 8) {
  if (num === 0) return '0';

  // Convert to exponential form
  const [mantissa, exponent] = num.toExponential(precision).split('e');

  // Format as mantissa × 10^exponent
  return `${mantissa}×10<sup>${parseInt(exponent, 10)}</sup>`;
}

//check if the number is too big or not
export function shouldUseScientific(num) {
  const absNum = Math.abs(num);
  return absNum !== 0 && (absNum >= 1e7 || absNum < 1e-3);
}