import { useState, useMemo } from "react";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import { type Player, getSavedPlayerNames } from "@/hooks/useTournament";
import dealerAvatar from "@/assets/dealer.svg";

interface PlayersViewProps {
  players: Player[];
  addPlayer: (name: string) => void;
  eliminatePlayer: (id: string) => void;
  reinstatePlayer: (id: string) => void;
  removePlayer: (id: string) => void;
}

export const PlayersView = ({
  players,
  addPlayer,
  eliminatePlayer,
  reinstatePlayer,
  removePlayer,
}: PlayersViewProps) => {
  const [newName, setNewName] = useState("");
  const [savedNames, setSavedNames] = useState<string[]>(getSavedPlayerNames());

  const handleAdd = () => {
    if (newName.trim()) {
      addPlayer(newName.trim());
      setNewName("");
    }
  };

  const toggleSavePlayer = (name: string) => {
    setSavedNames((prev) => {
      if (prev.includes(name)) {
        const next = prev.filter((n) => n !== name);
        localStorage.setItem("favorite_players", JSON.stringify(next));
        return next;
      }

      if (prev.length >= 6) {
        return prev;
      }

      const next = [...prev, name];
      localStorage.setItem("favorite_players", JSON.stringify(next));
      return next;
    });
  };

  const activePlayers = players.filter((p) => p.status === "active");
  const eliminatedPlayers = players.filter((p) => p.status === "eliminated");

  // Saved players not currently in the tournament
  const savedAvailable = useMemo(() => {
    const currentNames = new Set(players.map((p) => p.name));
    return getSavedPlayerNames().filter((name) => !currentNames.has(name));
  }, [players]);

  return (
    <div className="space-y-6 pb-4">
      <div className="text-center tilt-right flex items-center justify-center gap-3">
        <img
          src={dealerAvatar}
          alt="Dealer"
          className="w-12 h-12 rounded-full border-2 border-primary cartoon-shadow"
        />
        <h2 className="text-3xl font-display text-primary text-outline">
          PLAYERS
        </h2>
      </div>

      {/* Add Player */}
      <CartoonCard variant="gold">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Player name..."
            className="flex-1 bg-muted text-foreground font-body px-4 py-2 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"
          />
          <CartoonButton onClick={handleAdd} size="md">
            <UserPlus size={20} />
          </CartoonButton>
        </div>

        {/* Quick-add saved players */}
        {savedAvailable.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {savedAvailable.map((name) => (
              <button
                key={name}
                onClick={() => addPlayer(name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-primary/40 bg-primary/10 text-primary font-display text-sm hover:bg-primary/25 transition-colors"
              >
                <Plus size={14} />
                {name}
              </button>
            ))}
          </div>
        )}
      </CartoonCard>

      {/* Active Players */}
      <div>
        <h3 className="text-lg font-display text-primary mb-2">
          🎰 ACTIVE ({activePlayers.length})
        </h3>
        <div className="space-y-2">
          {activePlayers.map((player, i) => (
            <CartoonCard
              key={player.id}
              className={i % 2 === 0 ? "tilt-left" : "tilt-right"}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-display">
                    Seat {player.seat}
                  </span>
                  <p className="font-display text-lg text-foreground">
                    {player.name}
                  </p>
                  <p className="text-sm text-primary font-body">
                    💰 {player.chips.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleSavePlayer(player.name)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedNames.includes(player.name)
                        ? "bg-pink-500/20 text-pink-500 hover:bg-pink-500/40"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={savedNames.includes(player.name) ? "Unsave" : "Save"}
                  >
                    <Heart
                      size={18}
                      fill={
                        savedNames.includes(player.name)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                  <button
                    onClick={() => eliminatePlayer(player.id)}
                    className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/40 transition-colors"
                    title="Eliminate"
                  >
                    <Skull size={18} />
                  </button>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/40 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </CartoonCard>
          ))}
          {activePlayers.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-8">
              No players yet. Add some above! 🃏
            </p>
          )}
        </div>
      </div>

      {/* Eliminated Players */}
      {eliminatedPlayers.length > 0 && (
        <div>
          <h3 className="text-lg font-display text-secondary mb-2">
            💀 ELIMINATED ({eliminatedPlayers.length})
          </h3>
          <div className="space-y-2">
            {eliminatedPlayers.map((player) => (
              <CartoonCard key={player.id} className="opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg text-foreground line-through">
                      {player.name}
                    </p>
                  </div>
                  <button
                    onClick={() => reinstatePlayer(player.id)}
                    className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/40 transition-colors"
                    title="Reinstate"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </CartoonCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
