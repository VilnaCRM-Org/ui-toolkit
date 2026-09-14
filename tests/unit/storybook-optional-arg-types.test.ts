import type { SBType, StrictArgTypes } from 'storybook/internal/types';

import { collapseOptionalUndefined } from '../../.storybook/optional-arg-types';

const UNDEFINED: SBType = { name: 'other', value: 'undefined' };

function enhance(argTypes: StrictArgTypes): StrictArgTypes {
  return collapseOptionalUndefined({
    argTypes,
    id: 'probe--probe',
    initialArgs: {},
    parameters: {},
    storyGlobals: {},
  } as never);
}

describe('collapseOptionalUndefined (Storybook argTypes enhancer)', () => {
  it('collapses `boolean | undefined` to a boolean type with a boolean summary', () => {
    const enhanced: StrictArgTypes = enhance({
      checked: {
        name: 'checked',
        type: {
          name: 'union',
          required: false,
          raw: 'boolean | undefined',
          value: [{ name: 'boolean' }, UNDEFINED],
        },
        table: { type: { summary: 'union' } },
      },
    });

    expect(enhanced.checked?.type).toEqual({ name: 'boolean', required: false });
    expect(enhanced.checked?.table?.type?.summary).toBe('boolean');
  });

  it('keeps a real union, minus the undefined member, with a rebuilt raw text', () => {
    const enhanced: StrictArgTypes = enhance({
      size: {
        name: 'size',
        type: {
          name: 'union',
          required: false,
          raw: "'small' | 'medium' | undefined",
          value: [
            { name: 'literal', value: "'small'" },
            { name: 'literal', value: "'medium'" },
            UNDEFINED,
          ],
        },
      },
    });

    expect(enhanced.size?.type).toEqual({
      name: 'union',
      required: false,
      raw: "'small' | 'medium'",
      value: [
        { name: 'literal', value: "'small'" },
        { name: 'literal', value: "'medium'" },
      ],
    });
  });

  it('leaves a required union alone: there `undefined` is part of the contract', () => {
    const plain: StrictArgTypes = {
      value: {
        name: 'value',
        type: {
          name: 'union',
          required: true,
          raw: 'boolean | undefined',
          value: [{ name: 'boolean' }, UNDEFINED],
        },
      },
    };

    expect(enhance(plain).value).toBe(plain.value);
  });

  it('leaves types without an undefined member, and typeless argTypes, untouched', () => {
    const plain: StrictArgTypes = {
      label: { name: 'label', type: { name: 'string', required: true } },
      variant: {
        name: 'variant',
        type: { name: 'union', required: false, value: [{ name: 'string' }, { name: 'number' }] },
      },
      onClick: { name: 'onClick', action: 'clicked' },
    };

    const enhanced: StrictArgTypes = enhance(plain);

    expect(enhanced.label).toBe(plain.label);
    expect(enhanced.variant).toBe(plain.variant);
    expect(enhanced.onClick).toBe(plain.onClick);
  });
});
