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

function objectLiteralOf(declaration: ts.VariableDeclaration): ts.ObjectLiteralExpression | null {
  const initializer: ts.Expression | undefined = declaration.initializer;
  return initializer && ts.isObjectLiteralExpression(initializer) ? initializer : null;
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
    const literal: ts.ObjectLiteralExpression | null = objectLiteralOf(declaration);
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

function titleOf(statement: ts.Statement): string[] {
  if (!ts.isVariableStatement(statement)) {
    return [];
  }

  return statement.declarationList.declarations.flatMap(declaration => {
    const literal: ts.ObjectLiteralExpression | null = objectLiteralOf(declaration);
    const title: ts.ObjectLiteralElementLike | undefined = literal
      ? propertyNamed(literal, 'title')
      : undefined;

    if (!title || !ts.isPropertyAssignment(title) || !ts.isStringLiteralLike(title.initializer)) {
      return [];
    }
    return [title.initializer.text];
  });
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

  return sourceFile.statements.flatMap(titleOf)[0] ?? null;
}
