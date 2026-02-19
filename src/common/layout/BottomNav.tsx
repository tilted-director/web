import { cn } from "@/lib/utils";
import { LayoutDashboard, Timer, Users, Settings } from "lucide-react";

export type ViewType = "dashboard" | "timer" | "players" | "director";

interface BottomNavProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const navItems: {
  view: ViewType;
  icon: typeof LayoutDashboard;
  label: string;
}[] = [
  { view: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { view: "timer", icon: Timer, label: "Timer" },
  { view: "players", icon: Users, label: "Players" },
  { view: "director", icon: Settings, label: "Director" },
];

export const BottomNav = ({ activeView, onNavigate }: BottomNavProps) => {
  return (
    <nav className="border-t-4 border-primary bg-card">
      <div className="flex justify-around items-center py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all font-display text-xs tracking-wide",
                isActive
                  ? "text-primary scale-110 -translate-y-1"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                size={isActive ? 26 : 22}
                className={cn(
                  "transition-all",
                  isActive && "drop-shadow-[0_0_8px_hsl(var(--gold-glow)/0.6)]",
                )}
              />
              <span className={cn(isActive && "text-outline")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
