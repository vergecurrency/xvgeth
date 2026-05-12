import { TetrisGame } from "@/components/tetris/TetrisGame";

type TetrisPageProps = {
  onNavigate: (path: string) => void;
};

export function TetrisPage({ onNavigate }: TetrisPageProps) {
  return (
    <main className="games-page">
      <section className="games-panel games-panel--tetris">
        <button type="button" className="games-back-button" onClick={() => onNavigate("/games")}>
          Back
        </button>
        <TetrisGame />
      </section>
    </main>
  );
}
