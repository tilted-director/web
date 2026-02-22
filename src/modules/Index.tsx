import { useState } from "react";
import { BottomNav, type ViewType } from "@/common/layout/BottomNav";
import { DashboardView } from "@/views/Dashboard";
import { TimerView } from "@/views/Timer";
import { PlayersView } from "@/views/Players";
import { DirectorView } from "@/views/Director";

const VIEWS = {
  dashboard: DashboardView,
  timer: TimerView,
  players: PlayersView,
  director: DirectorView,
};

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const ActiveViewComponent = VIEWS[activeView];

  return (
    <div className="min-h-screen gradient-felt max-w-4xl mx-auto px-6 pt-6 pb-24">
      <ActiveViewComponent />
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
};

export default Index;
