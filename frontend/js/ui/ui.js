import {validateForDisplay, validateForEvaluation} from '../core/validation.js';
import {classifyButton} from '../core/classifyBtn.js';
import {insertValue, replaceOperator} from '../editor/insertion.js';
import {caretShowWithFocus, caretIndex} from '../editor/caretHandler.js';
import {handleAC, handleDelete, handleEqual, handleFunctions, handleInputClick, handleLeftArrow, handleRightArrow} from "../editor/inputController.js";

/**
 * DOM elements
 */
export const input = document.querySelector(".input_display");
const buttons = document.querySelectorAll(".btn");
const messageDiv = document.querySelector(".message_display");

const angleToggleContainer = document.querySelector(".radDegToggle");
const themeToggleContainer = document.querySelector(".theme_toggle");
const themeToggleButtons = document.querySelectorAll(".theme_toggle_btn");

const simpleHandlers = {
  ac: handleAC,
  delete: (inputText, caretPosition) => handleDelete(inputText, caretPosition),
  leftArrow: (inputText, caretPosition) => handleLeftArrow(inputText, caretPosition),
  rightArrow: (inputText, caretPosition) => handleRightArrow(inputText, caretPosition),
  function: (inputText, caretPosition, btnValue) => handleFunctions(btnValue, inputText, caretPosition),
};

/**
 * Current angle mode: 'deg' or 'rad'
 * Current theme : 'dark' or 'light'
 */
// let DegRadMode = 'deg';
const state = {
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
 * - Sets caret position
 * - Adds event listeners for clicks on input and buttons
 */
export function init() {
  // Set initial caret focus
  initCaret(input);

  // applies initial theme,active button & persist the theme
  render();

  /**
   * Handle mouse clicks on input display
   * - Moves caret according to click position
   * - For functions, caret jumps to the beginning of the function token
   */
  initInputClick(input);

  /**
   * Handle theme toggle button clicks
   */
  initThemeToggle(themeToggleButtons);

  /**
   * Handle button clicks
   */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const clickedBtn = classifyButton(btn);
      const caretPosition = caretIndex(input);

      switch (clickedBtn.type) {
        case "radian":
        case "degree":
          setState("angle", clickedBtn.value);
          executeEqual(input, state.lastExpression, caretPosition, clickedBtn.value);
          return;

        case "equal":
          setState("lastExpression", input.textContent);
          executeEqual(input, input.textContent, caretPosition, clickedBtn.value);
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

//helpers

function executeEqual(input, inputText, caretPosition, btnValue){
  console.log(inputText);
  const validated = validateForEvaluation(
    inputText,
    btnValue
  );

  if (validated.allowed) {
    const modifiedInputText = changeMultiplySign(inputText);
    console.log(modifiedInputText);
    const { newInput, newCaret, showMsg } = handleEqual(
      modifiedInputText
    );
    updateInput(input, newInput, newCaret, showMsg);
    return;
  }
  // ----------------------------
  // Fallback for invalid input
  // ----------------------------
  handleInvalidInput(input, caretPosition, validated.message);
  return; 
}

/**
 * Helper: Replace '×' with '*' for calculation
 * @returns {string} Modified input text
 */
function changeMultiplySign(inputText){
  return inputText.replaceAll('×', '*');
}

/**
 * Attaches a click listener to a toggle container
 * and updates a specific property of the global state
 * (e.g. 'angle' → 'deg' | 'rad', 'theme' → 'dark' | 'light')
 *
 * @param {HTMLElement} toggleContainer - Parent element that contains toggle buttons
 * @param {string} statePropertyKey - Key of the state object to update
 */
function setState(statePropertyKey, statePropertyValue) {
    state[statePropertyKey] = statePropertyValue;
    console.log(state[statePropertyKey]);
    render();
}

/**
 * Updates the UI of a toggle group based on current state
 * Adds 'active_toggle_btn' class to the active button
 *
 * @param {HTMLElement} toggleContainer - Parent element of toggle buttons
 * @param {string} statePropertyValue - Current value from state
 */
function renderToggle(toggleContainer, statePropertyValue) {
  const buttons = toggleContainer.querySelectorAll('.toggleBtn');

  buttons.forEach( btn => {
    btn.classList.toggle('active_toggle_btn', statePropertyValue === btn.dataset.value);
  })
}

/**
 * Main render function
 * Keeps the UI in sync with the state object
 * Should be called after any state change
 */
function render() {
  renderToggle(angleToggleContainer, state.angle);
  renderToggle(themeToggleContainer, state.theme);
  applyTheme(state.theme);
  restoreCaret(input); // ensures caret is always synced after state change
}

/**
 * Get current angle mode
 * @returns {string} 'deg' or 'rad'
 */
export function getMode(){
  // return DegRadMode;
  return state.angle;
}

export function applyTheme(theme){
  document.body.classList.toggle('dark_theme', theme === 'dark');
}





function initCaret(input) {
  const caretPosition = caretIndex(input);
  caretShowWithFocus(input, caretPosition);
}

function initInputClick(input){
  input.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const clickedRange = document.caretPositionFromPoint(e.clientX, e.clientY);
    const finalOffset = handleInputClick(input, clickedRange);
    caretShowWithFocus(input, finalOffset);
  });
}

function initThemeToggle(buttons){
  buttons.forEach( btn => {
    btn.addEventListener('click', () => {
      setState('theme', btn.dataset.value);
      localStorage.setItem('theme', btn.dataset.value);
    })
  })
}

function restoreCaret(input) { 
  caretShowWithFocus(input, caretIndex(input)); 
}

function updateInput (inputElm, newInput, newCaret, showMsg = false) {
  if (showMsg) showMessage();
  inputElm.innerHTML = newInput;
  caretShowWithFocus(inputElm, newCaret);
}

function handleInvalidInput(inputElm, caretPosition, message) {
  showMessage(message);
  caretShowWithFocus(inputElm, caretPosition);
}



  // ----------------------------
  // Default button handler
  // ----------------------------
  function handleDefaultButton(input, inputText, caretPosition, btnValue) {
    const validated = validateForDisplay(inputText, btnValue);

    if (validated.allowed) {
      const { newInput, newCaret } = insertValue(
        inputText,
        caretPosition,
        btnValue
      );
      updateInput(input, newInput, newCaret);
      return;
    }

    if (validated.action === "replace") {
      const { newInput, newCaret } = replaceOperator(
        inputText,
        caretPosition,
        btnValue
      );
      updateInput(input, newInput, newCaret);
      return;
    }

    handleInvalidInput(input, caretPosition, validated.message);
    return;
  }