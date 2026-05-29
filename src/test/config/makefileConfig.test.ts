import fs from 'fs';
import path from 'path';

function readStorybookStartRecipe(): string {
  const makefilePath: string = path.resolve(__dirname, '../../../Makefile');
  const makefileContents: string = fs.readFileSync(makefilePath, 'utf8');
  const recipeMatch: RegExpMatchArray | null = makefileContents.match(
    /^storybook-start:.*\n((?:\t.*\n)+)/m
  );

  if (!recipeMatch) {
    throw new Error('Could not locate the storybook-start recipe in Makefile');
  }

  return recipeMatch[1];
}

function readMakefileContents(): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../Makefile'), 'utf8');
}

describe('Makefile storybook-start target', () => {
  test('starts Storybook in non-interactive Docker mode with an automatically resolved host port', () => {
    expect(readMakefileContents()).toContain('STORYBOOK_PORT ?= 6006');

    const recipe: string = readStorybookStartRecipe();

    expect(recipe).toContain(
      'host_port=$$(STORYBOOK_PORT=$(STORYBOOK_PORT) node ./scripts/resolveStorybookHostPort.js)'
    );
    expect(recipe).toContain('--publish $$host_port:6006');
    expect(recipe).toContain('storybook dev --ci --host 0.0.0.0 -p 6006');
  });
});
