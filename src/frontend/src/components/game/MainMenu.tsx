import { motion } from "motion/react";

interface Props {
  onStart: () => void;
  onLeaderboard: () => void;
}

const STAR_DATA = [
  { w: 1, l: 0.3, t: 12.5, o: 0.4 },
  { w: 2, l: 14.1, t: 24.8, o: 0.6 },
  { w: 1, l: 27.6, t: 67.3, o: 0.3 },
  { w: 2, l: 41.2, t: 8.9, o: 0.7 },
  { w: 1, l: 55.8, t: 45.1, o: 0.5 },
  { w: 2, l: 69.4, t: 31.7, o: 0.4 },
  { w: 1, l: 82.9, t: 78.2, o: 0.6 },
  { w: 2, l: 96.5, t: 15.4, o: 0.3 },
  { w: 1, l: 7.3, t: 52.6, o: 0.5 },
  { w: 2, l: 20.8, t: 89.1, o: 0.4 },
  { w: 1, l: 34.4, t: 36.8, o: 0.6 },
  { w: 2, l: 48.0, t: 61.5, o: 0.3 },
  { w: 1, l: 61.5, t: 4.2, o: 0.7 },
  { w: 2, l: 75.1, t: 93.7, o: 0.4 },
  { w: 1, l: 88.6, t: 47.9, o: 0.5 },
  { w: 2, l: 2.2, t: 71.3, o: 0.3 },
  { w: 1, l: 15.7, t: 18.6, o: 0.6 },
  { w: 2, l: 29.3, t: 84.0, o: 0.4 },
  { w: 1, l: 42.8, t: 29.4, o: 0.5 },
  { w: 2, l: 56.4, t: 56.8, o: 0.7 },
  { w: 1, l: 69.9, t: 3.1, o: 0.3 },
  { w: 2, l: 83.5, t: 40.5, o: 0.6 },
  { w: 1, l: 97.0, t: 75.9, o: 0.4 },
  { w: 2, l: 10.6, t: 62.2, o: 0.5 },
  { w: 1, l: 24.1, t: 10.7, o: 0.3 },
  { w: 2, l: 37.7, t: 97.4, o: 0.7 },
  { w: 1, l: 51.2, t: 43.8, o: 0.4 },
  { w: 2, l: 64.8, t: 21.1, o: 0.6 },
  { w: 1, l: 78.3, t: 58.5, o: 0.5 },
  { w: 2, l: 91.9, t: 85.9, o: 0.3 },
  { w: 1, l: 5.4, t: 33.2, o: 0.6 },
  { w: 2, l: 19.0, t: 70.6, o: 0.4 },
  { w: 1, l: 32.5, t: 16.0, o: 0.5 },
  { w: 2, l: 46.1, t: 50.3, o: 0.7 },
  { w: 1, l: 59.6, t: 88.7, o: 0.3 },
  { w: 2, l: 73.2, t: 27.1, o: 0.6 },
  { w: 1, l: 86.7, t: 64.4, o: 0.4 },
  { w: 2, l: 0.3, t: 91.8, o: 0.5 },
  { w: 1, l: 13.8, t: 38.2, o: 0.3 },
  { w: 2, l: 27.4, t: 5.5, o: 0.7 },
];

export default function MainMenu({ onStart, onLeaderboard }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #070A14 0%, #0D1020 50%, #070A14 100%)",
      }}
    >
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_DATA.map((star) => (
          <div
            key={`star-${star.l}-${star.t}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.w}px`,
              height: `${star.w}px`,
              left: `${star.l}%`,
              top: `${star.t}%`,
              opacity: star.o,
            }}
          />
        ))}
      </div>

      {/* Animated ocean waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 96"
          className="w-full h-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Ocean waves"
        >
          <title>Ocean waves</title>
          <motion.path
            d="M0,48 C360,96 720,0 1080,48 C1260,72 1380,40 1440,48 L1440,96 L0,96 Z"
            fill="oklch(0.15 0.04 240 / 0.4)"
            animate={{
              d: [
                "M0,48 C360,96 720,0 1080,48 C1260,72 1380,40 1440,48 L1440,96 L0,96 Z",
                "M0,32 C360,0 720,96 1080,32 C1260,8 1380,60 1440,32 L1440,96 L0,96 Z",
                "M0,48 C360,96 720,0 1080,48 C1260,72 1380,40 1440,48 L1440,96 L0,96 Z",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Hero Characters Image */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="animate-float mb-2"
      >
        <img
          src="/assets/generated/hero-characters.dim_800x400.png"
          alt="Cool Guys Characters"
          className="w-full max-w-2xl h-auto object-contain"
          style={{ filter: "drop-shadow(0 0 30px oklch(0.72 0.14 70 / 0.5))" }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mb-2"
      >
        <h1
          className="title-gradient text-7xl md:text-8xl font-black tracking-widest mb-1"
          style={{ fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}
        >
          COOL GUYS
        </h1>
        <h2
          className="text-gold text-3xl md:text-4xl font-bold tracking-[0.3em]"
          style={{ fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}
        >
          GAME
        </h2>
        <p className="text-muted-foreground text-lg mt-2 tracking-widest uppercase">
          One Piece — Devil Fruit Chronicles
        </p>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-80 h-px my-6"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.14 70), transparent)",
        }}
      />

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col gap-4 items-center"
      >
        <button
          type="button"
          data-ocid="menu.start.primary_button"
          onClick={onStart}
          className="btn-action animate-pulse-gold px-16 py-4 text-xl rounded-sm"
          style={{ minWidth: "260px" }}
        >
          ⚔️ START GAME
        </button>
        <button
          type="button"
          data-ocid="menu.leaderboard.secondary_button"
          onClick={onLeaderboard}
          className="btn-action px-16 py-4 text-xl rounded-sm"
          style={{
            minWidth: "260px",
            background:
              "linear-gradient(135deg, oklch(0.16 0.04 255) 0%, oklch(0.12 0.03 255) 100%)",
          }}
        >
          🏆 LEADERBOARD
        </button>
      </motion.div>

      {/* Controls hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-28 text-center"
      >
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          P1: WASD + F attack + Q special &nbsp;|&nbsp; P2: Arrows + L attack +
          O special
        </p>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
