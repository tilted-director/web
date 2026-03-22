import { describe, expect, it } from "vitest";
import type { BlindLevel } from "@/domain/types/tournament.types";
import {
  deriveTimerState,
  getBaseElapsedMs,
  getCumulativeDurationsInSeconds,
  getDurationByLevelInSeconds,
  getEffectiveElapsedMs,
  getElapsedOffsetForTargetLevel,
  type TimerTimeline,
} from "@/domain/timer/engine";

const levels: BlindLevel[] = [
  { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 1 },
  { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, duration: 2 },
  { level: 3, smallBlind: 100, bigBlind: 200, ante: 25, duration: 1 },
];

const baseTimeline = (
  overrides: Partial<TimerTimeline> = {},
): TimerTimeline => ({
  startedAtMs: 0,
  pausedAtMs: null,
  totalPausedMs: 0,
  elapsedOffsetMs: 0,
  ...overrides,
});

describe("getDurationByLevelInSeconds", () => {
  it("converts minutes to seconds and clamps non-positive values", () => {
    const input: BlindLevel[] = [
      { level: 1, smallBlind: 1, bigBlind: 2, ante: 0, duration: 1 },
      { level: 2, smallBlind: 2, bigBlind: 4, ante: 0, duration: 0 },
      { level: 3, smallBlind: 4, bigBlind: 8, ante: 0, duration: -3 },
    ];

    expect(getDurationByLevelInSeconds(input)).toEqual([60, 1, 1]);
  });

  it("supports fractional and very large durations", () => {
    const input: BlindLevel[] = [
      { level: 1, smallBlind: 1, bigBlind: 2, ante: 0, duration: 0.5 },
      {
        level: 2,
        smallBlind: 2,
        bigBlind: 4,
        ante: 0,
        duration: 1_000_000,
      },
    ];

    expect(getDurationByLevelInSeconds(input)).toEqual([30, 60_000_000]);
  });
});

describe("getCumulativeDurationsInSeconds", () => {
  it("returns empty durations and zero cumulative baseline for empty structure", () => {
    expect(getCumulativeDurationsInSeconds([])).toEqual({
      durations: [],
      cumulative: [0],
    });
  });

  it("computes per-level durations and cumulative boundaries", () => {
    expect(getCumulativeDurationsInSeconds(levels)).toEqual({
      durations: [60, 120, 60],
      cumulative: [0, 60, 180, 240],
    });
  });
});

describe("getBaseElapsedMs", () => {
  it("returns 0 when tournament has not started", () => {
    const timeline = baseTimeline({ startedAtMs: null });
    expect(getBaseElapsedMs(50_000, timeline)).toBe(0);
  });

  it("subtracts consolidated pause time while running", () => {
    const timeline = baseTimeline({ startedAtMs: 1_000, totalPausedMs: 5_000 });
    expect(getBaseElapsedMs(61_000, timeline)).toBe(55_000);
  });

  it("subtracts ongoing pause duration while paused", () => {
    const timeline = baseTimeline({
      startedAtMs: 1_000,
      totalPausedMs: 5_000,
      pausedAtMs: 31_000,
    });

    expect(getBaseElapsedMs(61_000, timeline)).toBe(25_000);
  });

  it("clamps to 0 on underflow", () => {
    const timeline = baseTimeline({ startedAtMs: 5_000, totalPausedMs: 2_000 });
    expect(getBaseElapsedMs(1_000, timeline)).toBe(0);
  });
});

describe("getEffectiveElapsedMs", () => {
  it("applies positive offset", () => {
    const timeline = baseTimeline({ elapsedOffsetMs: 5_000 });
    expect(getEffectiveElapsedMs(10_000, timeline)).toBe(15_000);
  });

  it("clamps to 0 when negative offset exceeds base elapsed", () => {
    const timeline = baseTimeline({ elapsedOffsetMs: -20_000 });
    expect(getEffectiveElapsedMs(10_000, timeline)).toBe(0);
  });

  it("is monotonic with increasing nowMs when timeline is unchanged", () => {
    const timeline = baseTimeline({ startedAtMs: 1_000, totalPausedMs: 500 });
    const values = [5_000, 10_000, 20_000].map((now) =>
      getEffectiveElapsedMs(now, timeline),
    );

    expect(values[1]).toBeGreaterThanOrEqual(values[0]);
    expect(values[2]).toBeGreaterThanOrEqual(values[1]);
  });
});

describe("deriveTimerState", () => {
  it("returns neutral state for empty blind structure", () => {
    expect(deriveTimerState(42, [])).toEqual({
      currentLevel: 0,
      timeRemaining: 0,
      elapsedTotalSeconds: 42,
    });
  });

  it("clamps negative elapsed values to a safe initial state", () => {
    expect(deriveTimerState(-5, levels)).toEqual({
      currentLevel: 0,
      timeRemaining: 60,
      elapsedTotalSeconds: 0,
    });
  });

  it("computes current level and remaining time inside first level", () => {
    expect(deriveTimerState(0, levels)).toEqual({
      currentLevel: 0,
      timeRemaining: 60,
      elapsedTotalSeconds: 0,
    });

    expect(deriveTimerState(59, levels)).toEqual({
      currentLevel: 0,
      timeRemaining: 1,
      elapsedTotalSeconds: 59,
    });
  });

  it("handles exact level boundaries without off-by-one errors", () => {
    expect(deriveTimerState(60, levels)).toEqual({
      currentLevel: 1,
      timeRemaining: 120,
      elapsedTotalSeconds: 60,
    });

    expect(deriveTimerState(180, levels)).toEqual({
      currentLevel: 2,
      timeRemaining: 60,
      elapsedTotalSeconds: 180,
    });
  });

  it("pins to last level with zero remaining once structure is completed", () => {
    expect(deriveTimerState(240, levels)).toEqual({
      currentLevel: 2,
      timeRemaining: 0,
      elapsedTotalSeconds: 240,
    });

    expect(deriveTimerState(999, levels)).toEqual({
      currentLevel: 2,
      timeRemaining: 0,
      elapsedTotalSeconds: 999,
    });
  });
});

describe("getElapsedOffsetForTargetLevel", () => {
  it("computes offset to jump forward to the next level start", () => {
    const timeline = baseTimeline();
    const offset = getElapsedOffsetForTargetLevel(45_000, 1, levels, timeline);

    expect(offset).toBe(15_000);
  });

  it("clamps target below range to first level", () => {
    const timeline = baseTimeline();
    const offset = getElapsedOffsetForTargetLevel(
      45_000,
      -10,
      levels,
      timeline,
    );

    expect(offset).toBe(-45_000);
  });

  it("clamps target above range to last level start", () => {
    const timeline = baseTimeline();
    const offset = getElapsedOffsetForTargetLevel(
      45_000,
      999,
      levels,
      timeline,
    );

    expect(offset).toBe(135_000);
  });

  it("accounts for ongoing pause in base elapsed computation", () => {
    const timeline = baseTimeline({
      pausedAtMs: 30_000,
      totalPausedMs: 10_000,
    });
    const offset = getElapsedOffsetForTargetLevel(90_000, 1, levels, timeline);

    expect(offset).toBe(40_000);
  });

  it("handles empty blind levels by targeting zero elapsed", () => {
    const timeline = baseTimeline({ startedAtMs: 0 });
    const offset = getElapsedOffsetForTargetLevel(45_000, 2, [], timeline);

    expect(offset).toBe(-45_000);
  });
});

describe("fractional duration behavior", () => {
  it("computes boundaries correctly with fractional minute levels", () => {
    const fractionalLevels: BlindLevel[] = [
      { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 0.5 },
      { level: 2, smallBlind: 20, bigBlind: 40, ante: 0, duration: 1.25 },
    ];

    expect(getCumulativeDurationsInSeconds(fractionalLevels)).toEqual({
      durations: [30, 75],
      cumulative: [0, 30, 105],
    });

    expect(deriveTimerState(29, fractionalLevels)).toEqual({
      currentLevel: 0,
      timeRemaining: 1,
      elapsedTotalSeconds: 29,
    });

    expect(deriveTimerState(30, fractionalLevels)).toEqual({
      currentLevel: 1,
      timeRemaining: 75,
      elapsedTotalSeconds: 30,
    });
  });
});

describe("very large duration behavior", () => {
  it("derives stable state with very large blind durations", () => {
    const hugeLevels: BlindLevel[] = [
      {
        level: 1,
        smallBlind: 100,
        bigBlind: 200,
        ante: 0,
        duration: 1_000_000,
      },
    ];

    expect(deriveTimerState(1_000_000, hugeLevels)).toEqual({
      currentLevel: 0,
      timeRemaining: 59_000_000,
      elapsedTotalSeconds: 1_000_000,
    });

    expect(deriveTimerState(60_000_000, hugeLevels)).toEqual({
      currentLevel: 0,
      timeRemaining: 0,
      elapsedTotalSeconds: 60_000_000,
    });
  });
});
