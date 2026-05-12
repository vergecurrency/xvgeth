import { WalletConnectTrigger } from "@/components/WalletConnectTrigger";
import type { TokenDefinition } from "@/data/tokens";

type SiteHeaderProps = {
  currentPath: string;
  tokens: TokenDefinition[];
  onNavigate: (path: string) => void;
};

export function SiteHeader({ onNavigate }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button type="button" className="site-brand" onClick={() => onNavigate("/")}>
          <span className="site-brand__text">xvgeth.xvgtokens.com</span>
        </button>

        <nav className="site-nav">
          <button type="button" className="site-nav__link is-active" onClick={() => onNavigate("/")}>
            Home
          </button>
          <a
            href="https://xvgtokens.com/swap"
            target="_blank"
            rel="noreferrer"
            className="site-nav__link"
          >
            Swap
          </a>
          <a
            href="https://xvgtokens.com"
            target="_blank"
            rel="noreferrer"
            className="site-nav__link"
          >
            xvgtokens.com
          </a>
        </nav>

        <div className="site-header__wallet">
          <WalletConnectTrigger />
        </div>
      </div>
    </header>
  );
}
