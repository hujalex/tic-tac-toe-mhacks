"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Header } from "@/components/Header";
import { Board } from "@/components/Board";
import {
  createEmptyBoard,
  applyMove,
  checkWinner,
  isDraw,
  isValidMove,
  randomMove,
  type Board as BoardValue,
  type Player,
} from "@/lib/gameLogic";

const HUMAN: Player = "X";
const OPPONENT: Player = "O";

function playSound(name: "move" | "win" | "draw") {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.play().catch(() => {});
}

type Mode = "twoPlayer" | "vsComputer";

const MODES: { value: Mode; label: string }[] = [
  { value: "twoPlayer", label: "2 Player" },
  { value: "vsComputer", label: "vs Computer" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("twoPlayer");
  const [board, setBoard] = useState<BoardValue>(createEmptyBoard());
  const [current, setCurrent] = useState<Player>(HUMAN);

  const winner = checkWinner(board);
  const draw = isDraw(board);
  const gameOver = winner !== null || draw;
  const computersTurn = mode === "vsComputer" && current === OPPONENT;

  function handleCellClick(index: number) {
    if (gameOver || computersTurn || !isValidMove(board, index)) return;

    const nextBoard = applyMove(board, index, current);
    setBoard(nextBoard);
    playSound("move");

    const nextWinner = checkWinner(nextBoard);
    if (nextWinner) {
      playSound("win");
      return;
    }
    if (isDraw(nextBoard)) {
      playSound("draw");
      return;
    }
    setCurrent(current === HUMAN ? OPPONENT : HUMAN);
  }

  function handleReset() {
    setBoard(createEmptyBoard());
    setCurrent(HUMAN);
  }

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    handleReset();
  }

  useEffect(() => {
    if (!computersTurn || gameOver) return;

    const timeout = setTimeout(() => {
      const index = randomMove(board);
      const nextBoard = applyMove(board, index, OPPONENT);
      setBoard(nextBoard);
      playSound("move");

      const nextWinner = checkWinner(nextBoard);
      if (nextWinner) {
        playSound("win");
        return;
      }
      if (isDraw(nextBoard)) {
        playSound("draw");
        return;
      }
      setCurrent(HUMAN);
    }, 400);

    return () => clearTimeout(timeout);
  }, [computersTurn, gameOver, board]);

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center px-4">
      <Navbar />
      <Header />

      <div className="flex gap-2 pb-6 font-mono text-xs uppercase tracking-widest">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleModeChange(value)}
            aria-pressed={mode === value}
            className={`rounded-full px-4 py-2 transition ${
              mode === value
                ? "bg-cream text-moss-900"
                : "bg-moss-800 text-moss-300 hover:text-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Board
        board={board}
        onCellClick={handleCellClick}
        disabled={gameOver || computersTurn}
      />
      <div className="pt-6 font-mono text-sm text-moss-300">
        {winner && `${winner} wins!`}
        {draw && "It's a tie!"}
        {!gameOver && computersTurn && "Computer's turn…"}
        {!gameOver && !computersTurn && `${current}'s turn`}
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="mt-4 rounded-full bg-cream px-6 py-2 font-mono text-xs uppercase tracking-widest text-moss-900 transition hover:bg-leaf"
      >
        New game
      </button>
    </main>
  );
}
