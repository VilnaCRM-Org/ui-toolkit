import React from 'react';

import { resolveImageSrc } from '@/types/assets';

import type { ImageList } from '../../types';

// `item.alt` is a brand name (e.g. "Wix", "WordPress") — a proper noun that is
// intentionally NOT passed through i18next `t()`, unlike the translated alt
// keys used elsewhere. Translating it would echo the raw key / warn on a miss.
function ImageItem({ item }: Readonly<{ item: ImageList }>): React.ReactElement {
  return <img src={resolveImageSrc(item.image)} alt={item.alt} width={45} height={45} />;
}

export default ImageItem;
