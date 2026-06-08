import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import React from 'react';

import UiSkeletonBlock from '../UiSkeletonBlock';
import UiSkeletonButton from '../UiSkeletonButton';
import UiSkeletonInput from '../UiSkeletonInput';
import UiSkeletonText from '../UiSkeletonText';

import styles from './styles';

const SOCIAL_BUTTONS = [
  { id: 'google' },
  { id: 'facebook' },
  { id: 'apple' },
  { id: 'linkedin' },
] as const;

const STATIC_SX = { animation: 'none', backgroundSize: '100% 100%' } as const;

export type AuthSkeletonProps = {
  disableAnimation?: boolean;
  ariaLabel?: string;
};

type Wrap = <T extends object>(baseSx: T) => (T | typeof STATIC_SX)[];

const buildWrap =
  (disableAnimation: boolean): Wrap =>
  (baseSx) =>
    disableAnimation ? [baseSx, STATIC_SX] : [baseSx];

function TitleBlock({ wrap }: { wrap: Wrap }): React.ReactElement {
  return (
    <>
      <UiSkeletonText id="auth-skeleton-title" size="l" sx={wrap(styles.titleSkeleton)} />
      <Box sx={styles.subtitleWrapper}>
        <UiSkeletonText id="auth-skeleton-subtitle" size="m" sx={wrap(styles.subtitleFirstLine)} />
        <UiSkeletonText
          id="auth-skeleton-subtitle-line2"
          size="m"
          sx={wrap(styles.subtitleSecondLine)}
        />
      </Box>
    </>
  );
}

function FieldRows({
  wrap,
  disableAnimation,
}: {
  wrap: Wrap;
  disableAnimation: boolean;
}): React.ReactElement {
  return (
    <>
      {[1, 2, 3].map((id) => (
        <Box key={id} sx={id === 3 ? styles.lastFieldContainer : styles.fieldContainer}>
          <UiSkeletonText
            id={`auth-skeleton-field-label-${id}`}
            size="l"
            sx={wrap(styles.fieldLabel)}
          />
          <UiSkeletonInput disableAnimation={disableAnimation} id={`auth-skeleton-input-${id}`} />
        </Box>
      ))}
    </>
  );
}

function SocialBlocks({ wrap }: { wrap: Wrap }): React.ReactElement {
  return (
    <Box sx={styles.socialContainer}>
      {SOCIAL_BUTTONS.map((button) => (
        <UiSkeletonBlock
          id={`auth-skeleton-social-${button.id}`}
          key={button.id}
          sx={wrap(styles.socialButton)}
        />
      ))}
    </Box>
  );
}

function DividerBlock({ wrap }: { wrap: Wrap }): React.ReactElement {
  return (
    <Divider id="auth-skeleton-divider" role="presentation" sx={styles.divider}>
      <UiSkeletonText id="auth-skeleton-divider-text" size="l" sx={wrap(styles.dividerText)} />
    </Divider>
  );
}

function FormBody({
  wrap,
  disableAnimation,
}: {
  wrap: Wrap;
  disableAnimation: boolean;
}): React.ReactElement {
  return (
    <Box sx={wrap({ ...styles.formWrapper, ...styles.formWrapperPulse })}>
      <TitleBlock wrap={wrap} />
      <FieldRows wrap={wrap} disableAnimation={disableAnimation} />
      <UiSkeletonButton id="auth-skeleton-submit" sx={wrap(styles.buttonSkeleton)} />
      <DividerBlock wrap={wrap} />
      <SocialBlocks wrap={wrap} />
    </Box>
  );
}

export default function AuthSkeleton({
  disableAnimation = false,
  ariaLabel = 'Loading form',
}: AuthSkeletonProps): React.ReactElement {
  const wrap = buildWrap(disableAnimation);

  return (
    <Box component="section" aria-label={ariaLabel} sx={styles.formSection}>
      <FormBody wrap={wrap} disableAnimation={disableAnimation} />
      <UiSkeletonText id="auth-skeleton-switcher" size="l" sx={wrap(styles.switcherSkeleton)} />
    </Box>
  );
}
