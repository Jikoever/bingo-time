import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskSetup from "@/components/TaskSetup";
import BingoBoard from "@/components/BingoBoard";
import BingoCalendar from "@/components/BingoCalendar";
import BottomNav from "@/components/BottomNav";
import { BingoGame, getTodayGame } from "@/lib/bingo-utils";
import { useLocale, Locale } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

const localeLabels: Record<Locale, string> = { zh: "中", en: "EN", es: "ES" };
const localeOrder: Locale[] = ["zh", "en", "es"];

const Index = () => {
  const [tab, setTab] = useState<"board" | "calendar">("board");
  const [game, setGame] = useState<BingoGame | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale, setLocale, t } = useLocale();
  const { signOut } = useAuth();

  useEffect(() => {
    getTodayGame().then((today) => {
      if (today) setGame(today);
      setLoading(false);
    });
  }, []);

  const resetGame = () => setGame(null);

  const cycleLocale = () => {
    const idx = localeOrder.indexOf(locale);
    setLocale(localeOrder[(idx + 1) % localeOrder.length]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={cycleLocale} className="rounded-xl text-xs font-bold">
              <Globe className="w-4 h-4" />
            </Button>
            <span className="text-xs font-display font-bold text-muted-foreground">{localeLabels[locale]}</span>
          </div>

          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-primary tracking-tight leading-tight">
              {t.appTitle}
            </h1>
            <p className="font-body text-[10px] text-muted-foreground italic -mt-0.5">
              stop thinking, start clicking.
            </p>
          </div>

          <div className="flex items-center gap-1">
            {tab === "board" && game && (
              <Button variant="ghost" size="icon" onClick={resetGame} className="rounded-xl">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="rounded-xl">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === "board" ? (
            <motion.div key="board" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {game ? (
                <BingoBoard game={game} onUpdate={setGame} t={t} />
              ) : (
                <TaskSetup onGameCreated={setGame} t={t} />
              )}
            </motion.div>
          ) : (
            <motion.div key="calendar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <BingoCalendar t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={setTab} t={t} />
    </div>
  );
};

export default Index;
