import type { BackgroundOptionGroup } from '@/components/ui-background-picker/types';
import type { SegmentedOption } from '@/components/ui-segmented-control/types';

// Board copy for the nine Story 3.7 follow-up controls (Figma's own strings),
// kept apart from `fixtures.ts` per that file's own budget precedent.

// The Figma "Название 1/2/3" thumbnails are byte-identical across all three
// rows (a single placeholder board-preview bitmap), so one inline SVG data
// URI stands in for the consumer's real board-preview art.
const PICKER_THUMB_SRC: string =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
  "<rect width='32' height='32' fill='%23D0D4D8'/></svg>";

// The board's own two groups: unlabelled board previews, then the «Колір» swatches.
export const PICKER_GROUPS: BackgroundOptionGroup[] = [
  {
    options: [
      { id: 'name-1', label: 'Назва 1', kind: 'image', src: PICKER_THUMB_SRC },
      { id: 'name-2', label: 'Назва 2', kind: 'image', src: PICKER_THUMB_SRC },
      { id: 'name-3', label: 'Назва 3', kind: 'image', src: PICKER_THUMB_SRC },
    ],
  },
  {
    heading: 'Колір',
    options: [
      { id: 'grey', label: 'Сірий', kind: 'color', color: '#E1E7EA' },
      { id: 'blue', label: 'Синій', kind: 'color', color: '#1EAEFF' },
      { id: 'dark', label: 'Темний', kind: 'color', color: '#1B2327' },
    ],
  },
];

export const OPTION_CARD_CAPTION: string = 'Analytics API';
export const OPTION_CARD_VALUE: string = 'Reporting';

export const CHEVRON_BUTTON_LABEL: string = 'Далі';
export const ADD_BUTTON_LABEL: string = 'Додати стовпець';
export const CLEAR_BUTTON_LABEL: string = 'Очистити фільтри';

export const COPY_FIELD_SAMPLE: string = '5POLGOPWQZFCCFEI';

export const SEGMENTED_LABEL: string = 'Період';
// Board B's own three period options, verbatim.
export const SEGMENTED_OPTIONS: SegmentedOption[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
];
