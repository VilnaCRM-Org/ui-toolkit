import type { SxProps, Theme } from '@mui/material';

export interface UiImageProps {
  sx?: SxProps<Theme>;
  /**
   * Image source — a URL string or a static import (`{ src }`). The type is
   * strict, but the component degrades gracefully on runtime data: a nullish
   * `src` (or a nullish resolved URL) renders the styled wrapper with **no**
   * `<img>` and logs a development-only `console.warn`. No image is emitted, so
   * no alternative text is owed for the missing content.
   */
  src: { src: string } | string;
  alt: string;
}
