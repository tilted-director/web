import { useTournamentStore } from "@/stores/tournament.store";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export const TimerView = () => {
  const {
    currentLevel,
    blindLevels,
    timeRemaining,
    isRunning,
    toggleTimer,
    resetTimer,
    nextLevel,
    prevLevel,
  } = useTournamentStore();

  const blind = blindLevels[currentLevel];
  const progress = 1 - timeRemaining / (blind.duration * 60);

  return (
    <div className="space-y-5 pb-4">
      <div className="text-center">
        <h2 className="text-3xl font-display text-primary text-outline">
          BLIND TIMER
        </h2>
      </div>

      {/* Big Timer Display */}
      <CartoonCard
        variant="gold"
        className="text-center py-8 relative overflow-hidden"
      >
        {/* Progress bar background */}
        <div
          className="absolute px-0.5 bottom-0 left-0 h-2 bg-secondary transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
        <p className="text-sm text-muted-foreground font-display tracking-widest">
          LEVEL {blind.level}
        </p>
        <div className="text-6xl font-display text-primary text-outline my-4 float-animation">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-2xl font-display text-foreground">
          {blind.smallBlind.toLocaleString()} /{" "}
          {blind.bigBlind.toLocaleString()}
        </div>
        {blind.ante > 0 && (
          <p className="text-lg text-secondary font-display mt-1">
            Ante: {blind.ante}
          </p>
        )}
      </CartoonCard>

      {/* Controls */}
      <div className="flex justify-center items-center gap-3">
        <CartoonButton variant="accent" size="sm" onClick={prevLevel}>
          <SkipBack size={20} />
        </CartoonButton>
        <CartoonButton variant="accent" size="sm" onClick={resetTimer}>
          <RotateCcw size={20} />
        </CartoonButton>
        <CartoonButton
          variant={isRunning ? "danger" : "primary"}
          size="lg"
          onClick={toggleTimer}
          className="px-8"
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} />}
        </CartoonButton>
        <CartoonButton variant="accent" size="sm" onClick={resetTimer}>
          <RotateCcw size={20} />
        </CartoonButton>
        <CartoonButton variant="accent" size="sm" onClick={nextLevel}>
          <SkipForward size={20} />
        </CartoonButton>
      </div>

      {/* Blind Structure */}
      <CartoonCard>
        <h3 className="text-lg font-display text-primary mb-3">
          BLIND STRUCTURE
        </h3>
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {blindLevels.map((lvl, i) => (
            <div
              key={lvl.level}
              className={`flex justify-between items-center px-3 py-1.5 rounded-lg font-body text-sm transition-all ${
                i === currentLevel
                  ? "bg-primary/20 border-2 border-primary text-foreground font-bold"
                  : i < currentLevel
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
              }`}
            >
              <span>Lvl {lvl.level}</span>
              <span>
                {lvl.smallBlind}/{lvl.bigBlind}
                {lvl.ante > 0 && ` (${lvl.ante})`}
              </span>
              <span>{lvl.duration}m</span>
            </div>
          ))}
        </div>
      </CartoonCard>
    </div>
  );
};
