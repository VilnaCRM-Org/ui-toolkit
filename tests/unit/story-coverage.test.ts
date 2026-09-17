import fs from 'node:fs';
import path from 'node:path';

import { isStoryFile } from '../../scripts/ci/story-play-functions';

const componentsRoot: string = path.resolve(__dirname, '../../src/components');
const barrelSource: string = fs.readFileSync(path.join(componentsRoot, 'index.ts'), 'utf8');

function isDocsFile(fileName: string): boolean {
  return isStoryFile(fileName) || fileName.endsWith('.mdx');
}

function documentsItself(directory: string): boolean {
  return fs
    .readdirSync(path.join(componentsRoot, directory), { recursive: true })
    .some(entry => isDocsFile(path.basename(String(entry))));
}

const exportedDirectories: string[] = [
  ...new Set([...barrelSource.matchAll(/from '\.\/([a-z0-9-]+)/g)].map(match => match[1] ?? '')),
].sort();

const documentedDirectories: string[] = fs
  .readdirSync(componentsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && documentsItself(entry.name))
  .map(entry => entry.name)
  .sort();

describe('Storybook coverage of the public component surface', () => {
  it('reads the exported module directories out of the barrel', () => {
    expect(exportedDirectories).toEqual(expect.arrayContaining(['ui-button', 'ui-color-theme']));
  });

  it('documents every exported module with at least one story or docs page', () => {
    const undocumented: string[] = exportedDirectories.filter(
      directory => !documentedDirectories.includes(directory)
    );

    expect(undocumented).toEqual([]);
  });

  it('never publishes a story for a module the barrel does not export', () => {
    const unexported: string[] = documentedDirectories.filter(
      directory => !exportedDirectories.includes(directory)
    );

    expect(unexported).toEqual([]);
  });
});
