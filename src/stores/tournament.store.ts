import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTime } from "date-fns";
import { generateId } from "@/lib/utils";
import type { Player, BlindLevel } from "@/domain/types/tournament.types";
import {
  deriveTimerState,
  getEffectiveElapsedMs,
  getElapsedOffsetForTargetLevel,
} from "@/domain/timer/engine";
import CLASSIC from "@/domain/structures/classic.json";

type TournamentStore = {
  players: Player[];
  blindLevels: BlindLevel[];
  buyIn: number;
  currentLevel: number;
  timeRemaining: number;
  elapsedTotalSeconds: number;
  isRunning: boolean;
  tournamentName: string;
  startingChips: number;
  announcement: string;
  addOnChips: number;
  addOn: number;
  payoutStructure: (number | null)[];
  tournamentStartsAt: number | null;
  tournamentPausedAt: number | null;
  totalPausedMs: number;
  elapsedOffsetMs: number;

  // setters
  setTournamentName: (name: string) => void;
  setBuyIn: (amount: number) => void;
  setStartingChips: (chips: number) => void;
  setAnnouncement: (msg: string) => void;
  setPayoutStructure: (structure: (number | null)[]) => void;

  // actions
  addPlayer: (name: string) => void;
  eliminatePlayer: (id: string) => void;
  reinstatePlayer: (id: string) => void;
  clearPlayers: () => void;
  rebuy: (id: string) => void;
  buyAddon: (id: string) => void;
  removePlayer: (id: string) => void;
  randomizeSeats: () => void;

  toggleTimer: () => void;
  resetTimer: () => void;
  nextLevel: () => void;
  prevLevel: () => void;
  syncTimerState: () => void;

  startTimerLoop: () => void;
  stopTimerLoop: () => void;

  // calculated information
  getPrizePool: () => number;
};

let interval: ReturnType<typeof setInterval> | null = null;

export const useTournamentStore = create<
  TournamentStore,
  [["zustand/persist", { players: Player[]; tournamentName: string }]]
>(
  persist(
    (set, get) => ({
      players: [],
      blindLevels: CLASSIC,
      buyIn: 20,
      currentLevel: 0,
      timeRemaining: CLASSIC[0].duration * 60,
      elapsedTotalSeconds: 0,
      isRunning: false,
      tournamentName: "The tilted tournament",
      startingChips: 10000,
      announcement: "",
      addOnChips: 5000,
      addOn: 10,
      payoutStructure: [50, 30, 20],
      tournamentStartsAt: null,
      tournamentPausedAt: null,
      totalPausedMs: 0,
      elapsedOffsetMs: 0,

      setTournamentName: (name) => set({ tournamentName: name }),
      setBuyIn: (amount) => set({ buyIn: amount }),
      setStartingChips: (chips) =>
        set((state) => ({
          startingChips: chips,
          players: state.players.map((p) => ({ ...p, chips: chips })),
        })),
      setAnnouncement: (msg) => set({ announcement: msg }),
      setPayoutStructure: (structure) => set({ payoutStructure: structure }),

      addPlayer: (name) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: generateId(),
              name,
              chips: state.startingChips,
              status: "active",
              seat: state.players.length + 1,
              rebuyCount: 0,
              hasAddon: false,
              buyIn: state.buyIn,
            },
          ],
        })),

      eliminatePlayer: (id) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, status: "eliminated" } : p,
          ),
        })),

      reinstatePlayer: (id) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, status: "active" } : p,
          ),
        })),

      clearPlayers: () => set({ players: [] }),

      rebuy: (id) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "active",
                  chips: p.chips + s.startingChips,
                  rebuyCount: p.rebuyCount + 1,
                }
              : p,
          ),
        })),

      buyAddon: (id) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id
              ? {
                  ...p,
                  chips: p.chips + s.addOnChips,
                  hasAddon: true,
                }
              : p,
          ),
        })),

      removePlayer: (id) =>
        set((s) => ({
          players: s.players.filter((p) => p.id !== id),
        })),

      randomizeSeats: () =>
        set((s) => {
          const shuffled = [...s.players].sort(() => Math.random() - 0.5);
          return {
            players: shuffled.map((p, index) => ({ ...p, seat: index + 1 })),
          };
        }),

      toggleTimer: () => {
        const now = getTime(new Date());
        const {
          isRunning,
          tournamentStartsAt,
          tournamentPausedAt,
          totalPausedMs,
        } = get();

        if (!isRunning) {
          if (tournamentStartsAt === null) {
            set({
              tournamentStartsAt: now,
              tournamentPausedAt: null,
              isRunning: true,
            });
          } else if (tournamentPausedAt !== null) {
            set({
              tournamentPausedAt: null,
              totalPausedMs:
                totalPausedMs + Math.max(now - tournamentPausedAt, 0),
              isRunning: true,
            });
          } else {
            set({ isRunning: true });
          }

          get().syncTimerState();
          get().startTimerLoop();
          return;
        }

        set({ isRunning: false, tournamentPausedAt: now });
        get().syncTimerState();
        get().stopTimerLoop();
      },

      resetTimer: () => {
        const { blindLevels } = get();
        set({
          currentLevel: 0,
          timeRemaining: blindLevels[0].duration * 60,
          elapsedTotalSeconds: 0,
          isRunning: false,
          tournamentStartsAt: null,
          tournamentPausedAt: null,
          totalPausedMs: 0,
          elapsedOffsetMs: 0,
        });
        get().stopTimerLoop();
      },
      nextLevel: () => {
        const now = getTime(new Date());
        const {
          blindLevels,
          tournamentStartsAt,
          tournamentPausedAt,
          totalPausedMs,
          elapsedOffsetMs,
          currentLevel,
        } = get();
        const targetLevel = currentLevel + 1;

        set({
          elapsedOffsetMs: getElapsedOffsetForTargetLevel(
            now,
            targetLevel,
            blindLevels,
            {
              startedAtMs: tournamentStartsAt,
              pausedAtMs: tournamentPausedAt,
              totalPausedMs,
              elapsedOffsetMs,
            },
          ),
        });
        get().syncTimerState();
      },
      prevLevel: () => {
        const now = getTime(new Date());
        const {
          blindLevels,
          tournamentStartsAt,
          tournamentPausedAt,
          totalPausedMs,
          elapsedOffsetMs,
          currentLevel,
        } = get();
        const targetLevel = currentLevel - 1;

        set({
          elapsedOffsetMs: getElapsedOffsetForTargetLevel(
            now,
            targetLevel,
            blindLevels,
            {
              startedAtMs: tournamentStartsAt,
              pausedAtMs: tournamentPausedAt,
              totalPausedMs,
              elapsedOffsetMs,
            },
          ),
        });
        get().syncTimerState();
      },

      syncTimerState: () => {
        const now = getTime(new Date());
        const {
          blindLevels,
          tournamentStartsAt,
          tournamentPausedAt,
          totalPausedMs,
          elapsedOffsetMs,
        } = get();

        const effectiveElapsedMs = getEffectiveElapsedMs(now, {
          startedAtMs: tournamentStartsAt,
          pausedAtMs: tournamentPausedAt,
          totalPausedMs,
          elapsedOffsetMs,
        });
        const elapsedSeconds = Math.floor(effectiveElapsedMs / 1000);
        const derived = deriveTimerState(elapsedSeconds, blindLevels);

        set({
          currentLevel: derived.currentLevel,
          timeRemaining: derived.timeRemaining,
          elapsedTotalSeconds: derived.elapsedTotalSeconds,
        });
      },

      startTimerLoop: () => {
        if (interval) return;

        interval = setInterval(() => {
          get().syncTimerState();
        }, 1000);
      },

      stopTimerLoop: () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      },

      getPrizePool: () => {
        const { players, buyIn } = get();
        const prizePool = players.reduce(
          (sum, p) =>
            sum + buyIn + p.rebuyCount * buyIn + (p.hasAddon ? get().addOn : 0),
          0,
        );
        console.log("Calculated prize pool:", prizePool);
        return prizePool;
      },
    }),
    {
      name: "tournament-storage",
      partialize: (state) => ({
        players: state.players,
        tournamentName: state.tournamentName,
        currentLevel: state.currentLevel,
        isRunning: state.isRunning,
        startingChips: state.startingChips,
        announcement: state.announcement,
        buyIn: state.buyIn,
        addOnChips: state.addOnChips,
        addOn: state.addOn,
        tournamentStartsAt: state.tournamentStartsAt,
        tournamentPausedAt: state.tournamentPausedAt,
        totalPausedMs: state.totalPausedMs,
        elapsedOffsetMs: state.elapsedOffsetMs,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.syncTimerState();
        if (state.isRunning) {
          state.startTimerLoop();
        } else {
          state.stopTimerLoop();
        }
      },
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "tournament-storage") return;

    useTournamentStore.persist.rehydrate();
    const state = useTournamentStore.getState();
    state.syncTimerState();

    if (state.isRunning) state.startTimerLoop();
    else state.stopTimerLoop();
  });
}
