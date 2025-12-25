import {classifyButton} from '../core/classifyBtn.js';
import {caretShowWithFocus, caretIndex} from '../editor/caretHandler.js';
import {handleAC, handleDelete, handleFunctions, handleInputClick, handleLeftArrow, handleRightArrow} from "../editor/inputController.js";
import {setState, render} from "./uiState.js";
import {executeEqual, handleDefaultButton} from "./uiHandlers.js";


/**
 * DOM elements
*/
export const input = document.querySelector(".input_display");
const buttons = document.querySelectorAll(".btn");
const messageDiv = document.querySelector(".message_display");

export const angleToggleContainer = document.querySelector(".radDegToggle");
export const themeToggleContainer = document.querySelector(".theme_toggle");
const themeToggleButtons = document.querySelectorAll(".theme_toggle_btn");

const historyContainer = document.querySelector('.history_list_container');


/**
 * Map of simple button types to their handlers
 * @type {Object<string, Function>}
*/
const simpleHandlers = {
  ac: handleAC,
  delete: (inputText, caretPosition) => handleDelete(inputText, caretPosition),
  leftArrow: (inputText, caretPosition) => handleLeftArrow(inputText, caretPosition),
  rightArrow: (inputText, caretPosition) => handleRightArrow(inputText, caretPosition),
  function: (inputText, caretPosition, btnValue) => handleFunctions(btnValue, inputText, caretPosition),
};


/**
 * Global UI state
 * - theme: 'dark' | 'light'
 * - angle: 'deg' | 'rad'
 * - lastExpression: stores the input before pressing '='
*/
export const state = {
  theme: localStorage.getItem('theme') || 'light',  //ui theme
  angle: 'deg',  //angle mode
  lastExpression: '',  // stores input before pressing '='
}


/**
 * Display a message to the user
 * @param {string} msg - Message text
*/
function showMessage(msg = "Message: All is well") {
  messageDiv.textContent = msg;
}

/**
 * Initialize the calculator UI
 * - Sets initial caret position
 * - Applies theme and updates toggle buttons
 * - Adds event listeners for input clicks, theme toggle, and calculator buttons
*/
export function init() {
  // Focus caret initially
  initCaret(input);

  // Render initial theme and toggle buttons
  render();

  // Handle mouse clicks on input display
  initInputClick(input);

  // handle theme toggle buttons
  initThemeToggle(themeToggleButtons);

  // handle all calculator button clicks
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const clickedBtn = classifyButton(btn);
      const caretPosition = caretIndex(input);

      switch (clickedBtn.type) {
        case "radian":
        case "degree":
          setState("angle", clickedBtn.value);
          executeEqual(input, state.lastExpression, caretPosition, clickedBtn.value);
          appendHistory(input);
          return;

        case "equal":
          setState("lastExpression", input.innerHTML);
          executeEqual(input, input.textContent, caretPosition, clickedBtn.value);
          appendHistory(input);
          return;

        default:
          if (simpleHandlers[clickedBtn.type]) {
            const { newInput, newCaret, showMsg } = simpleHandlers[clickedBtn.type](input.textContent,    caretPosition, clickedBtn.value);
            updateInput(input, newInput, newCaret, showMsg);
            return;
          }

          handleDefaultButton(input, input.textContent, caretPosition, clickedBtn.value);
          return;
      }
    });
  });
}


/**
 * --------------------
 * UI Helper Functions
 * --------------------
*/


/**
 * Initialize caret position at the start of the input
 * @param {HTMLElement} input - Input display element
*/
function initCaret(input) {
  const caretPosition = caretIndex(input);
  caretShowWithFocus(input, caretPosition);
}


/**
 * Initialize click behavior for input display
 * - Moves caret to clicked position
 * - Jumps to function token start if needed
 * @param {HTMLElement} input - Input display element
*/
function initInputClick(input){
  input.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const clickedRange = document.caretPositionFromPoint(e.clientX, e.clientY);
    const finalOffset = handleInputClick(input, clickedRange);
    caretShowWithFocus(input, finalOffset);
  });
}


/**
 * Initialize theme toggle buttons
 * - Updates state and persists theme to localStorage
 * @param {NodeListOf<HTMLElement>} buttons - Theme toggle buttons
*/
function initThemeToggle(buttons){
  buttons.forEach( btn => {
    btn.addEventListener('click', () => {
      setState('theme', btn.dataset.value);
      localStorage.setItem('theme', btn.dataset.value);
    })
  })
}


/**
 * Restore caret to its current position
 * @param {HTMLElement} input - Input display element
*/
export function restoreCaret(input) { 
  caretShowWithFocus(input, caretIndex(input)); 
}


/**
 * Update the input display
 * - Optionally shows a message
 * - Updates caret position
 * @param {HTMLElement} inputElm - Input element
 * @param {string} newInput - New input text
 * @param {number} newCaret - New caret position
 * @param {boolean} [showMsg=false] - Whether to show a message
*/
export function updateInput (inputElm, newInput, newCaret, showMsg = false) {
  if (showMsg) showMessage();
  inputElm.innerHTML = newInput;
  caretShowWithFocus(inputElm, newCaret);
}


/**
 * Handle invalid input scenario
 * - Displays message
 * - Restores caret
 * @param {HTMLElement} inputElm - Input element
 * @param {number} caretPosition - Caret position to restore
 * @param {string} message - Message to display
*/
export function handleInvalidInput(inputElm, caretPosition, message) {
  showMessage(message);
  caretShowWithFocus(inputElm, caretPosition);
}

function appendHistory(input){
    const result = input.innerHTML;
    console.log(result);
    const newElm = document.createElement('div');
    const itemExp = document.createElement('div');
    const itemResult = document.createElement('div');

    itemExp.innerHTML = state.lastExpression;
    itemResult.innerHTML = `= ${result}`;

    newElm.appendChild(itemExp);
    newElm.appendChild(itemResult);
    // newElm.innerHTML = `${state.lastExpression}   =   ${result}`;
    newElm.classList.add('history_item');
    itemExp.classList.add('history_item_exp');
    itemResult.classList.add('history_item_result');

    historyContainer.appendChild(newElm);
  }

  