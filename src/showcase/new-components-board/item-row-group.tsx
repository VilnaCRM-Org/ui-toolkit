import { itemRowNode } from './nodes';
import {
  ROW_DELETE_HOVER_SX,
  ROW_GET_HOVER_SX,
  ROW_GREY_HOVER_SX,
  ROW_MOBILE_SX,
  ROW_POST_HOVER_SX,
  ROW_PUT_HOVER_SX,
} from './styles';
import type { GroupSpec } from './types';

export const ITEM_ROW_GROUPS: GroupSpec[] = [
  {
    title: 'Рядок ендпоінта (REST API)',
    width: 680,
    states: [
      {
        label: 'GET — Rest',
        node: itemRowNode({
          method: 'get',
          path: '/put/{petID}/uploadImage',
          description: 'Uploads an image',
        }),
      },
      {
        label: 'PUT — Rest',
        node: itemRowNode({ method: 'put', path: '/pet', description: 'Update existing pet' }),
      },
      {
        label: 'POST — Rest',
        node: itemRowNode({
          method: 'post',
          path: '/put/{petID}',
          description: 'Update existing pet',
        }),
      },
      {
        label: 'DELETE — Rest',
        node: itemRowNode({
          method: 'delete',
          path: '/delete/{petID}',
          description: 'Deletes existing pet',
        }),
      },
      {
        label: 'Grey — Rest',
        node: itemRowNode({
          method: 'get',
          path: '/put/{petID}/uploadImage',
          description: 'Uploads an image',
          muted: true,
        }),
      },
      {
        label: 'GET — Hover',
        node: itemRowNode({
          method: 'get',
          path: '/put/{petID}/uploadImage',
          description: 'Uploads an image',
          sx: ROW_GET_HOVER_SX,
        }),
      },
      {
        label: 'PUT — Hover',
        node: itemRowNode({
          method: 'put',
          path: '/pet',
          description: 'Update existing pet',
          sx: ROW_PUT_HOVER_SX,
        }),
      },
      {
        label: 'POST — Hover',
        node: itemRowNode({
          method: 'post',
          path: '/put/{petID}',
          description: 'Update existing pet',
          sx: ROW_POST_HOVER_SX,
        }),
      },
      {
        label: 'DELETE — Hover',
        node: itemRowNode({
          method: 'delete',
          path: '/delete/{petID}',
          description: 'Deletes existing pet',
          sx: ROW_DELETE_HOVER_SX,
        }),
      },
      {
        label: 'Grey — Hover',
        node: itemRowNode({
          method: 'get',
          path: '/put/{petID}/uploadImage',
          description: 'Uploads an image',
          muted: true,
          sx: ROW_GREY_HOVER_SX,
        }),
      },
      {
        label: 'Expanded',
        node: itemRowNode({
          method: 'post',
          path: '/put/{petID}',
          description: 'Update existing pet',
          expanded: true,
        }),
      },
      {
        label: 'Mobile',
        width: 345,
        node: itemRowNode({
          method: 'get',
          path: '/put/{petID}/uploadImage',
          description: 'Uploads an image',
          sx: ROW_MOBILE_SX,
        }),
      },
    ],
  },
];
