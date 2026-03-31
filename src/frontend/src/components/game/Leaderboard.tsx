import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useLeaderboard } from "../../hooks/useQueries";

const FRUIT_EMOJIS: Record<string, string> = {
  "mera-mera": "🔥",
  "goro-goro": "⚡",
  "hana-hana": "🌸",
  "gomu-gomu": "🥊",
};

const RANK_STYLES = [
  { color: "#FFD700", label: "🥇" },
  { color: "#C0C0C0", label: "🥈" },
  { color: "#CD7F32", label: "🥉" },
];

interface Props {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: Props) {
  const { data: leaderboard, isLoading } = useLeaderboard();

  const sorted = leaderboard
    ? [...leaderboard].sort(
        (a, b) => Number(b.score.highScore) - Number(a.score.highScore),
      )
    : [];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-12 pb-8"
      style={{
        background: "linear-gradient(160deg, #070A14 0%, #0D1020 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl px-4"
      >
        <div className="text-center mb-8">
          <h1
            className="title-gradient text-6xl font-black tracking-widest uppercase mb-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            🏆 Leaderboard
          </h1>
          <p className="text-muted-foreground tracking-widest uppercase text-sm">
            Hall of the Strongest
          </p>
          <div
            className="w-64 h-px mx-auto mt-4"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.72 0.14 70), transparent)",
            }}
          />
        </div>

        <div className="card-dark p-1" data-ocid="leaderboard.table">
          {isLoading ? (
            <div
              className="p-6 flex flex-col gap-3"
              data-ocid="leaderboard.loading_state"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <Skeleton
                  key={`skel-${n}`}
                  className="h-14 rounded-sm"
                  style={{ background: "rgba(40,50,80,0.5)" }}
                />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="leaderboard.empty_state"
            >
              <p className="text-6xl mb-4">⚓</p>
              <p className="text-muted-foreground uppercase tracking-widest">
                No scores yet — be the first!
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {sorted.map((entry, i) => {
                const rank = RANK_STYLES[i] ?? {
                  color: "rgba(180,140,50,0.7)",
                  label: `${i + 1}.`,
                };
                const fruitKey = entry.profile.devilFruit;
                const emoji = FRUIT_EMOJIS[fruitKey] ?? "🍎";
                return (
                  <motion.div
                    key={entry.profile.username}
                    data-ocid={`leaderboard.item.${i + 1}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
                    style={{
                      borderColor: "rgba(180,140,50,0.15)",
                      background:
                        i === 0 ? "rgba(200,160,0,0.08)" : "transparent",
                    }}
                  >
                    <span className="text-2xl w-8 text-center">
                      {rank.label}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-white tracking-wide">
                        {entry.profile.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emoji} {fruitKey} · Lv.
                        {String(entry.score.highestLevel)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-black text-xl"
                        style={{
                          color: rank.color,
                          fontFamily: "'Cinzel', serif",
                        }}
                      >
                        {String(entry.score.highScore)}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            data-ocid="leaderboard.back.button"
            onClick={onBack}
            className="btn-action px-12 py-3 text-lg rounded-sm"
          >
            ← BACK TO MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
