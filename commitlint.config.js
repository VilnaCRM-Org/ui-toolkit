// The release version is derived from these headers by
// TriPSs/conventional-changelog-action (.github/workflows/autorelease.yml), so the header
// shape is a semver contract rather than a style preference. Keep this file self-contained:
// Dockerfile.playwright copies it on its own, without the rest of the repository.
const TYPES = [
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

// Human-authored work is traceable to a GitHub issue: `#12`, or `#12,#13` when one change
// closes several stories.
const TASK_SCOPE = '#\\d+(?:,\\s*#\\d+)*';

// Dependabot writes its own headers and has no issue to reference.
const AUTOMATION_SCOPES = ['deps', 'deps-dev'];

// `!` before the colon is the Conventional Commits breaking-change marker, which the release
// action turns into a major bump — it has to be spellable.
const HEADER_PATTERN = new RegExp(
  `^(?:${TYPES.join('|')})\\((?:${TASK_SCOPE}|${AUTOMATION_SCOPES.join('|')})\\)!?:\\s.+$`
);

const HEADER_HINT = [
  'header must be `<type>(#<issue>): <subject>`',
  `type: ${TYPES.join(', ')}`,
  `scope: #12, #12,#13, or ${AUTOMATION_SCOPES.join('/')} for Dependabot`,
  'breaking change: `<type>(#<issue>)!: <subject>`',
].join(' — ');

// image-optimization.yml grants calibreapp/image-actions `contents: write` and it pushes this
// exact header onto the pull request branch. No contributor can rewrite it without a
// force-push that re-triggers the action, so the gate has to let it through.
const IMAGE_ACTIONS_HEADER = 'Optimised images with calibre/image-actions';

// Matched on the whole first line, not as a prefix, so the exemption cannot be borrowed by a
// header that merely starts with it.
const isImageActionsCommit = message => message.split('\n')[0].trimEnd() === IMAGE_ACTIONS_HEADER;

module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [isImageActionsCommit],
  rules: {
    'check-task-number-rule': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'check-task-number-rule': data => [HEADER_PATTERN.test(data.header), HEADER_HINT],
      },
    },
  ],
};
