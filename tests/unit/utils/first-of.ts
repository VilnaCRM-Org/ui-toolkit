import nthOf from './nth-of';

/** The first element of a collection the surrounding test has already rendered. */
export default function firstOf<T>(items: readonly T[]): T {
  return nthOf(items, 0);
}
