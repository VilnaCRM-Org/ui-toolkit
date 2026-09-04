/**
 * The runtime export names of the public barrel, read from its SOURCE TEXT.
 *
 * The barrel is deliberately never imported by a structural guard that only
 * needs the names. `tests/unit/mutation-runner-scope.test.ts` pins a hard
 * invariant that only the two suites listed there may import it: a barrel import
 * makes every suite "related" to every mutant, which is what blew the mutation
 * run out to ~2h before #141/#142.
 *
 * Shared by `board-coverage-traceability` (Story 5.1) and
 * `component-provenance-traceability` (Story 5.2), which would otherwise carry
 * the same parser twice.
 */
export default function barrelExportNames(barrelSource: string): string[] {
  const names: string[] = [];
  for (const block of barrelSource.matchAll(/^export\s+(type\s+)?\{([^}]*)\}/gm)) {
    // `export type { … }` erases at compile time — not a runtime export.
    if (block[1] !== undefined) {
      continue;
    }
    for (const specifier of (block[2] ?? '').split(',')) {
      // `default as UiButton` exports the name after `as`; a bare `sharedPalette`
      // exports itself.
      const name: string =
        specifier
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim() ?? '';
      if (name.length > 0 && name !== 'default') {
        names.push(name);
      }
    }
  }
  return [...new Set(names)];
}
