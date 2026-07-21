// The continuous faint-blue range band Figma draws behind each week row. Because
// the seven day circles are laid out `justify-between`, the band edges are derived
// from the circle centres, not the cell boxes — pure geometry, kept out of the
// styling and view-model modules so each stays under the complexity budget.
import { BAND, CIRCLE_PX, GRID_PX, type CalendarSize } from './styles';
import type { CellDescriptor, DayDescriptor } from './view-model';

// The px centre of the day circle in column `col`, given a `w`-wide justify-between
// row: the first centre is at 12px, the last at `w−12`, evenly spread between.
function circleCenter(col: number, w: number): number {
  return col * ((w - CIRCLE_PX) / 6) + CIRCLE_PX / 2;
}

function isBanded(cell: CellDescriptor): boolean {
  return cell.kind === 'day' && cell.bandSide !== 'none';
}

// `[leftPx, rightPx]` of the continuous range band across one week row, or null.
// The band reaches a row edge when the range continues past it (into the next/
// previous row) and stops at an endpoint circle's centre when it begins/ends here.
function bandEdges(cells: readonly CellDescriptor[], w: number): [number, number] | null {
  const first: number = cells.findIndex(isBanded);
  if (first < 0) return null;
  const last: number = cells.reduce((acc, cell, i) => (isBanded(cell) ? i : acc), first);
  const startsHere: boolean = (cells[first] as DayDescriptor).bandSide === 'right';
  const endsHere: boolean = (cells[last] as DayDescriptor).bandSide === 'left';
  return [startsHere ? circleCenter(first, w) : 0, endsHere ? circleCenter(last, w) : w];
}

/** The continuous faint-blue range band drawn behind one week row (Figma). Stops
 * are percentages so the band scales when the grid goes fluid on narrow screens. */
export default function rowBandBackground(
  cells: readonly CellDescriptor[],
  size: CalendarSize
): string {
  const w: number = GRID_PX[size];
  const edges: [number, number] | null = bandEdges(cells, w);
  // `none` (not `transparent`) so it is a valid `background-image` for the row —
  // `dayRowSx` applies the band via the longhand image props, not the shorthand.
  if (edges == null) return 'none';
  const start: number = (edges[0] / w) * 100;
  const end: number = (edges[1] / w) * 100;
  const head: string = `transparent ${start}%, ${BAND} ${start}%`;
  const tail: string = `${BAND} ${end}%, transparent ${end}%`;
  return `linear-gradient(to right, ${head}, ${tail})`;
}
