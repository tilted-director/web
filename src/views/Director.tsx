import { useState } from "react";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import type { Player, BlindLevel } from "@/hooks/useTournament";
import { Shuffle, Award, AlertTriangle } from "lucide-react";

interface DirectorViewProps {
  tournamentName: string;
  setTournamentName: (name: string) => void;
  startingChips: number;
  setStartingChips: (chips: number) => void;
  players: Player[];
  currentLevel: number;
  blindLevels: BlindLevel[];
  announcement: string;
  setAnnouncement: (msg: string) => void;
}

export const DirectorView = ({
  tournamentName,
  setTournamentName,
  startingChips,
  setStartingChips,
  players,
  currentLevel,
  blindLevels,
  announcement,
  setAnnouncement,
}: DirectorViewProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const activePlayers = players.filter((p) => p.status === "active");
  const totalChips = players.length * startingChips;
  const avgStack =
    activePlayers.length > 0
      ? Math.round(totalChips / activePlayers.length)
      : 0;
  const blind = blindLevels[currentLevel];
  const bigBlindsAvg =
    blind.bigBlind > 0 ? Math.round(avgStack / blind.bigBlind) : 0;

  const [inputText, setInputText] = useState("");

  const handleAnnounce = () => {
    if (inputText.trim()) {
      setAnnouncement(inputText.trim());
      setInputText("");
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 3000);
    }
    console.log("Announcement:", announcement);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center tilt-crazy">
        <h2 className="text-3xl font-display text-primary text-outline">
          DIRECTOR
        </h2>
        <p className="text-sm text-muted-foreground font-display">
          🎩 You're the Boss 🎩
        </p>
      </div>

      {/* Tournament Settings */}
      <CartoonCard variant="gold">
        <h3 className="text-sm font-display text-muted-foreground tracking-widest mb-3">
          TOURNAMENT SETTINGS
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-display text-muted-foreground">
              NAME
            </label>
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full bg-muted text-foreground font-body px-4 py-2 rounded-xl border-2 border-border focus:border-primary outline-none mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-display text-muted-foreground">
              STARTING CHIPS
            </label>
            <input
              type="number"
              value={startingChips}
              onChange={(e) => setStartingChips(Number(e.target.value))}
              className="w-full bg-muted text-foreground font-body px-4 py-2 rounded-xl border-2 border-border focus:border-primary outline-none mt-1"
            />
          </div>
        </div>
      </CartoonCard>

      {/* Announcement */}
      <CartoonCard variant="red">
        <h3 className="text-sm font-display text-secondary tracking-widest mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> ANNOUNCEMENT
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnnounce()}
            placeholder="Break in 5 minutes..."
            className="flex-1 bg-muted text-foreground font-body px-4 py-2 rounded-xl border-2 border-border focus:border-primary outline-none"
          />
          <CartoonButton variant="secondary" onClick={handleAnnounce} size="sm">
            📢
          </CartoonButton>
        </div>
        {announcement && (
          <div className="mt-3 p-3 bg-secondary/20 rounded-xl border-2 border-secondary text-foreground font-display text-center animate-bounce-stop">
            <span>📣 {announcement}</span>
            <button
              onClick={() => setAnnouncement("")}
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              ✕
            </button>
          </div>
        )}
        {showPreview && (
          <div className="mt-2 text-xs text-center text-muted-foreground font-body">
            ✅ Annonce envoyée au Dashboard !
          </div>
        )}
      </CartoonCard>

      {/* Tournament Stats */}
      <CartoonCard>
        <h3 className="text-sm font-display text-muted-foreground tracking-widest mb-3">
          📊 TOURNAMENT STATS
        </h3>
        <div className="space-y-2 font-body">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Chips in Play</span>
            <span className="font-display text-foreground">
              {totalChips.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Average Stack</span>
            <span className="font-display text-primary">
              {avgStack.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg BBs Remaining</span>
            <span className="font-display text-foreground">{bigBlindsAvg}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active / Total</span>
            <span className="font-display text-foreground">
              {activePlayers.length} / {players.length}
            </span>
          </div>
        </div>
      </CartoonCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <CartoonCard className="tilt-left text-center cursor-pointer wobble-hover">
          <Shuffle size={24} className="mx-auto text-primary mb-1" />
          <p className="font-display text-sm text-foreground">Random Seat</p>
          <p className="text-xs text-muted-foreground font-body">
            Shuffle seating
          </p>
        </CartoonCard>
        <CartoonCard className="tilt-right text-center cursor-pointer wobble-hover">
          <Award size={24} className="mx-auto text-primary mb-1" />
          <p className="font-display text-sm text-foreground">Payouts</p>
          <p className="text-xs text-muted-foreground font-body">
            Prize structure
          </p>
        </CartoonCard>
      </div>
    </div>
  );
};
