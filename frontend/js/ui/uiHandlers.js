import { validateForDisplay, validateForEvaluation } from '../core/validation.js';
import { handleEqual } from '../editor/inputController.js';
import { insertValue, replaceOperator } from '../editor/insertion.js';
import { changeMultiplySign } from './uiUtils.js';
import { updateInput, handleInvalidInput } from './ui.js';
import {handleAC, handleDelete, handleFunctions, handleLeftArrow, handleRightArrow} from "../editor/inputController.js";


/**
 * Map of simple button types to their handlers
 * @type {Object<string, Function>}
*/
export const simpleHandlers = {
  ac: handleAC,
  delete: (inputText, caretPosition) => handleDelete(inputText, caretPosition),
  leftArrow: (inputText, caretPosition, btn, btnValue) => handleLeftArrow(inputText, caretPosition, btn, btnValue),
  rightArrow: (inputText, caretPosition, btn, btnValue) => handleRightArrow(inputText, caretPosition, btn, btnValue),
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
  // Validate the input for evaluation
  const validated = validateForEvaluation(
    inputText,
    btnValue
  );

  if (validated.allowed) {
    // Replace '×' with '*' for calculation
    const modifiedInputText = changeMultiplySign(inputText);
    // Evaluate the expression and get new input/caret
    const { newInput, newCaret, showMsg } = handleEqual(
      modifiedInputText
    );

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

    if (clickedBtnType === 'ac' && handler) {
      //execute simpleHandler function for AC button
      const { newInput, newCaret, showMsg } = handler(inputText, caretPosition, btn, btnValue);
      updateInput(input, newInput, newCaret, showMsg);
      return;
    }

    // Validate the input for display purposes
    const validated = validateForDisplay(inputText, btnValue, caretPosition);

    if (validated.allowed) {
      //execute simpleHandler function values
      if (handler) {
        const { newInput, newCaret, showMsg } = handler(inputText, caretPosition, btn, btnValue);
        updateInput(input, newInput, newCaret, showMsg);
        return;
      }

      // Insert the other values into the input
      const { newInput, newCaret } = insertValue(
        inputText,
        caretPosition,
        btn,
        btnValue
      );
      console.log(newCaret);
      updateInput(input, newInput, newCaret);
      return;
    }

    if (validated.action === "replace") {
      // Replace the operator at the current caret position
      const { newInput, newCaret } = replaceOperator(
        inputText,
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

  