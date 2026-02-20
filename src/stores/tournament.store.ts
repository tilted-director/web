import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import type { Player, BlindLevel } from "@/domain/types/tournament.types";
import CLASSIC from "@/domain/structures/classic.json";

type TournamentStore = {
  players: Player[];
  blindLevels: BlindLevel[];
  currentLevel: number;
  timeRemaining: number;
  isRunning: boolean;
  tournamentName: string;
  startingChips: number;
  announcement: string;
  addonAmount: number;

  // setters
  setTournamentName: (name: string) => void;
  setStartingChips: (chips: number) => void;
  setAnnouncement: (msg: string) => void;

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
      currentLevel: 0,
      timeRemaining: CLASSIC[0].duration * 60,
      isRunning: false,
      tournamentName: "CRAZY POKER NIGHT",
      startingChips: 10000,
      announcement: "",
      addonAmount: 5000,

      setTournamentName: (name) => set({ tournamentName: name }),
      setStartingChips: (chips) => set({ startingChips: chips }),
      setAnnouncement: (msg) => set({ announcement: msg }),

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
                  chips: p.chips + s.addonAmount,
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
      }),
    },
  ),
);
