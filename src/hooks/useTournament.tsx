import { useState, useCallback, useRef, useEffect } from "react";

export interface Player {
  id: string;
  name: string;
  chips: number;
  status: "active" | "eliminated";
  seat: number;
}

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // minutes
}

const DEFAULT_BLINDS: BlindLevel[] = [
  { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 20 },
  { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, duration: 20 },
  { level: 3, smallBlind: 75, bigBlind: 150, ante: 25, duration: 20 },
  { level: 4, smallBlind: 100, bigBlind: 200, ante: 25, duration: 15 },
  { level: 5, smallBlind: 150, bigBlind: 300, ante: 50, duration: 15 },
  { level: 6, smallBlind: 200, bigBlind: 400, ante: 50, duration: 15 },
  { level: 7, smallBlind: 300, bigBlind: 600, ante: 75, duration: 12 },
  { level: 8, smallBlind: 500, bigBlind: 1000, ante: 100, duration: 12 },
  { level: 9, smallBlind: 750, bigBlind: 1500, ante: 200, duration: 10 },
  { level: 10, smallBlind: 1000, bigBlind: 2000, ante: 300, duration: 10 },
];

export const useTournament = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [blindLevels] = useState<BlindLevel[]>(DEFAULT_BLINDS);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    DEFAULT_BLINDS[0].duration * 60,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [tournamentName, setTournamentName] = useState("CRAZY POKER NIGHT");
  const [startingChips, setStartingChips] = useState(10000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto advance level
            setCurrentLevel((lvl) => {
              const next = Math.min(lvl + 1, blindLevels.length - 1);
              return next;
            });
            return (
              blindLevels[Math.min(currentLevel + 1, blindLevels.length - 1)]
                .duration * 60
            );
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentLevel, blindLevels]);

  const addPlayer = useCallback(
    (name: string) => {
      setPlayers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          chips: startingChips,
          status: "active",
          seat: prev.length + 1,
        },
      ]);
    },
    [startingChips],
  );

  const eliminatePlayer = useCallback((id: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "eliminated" as const } : p,
      ),
    );
  }, []);

  const reinstatePlayer = useCallback((id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active" as const } : p)),
    );
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleTimer = useCallback(() => setIsRunning((prev) => !prev), []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(blindLevels[currentLevel].duration * 60);
    setIsRunning(false);
  }, [currentLevel, blindLevels]);

  const nextLevel = useCallback(() => {
    const next = Math.min(currentLevel + 1, blindLevels.length - 1);
    setCurrentLevel(next);
    setTimeRemaining(blindLevels[next].duration * 60);
  }, [currentLevel, blindLevels]);

  const prevLevel = useCallback(() => {
    const prev = Math.max(currentLevel - 1, 0);
    setCurrentLevel(prev);
    setTimeRemaining(blindLevels[prev].duration * 60);
  }, [currentLevel, blindLevels]);

  return {
    players,
    blindLevels,
    currentLevel,
    timeRemaining,
    isRunning,
    tournamentName,
    startingChips,
    setTournamentName,
    setStartingChips,
    addPlayer,
    eliminatePlayer,
    reinstatePlayer,
    removePlayer,
    toggleTimer,
    resetTimer,
    nextLevel,
    prevLevel,
  };
};
