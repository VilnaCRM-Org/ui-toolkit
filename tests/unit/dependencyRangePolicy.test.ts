import pkg from '../../package.json';
import {
  evaluatePackageJson,
  findRangeViolations,
  formatReport,
  isExemptSpecifier,
  RangeViolation,
  SCANNED_DEPENDENCY_FIELDS,
  usesCaretRange,
} from '../../scripts/ci/dependencyRangePolicy';

describe('dependencyRangePolicy', () => {
  describe('regression guard against the real package.json', () => {
    it('reports no violations for the current package.json', () => {
      expect(findRangeViolations(pkg)).toHaveLength(0);
    });

    it('evaluates the current package.json as ok', () => {
      expect(evaluatePackageJson(pkg).ok).toBe(true);
    });
  });

  describe('SCANNED_DEPENDENCY_FIELDS', () => {
    it('scans exactly dependencies and devDependencies', () => {
      expect(SCANNED_DEPENDENCY_FIELDS).toEqual(['dependencies', 'devDependencies']);
    });
  });

  describe('isExemptSpecifier', () => {
    it.each([
      'workspace:*',
      'file:../x',
      'link:../x',
      'npm:pkg@^1.2.3',
      'git+https://e/r.git',
      'https://e/r.tgz',
      'github:o/r',
      'o/r',
      'o/r#semver:^1.0.0',
      'latest',
      'next',
      'beta',
    ])('treats %p as exempt', specifier => {
      expect(isExemptSpecifier(specifier)).toBe(true);
    });

    it.each(['1.2.3', '~1.2.3', '>=1.0.0', '^1.2.3', '1.x', '*', 'v1.2.3', ''])(
      'treats %p as non-exempt',
      specifier => {
        expect(isExemptSpecifier(specifier)).toBe(false);
      }
    );
  });

  describe('usesCaretRange', () => {
    it.each(['^1.2.3', ' ^1.2.3 '])('returns true for %p', specifier => {
      expect(usesCaretRange(specifier)).toBe(true);
    });

    it.each(['~1.2.3', '1.2.3', '>=1.0.0'])('returns false for %p', specifier => {
      expect(usesCaretRange(specifier)).toBe(false);
    });
  });

  describe('findRangeViolations', () => {
    it('flags exact and tilde specifiers while skipping caret and exempt ones', () => {
      const fixture = {
        dependencies: {
          good: '^1.0.0',
          pinned: '1.2.3',
          tilde: '~1.0.0',
          local: 'workspace:*',
          tarball: 'https://example.com/pkg.tgz',
          tagged: 'latest',
        },
      };

      expect(findRangeViolations(fixture)).toEqual<RangeViolation[]>([
        {
          field: 'dependencies',
          name: 'pinned',
          specifier: '1.2.3',
          reason: 'expected a caret (^) range',
        },
        {
          field: 'dependencies',
          name: 'tilde',
          specifier: '~1.0.0',
          reason: 'expected a caret (^) range',
        },
      ]);
    });

    it('does not report packages listed in allowedExceptions', () => {
      const fixture = {
        dependencies: {
          pinned: '1.2.3',
        },
      };

      expect(findRangeViolations(fixture, ['pinned'])).toEqual([]);
    });

    it('ignores peerDependencies and optionalDependencies', () => {
      const fixture = {
        peerDependencies: {
          peer: '1.2.3',
        },
        optionalDependencies: {
          optional: '~2.0.0',
        },
      };

      expect(findRangeViolations(fixture)).toEqual([]);
    });

    it('treats null defensively as having no entries', () => {
      expect(findRangeViolations(null)).toEqual([]);
    });

    it('treats an empty object defensively as having no entries', () => {
      expect(findRangeViolations({})).toEqual([]);
    });
  });

  describe('formatReport', () => {
    it('returns an empty string when there are no violations', () => {
      expect(formatReport([])).toBe('');
    });

    it('lists the package name for a non-empty violation set', () => {
      const violations: RangeViolation[] = [
        {
          field: 'dependencies',
          name: 'pinned',
          specifier: '1.2.3',
          reason: 'expected a caret (^) range',
        },
      ];

      expect(formatReport(violations)).toContain('pinned');
    });
  });

  describe('evaluatePackageJson', () => {
    it('reports ok false with a non-empty report for a violating fixture', () => {
      const fixture = {
        dependencies: {
          pinned: '1.2.3',
        },
      };

      const result = evaluatePackageJson(fixture);

      expect(result.ok).toBe(false);
      expect(result.report).not.toBe('');
      expect(result.report).toContain('pinned');
    });
  });
});
