import { validateForDisplay, isOperator } from "./validation.js";
import { normalToSuperscript, normalToSubscript, superscripts, superscriptToNormal } from "./constants.js";

// Main insertion function
export function insertValue(currentInput, caretPosition, newValue) {
  const lastChar = currentInput[caretPosition - 1];

  // Case 1: inserting exponent box
  if (newValue.includes("□") && newValue.includes('x')) {
    if (validateForDisplay(currentInput, newValue).allowed) {
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: caretPosition,
      };
    }
  }

  if (newValue.includes("□") && newValue.includes('log')){
    if (validateForDisplay(currentInput, newValue).allowed) {
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: caretPosition + 3,
      };
    }
  }

  if(newValue.includes("□") && newValue.includes('√')) {
    if (validateForDisplay(currentInput, newValue).allowed) {
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: caretPosition - 1,
      };
    }
  }

  if(newValue.includes('C')){
    if (validateForDisplay(currentInput, newValue).allowed) {
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: caretPosition,
      };
    }
  }

  // Case 2: filling exponent and indices (subscript)
  if(currentInput.includes("□") && currentInput[caretPosition + 1] === 'C'){
    return{
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentInput.includes("□") && currentInput[caretPosition + 1] === '√'){ //first priority check
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if (currentInput.includes("□") && !isNaN(currentInput[caretPosition - 1])) {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentInput.includes("□") && currentInput[caretPosition - 1] === 'g'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(newValue.includes('x2') || newValue.includes('x3')){
    return{
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  // Case 3: appending to superscript and subscript
  if (Object.values(normalToSuperscript).includes(lastChar)) {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(Object.values(normalToSubscript).includes(currentInput[caretPosition - 1])){
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
  return (
    currentInput.slice(0, caretPos) + `<sup>□</sup>` + currentInput.slice(caretPos)
  );
}

function showExponent(currentInput, caretPos, newValue) {
  const boxForExponent = currentInput[caretPos];
  // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
  const supers = newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
  const filterOut_baseX = supers.split("").filter(v => v !== 'x');
  console.log(supers);
  console.log(filterOut_baseX);

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