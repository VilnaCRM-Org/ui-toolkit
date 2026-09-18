import newTabLabelWarning from '../../src/components/ui-link/new-tab-label-warning';

describe('newTabLabelWarning', () => {
  it.each([undefined, null])('warns for a new-tab link whose label is %s', label => {
    const message: string | null = newTabLabelWarning(true, label);
    expect(message).toEqual(expect.stringContaining('newTabLabel'));
    expect(message).toEqual(expect.stringContaining('target="_blank"'));
  });

  it.each(['', '   ', 'external'])('stays silent for a new-tab link labelled %j', label => {
    expect(newTabLabelWarning(true, label)).toBeNull();
  });

  it.each([undefined, null, '', 'external'])(
    'stays silent for a same-tab link whose label is %j',
    label => {
      expect(newTabLabelWarning(false, label)).toBeNull();
    }
  );
});
