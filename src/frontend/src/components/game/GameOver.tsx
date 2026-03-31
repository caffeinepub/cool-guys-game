import { motion } from "motion/react";
import { useEffect } from "react";
import type { GameResult } from "../../App";
import { useSetPlayerData } from "../../hooks/useQueries";

const FRUIT_NAMES: Record<string, string> = {
  "mera-mera": "Mera Mera 🔥",
  "goro-goro": "Goro Goro ⚡",
  "hana-hana": "Hana Hana 🌸",
  "gomu-gomu": "Gomu Gomu 🥊",
};

interface Props {
  result: GameResult;
  onPlayAgain: () => void;
  onMenu: () => void;
  onLeaderboard: () => void;
}

export default function GameOver({
  result,
  onPlayAgain,
  onMenu,
  onLeaderboard,
}: Props) {
  const { mutate: saveScore } = useSetPlayerData();

  useEffect(() => {
    saveScore({
      username: `P1-${(FRUIT_NAMES[result.p1Fruit] ?? result.p1Fruit).split(" ")[0]}`,
      highestLevel: BigInt(result.level),
      highScore: BigInt(result.score),
      devilFruit: result.p1Fruit,
    });
  }, [result, saveScore]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #070A14 0%, #0D1020 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="card-dark p-10 text-center max-w-lg w-full mx-4"
        style={{ border: "1px solid rgba(200,60,60,0.5)" }}
        data-ocid="gameover.panel"
      >
        <img
          src="/assets/generated/boss-monster.dim_400x300.png"
          alt="Boss Monster"
          className="w-40 h-auto object-contain mx-auto mb-4 opacity-80 animate-float"
          style={{ filter: "drop-shadow(0 0 20px rgba(200,0,0,0.6))" }}
        />

        <h1
          className="text-5xl font-black tracking-widest uppercase mb-2"
          style={{
            fontFamily: "'Cinzel', serif",
            color: "rgba(220,60,60,0.95)",
            textShadow: "0 0 30px rgba(200,0,0,0.5)",
          }}
        >
          GAME OVER
        </h1>

        <div
          className="w-full h-px my-4"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(200,60,60,0.6), transparent)",
          }}
        />

        <div className="flex justify-center gap-12 mb-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Level Reached
            </p>
            <p
              className="text-gold text-4xl font-black"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {result.level}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Final Score
            </p>
            <p
              className="text-gold text-4xl font-black"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {result.score}
            </p>
          </div>
        </div>

        <div className="card-dark p-4 mb-6 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-muted-foreground text-xs uppercase mb-1">
              Player 1
            </p>
            <p className="text-white font-bold">
              {FRUIT_NAMES[result.p1Fruit] ?? result.p1Fruit}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs uppercase mb-1">
              Player 2
            </p>
            <p className="text-white font-bold">
              {FRUIT_NAMES[result.p2Fruit] ?? result.p2Fruit}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-ocid="gameover.play_again.primary_button"
            onClick={onPlayAgain}
            className="btn-action animate-pulse-gold py-3 text-lg rounded-sm"
          >
            ⚔️ PLAY AGAIN
          </button>
          <button
            type="button"
            data-ocid="gameover.leaderboard.secondary_button"
            onClick={onLeaderboard}
            className="btn-action py-3 text-lg rounded-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.16 0.04 255) 0%, oklch(0.12 0.03 255) 100%)",
            }}
          >
            🏆 LEADERBOARD
          </button>
          <button
            type="button"
            data-ocid="gameover.menu.button"
            onClick={onMenu}
            className="btn-action py-2 text-sm rounded-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.03 255) 0%, oklch(0.10 0.02 255) 100%)",
            }}
          >
            ← MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
