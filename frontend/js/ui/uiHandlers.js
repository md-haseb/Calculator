import { validateForDisplay, validateForEvaluation } from '../core/validation.js';
import { handleEqual } from '../editor/inputController.js';
import { insertValue, replaceOperator } from '../editor/insertion.js';
import { changeMultiplySign } from './uiUtils.js';
import { updateInput, handleInvalidInput } from './ui.js';
import {handleAC, handleDelete, handleFunctions, handleLeftArrow, handleRightArrow} from "../editor/inputController.js"; // handleOperators,
import { operatorsMap } from '../core/constants.js';
import { formatTokensForDisplay } from './formatDisplay.js';



const operatorHandlers = Object.entries(operatorsMap).reduce((acc, [btnName, symbol]) => {
  console.log('hello');
  acc[btnName] = (inputText, caretPosition) => handleOperators(symbol, inputText, caretPosition);
  return acc;
}, {});


/**
 * Map of simple button types to their handlers
 * @type {Object<string, Function>}
*/
export const simpleHandlers = {
  ac: handleAC,
  delete: (inputText, caretPosition, btn) => handleDelete(inputText, caretPosition, btn),
  leftArrow: (inputText, caretPosition, btn) => handleLeftArrow(inputText, caretPosition, btn),
  rightArrow: (inputText, caretPosition, btn) => handleRightArrow(inputText, caretPosition, btn),
  function: (inputText, caretPosition, btn, btnValue) => handleFunctions(btnValue, inputText, btn, caretPosition),
};


/**
 * Execute the calculation when the equal button is pressed.
 * - Validates the input
 * - Replaces multiplication symbols for evaluation
 * - Updates the input display or shows an error message
 * 
 * @param {HTMLElement} input - The input display element
 * @param {string} inputText - Current input text
 * @param {number} caretPosition - Current caret position
 * @param {string} btnValue - Value of the clicked button (usually '=')
*/
export function executeEqual(input, inputText, caretPosition, btnValue){
  const inputMap = formatTokensForDisplay(inputText).map;
  // Validate the input for evaluation
  const validated = validateForEvaluation(
    inputText,
    inputMap,
    caretPosition,
    btnValue
  );

  if (validated.allowed) {
    // Replace '×' with '*' for calculation
    const modifiedInputText = changeMultiplySign(inputText);
    // Evaluate the expression and get new input/caret
    const { newInput, newCaret, showMsg } = handleEqual(
      modifiedInputText
    );
    console.log(newInput);
    // Update the input display
    updateInput(input, newInput, newCaret, showMsg);
    return;
  }
  // (fallback) If input is invalid, show error and restore caret
  handleInvalidInput(input, caretPosition, validated.message);
  return; 
} 

/**
 * Handles default button clicks (numbers, operators, etc.)
 * - Validates input for display
 * - Inserts or replaces values in the input field
 * - Updates the UI or shows an error if input is invalid
 * 
 * @param {HTMLElement} input - The input display element
 * @param {string} inputText - Current input text
 * @param {number} caretPosition - Current caret position
 * @param {string} btnValue - Value of the clicked button
*/
export function handleDefaultButton(input, inputText, caretPosition, btn, clickedBtnType, btnValue) {
    const handler = simpleHandlers[clickedBtnType];
    console.log(btnValue);

    if (clickedBtnType === 'ac' && handler) {
      //execute simpleHandler function for AC button
      const { newInput, newCaret, showMsg } = handler(inputText, caretPosition, btn, btnValue);
      updateInput(input, newInput, newCaret, showMsg);
      return;
    }
    console.log(inputText, btnValue, caretPosition);
    // Validate the input for display purposes
    const inputMap = formatTokensForDisplay(inputText).map;
    console.log(inputMap);
    const validated = validateForDisplay(inputText, inputMap, btnValue, caretPosition);
    console.log('hello');

    if (validated.allowed) {
      //execute simpleHandler function values
      if (handler) {
        const { newInput, newCaret, showMsg } = handler(inputText, caretPosition, btn, btnValue);
        updateInput(input, newInput, newCaret, showMsg);
        console.log(inputText, newInput);
        return;
      }
      console.log(inputText, caretPosition, btn, btnValue);
      // Insert the other values into the input
      const { newInput, newCaret } = insertValue(
        inputText,
        caretPosition,
        btn,
        btnValue
      );
      console.log(newInput);
      updateInput(input, newInput, newCaret);
      return;
    }

    if (validated.action === "replace") {
      console.log('hello');
      // Replace the operator at the current caret position
      const { newInput, newCaret } = replaceOperator(
        inputText,
        inputMap,
        caretPosition,
        btn, 
        btnValue
      );
      updateInput(input, newInput, newCaret);
      return;
    }

    // Invalid input: show message and restore caret
    handleInvalidInput(input, caretPosition, validated.message);
    return;
  }

  