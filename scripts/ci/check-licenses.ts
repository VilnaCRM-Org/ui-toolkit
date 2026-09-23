import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';

import fontLicenseDescription from './font-license';
import {
  bundledPackageDir,
  fontLicenseViolation,
  LICENSE_POLICY,
  noticeViolation,
  packageLicenseViolation,
  projectLicenseViolations,
  surfaceFindings,
} from './license-policy';

const PROJECT_ROOT: string = resolve(process.cwd());
const TEXT_FILE: RegExp = /\.(?:css|cjs|js|json|map|md|mjs|mts|ts|txt)$|(?:^|\/)LICENSE$/;
const FONT_FILE: RegExp = /\.(?:otf|ttf|woff2?)$/i;
const RUNTIME_MODULE: RegExp = /\.(?:mjs|js|css)$/;
const PRODUCTION_FIELDS: readonly string[] = ['dependencies', 'optionalDependencies'];

interface Unpacked {
  root: string;
  files: string[];
}

interface ScanContext {
  unpacked: Unpacked;
  manifest: Record<string, unknown>;
  notices: string | undefined;
}

function fail(message: string): never {
  console.error(`check-licenses: ${message}`);
  process.exit(2);
}

function singleTarball(packageDir: string): string {
  const tarballs: string[] = existsSync(packageDir)
    ? readdirSync(packageDir).filter(name => name.endsWith('.tgz'))
    : [];
  if (tarballs.length !== 1) {
    fail(
      `expected exactly one tarball in ${packageDir}, found ${tarballs.length}; run make package`
    );
  }
  return join(packageDir, tarballs[0] as string);
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  );
}

function unpack(tarball: string, scratch: string): Unpacked {
  execFileSync('/bin/tar', ['-xzf', tarball, '-C', scratch]);
  const root: string = join(scratch, 'package');
  return { root, files: walk(root).map(file => relative(root, file)) };
}

function readOptional(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

function readManifest(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function sourceMapSources(unpacked: Unpacked, file: string): string[] {
  const map: { sources?: unknown } = JSON.parse(readFileSync(join(unpacked.root, file), 'utf8'));
  return Array.isArray(map.sources) ? map.sources.filter(isString) : [];
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function bundledPackageDirs(unpacked: Unpacked): string[] {
  const dirs: (string | undefined)[] = unpacked.files
    .filter(file => file.endsWith('.map'))
    .flatMap(file => sourceMapSources(unpacked, file))
    .map(bundledPackageDir);
  return [...new Set(dirs.filter(isString))].sort((a, b) => a.localeCompare(b));
}

function unmappedModules(unpacked: Unpacked): string[] {
  return unpacked.files
    .filter(file => RUNTIME_MODULE.test(file))
    .filter(file => !unpacked.files.includes(`${file}.map`))
    .map(
      file => `${file} ships without a source map, so its bundled packages cannot be attributed`
    );
}

function installedManifest(packageDir: string): Record<string, unknown> | undefined {
  const path: string = join(PROJECT_ROOT, packageDir, 'package.json');
  return existsSync(path) ? readManifest(path) : undefined;
}

function bundledViolations(packageDir: string, notices: string | undefined): string[] {
  const manifest: Record<string, unknown> | undefined = installedManifest(packageDir);
  if (manifest === undefined) return [`${packageDir} is bundled but not installed`];
  const name: string = typeof manifest.name === 'string' ? manifest.name : packageDir;
  return [
    packageLicenseViolation(name, manifest, LICENSE_POLICY),
    noticeViolation(name, String(manifest.version), notices),
  ].filter(isString);
}

interface DependencyEdge {
  name: string;
  optional: boolean;
  fromDir: string;
}

interface InstalledPackage {
  name: string;
  dir: string | undefined;
  optional: boolean;
}

function dependencyEdges(
  manifest: Record<string, unknown> | undefined,
  fromDir: string
): DependencyEdge[] {
  return PRODUCTION_FIELDS.flatMap(field => {
    const entries: unknown = manifest?.[field];
    const names: string[] =
      typeof entries === 'object' && entries !== null ? Object.keys(entries) : [];
    return names.map(name => ({ name, optional: field === 'optionalDependencies', fromDir }));
  });
}

function resolvePackageDir(name: string, fromDir: string): string | undefined {
  const candidate: string = join(fromDir, 'node_modules', name);
  if (existsSync(join(PROJECT_ROOT, candidate, 'package.json'))) return candidate;
  const parent: string = dirname(fromDir);
  return parent === fromDir ? undefined : resolvePackageDir(name, parent);
}

function visit(
  edge: DependencyEdge,
  seen: Set<string>,
  queue: DependencyEdge[]
): InstalledPackage[] {
  const dir: string | undefined = resolvePackageDir(edge.name, edge.fromDir);
  if (dir === undefined) return [{ name: edge.name, dir, optional: edge.optional }];
  if (seen.has(dir)) return [];
  seen.add(dir);
  queue.push(...dependencyEdges(installedManifest(dir), dir));
  return [{ name: edge.name, dir, optional: edge.optional }];
}

function productionClosure(manifest: Record<string, unknown>): InstalledPackage[] {
  const seen: Set<string> = new Set();
  const queue: DependencyEdge[] = dependencyEdges(manifest, '.');
  const found: InstalledPackage[] = [];
  while (queue.length > 0) {
    found.push(...visit(queue.shift() as DependencyEdge, seen, queue));
  }
  return found;
}

function dependencyViolation(installed: InstalledPackage): string | undefined {
  if (installed.dir === undefined) {
    return installed.optional
      ? undefined
      : `production dependency ${installed.name} is not installed`;
  }
  const manifest: Record<string, unknown> = installedManifest(installed.dir) as Record<
    string,
    unknown
  >;
  return packageLicenseViolation(installed.name, manifest, LICENSE_POLICY);
}

function fontViolations(unpacked: Unpacked): string[] {
  return unpacked.files
    .filter(file => FONT_FILE.test(file))
    .map(file => {
      const description: string | undefined = fontLicenseDescription(
        readFileSync(join(unpacked.root, file))
      );
      return fontLicenseViolation(file, description, LICENSE_POLICY);
    })
    .filter(isString);
}

function surfaceViolations(unpacked: Unpacked): string[] {
  return unpacked.files
    .filter(file => TEXT_FILE.test(file))
    .flatMap(file => surfaceFindings(file, readFileSync(join(unpacked.root, file), 'utf8')))
    .map(finding => `${finding.file}: ${finding.rule} "${finding.match}"`);
}

function licenceViolations(context: ScanContext): string[] {
  const { unpacked, manifest, notices } = context;
  return [
    ...projectLicenseViolations(
      manifest,
      readOptional(join(unpacked.root, 'LICENSE')),
      LICENSE_POLICY
    ),
    ...unmappedModules(unpacked),
    ...bundledPackageDirs(unpacked).flatMap(dir => bundledViolations(dir, notices)),
    ...productionClosure(manifest).map(dependencyViolation).filter(isString),
    ...fontViolations(unpacked),
  ];
}

function scan(unpacked: Unpacked): string[] {
  const context: ScanContext = {
    unpacked,
    manifest: readManifest(join(unpacked.root, 'package.json')),
    notices: readOptional(join(unpacked.root, 'build', LICENSE_POLICY.noticesFile)),
  };
  return [...licenceViolations(context), ...surfaceViolations(unpacked)];
}

function report(tarball: string, violations: string[]): number {
  if (violations.length === 0) {
    console.log(`check-licenses: ${tarball} passes the licence and publish-surface policy`);
    return 0;
  }
  console.error(`check-licenses: ${tarball} violates the licence and publish-surface policy:`);
  violations.forEach(violation => console.error(`  ${violation}`));
  return 1;
}

function main(packageDir: string | undefined): number {
  if (packageDir === undefined) fail('usage: check-licenses.ts <package-dir>');
  const tarball: string = singleTarball(join(PROJECT_ROOT, basename(packageDir)));
  const scratch: string = mkdtempSync(join(tmpdir(), 'check-licenses-'));
  try {
    return report(relative(PROJECT_ROOT, tarball), scan(unpack(tarball, scratch)));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

process.exit(main(process.argv[2]));
