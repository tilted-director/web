import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTime } from "date-fns";
import { generateId } from "@/lib/utils";
import type { Player, BlindLevel } from "@/domain/types/tournament.types";
import CLASSIC from "@/domain/structures/classic.json";

type TournamentStore = {
  players: Player[];
  blindLevels: BlindLevel[];
  buyIn: number;
  currentLevel: number;
  timeRemaining: number;
  isRunning: boolean;
  tournamentName: string;
  startingChips: number;
  announcement: string;
  addOnChips: number;
  addOn: number;
  payoutStructure: number[];
  tournamentStartTimeInMs: number | null;

  // setters
  setTournamentName: (name: string) => void;
  setStartingChips: (chips: number) => void;
  setAnnouncement: (msg: string) => void;
  setPayoutStructure: (structure: number[]) => void;

  // actions
  addPlayer: (name: string) => void;
  eliminatePlayer: (id: string) => void;
  reinstatePlayer: (id: string) => void;
  clearPlayers: () => void;
  rebuy: (id: string) => void;
  buyAddon: (id: string) => void;
  removePlayer: (id: string) => void;

  toggleTimer: () => void;
  resetTimer: () => void;
  nextLevel: () => void;
  prevLevel: () => void;

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
      buyIn: 50,
      currentLevel: 0,
      timeRemaining: CLASSIC[0].duration * 60,
      isRunning: false,
      tournamentName: "CRAZY POKER NIGHT",
      startingChips: 10000,
      announcement: "",
      addOnChips: 5000,
      addOn: 10,
      payoutStructure: [50, 30, 20],
      tournamentStartTimeInMs: null,
      setTournamentName: (name) => set({ tournamentName: name }),
      setStartingChips: (chips) => set({ startingChips: chips }),
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

      toggleTimer: () => {
        const running = get().isRunning;
        const tournamentStartTimeInMs = get().tournamentStartTimeInMs;

        if (!running && tournamentStartTimeInMs === null) {
          set({ tournamentStartTimeInMs: getTime(new Date()) });
        }

        set({ isRunning: !running });
        if (!running) get().startTimerLoop();
        else get().stopTimerLoop();
      },

      resetTimer: () => {
        const { blindLevels, currentLevel } = get();
        set({
          timeRemaining: blindLevels[currentLevel].duration * 60,
          isRunning: false,
        });
        get().stopTimerLoop();
      },

      nextLevel: () => {
        const { currentLevel, blindLevels } = get();
        const next = Math.min(currentLevel + 1, blindLevels.length - 1);
        set({
          currentLevel: next,
          timeRemaining: blindLevels[next].duration * 60,
        });
      },

      prevLevel: () => {
        const { currentLevel, blindLevels } = get();
        const prev = Math.max(currentLevel - 1, 0);
        set({
          currentLevel: prev,
          timeRemaining: blindLevels[prev].duration * 60,
        });
      },

      startTimerLoop: () => {
        if (interval) return;

        interval = setInterval(() => {
          const { timeRemaining, currentLevel, blindLevels } = get();

          if (timeRemaining <= 1) {
            const next = Math.min(currentLevel + 1, blindLevels.length - 1);
            set({
              currentLevel: next,
              timeRemaining: blindLevels[next].duration * 60,
            });
          } else {
            set({ timeRemaining: timeRemaining - 1 });
          }
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
        timeRemaining: state.timeRemaining,
        isRunning: state.isRunning,
        startingChips: state.startingChips,
        announcement: state.announcement,
        buyIn: state.buyIn,
        addOnChips: state.addOnChips,
        addOn: state.addOn,
        tournamentStartTimeInMs: state.tournamentStartTimeInMs,
      }),
    },
  ),
);
