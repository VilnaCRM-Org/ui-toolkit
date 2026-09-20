import fs from 'fs';
import path from 'path';

const ROOT: string = path.resolve(__dirname, '../../..');
const CLAUDE_MD: string = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
const GITIGNORE_LINES: string[] = fs
  .readFileSync(path.join(ROOT, '.gitignore'), 'utf8')
  .split('\n')
  .map(line => line.trim());

const LOCAL_TOOLING_PREFIXES: Record<string, string> = {
  '_bmad/': '/_bmad/',
  '.claude/commands/': '.claude/*',
};

const LINK_TARGET = /\]\(([^)#\s]+)\)/g;
const CODE_SPAN = /`([^`\n]+)`/g;
const PATH_SHAPE = /^[\w.-]+(?:\/[\w.-]+)+\/?$/;

const isLocalTooling = (candidate: string): boolean =>
  Object.keys(LOCAL_TOOLING_PREFIXES).some(prefix => candidate.startsWith(prefix));

const matches = (pattern: RegExp): string[] =>
  Array.from(CLAUDE_MD.matchAll(pattern), match => match[1]!);

const linkTargets: string[] = matches(LINK_TARGET).filter(target => !/^\w+:/.test(target));
const codePaths: string[] = matches(CODE_SPAN)
  .flatMap(span => span.split(/\s+/))
  .filter(word => PATH_SHAPE.test(word));
const repositoryPaths: string[] = Array.from(new Set([...linkTargets, ...codePaths])).filter(
  candidate => !isLocalTooling(candidate)
);
const localToolingPaths: string[] = Array.from(new Set(codePaths)).filter(isLocalTooling);

describe('CLAUDE.md pointers', () => {
  it('names at least the contract files it exists to route agents to', () => {
    expect(linkTargets).toEqual(
      expect.arrayContaining([
        'agents.md',
        'CONTRIBUTING.md',
        'README.md',
        'specs/planning-artifacts/architecture.md',
      ])
    );
    expect(codePaths).toEqual(
      expect.arrayContaining(['.claude/settings.json', '.devcontainer/devcontainer.json'])
    );
  });

  it.each(repositoryPaths)('resolves %s in the repository', candidate => {
    expect(fs.existsSync(path.join(ROOT, candidate))).toBe(true);
  });

  it('exempts only the tooling paths .gitignore keeps out of the tree', () => {
    expect(localToolingPaths.length).toBeGreaterThan(0);
    localToolingPaths.forEach(candidate => {
      const prefix: string = Object.keys(LOCAL_TOOLING_PREFIXES).find(key =>
        candidate.startsWith(key)
      )!;

      expect(GITIGNORE_LINES).toContain(LOCAL_TOOLING_PREFIXES[prefix]);
    });
  });
});
