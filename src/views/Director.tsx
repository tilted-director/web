import { useState } from "react";
import { useTournamentStore } from "@/stores/tournament.store";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shuffle,
  Award,
  AlertTriangle,
  Trophy,
  Minus,
  Plus,
} from "lucide-react";

export const DirectorView = () => {
  const {
    tournamentName,
    setTournamentName,
    buyIn,
    setBuyIn,
    startingChips,
    setStartingChips,
    payoutStructure,
    setPayoutStructure,
    getPrizePool,
    players,
    currentLevel,
    blindLevels,
    announcement,
    setAnnouncement,
    randomizeSeats,
  } = useTournamentStore();

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
  const totalPayout = payoutStructure.reduce(
    (a, b) => Number(a) + Number(b),
    0,
  );

  const [inputText, setInputText] = useState("");

  const handleAnnounce = () => {
    if (inputText.trim()) {
      setAnnouncement(inputText.trim());
      setInputText("");
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 3000);
    }
  };

  const removePlace = () => {
    setPayoutStructure(payoutStructure.slice(0, -1));
  };

  const addPlace = () => {
    setPayoutStructure([...payoutStructure, 0]);
  };

  const updatePayout = (index: number, value: string) => {
    if (Number(value) < 0) return;
    const newStructure = [...payoutStructure];
    newStructure[index] = value ? Number(value) : null;
    setPayoutStructure(newStructure);
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
              BUY-IN ($)
            </label>
            <input
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(Number(e.target.value))}
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
        {/* Randomize Seats */}
        <Dialog>
          <DialogTrigger>
            <CartoonCard className="tilt-left text-center cursor-pointer wobble-hover">
              <Shuffle size={24} className="mx-auto text-primary mb-1" />
              <p className="font-display text-sm text-foreground">
                Random Seat
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Shuffle seating
              </p>
            </CartoonCard>
          </DialogTrigger>
          <DialogContent className="bg-card border-4 border-primary rounded-2xl max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-primary text-center flex items-center justify-center gap-2">
                <Shuffle size={20} /> RANDOMIZE SEATS
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground font-body">
                Are you sure you want to randomize the seating arrangement? This
                will not affect player statuses or chip counts.
              </p>
              <div>
                {players.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <p>{p.name}</p>
                    <p>{p.seat}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <CartoonButton
                  onClick={() => {
                    randomizeSeats();
                  }}
                >
                  Randomize
                </CartoonButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payouts Structure */}
        <Dialog>
          <DialogTrigger>
            <CartoonCard className="tilt-right text-center cursor-pointer wobble-hover">
              <Award size={24} className="mx-auto text-primary mb-1" />
              <p className="font-display text-sm text-foreground">Payouts</p>
              <p className="text-xs text-muted-foreground font-body">
                Prize structure
              </p>
            </CartoonCard>
          </DialogTrigger>
          <DialogContent className="bg-card border-4 border-primary rounded-2xl max-w-5/6 sm:w-2/3 lg:w-1/2 mx-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-primary text-center flex items-center justify-center gap-2">
                <Trophy size={24} /> PAYOUTS
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Place count controls */}
              <div className="flex items-center justify-between">
                <span className="font-display text-sm text-muted-foreground">
                  In the money
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={removePlace}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-display text-lg text-foreground w-8 text-center">
                    {payoutStructure.length}
                  </span>
                  <button
                    onClick={addPlace}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Payout inputs */}
              <div className="space-y-2">
                {payoutStructure.map((pct, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-20">
                      <span className="text-lg">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}
                      </span>
                      <span className="font-display text-sm text-muted-foreground">
                        {i + 1}
                        {i === 0 ? "er" : "e"}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={pct ?? ""}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => updatePayout(i, e.target.value)}
                      className="flex-1 bg-muted text-foreground font-display text-center px-3 py-2 rounded-xl border-2 border-border focus:border-primary outline-none"
                    />
                    <span className="font-display text-muted-foreground">
                      %
                    </span>
                  </div>
                ))}
              </div>

              {/* Total indicator */}
              <div
                className={`text-center font-display text-lg ${totalPayout === 100 ? "text-primary" : "text-destructive"}`}
              >
                Total: {totalPayout}%
                {totalPayout !== 100 && (
                  <span className="text-xs block text-destructive">
                    (must be 100%)
                  </span>
                )}
              </div>

              {/* Summary */}
              {totalPayout === 100 ? (
                <div className="bg-muted/50 rounded-xl p-3 space-y-1">
                  <p className="font-display text-xs text-muted-foreground tracking-widest">
                    SUMMARY
                  </p>
                  {payoutStructure.map((pct, i) => (
                    <div
                      key={i}
                      className="flex justify-between font-body text-sm"
                    >
                      <span className="text-muted-foreground">
                        {i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : "🎖️"}{" "}
                        Place {i + 1}
                      </span>
                      <div className="flex gap-2">
                        <span className="font-display text-foreground">
                          {(
                            (getPrizePool() * (pct ?? 0)) /
                            100
                          ).toLocaleString()}{" "}
                          $
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Please adjust the percentages so they add up to 100% to see
                  the payout summary.
                </div>
              )}
              {players.length < payoutStructure.length && (
                <div className="text-sm text-destructive">
                  ⚠ There are more payout places than players! Consider reducing
                  the number of places or adding more players.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
