import { CartoonCard } from "@/components/CartoonCard";
import type { BlindLevel, Player } from "@/hooks/useTournament";
import { Crown, Users, Layers, Coins, X } from "lucide-react";
import pokerScene from "@/assets/tilted-director.png";

interface DashboardViewProps {
  tournamentName: string;
  players: Player[];
  currentLevel: number;
  blindLevels: BlindLevel[];
  timeRemaining: number;
  isRunning: boolean;
  announcement: string;
  setAnnouncement: (msg: string) => void;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export const DashboardView = ({
  tournamentName,
  players,
  currentLevel,
  blindLevels,
  timeRemaining,
  isRunning,
  announcement,
  setAnnouncement,
}: DashboardViewProps) => {
  const activePlayers = players.filter((p) => p.status === "active").length;
  const eliminatedPlayers = players.filter(
    (p) => p.status === "eliminated",
  ).length;
  const blind = blindLevels[currentLevel];
  const totalChips = players.length * 10000;

  return (
    <div className="space-y-4 pb-4">
      {/* Title with mascot */}
      <div className="text-center tilt-left relative">
        <img
          src={pokerScene}
          alt="Poker dealer"
          className="w-28 h-28 mx-auto -mb-2 drop-shadow-lg float-animation"
        />
        <h1 className="text-4xl font-display text-primary text-outline drop-shadow-lg">
          {tournamentName}
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          🃏 Tournament Director 🃏
        </p>
      </div>

      {/* Announcement Banner */}
      {announcement && (
        <CartoonCard variant="red">
          <div className="flex items-center justify-between">
            <span className="font-display text-foreground">
              📣 {announcement}
            </span>
            <button
              onClick={() => setAnnouncement("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </CartoonCard>
      )}

      {/* Current Blinds - Hero Card */}
      <CartoonCard variant="gold" className="tilt-right text-center">
        <p className="text-xs text-muted-foreground font-display tracking-widest uppercase">
          Level {blind.level}
        </p>
        <div className="text-3xl font-display text-primary text-outline my-1">
          {blind.smallBlind.toLocaleString()} /{" "}
          {blind.bigBlind.toLocaleString()}
        </div>
        {blind.ante > 0 && (
          <p className="text-sm text-secondary font-display">
            Ante: {blind.ante}
          </p>
        )}
        <div
          className={`text-2xl font-display mt-2 ${isRunning ? "text-secondary pulse-glow inline-block rounded-lg px-3" : "text-foreground"}`}
        >
          ⏱ {formatTime(timeRemaining)}
        </div>
      </CartoonCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <CartoonCard className="tilt-left">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Players
            </span>
          </div>
          <p className="text-2xl font-display text-foreground mt-1">
            {activePlayers}
            <span className="text-sm text-muted-foreground">
              /{players.length}
            </span>
          </p>
        </CartoonCard>

        <CartoonCard className="tilt-right">
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Eliminated
            </span>
          </div>
          <p className="text-2xl font-display text-secondary mt-1">
            {eliminatedPlayers}
          </p>
        </CartoonCard>

        <CartoonCard className="tilt-right">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Level
            </span>
          </div>
          <p className="text-2xl font-display text-foreground mt-1">
            {currentLevel + 1}
            <span className="text-sm text-muted-foreground">
              /{blindLevels.length}
            </span>
          </p>
        </CartoonCard>

        <CartoonCard className="tilt-left">
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Total Chips
            </span>
          </div>
          <p className="text-xl font-display text-foreground mt-1">
            {totalChips.toLocaleString()}
          </p>
        </CartoonCard>
      </div>

      {/* Next Blinds Preview */}
      {currentLevel < blindLevels.length - 1 && (
        <CartoonCard variant="default" className="opacity-75">
          <p className="text-xs text-muted-foreground font-display tracking-widest">
            NEXT UP
          </p>
          <p className="text-lg font-display text-foreground">
            Level {blindLevels[currentLevel + 1].level}:{" "}
            {blindLevels[currentLevel + 1].smallBlind.toLocaleString()} /{" "}
            {blindLevels[currentLevel + 1].bigBlind.toLocaleString()}
            {blindLevels[currentLevel + 1].ante > 0 &&
              ` (ante ${blindLevels[currentLevel + 1].ante})`}
          </p>
        </CartoonCard>
      )}
    </div>
  );
};
