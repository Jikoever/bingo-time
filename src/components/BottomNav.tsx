import { Grid3X3, CalendarDays } from "lucide-react";
import { Translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  active: "board" | "calendar";
  onChange: (tab: "board" | "calendar") => void;
  t: Translations;
}

export default function BottomNav({ active, onChange, t }: Props) {
  const tabs = [
    { id: "board" as const, label: t.board, icon: Grid3X3 },
    { id: "calendar" as const, label: t.calendar, icon: CalendarDays },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center py-3 gap-1 transition-colors font-body text-xs",
              active === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className={cn("w-5 h-5", active === tab.id && "scale-110")} />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
