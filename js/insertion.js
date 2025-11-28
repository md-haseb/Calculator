import { validateForDisplay, isOperator } from "./validation.js";
import { normalToSuperscript, normalToSubscript, superscripts, superscriptToNormal } from "./constants.js";
import { tokenize } from "./calculation.js";

// Main insertion function
export function insertValue(currentInput, caretPosition, newValue) {
  const lastChar = currentInput[caretPosition - 1];
  // if(currentInput){
  //   const token = getTokenAtCaret(tokens, caretPosition);
  //   const prevToken = getPrevToken(tokens, token);
  //   const nextToken = getNextToken(tokens, token);
  //   console.log(tokens);
  //   console.log(token);
  //   console.log(prevToken);
  //   console.log(nextToken);
  // }

  // Case 1: inserting exponent box
  // if (newValue.includes("□") && newValue.includes('x')) {
  //   if (validateForDisplay(currentInput, newValue).allowed) {
  //     return {
  //       newInput: showExponentBox(currentInput, caretPosition, newValue),
  //       // newCaret: caretPosition + 1, // caret lands inside □
  //       newCaret: caretPosition,
  //     };
  //   }
  // }

  // if (newValue.includes("□") && newValue.includes('log')){
  //   if (validateForDisplay(currentInput, newValue).allowed) {
  //     return {
  //       newInput: showExponentBox(currentInput, caretPosition, newValue),
  //       // newCaret: caretPosition + 1, // caret lands inside □
  //       newCaret: caretPosition + 3,
  //     };
  //   }
  // }

  // if(newValue.includes("□") && newValue.includes('√')) {
  //   if (validateForDisplay(currentInput, newValue).allowed) {
  //     return {
  //       newInput: showExponentBox(currentInput, caretPosition, newValue),
  //       // newCaret: caretPosition + 1, // caret lands inside □
  //       newCaret: caretPosition - 1,
  //     };
  //   }
  // }

  // if(newValue.includes('C')){
  //   if (validateForDisplay(currentInput, newValue).allowed) {
  //     return {
  //       newInput: showExponentBox(currentInput, caretPosition, newValue),
  //       // newCaret: caretPosition + 1, // caret lands inside □
  //       newCaret: caretPosition,
  //     };
  //   }
  // }




  if (newValue.includes("□")) {
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: getCaretAfterInsertion(newValue, caretPosition),
      };
  }

  if(newValue.includes("n") && newValue.includes("r")){
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: getCaretAfterInsertion(newValue, caretPosition),
      };
  }

  if(newValue.includes('x2') || newValue.includes('x3')){
    return{
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }
  const tokens = getTokens(currentInput);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  const nextToken = getNextToken(tokens, currentToken);
  console.log(tokens);
  console.log(currentToken);
  console.log(prevToken);
  console.log(nextToken);
  // Case 2: filling exponent and indices (subscript)
  if(currentToken?.type === 'function' && nextToken?.type === 'box'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if ((currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal') && nextToken?.type === 'box') {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'combAndPerm' && nextToken?.type === 'box'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'box' && nextToken?.type === 'singleRoot'){ 
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'box' && nextToken?.type === 'combAndPerm'){ 
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  // Case 3: appending to superscript and subscript
  if (currentToken?.type === 'nthRoot' && caretPosition < currentToken?.end) {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if (currentToken?.type === 'supAndSub') {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'superscriptValue'){
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'subscriptValue'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }



  // Case 4: bracket handling → place caret inside
  if (newValue === "()") {
    return {
      newInput:
        currentInput.slice(0, caretPosition) +
        "()" +
        currentInput.slice(caretPosition),
      newCaret: caretPosition + 1, // caret is inside the brackets
    };
  }

  // Default case: normal insertion
  return {
    newInput:
      currentInput.slice(0, caretPosition) +
      newValue +
      currentInput.slice(caretPosition),
    newCaret: caretPosition + newValue.length,
  };
}

function getTokens(currentInput){
  return tokenize(currentInput);
}

function getTokenAtCaret(tokens, caretPos) {
  return tokens.find(t => caretPos >= t.start && caretPos <= t.end);
}

function getPrevToken(tokens, token) {
  // Find all tokens that end before the current token starts
  const previousTokens = tokens.filter(t => t.end <= token.start);
  // Return the one with the **largest end position**
  return previousTokens.sort((a, b) => b.end - a.end)[0];
}

function getNextToken(tokens, token) {
  // Find all tokens that end before the current token starts
  const nextTokens = tokens.filter(t => t.start >= token.end);
  // Return the one with the **largest end position**
  return nextTokens.sort((a, b) => a.start - b.start)[0];
}

function showExponentBox(currentInput, caretPos, newValue) {
  if(newValue.includes('log')){
    return currentInput.slice(0, caretPos) + `log<sub>□</sub>()` + currentInput.slice(caretPos);
  }
  if(newValue.includes('√')){
    return currentInput.slice(0, caretPos) + `<sup>□</sup>√` + currentInput.slice(caretPos);
  }
  if(newValue.includes('C')){
    return currentInput.slice(0, caretPos) + `<sup>□</sup>C<sub>□</sub>` + currentInput.slice(caretPos);
  }
  if(newValue.includes('P')){
    return currentInput.slice(0, caretPos) + `<sup>□</sup>P<sub>□</sub>` + currentInput.slice(caretPos);
  }
  return (
    currentInput.slice(0, caretPos) + `<sup>□</sup>` + currentInput.slice(caretPos)
  );
}

function getCaretAfterInsertion(newValue, caretPos) {
  if (newValue.includes('log')) return caretPos + 3;
  if (newValue.includes('√'))   return caretPos - 1;
  return caretPos; // default for x, C, P, etc.
}

function showExponent(currentInput, caretPos, newValue) {
  const boxForExponent = currentInput[caretPos];
  // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
  const supers = newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
  const filterOut_baseX = supers.split("").filter(v => v !== 'x');
  console.log(supers);
  console.log(filterOut_baseX);
  if (boxForExponent === "□" && currentInput[caretPos + 1] === 'C') {
    return (
      currentInput.slice(0, caretPos) +
      supers + `C<sub>□</sub>` + 
      currentInput.slice(caretPos + 3)
    );
  }
  if (boxForExponent === "□") {
    return (
      currentInput.slice(0, caretPos) +
      supers +
      currentInput.slice(caretPos + 1)
    );
  }
  if (Object.values(normalToSuperscript).includes(currentInput[caretPos - 1])) {
    return (
      currentInput.slice(0, caretPos) + supers + currentInput.slice(caretPos)
    );
  }
  if (newValue.includes('x2') || newValue.includes('x3')){
    return currentInput.slice(0, caretPos) + filterOut_baseX + currentInput.slice(caretPos);
  }
  return currentInput.slice(0, caretPos) + supers + currentInput.slice(caretPos);
}

function showIndicesForLog(currentInput, caretPos, newValue) {
  // const lastChar = currentInput[caretPos];
  const boxForIndices = currentInput[caretPos];
  console.log(boxForIndices);
  // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
  const subs = newValue.split("").map((d) => normalToSubscript[d] || d).join("");
  // const filterOut_baseX = supers.split("").filter(v => v !== 'x');
  // console.log(supers);
  // console.log(filterOut_baseX);

  if (boxForIndices === "□") {
    console.log(currentInput[caretPos + 1]);
    return (
      currentInput.slice(0, caretPos) +
      subs +
      currentInput.slice(caretPos + 1)
    );
  }
  if (Object.values(normalToSubscript).includes(currentInput[caretPos - 1])) {
    return (
      currentInput.slice(0, caretPos) + subs + currentInput.slice(caretPos)
    );
  }
  // if (newValue.includes('x2') || newValue.includes('x3')){
  //   return currentInput.slice(0, caretPos) + filterOut_baseX + currentInput.slice(caretPos);
  // }
  return currentInput.slice(0, caretPos) + subs + currentInput.slice(caretPos);
}

export function replaceOperator(currentInput, newValue) {
  return currentInput.slice(0, -1) + newValue;
}