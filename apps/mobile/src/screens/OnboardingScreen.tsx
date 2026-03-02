/**
 * Onboarding screen for the Buzzy Today mobile app.
 * Max 5 screens: 4 intro screens + 1 tag selection screen.
 * User must follow >= 3 tags before completing onboarding.
 * Does not reappear after completion.
 *
 * @module @buzzy/mobile/screens/OnboardingScreen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  useOnboardingStore,
  ONBOARDING_SCREENS,
  ONBOARDING_TOTAL_STEPS,
  MIN_FOLLOWED_TAGS,
} from '../stores/onboardingStore';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Popular starter tags for onboarding tag selection */
const STARTER_TAGS = [
  { id: 'tag-ai', name: 'Artificial Intelligence', category: 'tech' },
  { id: 'tag-climate', name: 'Climate Change', category: 'science' },
  { id: 'tag-crypto', name: 'Cryptocurrency', category: 'crypto' },
  { id: 'tag-nba', name: 'NBA', category: 'sports' },
  { id: 'tag-movies', name: 'Movies', category: 'entertainment' },
  { id: 'tag-election', name: 'Elections', category: 'politics' },
  { id: 'tag-stocks', name: 'Stock Market', category: 'money' },
  { id: 'tag-fitness', name: 'Fitness', category: 'health' },
  { id: 'tag-space', name: 'Space Exploration', category: 'science' },
  { id: 'tag-gaming', name: 'Gaming', category: 'entertainment' },
  { id: 'tag-startups', name: 'Startups', category: 'tech' },
  { id: 'tag-nfl', name: 'NFL', category: 'sports' },
  { id: 'tag-mental-health', name: 'Mental Health', category: 'health' },
  { id: 'tag-travel', name: 'Travel', category: 'lifestyle' },
  { id: 'tag-music', name: 'Music', category: 'entertainment' },
  { id: 'tag-ev', name: 'Electric Vehicles', category: 'tech' },
  { id: 'tag-real-estate', name: 'Real Estate', category: 'money' },
  { id: 'tag-soccer', name: 'Soccer', category: 'sports' },
] as const;

/**
 * A single selectable tag chip for the onboarding tag selection step.
 *
 * @param props - Tag chip props
 */
function TagChip({
  tag,
  isSelected,
  onToggle,
}: {
  tag: (typeof STARTER_TAGS)[number];
  isSelected: boolean;
  onToggle: () => void;
}) {
  const categoryColor = colors.category[tag.category] ?? colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.tagChip,
        isSelected && { backgroundColor: categoryColor, borderColor: categoryColor },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
        {tag.name}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Progress dots indicator.
 *
 * @param props - Step indicator props
 */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current && styles.dotActive]}
        />
      ))}
    </View>
  );
}

/**
 * Intro screen content (steps 0-3).
 *
 * @param props - Intro step props
 */
function IntroStep({ step }: { step: number }) {
  const screen = ONBOARDING_SCREENS[step];
  if (!screen) return null;

  return (
    <View style={styles.introContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>
          {screen.icon === 'swipe' && '\u2B06\uFE0F'}
          {screen.icon === 'lightning' && '\u26A1'}
          {screen.icon === 'filter' && '\uD83D\uDD0D'}
          {screen.icon === 'brain' && '\uD83E\uDDE0'}
          {screen.icon === 'tags' && '\uD83C\uDFF7\uFE0F'}
        </Text>
      </View>
      <Text style={styles.title}>{screen.title}</Text>
      {screen.subtitle ? (
        <Text style={styles.subtitle}>{screen.subtitle}</Text>
      ) : null}
      <Text style={styles.description}>{screen.description}</Text>
    </View>
  );
}

/**
 * Tag selection step (step 4).
 * User must select >= 3 tags.
 */
function TagSelectionStep() {
  const { followedTagIds, toggleTag } = useOnboardingStore();
  const screen = ONBOARDING_SCREENS[4];

  return (
    <View style={styles.tagSelectionContent}>
      <Text style={styles.title}>{screen?.title}</Text>
      <Text style={styles.subtitle}>{screen?.subtitle}</Text>
      <Text style={styles.tagCounter}>
        {followedTagIds.length} / {MIN_FOLLOWED_TAGS} selected
        {followedTagIds.length >= MIN_FOLLOWED_TAGS ? ' \u2714' : ''}
      </Text>
      <ScrollView
        style={styles.tagScrollView}
        contentContainerStyle={styles.tagGrid}
        showsVerticalScrollIndicator={false}
      >
        {STARTER_TAGS.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            isSelected={followedTagIds.includes(tag.id)}
            onToggle={() => toggleTag(tag.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Main onboarding screen component.
 * Shows 5 screens with navigation dots and Next/Skip buttons.
 */
export function OnboardingScreen() {
  const { currentStep, nextStep, prevStep, followedTagIds, completeOnboarding } =
    useOnboardingStore();

  const isLastStep = currentStep === ONBOARDING_TOTAL_STEPS - 1;
  const canComplete = followedTagIds.length >= MIN_FOLLOWED_TAGS;
  const isTagStep = currentStep === 4;

  const handleNext = useCallback(() => {
    if (isLastStep && canComplete) {
      // TODO: Send followed tags to API
      completeOnboarding();
    } else if (!isLastStep) {
      nextStep();
    }
  }, [isLastStep, canComplete, completeOnboarding, nextStep]);

  const handleSkipToTags = useCallback(() => {
    useOnboardingStore.getState().goToStep(4);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isTagStep ? <TagSelectionStep /> : <IntroStep step={currentStep} />}
      </View>

      <View style={styles.footer}>
        <StepIndicator current={currentStep} total={ONBOARDING_TOTAL_STEPS} />

        <View style={styles.buttons}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {!isTagStep && currentStep < 3 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipToTags}>
              <Text style={styles.skipButtonText}>Skip to Tags</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              isLastStep && !canComplete && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isLastStep && !canComplete}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? "Let's Go!" : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  introContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  tagSelectionContent: {
    flex: 1,
    width: '100%',
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  tagCounter: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tagScrollView: {
    flex: 1,
    width: '100%',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tagChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  skipButtonText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
});
