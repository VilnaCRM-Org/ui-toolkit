import { Box } from '@mui/material';

import styles from './styles';
import { UiImageProps } from './types';

function UiImage({ sx, alt, src }: UiImageProps): React.ReactElement {
  const imageUrl: string = typeof src === 'string' ? src : src.src;

  return (
    <Box sx={{ ...sx, ...styles.wrapper }}>
      <img alt={alt} src={imageUrl} loading="lazy" />
    </Box>
  );
}

export default UiImage;
