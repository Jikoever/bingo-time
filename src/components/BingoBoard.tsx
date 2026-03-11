import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BingoGame, checkBingoLines, saveGame } from "@/lib/bingo-utils";
import { Translations } from "@/lib/i18n";
import { playTapSound, playUntapSound, playBingoSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface Props {
  game: BingoGame;
  onUpdate: (game: BingoGame) => void;
  t: Translations;
}

export default function BingoBoard({ game, onUpdate, t }: Props) {
  const { cells, gridSize } = game;
  const [showBingo, setShowBingo] = useState(false);
  const [prevBingoCount, setPrevBingoCount] = useState(game.bingoCount);

  const cellColors = [
    "bg-primary", "bg-secondary", "bg-bingo-green",
    "bg-bingo-purple", "bg-bingo-orange", "bg-bingo-pink",
  ];

  const toggleCell = (index: number) => {
    const wasCompleted = cells[index].completed;
    if (wasCompleted) {
      playUntapSound();
    } else {
      playTapSound();
    }
    const newCells = cells.map((c, i) =>
      i === index ? { ...c, completed: !c.completed } : c
    );
    const lines = checkBingoLines(newCells, gridSize);
    const newGame = { ...game, cells: newCells, bingoLines: lines, bingoCount: lines.length };
    saveGame(newGame);
    onUpdate(newGame);
  };

  useEffect(() => {
    if (game.bingoCount > prevBingoCount) {
      playBingoSound();
      setShowBingo(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#e84057", "#3bb54a", "#8b5cf6", "#f59e0b", "#e84057"],
      });
      setTimeout(() => setShowBingo(false), 2500);
    }
    setPrevBingoCount(game.bingoCount);
  }, [game.bingoCount]);

  const bingoIndices = new Set(game.bingoLines.flat());

  return (
    <div className="relative">
      <div
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          maxWidth: gridSize === 3 ? "340px" : gridSize === 4 ? "400px" : "440px",
        }}
      >
        {cells.map((cell, i) => (
          <motion.button
            key={cell.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => toggleCell(i)}
            className={cn(
              "aspect-square rounded-xl flex items-center justify-center p-1 text-center transition-all duration-200 font-body font-semibold shadow-md border-2 border-transparent cursor-pointer select-none",
              gridSize === 3 ? "text-sm" : gridSize === 4 ? "text-xs" : "text-[10px]",
              cell.completed
                ? bingoIndices.has(i)
                  ? "bg-accent text-accent-foreground border-accent scale-105 bingo-line-shimmer"
                  : `${cellColors[i % cellColors.length]} text-primary-foreground opacity-90`
                : "bg-card text-card-foreground hover:shadow-lg hover:border-primary/30"
            )}
          >
            <span className={cn(cell.completed && "animate-cell-complete")}>
              {cell.task || t.empty}
            </span>
          </motion.button>
        ))}
      </div>

      {game.bingoCount > 0 && (
        <div className="mt-4 text-center">
          <span className="font-display text-lg text-primary font-bold">
            🎉 BINGO × {game.bingoCount}
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
    </div>
  );
}
