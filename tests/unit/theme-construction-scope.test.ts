import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import ts from 'typescript';

import { defaultUiTheme, createUiTheme } from '../../src/utils/ui-theme';

const REPO_ROOT: string = resolve(__dirname, '../..');
const SRC_DIR: string = join(REPO_ROOT, 'src');
const THEME_FACTORIES: ReadonlySet<string> = new Set([
  'createTheme',
  'createUiTheme',
  'defaultUiTheme',
]);
const THEME_ENTRY_MODULES: ReadonlySet<string> = new Set([
  'src/components/ui-breakpoints/index.ts',
  'src/components/ui-color-theme/index.ts',
  'src/components/ui-theme-provider/index.tsx',
]);
const THEME_MODULE_IMPORT: RegExp = /(?:^|\/)(?:ui-breakpoints|ui-color-theme|ui-theme-provider)$/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full: string = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) && !/\.(stories|d)\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

function unwrap(expression: ts.Expression): ts.Expression {
  return ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)
    ? unwrap(expression.expression)
    : expression;
}

function isThemeFactoryCall(expression: ts.Expression | undefined): boolean {
  if (expression === undefined) {
    return false;
  }
  const call: ts.Expression = unwrap(expression);
  return (
    ts.isCallExpression(call) &&
    ts.isIdentifier(call.expression) &&
    THEME_FACTORIES.has(call.expression.text)
  );
}

function moduleScopeThemeCalls(source: ts.SourceFile): string[] {
  return source.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => statement.declarationList.declarations)
    .filter(declaration => isThemeFactoryCall(declaration.initializer))
    .map(declaration => declaration.name.getText(source));
}

function themeModuleImports(source: ts.SourceFile): string[] {
  return source.statements
    .filter(ts.isImportDeclaration)
    .filter(statement => !statement.importClause?.isTypeOnly)
    .map(statement => (statement.moduleSpecifier as ts.StringLiteral).text)
    .filter(specifier => THEME_MODULE_IMPORT.test(specifier));
}

const files: string[] = sourceFiles(SRC_DIR).map(file => relative(REPO_ROOT, file));

describe('theme construction scope', () => {
  it('scans the source tree', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('builds themes at module scope only in the theme entry modules', () => {
    const offenders: string[] = files
      .filter(file => !THEME_ENTRY_MODULES.has(file))
      .flatMap(file =>
        moduleScopeThemeCalls(parse(join(REPO_ROOT, file))).map(name => `${file}: ${name}`)
      );
    expect(offenders).toEqual([]);
  });

  it('finds the module-scope themes the entry modules do build', () => {
    const built: string[] = [...THEME_ENTRY_MODULES].flatMap(file =>
      moduleScopeThemeCalls(parse(join(REPO_ROOT, file)))
    );
    expect(built.sort()).toEqual([
      'crmBreakpointsTheme',
      'crmColorTheme',
      'uiTheme',
      'websiteBreakpointsTheme',
      'websiteColorTheme',
    ]);
  });

  it('keeps component styles off the theme entry modules', () => {
    const offenders: string[] = files
      .filter(file => file !== 'src/components/index.ts' && !THEME_ENTRY_MODULES.has(file))
      .flatMap(file =>
        themeModuleImports(parse(join(REPO_ROOT, file))).map(specifier => `${file}: ${specifier}`)
      );
    expect(offenders).toEqual([]);
  });

  it('builds the fallback UI theme once, on first use', () => {
    expect(defaultUiTheme()).toBe(defaultUiTheme());
    expect(defaultUiTheme()).not.toBe(createUiTheme());
  });
});
