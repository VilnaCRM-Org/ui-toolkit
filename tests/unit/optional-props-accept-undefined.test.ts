import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import ts from 'typescript';

// Consumers compiling with `exactOptionalPropertyTypes` (website does) cannot
// pass `T | undefined` into a prop declared `foo?: T` — under that flag the two
// are different types, even though passing `undefined` is what "optional" means
// at runtime (issue #153). Every optional member of an exported interface or
// type alias under src/components therefore spells `| undefined` explicitly, and
// this guard fails the build for the first one that does not, so the contract
// cannot regress one prop at a time.
//
// Scope is exported declarations only: an internal, MUI-facing shape (a
// `slotProps` object literal type, say) has to match MUI's own `foo?: T`
// signatures and is never seen by a consumer.

const COMPONENTS_ROOT: string = resolve(__dirname, '..', '..', 'src', 'components');
const SKIPPED_FILE: RegExp = /\.(test|stories)\.tsx?$/;

interface Offender {
  readonly file: string;
  readonly line: number;
  readonly member: string;
}

function listSourceFiles(dir: string, out: string[] = []): string[] {
  readdirSync(dir).forEach((entry: string) => {
    const path: string = join(dir, entry);
    if (statSync(path).isDirectory()) listSourceFiles(path, out);
    else if (/\.tsx?$/.test(path) && !SKIPPED_FILE.test(path)) out.push(path);
  });
  return out;
}

function mentionsUndefined(type: ts.TypeNode | undefined): boolean {
  if (!type) return false;
  if (type.kind === ts.SyntaxKind.UndefinedKeyword) return true;
  if (ts.isUnionTypeNode(type)) return type.types.some(mentionsUndefined);
  if (ts.isParenthesizedTypeNode(type)) return mentionsUndefined(type.type);
  return false;
}

// A declaration inside `declare module '…' { … }` is an augmentation and is
// public without an `export` keyword; everything else must be exported.
function isExportedDeclaration(node: ts.Node): boolean {
  if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node)) return false;
  const exported: boolean = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
  return exported || ts.isModuleBlock(node.parent);
}

function isStrictOptional(node: ts.Node): boolean {
  return (
    ts.isPropertySignature(node) &&
    node.questionToken !== undefined &&
    !mentionsUndefined(node.type)
  );
}

function collectOffenders(sourceFile: ts.SourceFile, out: Offender[]): number {
  let declarations: number = 0;
  const visit = (node: ts.Node, inExported: boolean): void => {
    const exported: boolean = inExported || isExportedDeclaration(node);
    if (exported && !inExported) declarations += 1;
    if (exported && isStrictOptional(node) && ts.isPropertySignature(node)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      out.push({
        file: relative(COMPONENTS_ROOT, sourceFile.fileName),
        line: line + 1,
        member: node.name.getText(sourceFile),
      });
    }
    ts.forEachChild(node, (child: ts.Node) => visit(child, exported));
  };
  visit(sourceFile, false);
  return declarations;
}

function scanComponents(): { readonly declarations: number; readonly offenders: Offender[] } {
  const offenders: Offender[] = [];
  let declarations: number = 0;
  listSourceFiles(COMPONENTS_ROOT).forEach((file: string) => {
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );
    declarations += collectOffenders(sourceFile, offenders);
  });
  return { declarations, offenders };
}

function describeOffender(offender: Offender): string {
  return `${offender.file}:${offender.line} \`${offender.member}?\` lacks \`| undefined\``;
}

describe('optional props on exported component types accept undefined (#153)', () => {
  const scan = scanComponents();

  it('scans a non-trivial number of exported declarations (guard is not vacuous)', () => {
    expect(scan.declarations).toBeGreaterThan(50);
  });

  it('spells `| undefined` on every optional member of an exported type', () => {
    expect(scan.offenders.map(describeOffender)).toEqual([]);
  });

  // The matcher itself has to see through the type forms the codebase uses;
  // a matcher that only understood a bare `undefined` keyword would silently
  // accept parenthesised function types and nested unions.
  it.each([
    ['foo?: string', 1],
    ['foo?: string | undefined', 0],
    ['foo?: (string | null) | undefined', 0],
    ['foo?: ((v: string) => void) | undefined', 0],
    ['foo?: (v: string) => void', 1],
    ['foo?: (v: string) => void | undefined', 1],
  ])('classifies `%s` as %i offender(s)', (member: string, expected: number) => {
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      'probe.ts',
      `export interface Probe { ${member}; }`,
      ts.ScriptTarget.Latest,
      true
    );
    const offenders: Offender[] = [];
    collectOffenders(sourceFile, offenders);
    expect(offenders).toHaveLength(expected);
  });

  it('ignores optional members of non-exported types', () => {
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      'probe.ts',
      'interface Internal { foo?: string; }\ntype Local = { bar?: number };',
      ts.ScriptTarget.Latest,
      true
    );
    const offenders: Offender[] = [];
    expect(collectOffenders(sourceFile, offenders)).toBe(0);
    expect(offenders).toEqual([]);
  });
});
