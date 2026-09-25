/** @jest-environment node */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import fontLicenseDescription from '../../scripts/ci/font-license';
import {
  bundledPackageDir,
  declaredLicense,
  fontLicenseViolation,
  isAllowedExpression,
  LICENSE_POLICY,
  noticeViolation,
  packageLicenseViolation,
  projectLicenseViolations,
  surfaceFindings,
} from '../../scripts/ci/license-policy';

const REPO_ROOT: string = resolve(__dirname, '..', '..');
const FONTS_DIR: string = join(REPO_ROOT, 'src/assets/fonts');
const OFL_DESCRIPTION: string =
  'This Font Software is licensed under the SIL Open Font License, Version 1.1.';

interface NameEntry {
  platform: number;
  nameId: number;
  bytes: Buffer;
}

function utf16be(text: string): Buffer {
  return Buffer.from(text, 'utf16le').swap16();
}

function nameTable(entries: NameEntry[]): Buffer {
  const header: Buffer = Buffer.alloc(6 + entries.length * 12);
  header.writeUInt16BE(entries.length, 2);
  header.writeUInt16BE(header.length, 4);
  let offset: number = 0;
  entries.forEach((entry, index) => {
    const record: number = 6 + index * 12;
    header.writeUInt16BE(entry.platform, record);
    header.writeUInt16BE(entry.nameId, record + 6);
    header.writeUInt16BE(entry.bytes.length, record + 8);
    header.writeUInt16BE(offset, record + 10);
    offset += entry.bytes.length;
  });
  return Buffer.concat([header, ...entries.map(entry => entry.bytes)]);
}

function sfnt(signature: number, tag: string, table: Buffer): Buffer {
  const directory: Buffer = Buffer.alloc(12 + 16);
  directory.writeUInt32BE(signature, 0);
  directory.writeUInt16BE(1, 4);
  directory.write(tag, 12, 'latin1');
  directory.writeUInt32BE(directory.length, 20);
  directory.writeUInt32BE(table.length, 24);
  return Buffer.concat([directory, table]);
}

function shippedFonts(): string[] {
  return readdirSync(FONTS_DIR, { recursive: true, encoding: 'utf8' })
    .filter(name => name.endsWith('.ttf'))
    .map(name => join(FONTS_DIR, name));
}

function shippedFontFamilies(): string[] {
  return readdirSync(FONTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

describe('license policy', () => {
  describe('regression guard against the real package', () => {
    it('finds the shipped manifest and LICENSE compliant', () => {
      const manifest: unknown = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
      const license: string = readFileSync(join(REPO_ROOT, 'LICENSE'), 'utf8');
      expect(projectLicenseViolations(manifest, license, LICENSE_POLICY)).toEqual([]);
    });

    it('reads the licence metadata of every self-hosted font', () => {
      expect(shippedFonts().length).toBeGreaterThan(0);
    });

    it.each(shippedFonts())('%s embeds an OFL-1.1 licence the allow-list permits', file => {
      const description: string | undefined = fontLicenseDescription(readFileSync(file));
      expect(fontLicenseViolation(file, description, LICENSE_POLICY)).toBeUndefined();
    });

    it.each(shippedFontFamilies())('%s ships the SIL OFL-1.1 text beside its faces', family => {
      const licence: string = readFileSync(join(FONTS_DIR, family, 'OFL.txt'), 'utf8');
      expect(licence).toMatch(/^Copyright \d{4} The .+ Project Authors \(https:\/\/github\.com\//);
      expect(licence).toContain('SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007');
    });
  });

  describe('isAllowedExpression', () => {
    it.each(['MIT', '(MIT)', 'MIT OR GPL-3.0-only', '(Apache-2.0 OR MIT)', 'MIT AND ISC'])(
      'permits %s',
      expression => {
        expect(isAllowedExpression(expression, LICENSE_POLICY.allowedLicenses)).toBe(true);
      }
    );

    it.each([
      '',
      '   ',
      'GPL-3.0-only',
      'UNLICENSED',
      'SEE LICENSE IN LICENSE.md',
      'MIT AND GPL-3.0-only',
      'GPL-3.0-only AND (MIT OR BSD-3-Clause)',
      '(MIT OR BSD-3-Clause) AND GPL-3.0-only',
      'Apache-2.0 WITH LLVM-exception',
      'mit',
    ])('rejects %j', expression => {
      expect(isAllowedExpression(expression, LICENSE_POLICY.allowedLicenses)).toBe(false);
    });
  });

  describe('declaredLicense', () => {
    it.each([
      [{ license: 'MIT' }, 'MIT'],
      [{ license: { type: 'ISC' } }, 'ISC'],
      [{ licenses: [{ type: 'MIT' }, 'Apache-2.0'] }, 'MIT OR Apache-2.0'],
      [{ licenses: [{ url: 'x' }] }, undefined],
      [{ licenses: 'MIT' }, undefined],
      [{ license: { url: 'x' } }, undefined],
      [{}, undefined],
      [null, undefined],
      ['MIT', undefined],
    ])('reads %j as %j', (manifest, expected) => {
      expect(declaredLicense(manifest)).toBe(expected);
    });
  });

  describe('packageLicenseViolation', () => {
    it('passes an allowed licence', () => {
      expect(packageLicenseViolation('a', { license: 'MIT' }, LICENSE_POLICY)).toBeUndefined();
    });

    it('rejects a package that declares no licence', () => {
      expect(packageLicenseViolation('a', {}, LICENSE_POLICY)).toBe('a declares no licence');
    });

    it('rejects a licence outside the allow-list', () => {
      expect(packageLicenseViolation('a', { license: 'GPL-2.0' }, LICENSE_POLICY)).toBe(
        'a is licensed GPL-2.0, which the allow-list does not permit'
      );
    });
  });

  describe('projectLicenseViolations', () => {
    const cc0: string = 'Creative Commons Legal Code\n\nCC0 1.0 Universal\n';

    it('passes a CC0-1.0 manifest shipped with the CC0 text', () => {
      expect(projectLicenseViolations({ license: 'CC0-1.0' }, cc0, LICENSE_POLICY)).toEqual([]);
    });

    it('rejects a manifest with another SPDX id', () => {
      expect(projectLicenseViolations({ license: 'MIT' }, cc0, LICENSE_POLICY)).toEqual([
        'package.json declares MIT, not CC0-1.0',
      ]);
    });

    it('rejects a manifest with no licence and a missing LICENSE together', () => {
      expect(projectLicenseViolations({}, undefined, LICENSE_POLICY)).toEqual([
        'package.json declares no licence, not CC0-1.0',
        'the package ships no LICENSE file',
      ]);
    });

    it('rejects a LICENSE that is not the declared licence text', () => {
      expect(
        projectLicenseViolations({ license: 'CC0-1.0' }, 'MIT License', LICENSE_POLICY)
      ).toEqual(['LICENSE is not the CC0-1.0 text']);
    });
  });

  describe('fontLicenseViolation', () => {
    it('passes OFL-1.1 metadata', () => {
      expect(fontLicenseViolation('f.ttf', OFL_DESCRIPTION, LICENSE_POLICY)).toBeUndefined();
    });

    it('rejects a font without readable metadata', () => {
      expect(fontLicenseViolation('f.ttf', undefined, LICENSE_POLICY)).toBe(
        'f.ttf carries no readable licence metadata (name table id 13)'
      );
    });

    it('rejects a commercial font licence', () => {
      expect(
        fontLicenseViolation('f.ttf', 'Licensed for desktop use by Acme Inc.', LICENSE_POLICY)
      ).toBe(
        'f.ttf is licensed "Licensed for desktop use by Acme Inc.", ' +
          'which the allow-list does not permit'
      );
    });

    it('rejects a recognised font licence the allow-list does not name', () => {
      const policy = { ...LICENSE_POLICY, allowedLicenses: ['MIT'] };
      expect(fontLicenseViolation('f.ttf', OFL_DESCRIPTION, policy)).toMatch(/does not permit/);
    });
  });

  describe('noticeViolation', () => {
    it('passes a notice that names the package and version', () => {
      expect(noticeViolation('swiper', '14.0.6', 'swiper@14.0.6 (MIT)')).toBeUndefined();
    });

    it.each([undefined, '', 'swiper@14.0.5 (MIT)'])('rejects notices %j', notices => {
      expect(noticeViolation('swiper', '14.0.6', notices)).toBe(
        'swiper@14.0.6 is bundled without an entry in THIRD-PARTY-NOTICES.txt'
      );
    });
  });

  describe('surfaceFindings', () => {
    it.each([
      'http://localhost/api',
      'https://localhost:3000',
      'http://127.0.0.1:8080/x',
      'http://0.0.0.0',
      'https://10.20.30.40/x',
      'http://192.168.1.10',
      'http://172.16.0.1/x',
      'http://172.31.255.255',
      'https://api.crm.internal/v1',
      'http://printer.local',
      'https://wiki.corp/page',
      'wss://socket.intranet/stream',
      'ftp://files.lan/a',
      'http://router.home.arpa',
      'url("http://localhost")',
      'see localhost:6006',
    ])('flags the internal URL in %j', text => {
      expect(surfaceFindings('build/a.mjs', text).map(finding => finding.rule)).toContain(
        'internal-url'
      );
    });

    it.each([
      'https://swiperjs.com',
      'http://www.w3.org/2000/svg',
      'http://172.32.0.1',
      'https://docs.local.example.com',
      'https://localhost.example.com',
      'https://github.com/VilnaCRM-Org/website',
      'the localhost fallback',
    ])('does not flag the public URL or prose %j', text => {
      expect(surfaceFindings('build/a.mjs', text)).toEqual([]);
    });

    it.each([
      ['PROPRIETARY', 'PROPRIETARY'],
      ['CONFIDENTIAL build', 'CONFIDENTIAL'],
      ['For Internal Use Only', 'Internal Use Only'],
      ['do not distribute', 'do not distribute'],
      ['Do not redistribute', 'Do not redistribute'],
      ['a trade secret', 'trade secret'],
    ])('flags the proprietary marker in %j', (text, match) => {
      expect(surfaceFindings('build/a.mjs', text)).toEqual([
        { file: 'build/a.mjs', rule: 'proprietary-marker', match },
      ]);
    });

    it.each(['confidential_text', 'Proprietary fonts', 'confidential'])(
      'does not flag the lower-case word in %j',
      text => {
        expect(surfaceFindings('build/a.mjs', text)).toEqual([]);
      }
    );

    it.each(['LICENSE', 'build/THIRD-PARTY-NOTICES.txt'])(
      'exempts third-party licence text in %s from marker rules only',
      file => {
        const findings = surfaceFindings(file, 'CONFIDENTIAL http://localhost/x');
        expect(findings.map(finding => finding.rule)).toEqual(['internal-url']);
      }
    );

    it('reports every occurrence', () => {
      expect(surfaceFindings('a', 'http://localhost/ http://10.0.0.1/')).toHaveLength(2);
    });
  });

  describe('bundledPackageDir', () => {
    it.each([
      ['../node_modules/swiper/shared/swiper-core.mjs', 'node_modules/swiper'],
      ['../../node_modules/swiper/modules/a11y.mjs', 'node_modules/swiper'],
      ['../node_modules/@scope/pkg/index.js', 'node_modules/@scope/pkg'],
      ['../node_modules/a/node_modules/b/x.js', 'node_modules/a/node_modules/b'],
      ['..\\node_modules\\swiper\\swiper.mjs', 'node_modules/swiper'],
      ['../src/components/ui-button/index.tsx', undefined],
      ['../node_modules/', undefined],
    ])('maps %s to %j', (source, expected) => {
      expect(bundledPackageDir(source)).toBe(expected);
    });
  });

  describe('fontLicenseDescription', () => {
    it('reads a Windows UTF-16BE licence description', () => {
      const table: Buffer = nameTable([
        { platform: 3, nameId: 1, bytes: utf16be('Family') },
        { platform: 3, nameId: 13, bytes: utf16be(OFL_DESCRIPTION) },
      ]);
      expect(fontLicenseDescription(sfnt(0x00010000, 'name', table))).toBe(OFL_DESCRIPTION);
    });

    it('reads a Macintosh Latin-1 licence description from an OpenType font', () => {
      const table: Buffer = nameTable([
        { platform: 1, nameId: 13, bytes: Buffer.from('Mac licence', 'latin1') },
      ]);
      expect(fontLicenseDescription(sfnt(0x4f54544f, 'name', table))).toBe('Mac licence');
    });

    it('returns undefined when the name table has no licence description', () => {
      const table: Buffer = nameTable([{ platform: 3, nameId: 1, bytes: utf16be('Family') }]);
      expect(fontLicenseDescription(sfnt(0x74727565, 'name', table))).toBeUndefined();
    });

    it('returns undefined when the font has no name table', () => {
      expect(fontLicenseDescription(sfnt(0x00010000, 'head', Buffer.alloc(8)))).toBeUndefined();
    });

    it('returns undefined for a compressed WOFF2 container', () => {
      expect(fontLicenseDescription(Buffer.from('wOF2 compressed face'))).toBeUndefined();
    });

    it('returns undefined for a truncated font instead of throwing', () => {
      expect(fontLicenseDescription(Buffer.from([0, 1, 0]))).toBeUndefined();
    });

    it('returns undefined for an odd-length UTF-16 description instead of throwing', () => {
      const table: Buffer = nameTable([
        { platform: 3, nameId: 13, bytes: Buffer.from([0, 65, 0]) },
      ]);
      expect(fontLicenseDescription(sfnt(0x00010000, 'name', table))).toBeUndefined();
    });
  });
});
