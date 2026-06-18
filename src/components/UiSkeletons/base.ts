import { keyframes, Keyframes } from '@emotion/react';

export const shimmerAnimation: Keyframes = keyframes`
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 100% 0;
  }
`;

export const shimmerGradient: string = `linear-gradient(
  90deg,
  rgba(211, 216, 224, 0) 0%,
  rgba(211, 216, 224, 0.6) 49.13%,
  rgba(211, 216, 224, 0) 100%
)`;

export const SMALL_MOBILE_BREAKPOINT: number = 375;
export const SMALL_MOBILE_BREAKPOINT_UPPER: number = SMALL_MOBILE_BREAKPOINT + 1;
export const SKELETON_BORDER_RADIUS: string = '57px';
export const SKELETON_BORDER_COLOR: string = '#E1E7EA';

export const shadowPulseAnimation: Keyframes = keyframes`
  0% {
    box-shadow: 0px 7px 20px 0px rgba(211, 216, 224, 0.2);
  }
  100% {
    box-shadow: 0px 7px 60px 0px rgba(211, 216, 224, 0.8);
  }
`;

export const baseSkeletonStyle: {
  backgroundImage: string;
  backgroundSize: string;
  animation: string;
  '@media (prefers-reduced-motion: reduce)': { animation: string };
} = {
  backgroundImage: shimmerGradient,
  backgroundSize: '200% 100%',
  animation: `${shimmerAnimation} 1.5s ease-in-out infinite alternate`,
  // Honour the OS "reduce motion" preference (WCAG 2.3.3 / 2.2.2): every
  // skeleton primitive routes through this base, so one guard stops the
  // shimmer for all of them when the user opts out of motion.
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};
