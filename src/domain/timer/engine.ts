import type { BlindLevel } from "@/domain/types/tournament.types";

/**
 * Canonical tournament timeline.
 *
 * This structure is the persistable source of truth used to reconstruct
 * timer state after refresh, pause/resume, or tab visibility changes.
 */
type TimerTimeline = {
  startedAtMs: number | null;
  pausedAtMs: number | null;
  totalPausedMs: number;
  elapsedOffsetMs: number;
};

/**
 * Derived timer state ready to display in the UI.
 */
type DerivedTimerState = {
  currentLevel: number;
  timeRemaining: number;
  elapsedTotalSeconds: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Converts blind levels into durations in seconds for the timer engine.
 *
 * Each level is clamped to at least 1 second to avoid invalid zero-duration
 * transitions and division-by-zero edge cases.
 *
 * @param blindLevels Tournament blind structure.
 * @returns Level durations in seconds.
 */
const getDurationByLevelInSeconds = (blindLevels: BlindLevel[]) =>
  blindLevels.map((level) => Math.max(level.duration * 60, 1));

/**
 * Computes cumulative durations to quickly locate the active level.
 *
 * Example: levels [600, 600, 900] -> cumulative [0, 600, 1200, 2100].
 *
 * @param blindLevels Tournament blind structure.
 * @returns Per-level durations and cumulative second boundaries.
 */
const getCumulativeDurationsInSeconds = (blindLevels: BlindLevel[]) => {
  const durations = getDurationByLevelInSeconds(blindLevels);
  const cumulative: number[] = [0];

  for (const duration of durations) {
    cumulative.push(cumulative[cumulative.length - 1] + duration);
  }

  return { durations, cumulative };
};

/**
 * Computes raw elapsed time since start, excluding manual offset.
 *
 * The calculation subtracts:
 * - already consolidated pause duration (`totalPausedMs`)
 * - current ongoing pause duration when paused (`pausedAtMs`)
 *
 * @param nowMs Current timestamp in milliseconds.
 * @param timeline Canonical tournament timeline.
 * @returns Raw elapsed milliseconds, clamped to 0.
 */
const getBaseElapsedMs = (nowMs: number, timeline: TimerTimeline) => {
  if (timeline.startedAtMs === null) return 0;

  const ongoingPauseMs = timeline.pausedAtMs
    ? Math.max(nowMs - timeline.pausedAtMs, 0)
    : 0;

  return Math.max(
    nowMs - timeline.startedAtMs - timeline.totalPausedMs - ongoingPauseMs,
    0,
  );
};

/**
 * Computes effective elapsed time including manual level-jump offset.
 *
 * The offset keeps timeline continuity while allowing operator actions such as
 * nextLevel and prevLevel.
 *
 * @param nowMs Current timestamp in milliseconds.
 * @param timeline Canonical tournament timeline.
 * @returns Effective elapsed milliseconds, clamped to 0.
 */
export const getEffectiveElapsedMs = (nowMs: number, timeline: TimerTimeline) =>
  Math.max(getBaseElapsedMs(nowMs, timeline) + timeline.elapsedOffsetMs, 0);

/**
 * Derives the current level and remaining time from elapsed seconds.
 *
 * Rules:
 * - If there are no levels, returns a neutral state.
 * - If elapsed time exceeds total structure duration, pins to the last level
 *   with zero remaining time.
 *
 * @param elapsedSeconds Total elapsed time in seconds.
 * @param blindLevels Tournament blind structure.
 * @returns Derived state ready for UI rendering.
 */
export const deriveTimerState = (
  elapsedSeconds: number,
  blindLevels: BlindLevel[],
): DerivedTimerState => {
  const totalLevels = blindLevels.length;

  if (totalLevels === 0) {
    return {
      currentLevel: 0,
      timeRemaining: 0,
      elapsedTotalSeconds: Math.max(elapsedSeconds, 0),
    };
  }

  const { durations, cumulative } =
    getCumulativeDurationsInSeconds(blindLevels);
  const totalDuration = cumulative[cumulative.length - 1];

  if (elapsedSeconds >= totalDuration) {
    return {
      currentLevel: totalLevels - 1,
      timeRemaining: 0,
      elapsedTotalSeconds: elapsedSeconds,
    };
  }

  let levelIndex = 0;
  for (let i = 0; i < totalLevels; i += 1) {
    const startsAt = cumulative[i];
    const endsAt = startsAt + durations[i];
    if (elapsedSeconds >= startsAt && elapsedSeconds < endsAt) {
      levelIndex = i;
      break;
    }
  }

  const levelEnd = cumulative[levelIndex] + durations[levelIndex];
  const timeRemaining = Math.max(levelEnd - elapsedSeconds, 0);

  return {
    currentLevel: levelIndex,
    timeRemaining,
    elapsedTotalSeconds: elapsedSeconds,
  };
};

/**
 * Computes the offset required to reposition the timeline to a target level.
 *
 * Used for manual level jumps while preserving timeline semantics as the
 * single source of truth.
 *
 * @param nowMs Current timestamp in milliseconds.
 * @param targetLevel Target level index (clamped to valid bounds).
 * @param blindLevels Tournament blind structure.
 * @param timeline Canonical tournament timeline.
 * @returns Offset in milliseconds to store in elapsedOffsetMs.
 */
export const getElapsedOffsetForTargetLevel = (
  nowMs: number,
  targetLevel: number,
  blindLevels: BlindLevel[],
  timeline: TimerTimeline,
) => {
  const safeLevel = clamp(targetLevel, 0, Math.max(blindLevels.length - 1, 0));
  const { cumulative } = getCumulativeDurationsInSeconds(blindLevels);
  const targetElapsedMs = cumulative[safeLevel] * 1000;
  const baseElapsedMs = getBaseElapsedMs(nowMs, timeline);

  return targetElapsedMs - baseElapsedMs;
};
