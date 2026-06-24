import {
  LARGE_CARDLIST_ARRAY,
  SMALL_CARDLIST_ARRAY,
} from '../../src/components/ui-card-list/constants';
import { UiCardItemData } from '../../src/components/ui-card-list/types';

// `constants.ts` is exported demo data with no runtime logic; importing it
// executes the module (the SVG imports are resolved by the svg mock) and lets us
// assert the shape/length contract every consumer/story relies on.

describe('UiCardList demo constants', () => {
  it('exposes six large demo cards', () => {
    expect(LARGE_CARDLIST_ARRAY).toHaveLength(6);
  });

  it('exposes four small demo cards', () => {
    expect(SMALL_CARDLIST_ARRAY).toHaveLength(4);
  });

  it('marks every large card with the largeCard type', () => {
    LARGE_CARDLIST_ARRAY.forEach((card: UiCardItemData) => {
      expect(card.type).toBe('largeCard');
    });
  });

  it('marks every small card with the smallCard type', () => {
    SMALL_CARDLIST_ARRAY.forEach((card: UiCardItemData) => {
      expect(card.type).toBe('smallCard');
    });
  });

  it('gives every card the required fields populated', () => {
    [...LARGE_CARDLIST_ARRAY, ...SMALL_CARDLIST_ARRAY].forEach((card: UiCardItemData) => {
      expect(card.id).toEqual(expect.any(String));
      expect(card.id.length).toBeGreaterThan(0);
      expect(card.title).toEqual(expect.any(String));
      expect(card.text).toEqual(expect.any(String));
      expect(card.alt).toEqual(expect.any(String));
      expect(card.imageSrc).toBeDefined();
    });
  });

  it('uses unique ids across both demo arrays', () => {
    const ids: string[] = [...LARGE_CARDLIST_ARRAY, ...SMALL_CARDLIST_ARRAY].map(card => card.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
