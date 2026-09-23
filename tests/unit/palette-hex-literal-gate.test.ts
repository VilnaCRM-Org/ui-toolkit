import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  componentSourceFiles,
  findPaletteHexLiterals,
  normalizeHex,
  paletteHexLiteralsInSource,
  paletteTokensByHex,
  type PaletteHexLiteral,
} from '../../scripts/ci/palette-hex-literals';
import { sharedPalette } from '../../src/components/ui-color-theme';

const projectRoot: string = path.resolve(__dirname, '../..');

function tokens(hits: PaletteHexLiteral[]): string[] {
  return hits.map(hit => `${hit.line}:${hit.literal}:${hit.token}`);
}

describe('palette hex literal gate', () => {
  it('finds no sharedPalette colour spelled as a raw hex literal in component source', () => {
    expect(findPaletteHexLiterals(projectRoot)).toEqual([]);
  });

  it('indexes every sharedPalette token by its normalised hex', () => {
    Object.values(sharedPalette).forEach(colour => {
      const hex: string = normalizeHex(colour.main) as string;
      const token = paletteTokensByHex.get(hex) as keyof typeof sharedPalette;

      expect(normalizeHex(sharedPalette[token].main)).toBe(hex);
    });
  });

  it('normalises short, long and mixed-case spellings to one key', () => {
    expect(normalizeHex('#FFF')).toBe('#ffffff');
    expect(normalizeHex('#FfFfFf')).toBe('#ffffff');
    expect(normalizeHex('#1EAEFF')).toBe('#1eaeff');
    expect(normalizeHex('#1EAEFF80')).toBeNull();
    expect(normalizeHex('#FFFA')).toBeNull();
  });

  it('flags palette colours in strings, templates and JSX attributes', () => {
    const source: string = [
      "export const a = { color: '#1EAEFF' };",
      "export const b = { border: '1px solid #d0d4d8' };",
      'export const c = `0 0 0 2px #FBFBFB`;',
      'export const d = (x: string) => `${x} #fff ${x} #DC3939`;',
      'export const e = <svg fill="#969B9D" />;',
    ].join('\n');

    expect(tokens(paletteHexLiteralsInSource('probe.tsx', source))).toEqual([
      '1:#1EAEFF:primary',
      '2:#d0d4d8:grey400',
      '3:#FBFBFB:backgroundGrey100',
      '4:#fff:white',
      '4:#DC3939:error',
      '5:#969B9D:grey300',
    ]);
  });

  it('ignores comments, off-palette colours and alpha hexes', () => {
    const source: string = [
      '// #1EAEFF in a line comment',
      '/* #D0D4D8 in a block comment */',
      "export const a = { color: '#484848' };",
      "export const b = { color: '#1EAEFF80' };",
      "export const c = { label: 'issue #1234' };",
    ].join('\n');

    expect(paletteHexLiteralsInSource('probe.ts', source)).toEqual([]);
  });

  it('scans nested sources but skips stories, declarations and the palette module', () => {
    const root: string = fs.mkdtempSync(path.join(os.tmpdir(), 'palette-hex-'));
    const write = (relative: string): void => {
      const file: string = path.join(root, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, "export const x = '#1EAEFF';\n");
    };
    ['ui-a/styles.ts', 'ui-a/nested/index.tsx', 'ui-a/a.stories.tsx', 'ui-a/types.d.ts'].forEach(
      write
    );
    write('ui-color-theme/index.ts');
    write('ui-a/readme.md');

    expect(
      componentSourceFiles(root)
        .map(file => path.relative(root, file))
        .sort()
    ).toEqual(['ui-a/nested/index.tsx', 'ui-a/styles.ts']);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
