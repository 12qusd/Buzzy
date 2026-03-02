/**
 * Onboarding state store for the Buzzy Today mobile app.
 * Tracks onboarding completion and selected tags.
 * Persists completion flag so onboarding doesn't reappear.
 *
 * @module @buzzy/mobile/stores/onboardingStore
 */

import { create } from 'zustand';

/** Onboarding store state */
interface OnboardingState {
  /** Whether onboarding has been completed */
  isComplete: boolean;
  /** Current onboarding step index (0-4) */
  currentStep: number;
  /** Tag IDs the user has followed during onboarding */
  followedTagIds: string[];

  /** Advance to next step */
  nextStep: () => void;
  /** Go back to previous step */
  prevStep: () => void;
  /** Jump to a specific step */
  goToStep: (step: number) => void;
  /** Toggle following a tag */
  toggleTag: (tagId: string) => void;
  /** Mark onboarding as complete */
  completeOnboarding: () => void;
  /** Reset onboarding (for testing) */
  resetOnboarding: () => void;
}

/** Total number of onboarding screens */
export const ONBOARDING_TOTAL_STEPS = 5;

/** Minimum tags the user must follow before completing onboarding */
export const MIN_FOLLOWED_TAGS = 3;

/**
 * Onboarding content for each screen.
 */
export const ONBOARDING_SCREENS = [
  {
    title: 'Swipe through today\'s buzz',
    subtitle: 'one story at a time',
    description: 'Vertical swipe to browse today\'s top stories. Each card gives you the full picture in seconds.',
    icon: 'swipe',
  },
  {
    title: 'Get the facts fast',
    subtitle: '',
    description: 'Every story is summarized with a TL;DR, key takeaways, and the Buzzy Take — so you\'re always in the know.',
    icon: 'lightning',
  },
  {
    title: 'News without the noise',
    subtitle: 'is in TL;DDR',
    description: 'No clickbait, no endless scrolling. Just the stories that matter, presented clearly.',
    icon: 'filter',
  },
  {
    title: 'Understanding seconds',
    subtitle: 'built around you',
    description: 'The more you read, the smarter your feed gets. We learn what you like and show you more of it.',
    icon: 'brain',
  },
  {
    title: 'Follow topics',
    subtitle: 'We\'ll handle the rest.',
    description: 'Pick at least 3 topics to get started. You can always change these later.',
    icon: 'tags',
    isTagSelection: true,
  },
] as const;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isComplete: false,
  currentStep: 0,
  followedTagIds: [],

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, ONBOARDING_TOTAL_STEPS - 1),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  goToStep: (step: number) =>
    set({ currentStep: Math.max(0, Math.min(step, ONBOARDING_TOTAL_STEPS - 1)) }),

  toggleTag: (tagId: string) =>
    set((state) => {
      const exists = state.followedTagIds.includes(tagId);
      return {
        followedTagIds: exists
          ? state.followedTagIds.filter((id) => id !== tagId)
          : [...state.followedTagIds, tagId],
      };
    }),

  completeOnboarding: () =>
    set({ isComplete: true }),

  resetOnboarding: () =>
    set({ isComplete: false, currentStep: 0, followedTagIds: [] }),
}));
