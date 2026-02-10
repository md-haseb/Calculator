/**
 * ======================
 * History Module
 * ======================
 * Responsible for:
 * - Persisting calculation history to localStorage
 * - Rendering history items in the UI
 * - Managing history-related UI state (e.g., remove button visibility)
 *
 * This module does not own DOM selection.
 * Required DOM elements are injected as arguments for better reusability
 * and testability.
 */


/**
 * Retrieve calculation history from localStorage.
 *
 * @returns {Array<{expression: string, result: string}>}
 */
function getHistory() {
  return JSON.parse(localStorage.getItem('history')) || [];
}


/**
 * Persist calculation history to localStorage.
 *
 * @param {Array<{expression: string, result: string}>} data
 */
function saveHistory(data) {
  localStorage.setItem('history', JSON.stringify(data));
}


/**
 * Create a standardized history entry object.
 *
 * @param {string} expHTML - HTML representation of the expression
 * @param {string} resHTML - HTML representation of the result
 * @returns {{expression: string, result: string}}
 */
function historyObj (expHTML, resHTML) {
  return { expression: expHTML, result: resHTML };
}


/**
 * Render all history entries inside the provided container.
 *
 * @param {Array<{expression: string, result: string}>} items
 * @param {HTMLElement} historyContainer - Target container element
 */
function renderHistory(items, historyContainer) {
  // Clear existing history items
  historyContainer.replaceChildren();

  items.forEach(({ expression, result }) => {
    const item = document.createElement('div');
    const exp = document.createElement('div');
    const res = document.createElement('div');

    // Preserve formatted HTML (e.g., superscript/subscript)
    exp.innerHTML = expression;
    res.innerHTML = `= ${result}`;

    // Apply styling hooks
    item.classList.add('js-history-item');
    exp.classList.add('js-history-item-exp');
    res.classList.add('js-history-item-result');

    item.append(exp, res);
    historyContainer.appendChild(item);

    // Ensure latest entry is visible
    historyContainer.scrollTop = historyContainer.scrollHeight;
  });
}


/**
 * Append a new history entry and update the UI accordingly.
 * 
 * - Prevents saving empty expressions or results
 * - Avoids adding duplicate consecutive history entries
 * - Reads existing history, Adds a new entry if valid
 * - Persists updated history
 * - Updates remove button visibility
 * - Re-renders history list
 *
 * @param {HTMLElement} input - Input display element
 * @param {string} lastExpHTML - Expression before evaluation
 * @param {HTMLElement} historyContainer - History list container
 * @param {HTMLElement} historyRemoveBtn - Remove history button
 */
export function appendHistory(input, lastExpHTML, historyContainer, historyRemoveBtn) {
  const expression = lastExpHTML;
  const result = input.innerHTML;
  const currentHistory = getHistory();

  if (!expression || !result) {
    updateRemoveBtn(currentHistory.length, historyRemoveBtn);
    renderHistory(currentHistory, historyContainer);
    return;
  }

  const historyLastItem = currentHistory[currentHistory.length - 1];

  if (historyLastItem && 
    historyLastItem.expression === expression && 
    historyLastItem.result === result
  ) {
    return;
  }
  currentHistory.push(historyObj(expression, result));
  saveHistory(currentHistory);

  updateRemoveBtn(currentHistory.length, historyRemoveBtn);
  renderHistory(currentHistory, historyContainer);
}


/**
 * Clear all history data and reset related UI state.
 *
 * @param {HTMLElement} historyContainer - History list container
 * @param {HTMLElement} historyRemoveBtn - Remove history button
 */
export function handleRemoveHistory(historyContainer, historyRemoveBtn){
  localStorage.removeItem('history');
  historyContainer.replaceChildren();
  const currentHistory = getHistory();
  updateRemoveBtn(currentHistory.length, historyRemoveBtn);
}


/**
 * Toggle visibility of the history remove button
 * based on the number of stored history entries.
 *
 * @param {number} historyLength
 * @param {HTMLElement} historyRemoveBtn
 */
function updateRemoveBtn(historyLength, historyRemoveBtn) {
  if (historyLength > 0) {
    historyRemoveBtn.classList.remove('js-history-remove-btn');
  } else {
    historyRemoveBtn.classList.add('js-history-remove-btn');
  }
}