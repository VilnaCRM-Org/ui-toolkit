import type { SxProps, Theme } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';

export interface UiSxAdapterRenderProps {
  className: string | undefined;
  style: CSSProperties | undefined;
}

export interface UiSxAdapterProps {
  sx?: SxProps<Theme> | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  inline?: boolean | undefined;
  children: (props: UiSxAdapterRenderProps) => ReactNode;
}
