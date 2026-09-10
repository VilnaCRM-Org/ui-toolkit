import React from 'react';

import { hasHelperContent } from '../../src/components/field-controls/has-helper-content';

// `helperText` decides two things at once: whether a `<FormHelperText>` mounts
// (and is therefore worth pointing `aria-describedby` at) and whether the
// `error`-without-explanation warning stays silent. Anything React renders as
// nothing has to read as absent, or a control ends up describing itself with an
// empty node.
describe('hasHelperContent — what actually paints an explanation', () => {
  it('treats real text as present', () => {
    expect(hasHelperContent('Невірний код')).toBe(true);
    expect(hasHelperContent(0)).toBe(true);
    expect(hasHelperContent(<span>text</span>)).toBe(true);
  });

  it('treats everything React renders as nothing as absent', () => {
    expect(hasHelperContent('')).toBe(false);
    expect(hasHelperContent('   ')).toBe(false);
    expect(hasHelperContent(undefined)).toBe(false);
    expect(hasHelperContent(null)).toBe(false);
    // The `helperText={hasError && message}` idiom collapses to a boolean.
    expect(hasHelperContent(false)).toBe(false);
    expect(hasHelperContent(true)).toBe(false);
  });

  it('walks arrays, so an empty or blank-only list is absent', () => {
    expect(hasHelperContent([])).toBe(false);
    expect(hasHelperContent([null, undefined, false, '   '])).toBe(false);
    expect(hasHelperContent([[], ['']])).toBe(false);
  });

  it('counts an array with at least one renderable child as present', () => {
    expect(hasHelperContent(['', 'Невірний код'])).toBe(true);
    expect(hasHelperContent([<span key="a">text</span>])).toBe(true);
    expect(hasHelperContent([[''], ['text']])).toBe(true);
  });
});
