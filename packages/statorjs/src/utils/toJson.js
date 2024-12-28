export function toJson(jsonLikeData) {
  if (!(jsonLikeData.startsWith('{') && jsonLikeData.endsWith('}'))) {
    throw new Error('E001: Input must start and end with curly braces.');
  }

  // Clean the input to remove outer braces
  const content = jsonLikeData.slice(1, -1).trim();

  // Split on top-level commas (ignoring commas within nested structures or quotes)
  const items = [];
  let current = '';
  let inQuotes = false;
  let nestedBraces = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    }

    if (!inQuotes) {
      if (char === '{') nestedBraces++;
      if (char === '}') nestedBraces--;

      if (char === ',' && nestedBraces === 0) {
        items.push(current.trim());
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current) {
    items.push(current.trim());
  }

  // Parse key-value pairs
  const jsonObj = {};
  const keyValueRegex = /^\s*(['"]?)([\w$]+)\1\s*:\s*(.+)$/;

  items.forEach(item => {
    const match = item.match(keyValueRegex);
    if (!match) {
      throw new Error(`E002: Invalid key-value pair format: "${item}"`);
    }

    const key = match[2];
    let value = match[3].trim();

    // Parse value: handle numbers, booleans, null, or quoted strings
    if (/^["'].*["']$/.test(value)) {
      value = value.slice(1, -1); // Remove quotes
    } else if (/^\d+(\.\d+)?$/.test(value)) {
      value = parseFloat(value); // Convert numeric strings to numbers
    } else if (/^(true|false)$/.test(value)) {
      value = value === 'true'; // Convert "true"/"false" to boolean
    } else if (value === 'null') {
      value = null; // Convert "null" to null
    } else {
      throw new Error(`E003: Unsupported value format: "${value}"`);
    }

    jsonObj[key] = value;
  });

  return jsonObj;
}
