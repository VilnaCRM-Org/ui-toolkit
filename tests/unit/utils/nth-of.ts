/**
 * The element at `index` of a collection the surrounding test has already
 * rendered.
 *
 * `noUncheckedIndexedAccess` types every index read as `T | undefined`, which is
 * right for source but noise in a test that is *about* the node it just put on
 * screen. This asserts that expectation once, loudly, instead of casting it away
 * at every call site.
 */
export default function nthOf<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`expected a match at index ${index}, found none`);
  }
  return item;
}
