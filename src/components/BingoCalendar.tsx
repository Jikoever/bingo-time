import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBingoHistory } from "@/lib/bingo-utils";
import { Translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  t: Translations;
}

export default function BingoCalendar({ t }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [history, setHistory] = useState<Record<string, number>>({});

  useEffect(() => {
    getBingoHistory().then(setHistory);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const today = new Date().toISOString().slice(0, 10);
  const monthLabel = t.monthLabel(year, month + 1);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-xl font-bold">{monthLabel}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {t.weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-body text-muted-foreground py-2">
            {d}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const bingoCount = history[dateStr] || 0;
          const isToday = dateStr === today;

          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-body transition-all",
                isToday && "ring-2 ring-primary",
                bingoCount > 0
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground"
              )}
            >
              <span className="font-semibold">{day}</span>
              {bingoCount > 0 && (
                <span className="text-[10px] font-bold">🎯{bingoCount}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-sm font-body text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-primary inline-block" /> {t.hasBingo}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-card border inline-block" /> {t.noRecord}
        </span>
      </div>
    </div>
  );
}
