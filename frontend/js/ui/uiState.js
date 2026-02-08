import { input, state, angleToggleContainer, themeToggleContainer, restoreCaret } from './ui.js';

/* ----------------------------
   State Management Functions
   ---------------------------- 
*/

/**
 * Update a property in the global UI state and trigger a re-render.
 * - Example: changing angle mode ('deg' | 'rad') or theme ('dark' | 'light')
 *
 * @param {string} statePropertyKey - Key of the state object to update (e.g., 'angle', 'theme')
 * @param {string} statePropertyValue - New value for the state property
*/
export function setState(statePropertyKey, statePropertyValue) {
    state[statePropertyKey] = statePropertyValue;
    console.log(state[statePropertyKey]);
    render();
}

/* ----------------------------
   UI Rendering Functions
   ---------------------------- 
*/

/**
 * Update the UI for a toggle group (angle or theme) to reflect the current state.
 * - Adds 'active_toggle_btn' class to the active button
 *
 * @param {HTMLElement} toggleContainer - Parent element containing toggle buttons
 * @param {string} statePropertyValue - Current value from state to match with buttons
*/
function renderToggle(toggleContainer, statePropertyValue) {
  const buttons = toggleContainer.querySelectorAll('.js-toggle-btn');

  buttons.forEach( btn => {
    btn.classList.toggle('active_toggle_btn', statePropertyValue === btn.dataset.value);
  })
}

/**
 * Main render function for the calculator UI.
 * - Keeps the UI in sync with the global state
 * - Updates toggle button states and theme
 * - Restores caret position to maintain user input continuity
*/
export function render() {
  renderToggle(angleToggleContainer, state.angle);
  renderToggle(themeToggleContainer, state.theme);
  applyTheme(state.theme);
  restoreCaret(input); // ensures caret is always synced after state change
}


/**
 * Apply the selected theme to the document body.
 * - Toggles 'dark_theme' class based on current theme
 *
 * @param {string} theme - 'dark' or 'light'
*/
export function applyTheme(theme){
  document.body.classList.toggle('dark_theme', theme === 'dark');
}


/* ----------------------------
   State Query Functions
   ---------------------------- 
*/

/**
 * Get the current angle mode from the global state
 * @returns {string} - 'deg' or 'rad'
 */
export function getMode(){
  // return DegRadMode;
  return state.angle;
}
