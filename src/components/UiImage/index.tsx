import { Box } from '@mui/material';

import styles from './styles';
import { UiImageProps } from './types';

function UiImage({ sx, alt, src }: UiImageProps): React.ReactElement {
  return (
    <Box sx={{ ...sx, ...styles.wrapper }}>
      <img alt={alt} src={src} width={80} height={80} loading="lazy" />
    </Box>
  );
}

export default UiImage;
