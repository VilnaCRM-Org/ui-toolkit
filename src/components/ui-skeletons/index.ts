// Public entry for the shared skeleton style primitives. The skeleton
// components (UiSkeleton*, AuthSkeleton) consume these shared shimmer
// animations, base styles, and constants through this barrel rather than
// reaching into ./base directly (components-public-api boundary rule).
export * from './base';
