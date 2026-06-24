// Static image imports resolve to different shapes depending on the bundler:
// Storybook's webpack `asset/inline` rule yields a data-URI string, while the
// Jest `svg-mock` yields a `{ src }` object (mirroring a framework static
// import). Consumers must accept both shapes and normalize before use.
export type StaticImageSrc = string | { src: string };

export function resolveImageSrc(src: StaticImageSrc): string {
  return typeof src === 'string' ? src : src.src;
}
