const UNITS: readonly string[] = ['B', 'KB', 'MB', 'GB', 'TB'];
const STEP: number = 1024;

/**
 * Renders a byte count the way a size limit is written in the UI ("2 MB"), so
 * the validation message quotes the constraint in the same units the consumer
 * documented it in. Uses binary steps (1 KB = 1024 B) to match how operating
 * systems report file sizes in the picker the user just came from.
 */
export function formatBytes(bytes: number): string {
  let value: number = bytes;
  let unit: number = 0;
  while (value >= STEP && unit < UNITS.length - 1) {
    value /= STEP;
    unit += 1;
  }
  return `${Math.round(value * 10) / 10} ${UNITS[unit]}`;
}
