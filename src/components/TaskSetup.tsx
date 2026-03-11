import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Shuffle, Sparkles, Trash2, Bot, Loader2, CheckCircle2, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GridSize, getRandomTasks, createEmptyGrid, BingoGame, saveGame } from "@/lib/bingo-utils";
import { Translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";

interface Props {
  onGameCreated: (game: BingoGame) => void;
  t: Translations;
}

const gridOptions: { size: GridSize; label: string }[] = [
  { size: 3, label: "3×3" },
  { size: 4, label: "4×4" },
  { size: 5, label: "5×5" },
];

export default function TaskSetup({ onGameCreated, t }: Props) {
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { locale } = useLocale();

  // AI breakdown state
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<string[]>([]);
  const [showAi, setShowAi] = useState(false);

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingAiIndex, setEditingAiIndex] = useState<number | null>(null);
  const [editingAiValue, setEditingAiValue] = useState("");

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

  const startEditAiTask = (index: number) => {
    setEditingAiIndex(index);
    setEditingAiValue(aiResults[index]);
  };

  const saveEditAiTask = () => {
    if (editingAiIndex === null) return;
    if (editingAiValue.trim()) {
      setAiResults(aiResults.map((t, i) => (i === editingAiIndex ? editingAiValue.trim() : t)));
    }
    setEditingAiIndex(null);
  };

  const fillRandom = () => {
    const needed = totalSlots - tasks.length;
    if (needed <= 0) return;
    const random = getRandomTasks(needed, tasks, t.sampleTasks);
    setTasks([...tasks, ...random]);
  };

  const addAiTask = (task: string, index: number) => {
    if (tasks.length >= totalSlots) return;
    setTasks([...tasks, task]);
    setAiResults(aiResults.filter((_, i) => i !== index));
  };

  const useAllAiTasks = () => {
    const slotsLeft = totalSlots - tasks.length;
    const toAdd = aiResults.slice(0, slotsLeft);
    setTasks([...tasks, ...toAdd]);
    setAiResults(aiResults.slice(slotsLeft));
  };

  const aiBreakdown = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    setEditingAiIndex(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-breakdown", {
        body: { task: aiInput.trim(), count: totalSlots, locale },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiResults(data.tasks || []);
    } catch (e: any) {
      console.error("AI breakdown error:", e);
      toast.error(t.aiError);
    } finally {
      setAiLoading(false);
    }
  };

  const startGame = () => {
    if (tasks.length !== totalSlots) return;
    const shuffled = [...tasks].sort(() => Math.random() - 0.5);
    const cells = createEmptyGrid(gridSize).map((cell, i) => ({ ...cell, task: shuffled[i] }));
    const game: BingoGame = {
      id: Date.now().toString(),
      gridSize,
      cells,
      bingoLines: [],
      createdAt: new Date().toISOString().slice(0, 10),
      bingoCount: 0,
    };
    saveGame(game);
    onGameCreated(game);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-display text-xl font-bold text-foreground">{t.selectGridSize}</h2>
        <div className="flex gap-3 justify-center">
          {gridOptions.map((opt) => (
            <Button
              key={opt.size}
              variant={gridSize === opt.size ? "default" : "outline"}
              className={cn(
                "font-display text-lg px-6 py-3 rounded-xl transition-all",
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

      {/* AI Task Breakdown Section */}
      <div className="space-y-2">
        <Button
          variant={showAi ? "default" : "outline"}
          onClick={() => setShowAi(!showAi)}
          className="w-full rounded-xl font-display gap-2"
        >
          <Bot className="w-4 h-4" />
          {t.aiBreakdown}
        </Button>

        <AnimatePresence>
          {showAi && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !aiLoading && aiBreakdown()}
                    placeholder={t.aiPlaceholder}
                    className="rounded-xl font-body"
                    disabled={aiLoading}
                  />
                  <Button
                    onClick={aiBreakdown}
                    disabled={!aiInput.trim() || aiLoading}
                    className="rounded-xl shrink-0"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {aiLoading && (
                  <p className="text-sm text-muted-foreground text-center font-body animate-pulse">
                    {t.aiGenerating}
                  </p>
                )}

                {aiResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={useAllAiTasks}
                        disabled={remaining <= 0}
                        className="rounded-lg font-display text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t.aiUseAll} ({Math.min(aiResults.length, remaining)})
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                      {aiResults.map((task, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 text-sm font-body"
                        >
                          {editingAiIndex === i ? (
                            <>
                              <Input
                                value={editingAiValue}
                                onChange={(e) => setEditingAiValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveEditAiTask()}
                                className="h-7 text-sm rounded-lg font-body flex-1"
                                autoFocus
                              />
                              <button onClick={saveEditAiTask} className="text-primary shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => addAiTask(task, i)}
                                disabled={tasks.length >= totalSlots}
                                className="shrink-0 text-primary disabled:opacity-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <span className="flex-1 text-left">{task}</span>
                              <button onClick={() => startEditAiTask(i)} className="text-muted-foreground hover:text-foreground shrink-0">
                                <Pencil className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      <div className="flex gap-2">
        <Button variant="secondary" onClick={fillRandom} disabled={remaining <= 0} className="flex-1 rounded-xl font-display">
          <Shuffle className="w-4 h-4 mr-2" /> {t.randomFill} ({remaining})
        </Button>
      </div>

      <div className="space-y-2">
        <p className="font-body text-sm text-muted-foreground text-center">
          {t.tasksAdded} {tasks.length}/{totalSlots} {t.tasksUnit}
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {tasks.map((task, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 bg-card rounded-lg px-3 py-2 text-sm font-body shadow-sm"
            >
              {editingIndex === i ? (
                <>
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEditTask()}
                    className="h-7 text-sm rounded-lg font-body flex-1 min-w-0"
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
      </div>

      <Button
        onClick={startGame}
        disabled={tasks.length !== totalSlots}
        className="w-full rounded-xl font-display text-lg py-6 shadow-lg"
      >
        <Sparkles className="w-5 h-5 mr-2" /> {t.startBingo}
      </Button>
    </div>
  );
}