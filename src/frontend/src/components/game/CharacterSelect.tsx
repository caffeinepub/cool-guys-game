import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { DevilFruit, PlayerSelections } from "../../App";

const DEVIL_FRUITS: Array<{
  id: DevilFruit;
  name: string;
  type: string;
  description: string;
  color: string;
  glowColor: string;
  emoji: string;
  specialMove: string;
  damage: number;
}> = [
  {
    id: "mera-mera",
    name: "Mera Mera no Mi",
    type: "Logia — Fire",
    description: "Transform into fire. Engulf enemies in searing flames.",
    color: "#ff4500",
    glowColor: "rgba(255,80,0,0.6)",
    emoji: "🔥",
    specialMove: "Hiken!",
    damage: 45,
  },
  {
    id: "goro-goro",
    name: "Goro Goro no Mi",
    type: "Logia — Lightning",
    description: "Become lightning itself. Strike with 200 million volts.",
    color: "#00aaff",
    glowColor: "rgba(0,170,255,0.6)",
    emoji: "⚡",
    specialMove: "El Thor!",
    damage: 50,
  },
  {
    id: "hana-hana",
    name: "Hana Hana no Mi",
    type: "Paramecia — Clone",
    description: "Sprout limbs anywhere. Unleash a storm of strikes.",
    color: "#cc44ff",
    glowColor: "rgba(200,60,255,0.6)",
    emoji: "🌸",
    specialMove: "Cien Fleur!",
    damage: 35,
  },
  {
    id: "gomu-gomu",
    name: "Gomu Gomu no Mi",
    type: "Paramecia — Rubber",
    description: "Rubber body, infinite stretch. Gear up and dominate.",
    color: "#aadd00",
    glowColor: "rgba(160,220,0,0.6)",
    emoji: "🥊",
    specialMove: "Gum-Gum Gatling!",
    damage: 40,
  },
];

interface Props {
  onStart: (selections: PlayerSelections) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onStart, onBack }: Props) {
  const [p1Index, setP1Index] = useState(0);
  const [p2Index, setP2Index] = useState(1);
  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      e.preventDefault();
      if (!p1Ready) {
        if (e.key === "w" || e.key === "W")
          setP1Index(
            (i) => (i - 1 + DEVIL_FRUITS.length) % DEVIL_FRUITS.length,
          );
        if (e.key === "s" || e.key === "S")
          setP1Index((i) => (i + 1) % DEVIL_FRUITS.length);
        if (e.key === "Enter") setP1Ready(true);
      }
      if (!p2Ready) {
        if (e.key === "ArrowUp")
          setP2Index(
            (i) => (i - 1 + DEVIL_FRUITS.length) % DEVIL_FRUITS.length,
          );
        if (e.key === "ArrowDown")
          setP2Index((i) => (i + 1) % DEVIL_FRUITS.length);
        if (e.key === "Enter") setP2Ready(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [p1Ready, p2Ready]);

  useEffect(() => {
    if (p1Ready && p2Ready) {
      const timer = setTimeout(() => {
        onStart({
          p1: DEVIL_FRUITS[p1Index].id,
          p2: DEVIL_FRUITS[p2Index].id,
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [p1Ready, p2Ready, p1Index, p2Index, onStart]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-8 pb-8"
      style={{
        background:
          "linear-gradient(160deg, #070A14 0%, #0D1020 50%, #070A14 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1
          className="text-gold text-5xl font-black tracking-widest uppercase mb-1"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Choose Your Devil Fruit
        </h1>
        <p className="text-muted-foreground tracking-widest uppercase text-sm">
          P1: W/S to select, Enter to confirm &nbsp;|&nbsp; P2: ↑/↓ to select,
          Enter to confirm
        </p>
      </motion.div>

      {/* Devil Fruits image */}
      <motion.img
        src="/assets/generated/devil-fruits.dim_400x300.png"
        alt="Devil Fruits"
        className="w-64 h-auto object-contain mb-6 animate-float"
        style={{ filter: "drop-shadow(0 0 20px oklch(0.72 0.14 70 / 0.5))" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      />

      {/* Two-column layout */}
      <div className="flex gap-8 w-full max-w-5xl px-4">
        <PlayerColumn
          player={1}
          fruits={DEVIL_FRUITS}
          selectedIndex={p1Index}
          ready={p1Ready}
          color="red"
          onSelect={setP1Index}
          onReady={() => setP1Ready(true)}
        />
        <PlayerColumn
          player={2}
          fruits={DEVIL_FRUITS}
          selectedIndex={p2Index}
          ready={p2Ready}
          color="blue"
          onSelect={setP2Index}
          onReady={() => setP2Ready(true)}
        />
      </div>

      {p1Ready && p2Ready && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center"
        >
          <p
            className="text-gold text-2xl font-bold tracking-widest uppercase animate-pulse"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ⚡ BATTLE BEGINS! ⚡
          </p>
        </motion.div>
      )}

      <button
        type="button"
        data-ocid="character_select.back.button"
        onClick={onBack}
        className="mt-6 btn-action px-8 py-2 text-sm rounded-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.04 255) 0%, oklch(0.12 0.03 255) 100%)",
        }}
      >
        ← BACK
      </button>
    </div>
  );
}

function PlayerColumn({
  player,
  fruits,
  selectedIndex,
  ready,
  color,
  onSelect,
  onReady,
}: {
  player: number;
  fruits: typeof DEVIL_FRUITS;
  selectedIndex: number;
  ready: boolean;
  color: string;
  onSelect: (i: number) => void;
  onReady: () => void;
}) {
  const selected = fruits[selectedIndex];
  const borderColor =
    color === "red" ? "oklch(0.6 0.22 25)" : "oklch(0.55 0.2 255)";
  const headerBg =
    color === "red"
      ? "linear-gradient(135deg, oklch(0.35 0.18 15) 0%, oklch(0.22 0.12 15) 100%)"
      : "linear-gradient(135deg, oklch(0.30 0.18 255) 0%, oklch(0.18 0.12 255) 100%)";

  return (
    <div
      className="flex-1 card-dark p-4 flex flex-col gap-3"
      style={{ border: `1px solid ${borderColor}50` }}
    >
      <div
        className="text-center py-2 rounded-sm"
        style={{ background: headerBg }}
      >
        <span
          className="text-white font-black text-xl uppercase tracking-widest"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          PLAYER {player}
        </span>
        {ready && (
          <span className="ml-3 text-sm text-gold animate-pulse">✓ READY</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {fruits.map((fruit, i) => (
          <motion.button
            key={fruit.id}
            type="button"
            data-ocid={`p${player}_fruit.item.${i + 1}`}
            onClick={() => {
              onSelect(i);
            }}
            onDoubleClick={() => {
              onSelect(i);
              onReady();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-left p-3 rounded-sm transition-all"
            style={{
              background:
                i === selectedIndex
                  ? `linear-gradient(135deg, ${fruit.color}25 0%, ${fruit.color}10 100%)`
                  : "oklch(0.10 0.02 255)",
              border:
                i === selectedIndex
                  ? `1px solid ${fruit.color}80`
                  : "1px solid oklch(0.20 0.02 255)",
              boxShadow:
                i === selectedIndex ? `0 0 15px ${fruit.glowColor}` : "none",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{fruit.emoji}</span>
              <div>
                <div className="font-bold text-white text-sm tracking-wide">
                  {fruit.name}
                </div>
                <div className="text-xs" style={{ color: fruit.color }}>
                  {fruit.type}
                </div>
              </div>
              {i === selectedIndex && (
                <span className="ml-auto text-gold text-lg">◄</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div
        className="p-3 rounded-sm"
        style={{
          background: `${selected.color}15`,
          border: `1px solid ${selected.color}40`,
        }}
      >
        <p className="text-white text-sm mb-1">{selected.description}</p>
        <p className="text-xs" style={{ color: selected.color }}>
          Special: <strong>{selected.specialMove}</strong> — {selected.damage}{" "}
          dmg
        </p>
      </div>

      {!ready ? (
        <button
          type="button"
          data-ocid={`p${player}_fruit.confirm.button`}
          onClick={onReady}
          className="btn-action py-2 text-sm rounded-sm w-full"
        >
          CONFIRM — {selected.emoji} {selected.name.split(" ")[0]}
        </button>
      ) : (
        <div
          className="text-center py-2 text-gold font-bold animate-pulse"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          ✓ {selected.emoji} CONFIRMED
        </div>
      )}
    </div>
  );
}
