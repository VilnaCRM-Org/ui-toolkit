import barrelExportNames from './utils/barrel-export-names';

// The parser behind both traceability guards (Story 5.1's board-coverage checklist
// and Story 5.2's provenance registry). It reads the public barrel as TEXT rather
// than importing it, because `mutation-runner-scope` pins that only two structural
// guards may import the barrel — see the helper's own comment.
//
// It is worth a suite of its own: every name it returns becomes a row the registry
// MUST carry, so a name it invents is a false failure a future author would "fix"
// by writing a bogus row, and a name it drops is a module that reaches the public
// surface unrecorded. Both directions are asserted here against fixtures rather
// than against the real barrel, which changes with every story.
describe('barrelExportNames', () => {
  it('takes the alias from a default re-export and a bare named export as itself', () => {
    const source: string = [
      "export { default as UiButton } from './ui-button';",
      "export { crmColorTheme, sharedPalette } from './ui-color-theme';",
    ].join('\n');

    expect(barrelExportNames(source)).toEqual(['UiButton', 'crmColorTheme', 'sharedPalette']);
  });

  // `export type { … }` erases at compile time: nothing is exported at runtime, so a
  // name from one of these blocks would be a registry row owed for a type.
  it('skips a whole type-only export block', () => {
    const source: string = [
      "export { default as UiButton } from './ui-button';",
      "export type { UiButtonProps, ButtonLinkTarget } from './ui-button/types';",
    ].join('\n');

    expect(barrelExportNames(source)).toEqual(['UiButton']);
  });

  // The same erasure, one syntax down: an INLINE `type` specifier inside an
  // otherwise-runtime block. The barrel uses only the block form today, so this is
  // the arm that keeps a later inline one from being counted (PR #126 review).
  it('skips an inline type specifier, aliased or not, and keeps its value siblings', () => {
    const source: string =
      "export { default as UiFoo, type UiFooProps, type Raw as Alias, bar } from './ui-foo';";

    expect(barrelExportNames(source)).toEqual(['UiFoo', 'bar']);
  });

  it('spans a multi-line block and de-duplicates a name exported twice', () => {
    const source: string = [
      'export {',
      '  crmBreakpointValues,',
      '  heightBreakpoints,',
      "} from './ui-breakpoints';",
      "export { heightBreakpoints } from './ui-breakpoints';",
    ].join('\n');

    expect(barrelExportNames(source)).toEqual(['crmBreakpointValues', 'heightBreakpoints']);
  });

  // A side-effect import carries no specifiers, and `export default` is not the
  // barrel's shape; neither should contribute a name.
  it('returns nothing for a source with no named export block', () => {
    const source: string = ["import './fonts.css';", 'export default 1;'].join('\n');

    expect(barrelExportNames(source)).toEqual([]);
  });
});
