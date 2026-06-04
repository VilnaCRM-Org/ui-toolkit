module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'check-task-number-rule': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'check-task-number-rule': data => {
          const list = 'build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test';

          const regexp = new RegExp(`^(${list})\\(#\\d+\\):\\s.+$`);
          const correctCommit = regexp.test(data.header);

          return [correctCommit, `your task number incorrect (${list}(#1))`];
        },
      },
    },
  ],
};
