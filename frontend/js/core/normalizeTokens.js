


function splitSuperscriptRootTokens(tokens, superscriptChars) {
  const result = [];
  const supRegex = new RegExp(`^[${superscriptChars}]+√$`);

  for (const token of tokens) {
    if (typeof token === 'string' && supRegex.test(token)) {
      const supPart = token.slice(0, -1); // remove √
      result.push(supPart, '√');
    } else {
      result.push(token);
    }
  }
  return result;
}


export function normalizeTokens(tokens) {
  const result = [];

  for (const token of tokens) {
    if (token.type !== 'nthRoot') {
      result.push(token);
      continue;
    }

    const { raw, start } = token;

    // 1️⃣ extract superscripts (everything except √)
    const superscript = raw.replace('√', '');

    if (superscript.length > 0) {
      result.push({
        type: 'superscriptValue',
        value: superscript,
        start: start,
        end: start + superscript.length
      });
    }

    // 2️⃣ root symbol
    result.push({
      type: 'singleRoot',
      value: '√',
      start: start + superscript.length,
      end: start + raw.length
    });
  }
  return result;
}
