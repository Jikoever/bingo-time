import { supabase } from "@/integrations/supabase/client";

export type GridSize = 3 | 4 | 5;

export interface BingoCell {
  id: string;
  task: string;
  completed: boolean;
}

export interface BingoGame {
  id: string;
  gridSize: GridSize;
  cells: BingoCell[];
  bingoLines: number[][];
  createdAt: string;
  bingoCount: number;
}

export function getRandomTasks(count: number, exclude: string[] = [], sampleTasks: readonly string[]): string[] {
  const available = sampleTasks.filter(t => !exclude.includes(t));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function createEmptyGrid(size: GridSize): BingoCell[] {
  return Array.from({ length: size * size }, (_, i) => ({
    id: `cell-${i}`,
    task: "",
    completed: false,
  }));
}

export function checkBingoLines(cells: BingoCell[], size: GridSize): number[][] {
  const lines: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row = Array.from({ length: size }, (_, c) => r * size + c);
    if (row.every(i => cells[i].completed)) lines.push(row);
  }
  for (let c = 0; c < size; c++) {
    const col = Array.from({ length: size }, (_, r) => r * size + c);
    if (col.every(i => cells[i].completed)) lines.push(col);
  }
  const diag1 = Array.from({ length: size }, (_, i) => i * size + i);
  if (diag1.every(i => cells[i].completed)) lines.push(diag1);
  const diag2 = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i));
  if (diag2.every(i => cells[i].completed)) lines.push(diag2);
  return lines;
}

// Cloud-based save
export async function saveGame(game: BingoGame) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("bingo_games")
    .select("id")
    .eq("user_id", user.id)
    .eq("played_date", game.createdAt)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("bingo_games")
      .update({
        cells: game.cells as any,
        bingo_lines: game.bingoLines as any,
        bingo_count: game.bingoCount,
        grid_size: game.gridSize,
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("bingo_games")
      .insert({
        user_id: user.id,
        grid_size: game.gridSize,
        cells: game.cells as any,
        bingo_lines: game.bingoLines as any,
        bingo_count: game.bingoCount,
        played_date: game.createdAt,
      });
  }
}

export async function getTodayGame(): Promise<BingoGame | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("bingo_games")
    .select("*")
    .eq("user_id", user.id)
    .eq("played_date", today)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    gridSize: data.grid_size as GridSize,
    cells: data.cells as unknown as BingoCell[],
    bingoLines: data.bingo_lines as unknown as number[][],
    createdAt: data.played_date,
    bingoCount: data.bingo_count,
  };
}

export async function getBingoHistory(): Promise<Record<string, number>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("bingo_games")
    .select("played_date, bingo_count")
    .eq("user_id", user.id);

  const history: Record<string, number> = {};
  data?.forEach(g => {
    history[g.played_date] = g.bingo_count;
  });
  return history;
}
