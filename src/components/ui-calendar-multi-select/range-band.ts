// The continuous faint-blue range band Figma draws behind each week row. Because
// the seven day circles are laid out `justify-between`, the band edges are derived
// from the circle centres, not the cell boxes — pure geometry, kept out of the
// styling and view-model modules so each stays under the complexity budget.
import { BAND, CIRCLE_PX } from './styles';
import type { CellDescriptor, DayDescriptor } from './view-model';

// The CSS position of the day circle's centre in column `col` of a justify-between
// row: a percentage of the *actual* rendered width plus the fixed half-circle inset,
// combined via `calc()` so the 12px inset does NOT scale with the grid. A plain
// percentage of the design width drifts the endpoints off the circles once the grid
// goes fluid. The first centre resolves to 12px, the last to `100% − 12px`.
function circleCenter(col: number): string {
  return `calc(${(col / 6) * 100}% + ${CIRCLE_PX / 2}px - ${(col * CIRCLE_PX) / 6}px)`;
}

function isBanded(cell: CellDescriptor): boolean {
  return cell.kind === 'day' && cell.bandSide !== 'none';
}

// The `[left, right]` CSS stops of the continuous range band across one week row, or
// null. The band reaches a row edge (`0%`/`100%`) when the range continues past it
// (into the next/previous row) and stops at an endpoint circle's centre when it
// begins/ends here.
function bandEdges(cells: readonly CellDescriptor[]): [string, string] | null {
  const first: number = cells.findIndex(isBanded);
  if (first < 0) return null;
  const last: number = cells.reduce((acc, cell, i) => (isBanded(cell) ? i : acc), first);
  const startsHere: boolean = (cells[first] as DayDescriptor).bandSide === 'right';
  const endsHere: boolean = (cells[last] as DayDescriptor).bandSide === 'left';
  return [startsHere ? circleCenter(first) : '0%', endsHere ? circleCenter(last) : '100%'];
}

/** The continuous faint-blue range band drawn behind one week row (Figma). Each stop
 * mixes a percentage with the fixed circle inset via `calc()`, so the endpoints stay
 * on the circles even when the grid goes fluid on narrow screens. */
export default function rowBandBackground(cells: readonly CellDescriptor[]): string {
  const edges: [string, string] | null = bandEdges(cells);
  // `none` (not `transparent`) so it is a valid `background-image` for the row —
  // `dayRowSx` applies the band via the longhand image props, not the shorthand.
  if (edges == null) return 'none';
  const [start, end]: [string, string] = edges;
  const head: string = `transparent ${start}, ${BAND} ${start}`;
  const tail: string = `${BAND} ${end}, transparent ${end}`;
  return `linear-gradient(to right, ${head}, ${tail})`;
}
