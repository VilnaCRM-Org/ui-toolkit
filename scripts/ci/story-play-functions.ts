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
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  return sourceFile.statements.flatMap(scanStatement);
}

function titleIn(literal: ts.ObjectLiteralExpression | null): string[] {
  const title: ts.ObjectLiteralElementLike | undefined = literal
    ? propertyNamed(literal, 'title')
    : undefined;

  if (!title || !ts.isPropertyAssignment(title) || !ts.isStringLiteralLike(title.initializer)) {
    return [];
  }

  return [title.initializer.text];
}

// `export default { title: … }` — the meta object is the default export itself.
function defaultExportTitle(statement: ts.Statement): string[] {
  return ts.isExportAssignment(statement) ? titleIn(objectLiteralOf(statement.expression)) : [];
}

// `const meta = { title: … }; export default meta;` — the common CSF shape. Any
// declared object carrying a string `title` is a meta candidate; the unit guard
// asserts every story file yields exactly one, so an ambiguous file fails loudly.
function declaredTitle(statement: ts.Statement): string[] {
  if (!ts.isVariableStatement(statement)) {
    return [];
  }

  return statement.declarationList.declarations.flatMap(declaration =>
    titleIn(objectLiteralOf(declaration.initializer))
  );
}

/** The `title` of the CSF meta object (the default export), or `null` when absent. */
export function scanMetaTitle(fileName: string, source: string): string | null {
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const exported: string[] = sourceFile.statements.flatMap(defaultExportTitle);

  if (exported.length > 0) {
    return exported[0];
  }

  return sourceFile.statements.flatMap(declaredTitle)[0] ?? null;
}
