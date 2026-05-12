import type { ReactNode } from "react";

type UpdateEntry = {
  date: string;
  description: ReactNode;
};

function TokenMention({ children }: { children: ReactNode }) {
  return <strong className="updates-item__token">{children}</strong>;
}

const updates: UpdateEntry[] = [
  {
    date: "May 10th 2026",
    description: (
      <>
        <TokenMention>AERO</TokenMention> on Base and <TokenMention>USDC</TokenMention> on
        Arbitrum were added to the swap options.
      </>
    ),
  },
  {
    date: "May 10th 2026",
    description: (
      <>
        Tangem{" "}
        <a
          className="updates-item__link"
          href="https://tangem.com/en/how-to-buy/xvgbase/"
          target="_blank"
          rel="noreferrer"
        >
          adds support
        </a>{" "}
        for <TokenMention>XVGBASE</TokenMention> and releases instructions on how to
        buy/store <TokenMention>XVGBASE</TokenMention>
      </>
    ),
  },
  {
    date: "May 9th 2026",
    description: (
      <>
        Worldplorer link added to <TokenMention>XVGWORLD</TokenMention> page.
      </>
    ),
  },
  {
    date: "May 9th 2026",
    description: (
      <>
        More token options added to swaps on Ethereum. (
        <TokenMention>PEPE</TokenMention>, <TokenMention>DOT</TokenMention>,{" "}
        <TokenMention>LINK</TokenMention>)
      </>
    ),
  },
  {
    date: "May 7th 2026",
    description: "Farms balance/rewards API changed to display amounts faster.",
  },
  {
    date: "May 7th 2026",
    description: (
      <>
        Phemex links added to <TokenMention>XVGZKE</TokenMention>,{" "}
        <TokenMention>XVGOPT</TokenMention>, and <TokenMention>XVGSON</TokenMention>
      </>
    ),
  },
  {
    date: "May 6th 2026",
    description: "Swap section added (more to come!).",
  },
  {
    date: "April 16th 2026",
    description: (
      <>
        <TokenMention>XVGBASE</TokenMention> added to{" "}
        <a
          className="updates-item__link"
          href="https://WallOfFame.finance"
          target="_blank"
          rel="noreferrer"
        >
          https://WallOfFame.finance
        </a>
        , a token-based Wall of Fame on the Base Network blockchain
      </>
    ),
  },
  {
    date: "April 5th 2026",
    description: (
      <>
        <TokenMention>XVGBSC</TokenMention> Farm opens, paying out{" "}
        <TokenMention>273,972 XVGBSC</TokenMention> per day until April 5th 2029!
      </>
    ),
  },
  {
    date: "March 31st 2026",
    description: (
      <>
        <TokenMention>XVGBASE</TokenMention> Farm opens, paying out{" "}
        <TokenMention>228,310 XVGBASE</TokenMention> per day until March 31st 2029!
      </>
    ),
  },
];

export function UpdatesPage() {
  return (
    <main className="updates-page">
      <section className="updates-hero">
        <header className="updates-hero__header">
          <h1 className="updates-hero__title">Latest Updates</h1>
        </header>

        <div className="updates-list" role="list">
          {updates.map((update) => (
            <div key={`${update.date}-${update.description}`} className="updates-item" role="listitem">
              <span className="updates-item__bullet" aria-hidden="true">
                •
              </span>
              <span className="updates-item__content">
                <strong className="updates-item__date">{update.date}:</strong>{" "}
                <span>{update.description}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
