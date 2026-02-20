import { useState } from "react";
import { BottomNav, type ViewType } from "@/common/layout/BottomNav";
import { DashboardView } from "@/views/Dashboard";
import { TimerView } from "@/views/Timer";
import { PlayersView } from "@/views/Players";
import { DirectorView } from "@/views/Director";
import { useTournament } from "@/hooks/useTournament";

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const tournament = useTournament();

  return (
    <div className="min-h-screen gradient-felt max-w-2xl mx-auto px-4 pt-4 pb-24">
      {activeView === "dashboard" && (
        <DashboardView
          tournamentName={tournament.tournamentName}
          players={tournament.players}
          currentLevel={tournament.currentLevel}
          blindLevels={tournament.blindLevels}
          timeRemaining={tournament.timeRemaining}
          isRunning={tournament.isRunning}
        />
      )}
      {activeView === "timer" && (
        <TimerView
          currentLevel={tournament.currentLevel}
          blindLevels={tournament.blindLevels}
          timeRemaining={tournament.timeRemaining}
          isRunning={tournament.isRunning}
          toggleTimer={tournament.toggleTimer}
          resetTimer={tournament.resetTimer}
          nextLevel={tournament.nextLevel}
          prevLevel={tournament.prevLevel}
        />
      )}
      {activeView === "players" && (
        <PlayersView
          players={tournament.players}
          addPlayer={tournament.addPlayer}
          eliminatePlayer={tournament.eliminatePlayer}
          reinstatePlayer={tournament.reinstatePlayer}
          removePlayer={tournament.removePlayer}
        />
      )}
      {activeView === "director" && (
        <DirectorView
          tournamentName={tournament.tournamentName}
          setTournamentName={tournament.setTournamentName}
          startingChips={tournament.startingChips}
          setStartingChips={tournament.setStartingChips}
          players={tournament.players}
          currentLevel={tournament.currentLevel}
          blindLevels={tournament.blindLevels}
        />
      )}
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
};

export default Index;
