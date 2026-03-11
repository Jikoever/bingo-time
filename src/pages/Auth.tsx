import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLocale, Locale, getTranslations } from "@/lib/i18n";
import { Sparkles, Brain, Timer, Zap, CheckCircle2, Crown, Globe, Plus, Shuffle, Trash2, Bot, Pencil, Check, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GridSize, getRandomTasks, createEmptyGrid, checkBingoLines, BingoCell } from "@/lib/bingo-utils";
import { playTapSound, playUntapSound, playBingoSound } from "@/lib/sounds";
import confetti from "canvas-confetti";

const localeLabels: Record<Locale, string> = { zh: "中", en: "EN", es: "ES" };
const localeOrder: Locale[] = ["zh", "en", "es"];
const painIcons = [Brain, Timer, Zap];

const cellColors = [
  "bg-primary", "bg-secondary", "bg-bingo-green",
  "bg-bingo-purple", "bg-bingo-orange", "bg-bingo-pink",
];

// Static demo grid (kept for the "See how it works" section)
function checkLines(completed: Set<number>, size: number) {
  const lines: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row = Array.from({ length: size }, (_, c) => r * size + c);
    if (row.every((i) => completed.has(i))) lines.push(row);
  }
  for (let c = 0; c < size; c++) {
    const col = Array.from({ length: size }, (_, r) => r * size + c);
    if (col.every((i) => completed.has(i))) lines.push(col);
  }
  const d1 = Array.from({ length: size }, (_, i) => i * size + i);
  if (d1.every((i) => completed.has(i))) lines.push(d1);
  const d2 = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i));
  if (d2.every((i) => completed.has(i))) lines.push(d2);
  return lines;
}

function DemoBingoGrid({ tasks }: { tasks: readonly string[] }) {
  const grid = tasks.slice(0, 25);
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4, 5, 7, 12, 17, 19, 20, 22, 23, 24])
  );
  const lines = checkLines(completed, 5);
  const bingoIndices = new Set(lines.flat());
  const toggle = useCallback((i: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  return (
    <div className="grid grid-cols-5 gap-1.5" style={{ maxWidth: "320px", margin: "0 auto" }}>
      {grid.map((task, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.9 }}
          onClick={() => toggle(i)}
          className={cn(
            "aspect-square rounded-xl flex items-center justify-center p-1 text-center text-[9px] font-body font-semibold shadow-sm border-2 border-transparent select-none leading-tight cursor-pointer transition-all duration-200",
            completed.has(i)
              ? bingoIndices.has(i)
                ? "bg-accent text-accent-foreground border-accent scale-105"
                : `${cellColors[i % cellColors.length]} text-primary-foreground opacity-90`
              : "bg-card text-card-foreground border border-border hover:border-primary/30"
          )}
        >
          {task}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Interactive Try-It Demo ───
const gridOptions: { size: GridSize; label: string }[] = [
  { size: 3, label: "3×3" },
  { size: 4, label: "4×4" },
  { size: 5, label: "5×5" },
];

function InteractiveDemo({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const [phase, setPhase] = useState<"setup" | "play">("setup");
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Play phase state
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [bingoLines, setBingoLines] = useState<number[][]>([]);
  const [showBingo, setShowBingo] = useState(false);

  const totalSlots = gridSize * gridSize;
  const remaining = totalSlots - tasks.length;

  const addTask = () => {
    if (!input.trim() || tasks.length >= totalSlots) return;
    setTasks([...tasks, input.trim()]);
    setInput("");
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const startEditTask = (index: number) => {
    setEditingIndex(index);
    setEditingValue(tasks[index]);
  };

  const saveEditTask = () => {
    if (editingIndex === null) return;
    if (editingValue.trim()) {
      setTasks(tasks.map((t, i) => (i === editingIndex ? editingValue.trim() : t)));
    }
    setEditingIndex(null);
  };

  const fillRandom = () => {
    const needed = totalSlots - tasks.length;
    if (needed <= 0) return;
    const random = getRandomTasks(needed, tasks, t.sampleTasks);
    setTasks([...tasks, ...random]);
  };

  const startGame = () => {
    if (tasks.length !== totalSlots) return;
    const shuffled = [...tasks].sort(() => Math.random() - 0.5);
    const newCells = createEmptyGrid(gridSize).map((cell, i) => ({ ...cell, task: shuffled[i] }));
    setCells(newCells);
    setBingoLines([]);
    setPhase("play");
  };

  const toggleCell = (index: number) => {
    const wasCompleted = cells[index].completed;
    const updated = cells.map((c, i) =>
      i === index ? { ...c, completed: !c.completed } : c
    );
    setCells(updated);
    const newLines = checkBingoLines(updated, gridSize);

    if (!wasCompleted) {
      playTapSound();
      if (newLines.length > bingoLines.length) {
        setTimeout(() => {
          playBingoSound();
          setShowBingo(true);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#e84057", "#3bb54a", "#8b5cf6", "#f59e0b", "#e84057"],
          });
          setTimeout(() => setShowBingo(false), 2500);
        }, 150);
      }
    } else {
      playUntapSound();
    }

    setBingoLines(newLines);
  };

  const resetDemo = () => {
    setPhase("setup");
    setTasks([]);
    setCells([]);
    setBingoLines([]);
  };

  const bingoIndicesSet = new Set(bingoLines.flat());

  if (phase === "play") {
    return (
      <div className="relative space-y-4 mx-auto" style={{ maxWidth: gridSize === 3 ? "340px" : gridSize === 4 ? "400px" : "440px" }}>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {cells.map((cell, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => toggleCell(i)}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center p-1 text-center transition-all duration-200 font-body font-semibold shadow-md border-2 border-transparent cursor-pointer select-none",
                gridSize === 3 ? "text-sm" : gridSize === 4 ? "text-xs" : "text-[10px]",
                cell.completed
                  ? bingoIndicesSet.has(i)
                    ? "bg-accent text-accent-foreground border-accent scale-105 bingo-line-shimmer"
                    : `${cellColors[i % cellColors.length]} text-primary-foreground opacity-90`
                  : "bg-card text-card-foreground hover:shadow-lg hover:border-primary/30"
              )}
            >
              <span className={cn(cell.completed && "animate-cell-complete")}>
                {cell.task}
              </span>
            </motion.button>
          ))}
        </div>

        {bingoLines.length > 0 && (
          <div className="mt-4 text-center">
            <span className="font-display text-lg text-primary font-bold">
              🎉 BINGO × {bingoLines.length}
            </span>
          </div>
        )}

        <AnimatePresence>
          {showBingo && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="font-display text-6xl font-bold text-primary drop-shadow-lg animate-bingo-pop">
                BINGO! 🎊
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="outline" onClick={resetDemo} className="w-full rounded-xl font-display">
          ↺ {t.selectGridSize}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* Grid size */}
      <div className="text-center space-y-2">
        <h3 className="font-display text-lg font-bold text-foreground">{t.selectGridSize}</h3>
        <div className="flex gap-3 justify-center">
          {gridOptions.map((opt) => (
            <Button
              key={opt.size}
              variant={gridSize === opt.size ? "default" : "outline"}
              className={cn(
                "font-display text-base px-5 py-2 rounded-xl transition-all",
                gridSize === opt.size && "shadow-lg scale-105"
              )}
              onClick={() => {
                setGridSize(opt.size);
                setTasks(tasks.slice(0, opt.size * opt.size));
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder={t.inputTask}
          className="rounded-xl font-body"
          disabled={tasks.length >= totalSlots}
        />
        <Button onClick={addTask} disabled={!input.trim() || tasks.length >= totalSlots} className="rounded-xl">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Random fill */}
      <Button variant="secondary" onClick={fillRandom} disabled={remaining <= 0} className="w-full rounded-xl font-display">
        <Shuffle className="w-4 h-4 mr-2" /> {t.randomFill} ({remaining})
      </Button>

      {/* Task list */}
      <div className="space-y-2">
        <p className="font-body text-sm text-muted-foreground text-center">
          {t.tasksAdded} {tasks.length}/{totalSlots} {t.tasksUnit}
        </p>
        {tasks.length > 0 && (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {tasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 bg-card rounded-lg px-3 py-2 text-xs font-body shadow-sm"
              >
                {editingIndex === i ? (
                  <>
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEditTask()}
                      className="h-6 text-xs rounded-lg font-body flex-1 min-w-0"
                      autoFocus
                    />
                    <button onClick={saveEditTask} className="text-primary shrink-0">
                      <Check className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate">{task}</span>
                    <button onClick={() => startEditTask(i)} className="text-muted-foreground hover:text-foreground shrink-0">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeTask(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Start */}
      <Button
        onClick={startGame}
        disabled={tasks.length !== totalSlots}
        className="w-full rounded-xl font-display text-lg py-5 shadow-lg"
      >
        <Sparkles className="w-5 h-5 mr-2" /> {t.startBingo}
      </Button>
    </div>
  );
}

// ─── Main Auth Page ───
export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const cycleLocale = () => {
    const idx = localeOrder.indexOf(locale);
    setLocale(localeOrder[(idx + 1) % localeOrder.length]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={cycleLocale} className="rounded-xl h-8 w-8">
              <Globe className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-display font-bold text-muted-foreground">{localeLabels[locale]}</span>
          </div>
          <span className="font-display text-lg font-bold text-primary">✨ BINGO TIME</span>
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            size="sm"
            className="rounded-xl font-body text-xs gap-2 h-8 px-3"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.signIn}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 pt-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {t.appTitle}
          </h1>
          <p className="font-body text-muted-foreground italic text-sm">
            stop thinking, start clicking.
          </p>
          <p className="font-body text-lg md:text-xl text-foreground/80 max-w-xl mx-auto leading-relaxed pt-2 whitespace-pre-line">
            {t.heroDesc.split("ADHD").map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>{part}<span className="text-primary font-bold">ADHD</span></span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </motion.section>

        {/* Problem & Solution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {t.painPoints.map((item, i) => {
            const Icon = painIcons[i];
            return (
              <div key={i} className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-2">
                <Icon className="w-8 h-8 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </motion.section>

        {/* Interactive Try-It Demo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl font-bold text-foreground">{t.tryItTitle}</h2>
            <p className="font-body text-sm text-muted-foreground">{t.tryItDesc}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <InteractiveDemo locale={locale} />
          </div>

          {/* Save hint with login */}
          <div className="flex items-center justify-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
            <p className="font-body text-sm text-muted-foreground">{t.saveHint}</p>
            <Button
              onClick={handleGoogleSignIn}
              size="sm"
              className="rounded-xl font-display text-xs gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              Gmail
            </Button>
          </div>
        </motion.section>



        {/* Pricing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="font-display text-2xl font-bold text-center text-foreground">{t.choosePlan}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-4">
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-foreground">Basic</h3>
                <p className="font-display text-3xl font-bold text-primary">{t.free}</p>
              </div>
              <ul className="space-y-2.5 font-body text-sm text-muted-foreground">
                {t.basicFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleGoogleSignIn} className="w-full rounded-xl font-display">
                <Sparkles className="w-4 h-4 mr-1" /> {t.freeStart}
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-primary relative space-y-4">
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-display font-bold px-3 py-1 rounded-full">
                {t.recommended}
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" /> Pro
                </h3>
                <p className="font-display text-3xl font-bold text-primary">
                  $4.99<span className="text-base font-body text-muted-foreground">{t.perMonth}</span>
                </p>
              </div>
              <ul className="space-y-2.5 font-body text-sm text-muted-foreground">
                {t.proFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full rounded-xl font-display border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                disabled
              >
                {t.comingSoon}
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center pb-8"
        >
          <p className="font-body text-sm text-muted-foreground">{t.footerCta}</p>
        </motion.section>
      </main>
    </div>
  );
}
