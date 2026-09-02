import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';
import UiSkeletonButton from '../ui-skeleton-button';
import UiSkeletonInput from '../ui-skeleton-input';
import UiSkeletonText from '../ui-skeleton-text';
import { ComposedSkeleton } from '../ui-skeletons';

import styles from './styles';

const SOCIAL_BUTTONS: readonly { readonly id: string }[] = [
  { id: 'google' },
  { id: 'facebook' },
  { id: 'apple' },
  { id: 'linkedin' },
] as const;

const STATIC_SX: { readonly animation: 'none'; readonly backgroundSize: '100% 100%' } = {
  animation: 'none',
  backgroundSize: '100% 100%',
} as const;

export type AuthSkeletonProps = {
  disableAnimation?: boolean;
  /**
   * Visually-hidden loading text for the busy container. Pass a localized
   * string in consuming apps. The skeleton only marks state (`aria-busy` plus
   * this hidden text); announcing that loading finished is the consumer's job,
   * via one persistent `role="status"` region per view — `aria-busy` is a
   * state marker, not a notification, and the shapes themselves are decorative.
   */
  ariaLabel?: string;
};

type Wrap = <T extends object>(baseSx: T) => (T | typeof STATIC_SX)[];

/** `uid` prefixes every rendered id so two skeletons never collide in the DOM. */
type PartProps = { wrap: Wrap; uid: string };

type BodyProps = PartProps & { disableAnimation: boolean };

const buildWrap: (disableAnimation: boolean) => Wrap =
  (disableAnimation: boolean): Wrap =>
  baseSx =>
    disableAnimation ? [baseSx, STATIC_SX] : [baseSx];

function TitleBlock({ wrap, uid }: PartProps): React.ReactElement {
  return (
    <>
      <UiSkeletonText id={`${uid}auth-skeleton-title`} size="l" sx={wrap(styles.titleSkeleton)} />
      <Box sx={styles.subtitleWrapper}>
        <UiSkeletonText
          id={`${uid}auth-skeleton-subtitle`}
          size="m"
          sx={wrap(styles.subtitleFirstLine)}
        />
        <UiSkeletonText
          id={`${uid}auth-skeleton-subtitle-line2`}
          size="m"
          sx={wrap(styles.subtitleSecondLine)}
        />
      </Box>
    </>
  );
}

function FieldRows({ wrap, uid, disableAnimation }: BodyProps): React.ReactElement {
  return (
    <>
      {[1, 2, 3].map(id => (
        <Box key={id} sx={id === 3 ? styles.lastFieldContainer : styles.fieldContainer}>
          <UiSkeletonText
            id={`${uid}auth-skeleton-field-label-${id}`}
            size="l"
            sx={wrap(styles.fieldLabel)}
          />
          <UiSkeletonInput
            disableAnimation={disableAnimation}
            id={`${uid}auth-skeleton-input-${id}`}
          />
        </Box>
      ))}
    </>
  );
}

function SocialBlocks({ wrap, uid }: PartProps): React.ReactElement {
  return (
    <Box sx={styles.socialContainer}>
      {SOCIAL_BUTTONS.map(button => (
        <UiSkeletonBlock
          id={`${uid}auth-skeleton-social-${button.id}`}
          key={button.id}
          sx={wrap(styles.socialButton)}
        />
      ))}
    </Box>
  );
}

function DividerBlock({ wrap, uid }: PartProps): React.ReactElement {
  return (
    <Divider role="presentation" sx={styles.divider}>
      <UiSkeletonText
        id={`${uid}auth-skeleton-divider-text`}
        size="l"
        sx={wrap(styles.dividerText)}
      />
    </Divider>
  );
}

function FormBody({ wrap, uid, disableAnimation }: BodyProps): React.ReactElement {
  return (
    <Box sx={wrap({ ...styles.formWrapper, ...styles.formWrapperPulse })}>
      <TitleBlock wrap={wrap} uid={uid} />
      <FieldRows wrap={wrap} uid={uid} disableAnimation={disableAnimation} />
      <UiSkeletonButton id={`${uid}auth-skeleton-submit`} sx={wrap(styles.buttonSkeleton)} />
      <DividerBlock wrap={wrap} uid={uid} />
      <SocialBlocks wrap={wrap} uid={uid} />
    </Box>
  );
}

export default function AuthSkeleton({
  disableAnimation = false,
  ariaLabel = 'Loading form',
}: AuthSkeletonProps): React.ReactElement {
  const wrap: Wrap = buildWrap(disableAnimation);
  const uid: string = React.useId();

  return (
    <ComposedSkeleton loadingText={ariaLabel} sx={styles.formSection}>
      <FormBody wrap={wrap} uid={uid} disableAnimation={disableAnimation} />
      <UiSkeletonText
        id={`${uid}auth-skeleton-switcher`}
        size="l"
        sx={wrap(styles.switcherSkeleton)}
      />
    </ComposedSkeleton>
  );
}
