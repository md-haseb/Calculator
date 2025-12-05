// main.js
// Entry point of the application

// Import the UI initialization function
import {init} from './ui/ui.js';

/**
 * When the DOM content is fully loaded, initialize the calculator UI.
 * This ensures all HTML elements are available before attaching events or manipulating the DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
  init();
});