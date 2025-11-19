import { validateForDisplay, isOperator } from "./validation.js";
import { normalToSuperscript, superscripts, superscriptToNormal } from "./constants.js";

// Main insertion function
export function insertValue(currentInput, caretPosition, newValue) {
  const lastChar = currentInput[caretPosition - 1];

  // Case 1: inserting exponent box
  if (newValue.includes("□")) {
    if (validateForDisplay(currentInput, newValue).allowed) {
      return {
        newInput: showExponentBox(currentInput, caretPosition),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: caretPosition,
      };
    }
  }

  // Case 2: filling exponent
  if (currentInput.includes("□")) {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(newValue.includes('x2') || newValue.includes('x3')){
    return{
      newInput: showExponent(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  // Case 3: appending to superscript
  if (Object.values(normalToSuperscript).includes(lastChar)) {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue),
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

function showExponentBox(currentInput, caretPos) {
  return (
    currentInput.slice(0, caretPos) + `<sup>□</sup>` + currentInput.slice(caretPos)
  );
}

function showExponent(currentInput, caretPos, newValue) {
  const lastChar = currentInput[caretPos];
  // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
  const supers = newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
  const filterOut_baseX = supers.split("").filter(v => v !== 'x');
  console.log(supers);
  console.log(filterOut_baseX);

  if (lastChar === "□") {
    return (
      currentInput.slice(0, caretPos) +
      supers +
      currentInput.slice(caretPos + 1)
    );
  }
  if (Object.values(normalToSuperscript).includes(lastChar)) {
    return (
      currentInput.slice(0, caretPos) + supers + currentInput.slice(caretPos)
    );
  }
  if (newValue.includes('x2') || newValue.includes('x3')){
    return currentInput.slice(0, caretPos) + filterOut_baseX + currentInput.slice(caretPos);
  }
  return currentInput.slice(0, caretPos) + supers + currentInput.slice(caretPos);
}

export function replaceOperator(currentInput, newValue) {
  return currentInput.slice(0, -1) + newValue;
}