import { Toolbar } from '@mui/material';
import React from 'react';

import { toolbarSx } from './styles';

export interface UiToolbarProps {
  children: React.ReactNode;
}

function UiToolbar({ children }: UiToolbarProps): React.ReactElement {
  return <Toolbar sx={toolbarSx}>{children}</Toolbar>;
}

export default UiToolbar;
