type GamesPageProps = {
  onNavigate: (path: string) => void;
};

export function GamesPage({ onNavigate }: GamesPageProps) {
  return (
    <main className="games-page">
      <section className="games-hero">
        <div className="games-hero__status">
          <span className="games-hero__status-light" aria-hidden="true" />
          <span>Coming Soon</span>
        </div>
        <h1 className="games-hero__title">Contract-powered games</h1>
      </section>

      <section className="games-tabs" aria-label="Games">
        <button
          type="button"
          className="games-tab games-tab--active"
          onClick={() => onNavigate("/games/tetris")}
        >
          tetris
        </button>
      </section>
    </main>
  );
}
