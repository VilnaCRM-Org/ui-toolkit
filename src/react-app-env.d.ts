// Image imports resolve to a data-URI string under Storybook's webpack
// `asset/inline` rule and to a `{ src }` object under the Jest `svgMock`.
// Type them as the union both shapes satisfy instead of an implicit `any`
// (see src/types/assets.ts for the shared resolver).
declare module '*.png' {
  const src: string | { src: string };
  export default src;
}
declare module '*.svg' {
  const src: string | { src: string };
  export default src;
}
declare module '*.jpeg' {
  const src: string | { src: string };
  export default src;
}
declare module '*.jpg' {
  const src: string | { src: string };
  export default src;
}
declare module 'swiper/css';
declare module 'swiper/css/pagination';
