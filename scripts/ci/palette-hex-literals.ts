import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { sharedPalette } from '../../src/components/ui-color-theme';

export interface PaletteHexLiteral {
  file: string;
  line: number;
  literal: string;
  token: string;
}

const HEX_PATTERN: RegExp = /#[0-9a-f]{3,8}\b/gi;
const PALETTE_MODULE_DIR: string = 'ui-color-theme';

export function normalizeHex(hex: string): string | null {
  const digits: string = hex.slice(1).toLowerCase();
  if (digits.length === 3) {
    return `#${[...digits].map(digit => digit + digit).join('')}`;
  }
  return digits.length === 6 ? `#${digits}` : null;
}

export const paletteTokensByHex: ReadonlyMap<string, string> = new Map(
  Object.entries(sharedPalette).map(([token, colour]) => [
    normalizeHex(colour.main) as string,
    token,
  ])
);

function isLiteralNode(node: ts.Node): node is ts.LiteralLikeNode {
  return ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node);
}

function literalNodes(sourceFile: ts.SourceFile): ts.LiteralLikeNode[] {
  const found: ts.LiteralLikeNode[] = [];
  const visit = (node: ts.Node): void => {
    if (isLiteralNode(node)) {
      found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

export function paletteHexLiteralsInSource(file: string, source: string): PaletteHexLiteral[] {
  const kind: ts.ScriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  return literalNodes(sourceFile).flatMap(node =>
    [...node.text.matchAll(HEX_PATTERN)].flatMap(match => {
      const token: string | undefined = paletteTokensByHex.get(normalizeHex(match[0]) ?? '');
      if (token === undefined) {
        return [];
      }
      const line: number = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      return [{ file, line, literal: match[0], token }];
    })
  );
}

function isScannedSource(name: string): boolean {
  return /\.tsx?$/.test(name) && !/\.(stories|d)\.tsx?$/.test(name);
}

export function componentSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full: string = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === PALETTE_MODULE_DIR ? [] : componentSourceFiles(full);
    }
    return isScannedSource(entry.name) ? [full] : [];
  });
}

export function findPaletteHexLiterals(projectRoot: string): PaletteHexLiteral[] {
  return componentSourceFiles(path.join(projectRoot, 'src/components')).flatMap(file =>
    paletteHexLiteralsInSource(path.relative(projectRoot, file), fs.readFileSync(file, 'utf8'))
  );
}
