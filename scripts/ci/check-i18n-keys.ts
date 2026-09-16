import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import {
  findKeyReferences,
  findMissingKeys,
  formatReport,
  leafKeys,
  type KeyReference,
  type TranslationTree,
} from './i18n-key-policy';

const PROJECT_ROOT = resolve(process.cwd());
const SOURCE_ROOT = resolve(PROJECT_ROOT, 'src');
const RESOURCES_PATH = resolve(PROJECT_ROOT, 'i18n', 'localization.json');
const REFERENCE_LOCALE = 'en';
const NAMESPACE = 'translation';

const SOURCE_FILE = /\.tsx?$/;
const EXCLUDED_SOURCE_FILE = /\.(stories\.tsx|d\.ts)$/;

function fail(code: 1 | 2, message: string): never {
  console.error(message);
  process.exit(code);
}

function referenceLocaleTree(): TranslationTree {
  let resources: unknown;
  try {
    resources = JSON.parse(readFileSync(RESOURCES_PATH, 'utf8'));
  } catch (error) {
    return fail(2, `Failed to read or parse ${RESOURCES_PATH}: ${String(error)}`);
  }
  const locale =
    typeof resources === 'object' && resources !== null
      ? (resources as Record<string, unknown>)[REFERENCE_LOCALE]
      : undefined;
  const tree =
    typeof locale === 'object' && locale !== null
      ? (locale as Record<string, unknown>)[NAMESPACE]
      : undefined;
  if (typeof tree !== 'object' || tree === null) {
    return fail(2, `${RESOURCES_PATH} has no "${REFERENCE_LOCALE}.${NAMESPACE}" object`);
  }
  return tree as TranslationTree;
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry): string[] => {
    const absolute = join(directory, entry);
    const stats = lstatSync(absolute);
    if (stats.isSymbolicLink()) return [];
    if (stats.isDirectory()) return sourceFiles(absolute);
    if (!SOURCE_FILE.test(entry) || EXCLUDED_SOURCE_FILE.test(entry)) return [];
    return [absolute];
  });
}

function displayPath(file: string): string {
  return relative(PROJECT_ROOT, file).split(sep).join('/');
}

function assertRealDirectory(path: string): void {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(`${path} must be a real directory, not a link or a file`);
  }
}

function collectReferences(): KeyReference[] {
  let files: string[];
  try {
    assertRealDirectory(SOURCE_ROOT);
    files = sourceFiles(SOURCE_ROOT);
  } catch (error) {
    return fail(2, `Failed to scan ${SOURCE_ROOT}: ${String(error)}`);
  }
  if (files.length === 0) {
    return fail(
      2,
      `No TypeScript sources under ${SOURCE_ROOT}; refusing to report a vacuous pass.`
    );
  }
  return files.flatMap(file => findKeyReferences(displayPath(file), readFileSync(file, 'utf8')));
}

const knownKeys = new Set(leafKeys(referenceLocaleTree()));
const references = collectReferences();

if (references.length === 0) {
  fail(2, `No t()/i18nKey literal under ${SOURCE_ROOT}; refusing to report a vacuous pass.`);
}

const missing = findMissingKeys(references, knownKeys);

if (missing.length > 0) {
  console.error(`i18n key check failed: ${missing.length} reference(s) have no translation:`);
  console.error(formatReport(missing));
  console.error('Add the key to i18n/localization.json (every locale) or pass a defaultValue.');
  process.exit(1);
}

console.log(`Every literal i18n key in src/ resolves (${references.length} reference(s)).`);
