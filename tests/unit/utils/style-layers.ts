/**
 * Every `*Sx` factory in the toolkit is typed as the broad `SxProps` union but
 * in practice always returns the `[base, ...consumerSx]` array. These two
 * aliases narrow it once so the layer assertions can index into the produced
 * style objects instead of casting at every call site.
 */
export type StyleObject = Record<string, unknown>;
export type SxLayers = StyleObject[];

/** The selector keys of `base` containing `fragment`, in declaration order. */
export function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}
