import React from 'react';

import { ImageList } from '../../types';

function ImageItem({ item }: { item: ImageList }): React.ReactElement {
  return <img src={item.image} alt={item.alt} width={45} height={45} />;
}

export default ImageItem;
