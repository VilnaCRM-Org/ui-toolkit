import {
  SKELETON_BORDER_COLOR,
  SKELETON_BORDER_RADIUS,
  SMALL_MOBILE_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT_UPPER,
  baseSkeletonStyle,
  shadowPulseAnimation,
  shimmerAnimation,
  shimmerGradient,
} from '../../src/components/ui-skeletons';

// Story 4.1 (#24) — CRM skeleton parity lock.
//
// Baseline: crm@0057d7845923b5f32fce7f276d384cdfcab5156c,
// `src/components/skeletons/base/styles.ts`. Every literal below is the CRM
// original. PRD §3.4 makes skeleton animation parity release-blocking, so a
// failure here is a contract break to revert — never a value to re-baseline.

const CRM_SHIMMER_GRADIENT: string = `linear-gradient(
  90deg,
  rgba(211, 216, 224, 0) 0%,
  rgba(211, 216, 224, 0.6) 49.13%,
  rgba(211, 216, 224, 0) 100%
)`;

const CRM_TIMING: RegExp = / 1\.5s ease-in-out infinite alternate$/;

const CRM_SHIMMER_STOPS: string =
  '{ 0% { background-position: 0% 0; } 100% { background-position: 100% 0; } }';

const CRM_PULSE_STOPS: string =
  '{ 0% { box-shadow: 0px 7px 20px 0px rgba(211, 216, 224, 0.2); } ' +
  '100% { box-shadow: 0px 7px 60px 0px rgba(211, 216, 224, 0.8); } }';

// Emotion serialises keyframes with the authored indentation; collapsing runs
// of whitespace keeps the lock on the declarations rather than on formatting.
function normalizeCss(styles: string): string {
  return styles.replace(/\s+/g, ' ').trim();
}

describe('skeleton CRM parity lock', () => {
  describe('shimmer gradient', () => {
    it('matches the CRM gradient string exactly', () => {
      expect(shimmerGradient).toBe(CRM_SHIMMER_GRADIENT);
    });
  });

  describe('base skeleton style', () => {
    it('paints the shimmer gradient across a double-width background', () => {
      expect(baseSkeletonStyle.backgroundImage).toBe(shimmerGradient);
      expect(baseSkeletonStyle.backgroundSize).toBe('200% 100%');
    });

    it('drives the shimmer keyframes on the CRM timing', () => {
      expect(baseSkeletonStyle.animation).toMatch(CRM_TIMING);
    });

    it('names the shimmer keyframes, not the shadow pulse', () => {
      expect(baseSkeletonStyle.animation.startsWith(String(shimmerAnimation))).toBe(true);
      expect(baseSkeletonStyle.animation).toContain(shimmerAnimation.name);
      expect(baseSkeletonStyle.animation).not.toContain(shadowPulseAnimation.name);
    });

    it('stops the animation when the OS asks for reduced motion', () => {
      expect(baseSkeletonStyle['@media (prefers-reduced-motion: reduce)']).toEqual({
        animation: 'none',
      });
    });
  });

  describe('keyframes', () => {
    it('keeps the CRM shimmer stops', () => {
      expect(normalizeCss(shimmerAnimation.styles)).toBe(
        `@keyframes ${shimmerAnimation.name}${CRM_SHIMMER_STOPS}`
      );
    });

    it('keeps the CRM shadow-pulse stops', () => {
      expect(normalizeCss(shadowPulseAnimation.styles)).toBe(
        `@keyframes ${shadowPulseAnimation.name}${CRM_PULSE_STOPS}`
      );
    });
  });

  describe('layout constants', () => {
    it('keeps the CRM border radius and colour', () => {
      expect(SKELETON_BORDER_RADIUS).toBe('57px');
      expect(SKELETON_BORDER_COLOR).toBe('#E1E7EA');
    });

    it('keeps the CRM small-mobile breakpoint pair', () => {
      expect(SMALL_MOBILE_BREAKPOINT).toBe(375);
      expect(SMALL_MOBILE_BREAKPOINT_UPPER).toBe(376);
    });
  });
});
