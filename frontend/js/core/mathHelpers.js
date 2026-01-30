import {normalToSuperscript, superscriptToNormal, subscriptToNormal, superscriptChars, subscriptChars} from './constants.js';




/**
 * Divides two numbers and rounds the result to 10 decimal places.
 *
 * This ensures consistent precision for display or further calculations.
 *
 * @param {number} a - The dividend.
 * @param {number} b - The divisor.
 * @returns {number} The quotient rounded to 10 decimal digits.
 */
export function divide(a, b){
  const result = a / b;
  const tenDigitResult = Number(result.toFixed(10));
  return tenDigitResult;
}






/**
 * Multiplies a numeric token by π (pi ≈ 3.14159).
 *
 * The input token may contain the 'π' character, which is removed
 * before performing the multiplication.
 *
 * @param {number|string} token - The numeric value to multiply by π.
 * @returns {number} The result of the multiplication.
 */

export function calculateNumWithPi(token) {
  const num = filterOutPi(token);
  const result = num * Math.PI;
  return result;
}






/**
 * Multiplies a numeric token by Euler's number (e ≈ 2.71828).
 *
 * The input token may contain the 'e' character, which is removed
 * before performing the multiplication.
 *
 * @param {number|string} token - The numeric value to multiply by e.
 * @returns {number} The result of the multiplication.
 */

export function calculateNumWithE(token) {
  const num = filterOutE(token);
  const result = num * Math.E;
  return result;
}






/**
 * Checks whether a token represents a number followed by superscript digits.
 *
 * A valid token contains one or more normal digits followed immediately
 * by one or more superscript characters (e.g., "2²", "10³²").
 *
 * @param {string} token - The string to check.
 * @returns {boolean} True if the token is a number followed by superscript digits, false otherwise.
 */
export function isNumWithSuperscript(token) {
  return new RegExp(`\\d+[${superscriptChars}]+`).test(token);
}






/**
 * Checks whether a string consists entirely of superscripted digits.
 *
 * Superscripted digits are characters like ¹, ², ³, … ⁹, ⁰. This function
 * returns true only if the input token contains one or more of these
 * characters and nothing else.
 *
 * @param {string} token - The string to check.
 * @returns {boolean} True if the token contains only superscripted digits, false otherwise.
 */

export function isSuperscriptedNumber(token){
  return new RegExp(`^[${superscriptChars}]+$`).test(token);
}







/**
 * Checks whether a string consists entirely of subscripted digits.
 *
 * Subscripted digits are characters like ₀, ₁, ₂, … ₉. This function
 * returns true only if the input token contains one or more of these
 * characters and nothing else.
 *
 * @param {string} token - The string to check.
 * @returns {boolean} True if the token contains only subscripted digits, false otherwise.
 */

export function isSubscriptedNumber(token){
  // return new RegExp(`^[₀-₉]+$`).test(token);
  return new RegExp(`^[${subscriptChars}]+$`).test(token);
}






/**
 * Computes the exponentiation of a base raised to a power.
 *
 * Calculates base^exp using the JavaScript exponentiation operator.
 *
 * @param {number} base - The base number.
 * @param {number} exp - The exponent.
 * @returns {number} The result of base raised to the power exp.
 */

export function calculateExponent(base, exp){
  return base ** exp;
}






/**
 * Computes the factorial of a non-negative integer.
 *
 * Factorial is defined as n! = 1 × 2 × ... × n, with 0! = 1.
 *
 * @param {number} num - A non-negative integer.
 * @returns {number} The factorial of `num`.
 */

export function calculateFactorial(num){
  let result = 1;
  for(let i = 2; i <= num; i++){
    result *= i;
  }
  return result;
}






/**
 * Normalizes an angle in radians to the range [-π, π].
 *
 * This is useful for improving numerical stability in trigonometric
 * calculations by ensuring the angle stays within a standard range.
 *
 * @param {number} angle - The angle in radians to normalize.
 * @returns {number} The equivalent angle normalized to [-π, π].
 */

export function reduceRadian(angle){
  return angle - Math.round(angle / (2 * Math.PI)) * 2 * Math.PI;
}





/**
 * Computes the sine of an angle (in radians) using the Taylor series expansion.
 *
 * The input angle is first reduced modulo 2π to improve numerical stability.
 * The sine is approximated using the first 20 terms of the Taylor series:
 * sin(x) ≈ x - x³/3! + x⁵/5! - x⁷/7! + ...
 * Small floating-point errors near zero are treated as 0, and the result
 * is rounded to 10 decimal places for display purposes.
 *
 * @param {number} degreeToRadian - The angle in radians.
 * @returns {number} The sine of the angle, rounded to 10 decimal digits.
 */

export function calculateSin(degreeToRadian) {
  // Reduce angle to improve numerical stability
  const reduceAngle = degreeToRadian % (2 * Math.PI);
  let sin = 0;
  const terms = 20; // number of Taylor series terms

  for (let n = 0; n < terms; n++) {
    const term = ((-1) ** n) * calculateExponent(reduceAngle, 2 * n + 1) / calculateFactorial(2 * n + 1);
    sin += term;
  }

  // Treat tiny floating-point errors as 0
  if (Math.abs(sin) < 1e-10) return 0;

  // Round to 10 decimal digits for display
  return Number(sin.toFixed(10));
}




/**
 * Computes the cosine of an angle (in radians) using the Taylor series expansion.
 *
 * The input angle is first reduced modulo 2π to improve numerical stability.
 * The cosine is approximated using the first 20 terms of the Taylor series:
 * cos(x) ≈ 1 - x²/2! + x⁴/4! - x⁶/6! + ...
 * Very small floating-point errors near zero are treated as 0, and the result
 * is rounded to 10 decimal places for display purposes.
 *
 * @param {number} degreeToRadian - The angle in radians.
 * @returns {number} The cosine of the angle, rounded to 10 decimal digits.
 */

function calculateCos(degreeToRadian) {
  // const x = deg * Math.PI / 180; // convert to radians
  const reduceAngle = degreeToRadian % (2 * Math.PI);
  let cos = 0;
  const terms = 20; // number of Taylor series terms

  for (let n = 0; n < terms; n++) {
    const term = ((-1) ** n) * (reduceAngle ** (2 * n)) / calculateFactorial(2 * n);
    cos += term;
  }

  // treat very small numbers as 0
  if (Math.abs(cos) < 1e-10) return 0;

  return Number(cos.toFixed(10)); // round for display
}





/**
 * Computes the tangent of an angle (in radians) using sine and cosine.
 *
 * The tangent is calculated as tan(x) = sin(x) / cos(x), using the
 * custom Taylor series implementations for sine and cosine.
 * The result is rounded to 10 decimal places for display purposes.
 *
 * @param {number} degreeToRadian - The angle in radians.
 * @returns {number} The tangent of the angle, rounded to 10 decimal digits.
 */

function calculateTan(degreeToRadian){
  const tanResult = calculateSin(degreeToRadian)/calculateCos(degreeToRadian);
  const tenDigitResult = Number(tanResult.toFixed(10));
  return tenDigitResult;
}





/**
 * Computes the cotangent of an angle (in radians) using cosine and sine.
 *
 * The cotangent is calculated as cot(x) = cos(x) / sin(x), using the
 * custom Taylor series implementations for sine and cosine.
 * The result is rounded to 10 decimal places for display purposes.
 *
 * @param {number} degreeToRadian - The angle in radians.
 * @returns {number} The cotangent of the angle, rounded to 10 decimal digits.
 */

function calculateCot(degreeToRadian){
  const cotResult = calculateCos(degreeToRadian)/calculateSin(degreeToRadian);
  const tenDigitResult = Number(cotResult.toFixed(10));
  return tenDigitResult;
}





/**
 * Computes the secant of an angle (in radians) using cosine.
 *
 * The secant is calculated as sec(x) = 1 / cos(x), using the
 * custom Taylor series implementation for cosine.
 * The result is rounded to 10 decimal places for display purposes.
 *
 * @param {number} degreeToRadian - The angle in radians.
 * @returns {number} The secant of the angle, rounded to 10 decimal digits.
 */

function calculateSec(degreeToRadian){
  const secResult = 1/calculateCos(degreeToRadian);
  const tenDigitResult = Number(secResult.toFixed(10));
  return tenDigitResult;
}



/**
 * Computes the cosecant of an angle (in radians) using sine.
 *
 * The cosecant is calculated as csc(x) = 1 / sin(x), using the
 * custom Taylor series implementation for sine.
 * The result is rounded to 10 decimal places for display purposes.
 *
 * @param {number} degreeToRadian - The angle in radians.
 * @returns {number} The cosecant of the angle, rounded to 10 decimal digits.
 */

function calculateCsc(degreeToRadian){
  const cscResult = 1/calculateSin(degreeToRadian);
  const tenDigitResult = Number(cscResult.toFixed(10));
  return tenDigitResult;
}





/**
 * Computes the value of a trigonometric function for a given angle.
 *
 * The angle can be provided in degrees or radians. If in degrees, it is
 * converted to radians. The function supports 'sin', 'cos', 'tan', 'cot',
 * 'sec', and 'csc', using the custom Taylor series-based implementations
 * for accurate calculation. 
 *
 * @param {string} func - The trigonometric function to compute ('sin', 'cos', 'tan', 'cot', 'sec', 'csc').
 * @param {number} angle - The angle value in degrees or radians.
 * @param {'deg'|'rad'} mode - Indicates whether the angle is in degrees ('deg') or radians ('rad').
 * @returns {number} The computed value of the trigonometric function.
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
 * Computes the logarithm of a number with a given base using binary search.
 *
 * Calculates log_base(num) without relying on Math.log, using an iterative
 * binary search approach for precision. The function handles real numbers
 * and provides a high-accuracy approximation.
 *
 * @param {number} base - The base of the logarithm (must be > 0 and != 1).
 * @param {number} num - The number to compute the logarithm for (must be > 0).
 * @returns {number} The logarithm of `num` to the specified `base`.
 * @throws {Error} If `base` <= 0, `base` == 1, or `num` <= 0.
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
 * Parses a numeric token that includes superscripted digits into its base and exponent.
 *
 * For example, the token "2³" will be parsed as { base: 2, exponent: 3 }.
 * Superscript characters are converted to their normal numeric equivalents.
 *
 * @param {string} token - The token containing a number followed by superscript digits.
 * @returns {{ base: number, exponent: number }} An object with the numeric base and exponent.
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
 * Converts a token containing superscripted digits into normal digits.
 *
 * Each superscript character is mapped to its standard numeric equivalent.
 *
 * For example, "²³" becomes "23".
 *
 * @param {string} token - The string containing superscript characters.
 * @returns {string} The converted string with normal digits.
 */

export function parseSuperscripted(token){
  return token.split("").map(ch => superscriptToNormal[ch] || ch).join("");
}




/**
 * Converts a token containing subscripted digits into normal digits.
 *
 * Each subscript character is mapped to its standard numeric equivalent.
 *
 * For example, "₁₂₃" becomes "123".
 *
 * @param {string} token - The string containing subscript characters.
 * @returns {string} The converted string with normal digits.
 */

export function parseSubscripted(token){
  return token.split("").map(ch => subscriptToNormal[ch] || ch).join("");
}




/**
 * Removes the π character from a token string.
 *
 * Useful for extracting the numeric portion of values such as "2π"
 * before further evaluation.
 *
 * @param {string} token - The token string containing π.
 * @returns {string} The token string with π removed.
 */

export function filterOutPi(token){
  return token.split("").filter(ch => ch !== 'π').join("");
}





/**
 * Removes the e character from a token string.
 *
 * Useful for extracting the numeric portion of values such as "2e"
 * before further evaluation.
 *
 * @param {string} token - The token string containing e.
 * @returns {string} The token string with e removed.
 */

export function filterOutE(token){
  return token.split("").filter(ch => ch !== 'e').join("");
}





/**
 * Converts superscript characters in a root index to normal digits.
 *
 * Translates supported superscript numerals into their standard
 * numeric form and discards unsupported or non-superscript characters.
 *
 * @param {string} val - The string containing superscript characters.
 * @returns {string} The converted numeric string.
 */

export function rootOfValue(val){
  return val
  .split('')
  .map(ch => superscriptToNormal[ch])  // convert superscripts
  .filter(ch => ch !== undefined)       // remove root or unknown chars
  .join('');         
}





/**
 * Extracts the root degree from a root token like "³√", "10√".
 *
 * Supports both normal digits (e.g. "10√") and superscript digits
 * (e.g. "²⁴√") appearing before the root symbol.
 *
 * @param {string} t - The root token containing a degree and √ symbol.
 * @returns {number} The extracted root degree as a number.
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
 * Extracts the root degree, providing a default for a single root symbol.
 *
 * Returns 2 for a standalone "√" (square root); otherwise delegates
 * to `extractDegree` for explicit degree extraction.
 *
 * @param {string} t - The root token.
 * @returns {number} The extracted root degree.
 */

export function extractDegreeWithFallback(t) {
  if (t === "√") return 2; // square root by default
  return extractDegree(t);
}





/**
 * Computes the n-th root of a number using a binary search approach.
 *
 * Handles both integers and decimals, snapping results to integers
 * when very close, and uses a high-precision epsilon for convergence.
 * Designed as a custom replacement for `Math.pow(num, 1/n)` to avoid
 * floating-point inaccuracies in certain edge cases.
 *
 * @param {number} num - The number to extract the root from.
 * @param {number} rootOf - The degree of the root.
 * @returns {number} The computed n-th root of `num`.
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





/**
 * Calculates the number of combinations (nCr) using logarithms to maintain precision.
 *
 * Uses the formula: nCr = n! / (r! * (n - r)!)  
 * Logarithms are applied to prevent overflow with large n and r values.
 * The final result is rounded to the nearest integer.
 *
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} The number of combinations (n choose r).
 * @throws {Error} If n or r are negative, or if r > n.
 */

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





/**
 * Calculates the number of permutations (nPr) using logarithms to maintain precision.
 *
 * Uses the formula: nPr = n! / (n - r)!  
 * Logarithms are applied to improve accuracy and avoid floating-point errors.
 * The final result is rounded to the nearest integer.
 *
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to arrange.
 * @returns {number} The number of permutations (nPr).
 * @throws {Error} If n or r are negative, or if r > n.
 */

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





/**
 * Computes the base-10 logarithm of a factorial (log10(value!)).
 *
 * This is used in combination and permutation calculations (nCr, nPr)
 * to prevent overflow and maintain numerical precision.
 * The result is the sum of log10(1) + log10(2) + ... + log10(value).
 *
 * @param {number} value - The number for which to compute the factorial logarithm.
 * @returns {number} The base-10 logarithm of value!.
 */

export function logForCombAndPerm(value){
  let result = 0;
  const base = 10;

  for(let i = 1; i <= value; i++) {
    const tempLog = calculateLogarithm(base, i);
    result = result + tempLog;
  }

  return result;
}






/**
 * Converts a numeric string or number into its superscript representation.
 *
 * Each digit is mapped to the corresponding superscript character.
 * Useful for displaying root indices, exponents, or powers in the UI.
 *
 * @param {number|string} num - The number or numeric string to convert.
 * @returns {string} The corresponding superscript string.
 */

function toSuperscriptString(num) {
  return String(num)
    .split('')
    .map(ch => normalToSuperscript[ch])
    .join('');
}






/**
 * Formats a number in scientific notation using "×10^x" with superscript exponent.
 *
 * Converts large or small numbers into a human-readable scientific format,
 * replacing the default JavaScript "e" notation with a superscript exponent.
 * Trailing zeros in the mantissa are removed for cleaner display.
 *
 * @param {number} num - The number to format.
 * @param {number} [precision=8] - Number of digits after the decimal in the mantissa.
 * @returns {string} The formatted scientific notation string (e.g., "1.23×10³").
 */

export function toScientific(num, precision = 8) {
  if (num === 0) return '0';

  // Convert to exponential form
  let [mantissa, exponent] = num.toExponential(precision).split('e');
  mantissa = mantissa.replace(/\.?0+$/, '');

  // Format as mantissa × 10^exponent
  return `${mantissa}×10${toSuperscriptString(exponent)}`;
}






/**
 * Determines whether a number should be displayed in scientific notation.
 *
 * Numbers are considered "too large" or "too small" if they are:
 *   - greater than or equal to 1e10, or
 *   - less than 0.001 (1e-3) but not zero.
 *
 * @param {number} num - The number to evaluate.
 * @returns {boolean} True if the number should use scientific notation, false otherwise.
 */

export function shouldUseScientific(num) {
  const absNum = Math.abs(num);
  return absNum !== 0 && (absNum >= 1e10 || absNum < 1e-3);
}