// Re-implements the browser's `accept` matching so drag-and-drop is held to the
// same rule as the OS picker: the attribute filters the picker dialog only, and
// a dropped file never passes through it. Supports the three token forms the
// HTML spec allows — `.ext`, `type/subtype` and `type/*` — matched
// case-insensitively.

function tokensOf(accept: string): string[] {
  return accept
    .split(',')
    .map(token => token.trim().toLowerCase())
    .filter(token => token !== '');
}

function matchesExtension(token: string, file: File): boolean {
  return file.name.toLowerCase().endsWith(token);
}

function matchesWildcard(token: string, file: File): boolean {
  return file.type.toLowerCase().startsWith(token.slice(0, -1));
}

function matchesToken(token: string, file: File): boolean {
  if (token.startsWith('.')) {
    return matchesExtension(token, file);
  }
  if (token.endsWith('/*')) {
    return matchesWildcard(token, file);
  }
  return file.type.toLowerCase() === token;
}

/**
 * True when `file` satisfies the `accept` list. An empty or absent list accepts
 * everything, mirroring an `<input type="file">` with no `accept` attribute.
 */
export function matchesAccept(file: File, accept: string): boolean {
  const tokens: string[] = tokensOf(accept);
  if (tokens.length === 0) {
    return true;
  }
  return tokens.some(token => matchesToken(token, file));
}
