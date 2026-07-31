// The seven Board A action glyphs, lifted verbatim from the Figma vectors (rest
// column nodes 439:19830 / 439:19860 / 451:25809 / 451:25817 / 451:26186 /
// 632:46703). Every one is stroke-only — `fill="none"`, round caps and joins,
// `currentColor` so the button that holds it owns the per-lane ink ramp — and the
// paths are byte-identical across all four Figma state columns: nothing but the
// stroke colour changes between rest, hover, active and disabled.
//
// The `d` strings are assembled from whitespace-split fragments joined with a
// single space, because SVG treats runs of whitespace as coordinate separators
// and the 100-column line limit cannot hold them whole. Splitting only ever
// happens at an existing space, so the joined result is the original path.
//
// Six of the seven live in the shared 24-unit space; `settings-04` keeps its
// native 30-unit viewBox (stroke 2.5), which resolves to exactly 2 once rendered
// into the same 24px slot — see `action-glyph.tsx`.

/** `x-close` — two crossing strokes, one path. */
export const X_CLOSE_PATH: string = 'M18 6L6 18M6 6L18 18';

/** `dots-horizontal` — three 1-unit circles stroked at 2, centres x = 5/12/19, y = 12. */
export const DOTS_HORIZONTAL_PATHS: readonly string[] = [
  [
    'M12 13C12.55228 13 13 12.55228 13 12C13 11.44772 12.55228 11 12 11C11.44772 11 11 11.44772',
    '11 12C11 12.55228 11.44772 13 12 13Z',
  ].join(' '),
  [
    'M19 13C19.5523 13 20 12.55228 20 12C20 11.44772 19.5523 11 19 11C18.4477 11 18 11.44772 18',
    '12C18 12.55228 18.4477 13 19 13Z',
  ].join(' '),
  [
    'M5 13C5.55228 13 6 12.55228 6 12C6 11.44772 5.55228 11 5 11C4.44772 11 4 11.44772 4 12C4',
    '12.55228 4.44772 13 5 13Z',
  ].join(' '),
];

/** `dots-vertical` — the same three circles, centres x = 12, y = 5/12/19. */
export const DOTS_VERTICAL_PATHS: readonly string[] = [
  [
    'M12 13C12.55228 13 13 12.55228 13 12C13 11.44772 12.55228 11 12 11C11.44772 11 11 11.44772',
    '11 12C11 12.55228 11.44772 13 12 13Z',
  ].join(' '),
  [
    'M12 6C12.55228 6 13 5.55228 13 5C13 4.44772 12.55228 4 12 4C11.44772 4 11 4.44772 11 5C11',
    '5.55228 11.44772 6 12 6Z',
  ].join(' '),
  [
    'M12 20C12.55228 20 13 19.5523 13 19C13 18.4477 12.55228 18 12 18C11.44772 18 11 18.4477 11',
    '19C11 19.5523 11.44772 20 12 20Z',
  ].join(' '),
];

/** `eye` — the lid outline first, then the pupil. */
export const EYE_PATHS: readonly string[] = [
  [
    'M2.42012 12.71318C2.28394 12.49754 2.21584 12.38972 2.17772 12.22342C2.14909 12.0985 2.14909',
    '11.9015 2.17772 11.77658C2.21584 11.61028 2.28394 11.50246 2.42012 11.28682C3.54553 9.50484',
    '6.8954 5 12 5C17.10545 5 20.45525 9.50484 21.58065 11.28682C21.71685 11.50246 21.78495',
    '11.61028 21.82305 11.77658C21.85175 11.9015 21.85175 12.0985 21.82305 12.22342C21.78495',
    '12.38972 21.71685 12.49754 21.58065 12.71318C20.45525 14.4952 17.10545 19 12 19C6.8954 19',
    '3.54553 14.4952 2.42012 12.71318Z',
  ].join(' '),
  [
    'M12 15C13.65725 15 15.00045 13.65685 15.00045 12C15.00045 10.34315 13.65725 9 12 9C10.34355',
    '9 9.0004 10.34315 9.0004 12C9.0004 13.65685 10.34355 15 12 15Z',
  ].join(' '),
];

/**
 * `eye-off` — one compound path: the broken lid arcs, the pupil arc and the
 * `M3 3L21 21` slash. Its ink is 20 tall against the eye's 16, so both stay
 * centred in the same 24x24 slot (Figma: eye vector y=5, eye-off y=3).
 */
export const EYE_OFF_PATH: string = [
  'M10.74294 5.09232C11.14936 5.03223 11.56865 5 12 5C17.10545 5 20.45525 9.50484 21.58065',
  '11.28682C21.71695 11.5025 21.78505 11.61034 21.82315 11.77667C21.85175 11.90159 21.85175',
  '12.0987 21.82305 12.2236C21.78495 12.3899 21.71635 12.4985 21.57915 12.7156C21.27935 13.1901',
  '20.82215 13.8571 20.21645 14.5805M6.72432 6.71504C4.56225 8.1817 3.09445 10.21938 2.42111',
  '11.28528C2.28428 11.50187 2.21587 11.61016 2.17774 11.77648C2.1491 11.9014 2.14909 12.0984',
  '2.17771 12.2234C2.21583 12.3897 2.28393 12.4975 2.42013 12.7132C3.54554 14.4952 6.89541 19 12',
  '19C14.05885 19 15.83185 18.2676 17.28885 17.2766M3 3L21 21M9.8791 9.87868C9.3362 10.42157',
  '9.00042 11.17157 9.00042 12C9.00042 13.6569 10.34356 15 12 15C12.82885 15 13.57885 14.6642',
  '14.12175 14.1213',
].join(' ');

/** `settings-04` — native 30-unit viewBox, stroke 2.5 (two sliders). */
export const SETTINGS_PATH: string = [
  'M3.75 10L18.75 10M18.75 10C18.75 12.07107 20.4289 13.75 22.5 13.75C24.5711 13.75 26.25',
  '12.07107 26.25 10C26.25 7.92893 24.5711 6.25 22.5 6.25C20.4289 6.25 18.75 7.92893 18.75',
  '10ZM11.25 20L26.25 20M11.25 20C11.25 22.0711 9.57107 23.75 7.5 23.75C5.42893 23.75 3.75',
  '22.0711 3.75 20C3.75 17.9289 5.42893 16.25 7.5 16.25C9.57107 16.25 11.25 17.9289 11.25 20Z',
].join(' ');

/** `trash-02` — lid handle, lid bar and body in one path; the H/V commands are
 *  the Figma export's own and are deliberately not normalised. */
export const TRASH_PATH: string = [
  'M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.7157 15.2843 2.40974 14.908',
  '2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.07989 2 9.51984 2 9.09202 2.21799C8.71569 2.40974',
  '8.40973 2.7157 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M3 6H21M19 6V17.2C19 18.8802 19',
  '19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2',
  '22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5',
  '19.7202 5 18.8802 5 17.2V6',
].join(' ');
