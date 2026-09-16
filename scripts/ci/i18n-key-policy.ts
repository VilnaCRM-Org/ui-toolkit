import ts from 'typescript';

export interface KeyReference {
  file: string;
  line: number;
  key: string;
}

export type TranslationTree = { [key: string]: string | TranslationTree };

const TRANSLATE_FUNCTION = 't';
const TRANS_KEY_ATTRIBUTE = 'i18nKey';
const DEFAULT_VALUE_OPTION = 'defaultValue';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function leafKeys(tree: unknown, prefix: string = ''): string[] {
  if (!isRecord(tree)) return [];
  return Object.entries(tree).flatMap(([key, value]): string[] => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : leafKeys(value, path);
  });
}

function literalText(node: ts.Node | undefined): string | null {
  if (node === undefined) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function isTranslateCallee(callee: ts.Expression): boolean {
  if (ts.isIdentifier(callee)) return callee.text === TRANSLATE_FUNCTION;
  return ts.isPropertyAccessExpression(callee) && callee.name.text === TRANSLATE_FUNCTION;
}

function isDefaultValueName(name: ts.PropertyName): boolean {
  if (ts.isComputedPropertyName(name)) {
    return literalText(name.expression) === DEFAULT_VALUE_OPTION;
  }
  return (
    literalText(name) === DEFAULT_VALUE_OPTION ||
    (ts.isIdentifier(name) && name.text === DEFAULT_VALUE_OPTION)
  );
}

function carriesDefaultValue(options: ts.Expression | undefined): boolean {
  if (options === undefined || !ts.isObjectLiteralExpression(options)) return false;
  return options.properties.some(
    property =>
      (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
      isDefaultValueName(property.name)
  );
}

function keyFromCall(node: ts.CallExpression): string | null {
  if (!isTranslateCallee(node.expression)) return null;
  if (carriesDefaultValue(node.arguments[1])) return null;
  return literalText(node.arguments[0]);
}

function keyFromAttribute(node: ts.JsxAttribute): string | null {
  if (!ts.isIdentifier(node.name) || node.name.text !== TRANS_KEY_ATTRIBUTE) return null;
  const { initializer } = node;
  if (initializer === undefined) return null;
  return ts.isJsxExpression(initializer)
    ? literalText(initializer.expression)
    : literalText(initializer);
}

function keyFromNode(node: ts.Node): string | null {
  if (ts.isCallExpression(node)) return keyFromCall(node);
  if (ts.isJsxAttribute(node)) return keyFromAttribute(node);
  return null;
}

export function findKeyReferences(file: string, source: string): KeyReference[] {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const references: KeyReference[] = [];

  const visit = (node: ts.Node): void => {
    const key = keyFromNode(node);
    if (key !== null) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      references.push({ file, line: line + 1, key });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return references;
}

export function findMissingKeys(
  references: readonly KeyReference[],
  knownKeys: ReadonlySet<string>
): KeyReference[] {
  return references.filter(reference => !knownKeys.has(reference.key));
}

export function formatReport(missing: readonly KeyReference[]): string {
  return missing
    .map(reference => `  ${reference.file}:${reference.line}: "${reference.key}"`)
    .join('\n');
}
