import { useState } from "react";
import CharacterSelect from "./components/game/CharacterSelect";
import GameOver from "./components/game/GameOver";
import GameScreen from "./components/game/GameScreen";
import Leaderboard from "./components/game/Leaderboard";
import MainMenu from "./components/game/MainMenu";

export type AppScreen =
  | "menu"
  | "character-select"
  | "game"
  | "gameover"
  | "leaderboard";

export type DevilFruit = "mera-mera" | "goro-goro" | "hana-hana" | "gomu-gomu";

export interface PlayerSelections {
  p1: DevilFruit;
  p2: DevilFruit;
}

export interface GameResult {
  level: number;
  score: number;
  p1Fruit: DevilFruit;
  p2Fruit: DevilFruit;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [playerSelections, setPlayerSelections] = useState<PlayerSelections>({
    p1: "mera-mera",
    p2: "goro-goro",
  });
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  function handleStartGame(selections: PlayerSelections) {
    setPlayerSelections(selections);
    setScreen("game");
  }

  function handleGameOver(result: GameResult) {
    setGameResult(result);
    setScreen("gameover");
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {screen === "menu" && (
        <MainMenu
          onStart={() => setScreen("character-select")}
          onLeaderboard={() => setScreen("leaderboard")}
        />
      )}
      {screen === "character-select" && (
        <CharacterSelect
          onStart={handleStartGame}
          onBack={() => setScreen("menu")}
        />
      )}
      {screen === "game" && (
        <GameScreen
          playerSelections={playerSelections}
          onGameOver={handleGameOver}
        />
      )}
      {screen === "gameover" && gameResult && (
        <GameOver
          result={gameResult}
          onPlayAgain={() => setScreen("character-select")}
          onMenu={() => setScreen("menu")}
          onLeaderboard={() => setScreen("leaderboard")}
        />
      )}
      {screen === "leaderboard" && (
        <Leaderboard onBack={() => setScreen("menu")} />
      )}
    </div>
  );
}
