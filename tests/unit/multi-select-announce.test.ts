import { announceChange } from '../../src/components/ui-multi-select/announce';
import type { UiMultiSelectOption } from '../../src/components/ui-multi-select/types';

const kyiv: UiMultiSelectOption = { label: 'Kyiv', value: 'kyiv' };
const lviv: UiMultiSelectOption = { label: 'Lviv', value: 'lviv' };
const odesa: UiMultiSelectOption = { label: 'Odesa', value: 'odesa' };

describe('multi-select announceChange', () => {
  it('announces an addition with the new count', () => {
    expect(announceChange([kyiv], [kyiv, lviv])).toBe('Lviv added, 2 selected');
  });

  it('announces a removal with the new count', () => {
    expect(announceChange([kyiv, lviv, odesa], [kyiv, odesa])).toBe('Lviv removed, 2 selected');
  });

  it('announces the last removal as a removal, not a clear', () => {
    expect(announceChange([kyiv], [])).toBe('Kyiv removed, 0 selected');
  });

  it('announces clearing several at once', () => {
    expect(announceChange([kyiv, lviv], [])).toBe('Selection cleared, 0 selected');
  });

  it('returns an empty string when nothing changed', () => {
    expect(announceChange([kyiv], [kyiv])).toBe('');
  });
});
