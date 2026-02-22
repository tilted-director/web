import { getTime, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useTournamentStore } from "@/stores/tournament.store";
import { CartoonCard } from "@/components/CartoonCard";
import { Crown, Users, Layers, Coins, X, Trophy, Landmark } from "lucide-react";
import pokerScene from "@/assets/tilted-director.png";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};
const formatLocalTimeShort = (d: Date) => format(d, "HH:mm");
const formatTimeLong = (d: Date) => formatInTimeZone(d, "UTC", "HH:mm:ss");

export const DashboardView = () => {
  const {
    tournamentName,
    players,
    currentLevel,
    blindLevels,
    timeRemaining,
    announcement,
    payoutStructure,
    tournamentStartTimeInMs,
    setAnnouncement,
    getPrizePool,
  } = useTournamentStore();

  const activePlayers = players.filter((p) => p.status === "active").length;
  const eliminatedPlayers = players.filter(
    (p) => p.status === "eliminated",
  ).length;
  const blind = blindLevels[currentLevel];
  const totalChips = players.reduce((sum, p) => sum + p.chips, 0);
  const averageChips = totalChips / activePlayers || 0;
  const averageToBigBlind = averageChips / blind.bigBlind;
  const ITMPlayers = payoutStructure.length;

  return (
    <div className="space-y-4 pb-4">
      {/* Title with mascot */}
      <div className="text-center tilt-left relative">
        <img
          src={pokerScene}
          alt="Poker dealer"
          className="w-48 mx-auto -mb-6 drop-shadow-lg float-animation"
        />
        <h1 className="text-5xl font-display text-primary text-outline drop-shadow-lg">
          {tournamentName}
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          🃏 The Tilted Tournament Director 🃏
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
      <CartoonCard
        variant="gold"
        className="tilt-right text-center grid grid-rows-2 grid-cols-2 sm:flex justify-evenly items-center w-full"
      >
        <div className="font-display text-primary text-outline sm:w-1/3 row-start-2 col-span-1">
          <p className="text-xl text-foreground/90 font-display tracking-widest uppercase">
            Level {blind.level}
          </p>
          <p className="text-3xl">
            {blind.smallBlind.toLocaleString()} /{" "}
            {blind.bigBlind.toLocaleString()}
          </p>

          {blind.ante > 0 && (
            <p className="text-xl text-secondary/80 font-display">
              Ante: {blind.ante}
            </p>
          )}
        </div>
        <div className="row-start-1 col-span-2 flex items-center justify-center sm:w-1/3">
          <div className="text-6xl font-display text-foreground">
            {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="text-3xl font-display text-primary text-outline sm:w-1/3 row-start-2 col-span-1">
          <div className="flex items-center justify-center gap-2 text-xl">
            <Users size={20} className="text-primary" />
            <span className="text-foreground/90 font-display">Players</span>
          </div>
          <p className="text-4xl font-display text-foreground/90 mt-1">
            {activePlayers}
            <span className="text-xl text-muted-foreground">
              /{players.length}
            </span>
          </p>
        </div>
      </CartoonCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <CartoonCard className="tilt-left flex flex-col sm:flex-row items-center">
          <div className="sm:w-1/2">
            <div className="flex items-center gap-2">
              <Landmark size={20} className="text-primary" />
              <span className="text-xs text-muted-foreground font-display">
                Prize pool
              </span>
            </div>
            <p className="text-2xl text-center sm:text-start font-display text-foreground mt-1 ms-1">
              {getPrizePool().toLocaleString()}
              <span className="text-sm text-muted-foreground ms-1">$</span>
            </p>
          </div>
          <div className="w-1/2 hidden sm:flex flex-col items-end ">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-display">
                Top paid
              </span>
              <Trophy size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-display text-foreground mt-1 me-1">
              {ITMPlayers}
              <span className="text-lg text-muted-foreground">
                /{players.length}
              </span>
            </p>
          </div>
        </CartoonCard>

        <CartoonCard className="tilt-right">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Crown size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Eliminated
            </span>
          </div>
          <p className="text-2xl font-display text-secondary text-center sm:text-start justify-center sm:justify-start sm:mt-1">
            {eliminatedPlayers}
          </p>
        </CartoonCard>

        <CartoonCard className="tilt-right">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Layers size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Level
            </span>
          </div>
          <p className="text-2xl text-center sm:text-start font-display text-foreground mt-1">
            {currentLevel + 1}
            <span className="text-sm text-muted-foreground">
              /{blindLevels.length}
            </span>
          </p>
        </CartoonCard>

        <CartoonCard className="tilt-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Coins size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              Average Chips
            </span>
          </div>
          <p className="text-xl font-display text-foreground text-center sm:text-start mt-1 ms-1">
            {averageChips.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
            <span className="text-sm text-muted-foreground">
              /
              {averageToBigBlind.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
              BB
            </span>
          </p>
        </CartoonCard>
      </div>

      {/* Next Blinds Preview */}
      {currentLevel < blindLevels.length - 1 && (
        <CartoonCard
          variant="default"
          className="opacity-75 grid grid-cols-2 grid-rows-2 sm:flex"
        >
          <div className="sm:w-1/3 col-span-2 flex flex-col items-center sm:items-start">
            <p className="text-xs text-muted-foreground font-display tracking-widest">
              NEXT UP:
              <span className="text-destructive ms-1">
                {formatTime(blindLevels[currentLevel + 1].duration * 60)}
              </span>
            </p>
            <p className="text-lg font-display text-foreground">
              Level {blindLevels[currentLevel + 1].level}:{" "}
              {blindLevels[currentLevel + 1].smallBlind.toLocaleString()} /{" "}
              {blindLevels[currentLevel + 1].bigBlind.toLocaleString()}
              {blindLevels[currentLevel + 1].ante > 0 &&
                ` (ante ${blindLevels[currentLevel + 1].ante})`}
            </p>
          </div>
          <div className="sm:w-1/3 flex flex-col items-center col-span-1">
            <p className="text-xs text-muted-foreground font-display tracking-widest">
              Total time
            </p>
            <p className="text-lg font-display text-foreground">
              {tournamentStartTimeInMs
                ? formatTimeLong(
                    new Date(getTime(new Date()) - tournamentStartTimeInMs),
                  )
                : "Not started"}
            </p>
          </div>
          <div className="sm:w-1/3 flex flex-col items-center sm:items-end col-span-1">
            <p className="text-xs text-muted-foreground font-display tracking-widest">
              Current time
            </p>
            <p className="text-lg font-display text-foreground">
              {formatLocalTimeShort(new Date())}
            </p>
          </div>
        </CartoonCard>
      )}
    </div>
  );
};
