import { validateForDisplay, validateForEvaluation } from '../core/validation.js';
import { handleEqual } from '../editor/inputController.js';
import { insertValue, replaceOperator } from '../editor/insertion.js';
import { changeMultiplySign } from './uiUtils.js';
import { updateInput, handleInvalidInput } from './ui.js';


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
export function handleDefaultButton(input, inputText, caretPosition, btnValue) {
    // Validate the input for display purposes
    const validated = validateForDisplay(inputText, btnValue);

    if (validated.allowed) {
      // Insert the value into the input
      const { newInput, newCaret } = insertValue(
        inputText,
        caretPosition,
        btnValue
      );
      updateInput(input, newInput, newCaret);
      return;
    }

    if (validated.action === "replace") {
      // Replace the operator at the current caret position
      const { newInput, newCaret } = replaceOperator(
        inputText,
        caretPosition,
        btnValue
      );
      updateInput(input, newInput, newCaret);
      return;
    }

    // Invalid input: show message and restore caret
    handleInvalidInput(input, caretPosition, validated.message);
    return;
  }

  