/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';

const ROOT: string = path.resolve(__dirname, '../..');

function source(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const RENDERER_PINS: string[] = [
  '--disable-gpu',
  '--disable-gpu-rasterization',
  '--disable-partial-raster',
  '--disable-lcd-text',
  '--disable-skia-runtime-opts',
];

const VISUAL_SPECS: string[] = ['tests/visual/states.spec.ts', 'tests/visual/visual.spec.ts'];

describe('visual baseline exactness', () => {
  const config: string = source('playwright.config.ts');

  it('compares every screenshot against its baseline exactly', () => {
    expect(config).toMatch(
      /toHaveScreenshot:\s*\{\s*threshold:\s*0,\s*maxDiffPixels:\s*0,\s*maxDiffPixelRatio:\s*0\s*\}/
    );
  });

  it('pins the chromium rasteriser', () => {
    RENDERER_PINS.forEach(pin => {
      expect(config).toContain(`'${pin}'`);
    });
  });

  it('never retries a failed comparison', () => {
    expect(config).toMatch(/^\s*retries:\s*0,$/m);
    expect(config).not.toMatch(/retries:\s*process\.env/);
  });

  it.each(VISUAL_SPECS)('%s declares no per-shot pixel budget', (spec: string) => {
    expect(source(spec)).not.toMatch(/maxDiffPixel|threshold\s*:/);
  });
});
