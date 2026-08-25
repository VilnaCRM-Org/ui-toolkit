/**
 * Static scan of a CSF story module for `play` functions and story tags.
 *
 * Used by the unit-tier drift guard so a `play` function can never be added to a
 * story without being tagged `interaction` and registered in
 * `tests/storybook/interaction-stories.json`. The scan is deliberately static
 * (TypeScript AST, no module evaluation): importing story modules would drag the
 * whole component tree into the Jest run and make Stryker re-run this guard for
 * every mutant.
 */
import ts from 'typescript';

/** One exported story and the two facts the interaction gate cares about. */
export interface ScannedStory {
  exportName: string;
  hasPlay: boolean;
  tags: string[];
}

// Mirrors the stories glob in `.storybook/main.ts` (`*.stories.@(js|jsx|mjs|ts|tsx)`).
// Narrowing this to `.tsx` alone would let a CSF module in any other flavour carry a
// `play` function that the drift guard never sees.
const STORY_FILE = /\.stories\.(?:mjs|jsx?|tsx?)$/;

/** `true` when `fileName` is a CSF story module in any flavour Storybook loads. */
export function isStoryFile(fileName: string): boolean {
  return STORY_FILE.test(fileName);
}

/**
 * Parses a story module under the grammar its extension implies. Only a plain `.ts`
 * module gets the non-JSX grammar: read with TSX rules it would mis-parse a bare
 * generic (`<T>(v: T) => v`) as an unclosed JSX tag and swallow the rest of the
 * file, hiding its stories. Every other flavour tolerates the JSX-capable variant.
 */
function parse(fileName: string, source: string): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.TSX
  );
}

/** Strips the wrappers CSF authors put around a story object (`as`, `satisfies`). */
function unwrap(expression: ts.Expression): ts.Expression {
  let current: ts.Expression = expression;

  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function objectLiteralOf(
  initializer: ts.Expression | undefined
): ts.ObjectLiteralExpression | null {
  if (!initializer) {
    return null;
  }
  const unwrapped: ts.Expression = unwrap(initializer);

  return ts.isObjectLiteralExpression(unwrapped) ? unwrapped : null;
}

function propertyNamed(
  literal: ts.ObjectLiteralExpression,
  name: string
): ts.ObjectLiteralElementLike | undefined {
  return literal.properties.find(property => property.name?.getText() === name);
}

function stringLiteralsOf(property: ts.ObjectLiteralElementLike | undefined): string[] {
  if (!property || !ts.isPropertyAssignment(property)) {
    return [];
  }
  if (!ts.isArrayLiteralExpression(property.initializer)) {
    return [];
  }
  return property.initializer.elements.filter(ts.isStringLiteralLike).map(element => element.text);
}

function isExported(statement: ts.VariableStatement): boolean {
  return (
    statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) === true
  );
}

function scanStatement(statement: ts.Statement): ScannedStory[] {
  if (!ts.isVariableStatement(statement) || !isExported(statement)) {
    return [];
  }

  return statement.declarationList.declarations.flatMap(declaration => {
    const literal: ts.ObjectLiteralExpression | null = objectLiteralOf(declaration.initializer);
    if (!literal || !ts.isIdentifier(declaration.name)) {
      return [];
    }
    return [
      {
        exportName: declaration.name.text,
        hasPlay: propertyNamed(literal, 'play') !== undefined,
        tags: stringLiteralsOf(propertyNamed(literal, 'tags')),
      },
    ];
  });
}

/** Every exported CSF story object in `source`, with its `play`/`tags` facts. */
export function scanStories(fileName: string, source: string): ScannedStory[] {
  return parse(fileName, source).statements.flatMap(scanStatement);
}

function titleOf(literal: ts.ObjectLiteralExpression | null): string | null {
  const title: ts.ObjectLiteralElementLike | undefined = literal
    ? propertyNamed(literal, 'title')
    : undefined;

  if (!title || !ts.isPropertyAssignment(title) || !ts.isStringLiteralLike(title.initializer)) {
    return null;
  }

  return title.initializer.text;
}

/** The initializer of the top-level `const <name> = …` declaration, if any. */
function initializerOf(sourceFile: ts.SourceFile, name: string): ts.Expression | undefined {
  return sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => statement.declarationList.declarations)
    .find(declaration => ts.isIdentifier(declaration.name) && declaration.name.text === name)
    ?.initializer;
}

/**
 * The local name a `export { meta as default }` clause aliases, if the module uses
 * that form instead of `export default`. Re-exports (`export { x as default } from
 * './y'`) carry a module specifier and are skipped: their declaration is in another
 * file, so there is nothing to resolve here.
 */
function defaultAlias(sourceFile: ts.SourceFile): string | undefined {
  return sourceFile.statements
    .filter(ts.isExportDeclaration)
    .filter(declaration => declaration.moduleSpecifier === undefined)
    .flatMap(declaration =>
      declaration.exportClause && ts.isNamedExports(declaration.exportClause)
        ? [...declaration.exportClause.elements]
        : []
    )
    .find(element => element.name.text === 'default')?.propertyName?.text;
}

/**
 * The object Storybook receives as the module's default export, written inline
 * (`export default { title: … }`), named (`const meta = …; export default meta;`)
 * or aliased (`export { meta as default };`). A name is resolved back to ITS
 * declaration: reading the first titled object in the file instead would let an
 * unrelated helper object declared above `meta` supply the wrong title.
 */
function defaultExport(sourceFile: ts.SourceFile): ts.Expression | undefined {
  const assignment: ts.ExportAssignment | undefined = sourceFile.statements.find(
    ts.isExportAssignment
  );

  if (!assignment) {
    const alias: string | undefined = defaultAlias(sourceFile);

    return alias === undefined ? undefined : initializerOf(sourceFile, alias);
  }

  const exported: ts.Expression = unwrap(assignment.expression);

  return ts.isIdentifier(exported) ? initializerOf(sourceFile, exported.text) : exported;
}

/** The `title` of the CSF meta object (the default export), or `null` when absent. */
export function scanMetaTitle(fileName: string, source: string): string | null {
  return titleOf(objectLiteralOf(defaultExport(parse(fileName, source))));
}
