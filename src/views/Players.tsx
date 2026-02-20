import { useState } from "react";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import type { Player } from "@/hooks/useTournament";
import { UserPlus, Skull, RotateCcw, Trash2 } from "lucide-react";
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

  const handleAdd = () => {
    if (newName.trim()) {
      addPlayer(newName.trim());
      setNewName("");
    }
  };

  const activePlayers = players.filter((p) => p.status === "active");
  const eliminatedPlayers = players.filter((p) => p.status === "eliminated");

  return (
    <div className="space-y-4 pb-4">
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
      </CartoonCard>

      {/* Active Players */}
      <div>
        <h3 className="text-lg font-display text-primary mb-2">
          🎰 ACTIVE ({activePlayers.length})
        </h3>
        <div
          className="relative"
          style={{ height: `${activePlayers.length * 80 + 54}px` }}
        >
          {activePlayers.map((player, i) => (
            <div
              key={player.id}
              className="absolute w-full transition-all duration-200 hover:z-10 hover:-translate-y-12"
              style={{ top: `${i * 80}px`, zIndex: i }}
            >
              <CartoonCard className={i % 2 === 0 ? "tilt-left" : "tilt-right"}>
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
            </div>
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
