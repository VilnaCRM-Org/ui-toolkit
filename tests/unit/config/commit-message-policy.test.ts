import commitlintConfig from '../../../commitlint.config';

// The release version is derived from commit headers by TriPSs/conventional-changelog-action
// (.github/workflows/autorelease.yml). These cases are the shapes the repository's own
// contributors and bots actually produce, so a change here changes what can be released.

const taskNumberRule = commitlintConfig.plugins[0].rules['check-task-number-rule'];

const accepts = (header: string): boolean => taskNumberRule({ header })[0] === true;
const explain = (header: string): string => String(taskNumberRule({ header })[1]);

const ignoresMessage = (message: string): boolean =>
  commitlintConfig.ignores.some(predicate => predicate(message));

// The single source of truth for the tests below: every type here must be accepted by the rule
// AND named in the failure hint, so the two can never drift apart or silently drop an entry.
const ACCEPTED_TYPES = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];

describe('commit header policy', () => {
  describe('accepted headers', () => {
    it.each([
      ['a single issue reference', 'feat(#87): add the commitlint gate'],
      ['a fix', 'fix(#74): guard against a nullish src'],
      ['several issues closed at once', 'feat(#24,#25,#26): epic 4 skeleton parity'],
      ['several issues written with spaces', 'feat(#24, #25): epic 4 skeleton parity'],
      ['a breaking change marker', 'feat(#87)!: drop the legacy entry point'],
      ['a breaking change across issues', 'refactor(#24,#25)!: collapse the barrels'],
      ['a Dependabot production bump', 'feat(deps): bump the all-deps group with 30 updates'],
      ['a Dependabot development bump', 'chore(deps-dev): bump the all-deps group'],
      ['the squash suffix GitHub appends', 'feat(#87): add the commitlint gate (#128)'],
    ])('accepts %s', (_label, header) => {
      expect(accepts(header)).toBe(true);
    });

    it.each(ACCEPTED_TYPES)('accepts the %s type', type => {
      expect(accepts(`${type}(#87): a subject`)).toBe(true);
    });
  });

  describe('rejected headers', () => {
    it.each([
      ['free-form prose', 'Fix button'],
      ['a missing scope', 'feat: add the commitlint gate'],
      ['an empty scope', 'feat(): add the commitlint gate'],
      ['a scope with no issue number', 'feat(#): add the commitlint gate'],
      ['an arbitrary word scope', 'feat(release): attach the packed npm tarball'],
      ['an unknown type', 'wip(#87): add the commitlint gate'],
      ['a type outside the enum', 'specs(#6): plan the toolkit completion'],
      ['a missing space after the colon', 'feat(#87):add the commitlint gate'],
      ['a missing subject', 'feat(#87): '],
      ['the legacy stack prefix', '[Stack 4/4] shared parity layer'],
      ['a trailing bang outside the scope', 'feat!(#87): drop the legacy entry point'],
      ['a bare issue number without a type', '#87: add the commitlint gate'],
    ])('rejects %s', (_label, header) => {
      expect(accepts(header)).toBe(false);
    });

    it('rejects an empty header', () => {
      expect(accepts('')).toBe(false);
    });
  });

  describe('the failure hint', () => {
    it('shows the expected header shape', () => {
      expect(explain('Fix button')).toContain('<type>(#<issue>): <subject>');
    });

    it('names every accepted type so the message never drifts from the rule', () => {
      const hint = explain('Fix button');

      ACCEPTED_TYPES.forEach(type => {
        expect(hint).toContain(type);
      });
    });

    it('documents the breaking-change marker', () => {
      expect(explain('Fix button')).toContain('<type>(#<issue>)!: <subject>');
    });
  });
});

describe('ignored messages', () => {
  it('ignores the image-actions header that contributors cannot rewrite', () => {
    expect(ignoresMessage('Optimised images with calibre/image-actions')).toBe(true);
  });

  it('ignores the image-actions header when a body follows it', () => {
    expect(ignoresMessage('Optimised images with calibre/image-actions\n\nsome body')).toBe(true);
  });

  it.each([
    'Fix button',
    'Optimised images by hand',
    'chore: optimise images with calibre/image-actions',
    // The exemption is matched on the whole first line, so it cannot be borrowed as a prefix.
    'Optimised images with calibre/image-actions and quietly drop the tests',
    ' Optimised images with calibre/image-actions',
  ])('does not ignore %p', message => {
    expect(ignoresMessage(message)).toBe(false);
  });
});

describe('the conventional-commits ruleset', () => {
  it('still extends config-conventional, which supplies type-enum and subject rules', () => {
    expect(commitlintConfig.extends).toEqual(['@commitlint/config-conventional']);
  });

  it('keeps the task-number rule at error severity', () => {
    expect(commitlintConfig.rules['check-task-number-rule']).toEqual([2, 'always']);
  });
});
