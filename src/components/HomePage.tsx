import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Github,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import {
  socials,
  sharedContractAddress,
  type TokenDefinition,
} from "@/data/tokens";

type HomePageProps = {
  tokens: TokenDefinition[];
  onNavigate: (path: string) => void;
};

export function HomePage({ tokens, onNavigate }: HomePageProps) {
  const [copied, setCopied] = useState(false);

  const socialIcons: Record<string, ReactNode> = {
    Discord: <MessageCircle className="h-4 w-4" />,
    X: <Twitter className="h-4 w-4" />,
    Telegram: <Send className="h-4 w-4" />,
    GitHub: <Github className="h-4 w-4" />,
    YouTube: <Youtube className="h-4 w-4" />,
  };

  async function handleCopyContract() {
    try {
      await navigator.clipboard.writeText(sharedContractAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed copying contract address", error);
    }
  }

  return (
    <main className="site-shell">
      <section className="token-grid-section">
        <div className="landing-atmosphere" aria-hidden="true">
          <span className="landing-atmosphere__ring landing-atmosphere__ring--one" />
          <span className="landing-atmosphere__ring landing-atmosphere__ring--two" />
          <span className="landing-atmosphere__ring landing-atmosphere__ring--three" />
          <span className="landing-atmosphere__beam landing-atmosphere__beam--left" />
          <span className="landing-atmosphere__beam landing-atmosphere__beam--right" />
        </div>
        <div className="token-grid-intro">
          <div className="token-grid-intro__stack">
            <div className="token-grid-kicker">Multi-Chain Token Ecosystem</div>
            <div className="token-grid-heading">One Contract Address to Rule Them All...</div>
            <p className="token-grid-body">
              All of the $XVG branded tokens follow a unique unified contract address system, a
              first of its kind, where they all share the same contract address across all smart
              chains.
            </p>
            <button
              type="button"
              className={`contract-chip ${copied ? "is-copied" : ""}`}
              onClick={() => void handleCopyContract()}
            >
              <span className="contract-chip__label">Shared Contract</span>
              <span className="contract-chip__value">{sharedContractAddress}</span>
              <span className="contract-chip__action">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link copied" : "Copy"}
              </span>
            </button>
            <div className="landing-microcopy">
              Open any token below to view its links, explorer resources, wallet helper, and farm
              access where available.
            </div>
          </div>
        </div>
        <div className="token-grid" aria-label="XVG token network">
          {tokens.map((token, index) => (
            <motion.button
              key={token.slug}
              type="button"
              aria-label={`Open ${token.symbol}`}
              className={`token-orb token-orb--${token.glow}`}
              style={
                {
                  "--token-landing-glow": token.landingGlow,
                  "--token-landing-glow-secondary":
                    token.landingGlowSecondary ?? token.landingGlow,
                } as CSSProperties
              }
              data-glow-mode={token.landingGlowMode ?? "solid"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.035 } }}
              onClick={() => onNavigate(`/${token.slug}`)}
            >
              <span className="token-orb__halo" />
              <span className="token-orb__frame">
                <img src={token.icon} alt="" className="token-orb__icon" />
                <span className="token-orb__name">{token.symbol}</span>
              </span>
              <span className="token-orb__label">${token.symbol}</span>
            </motion.button>
          ))}
        </div>
        <div className="landing-socials" aria-label="XVG social links">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="landing-socials__link"
              data-social={social.label.toLowerCase()}
            >
              <span className="landing-socials__icon" aria-hidden="true">
                {socialIcons[social.label]}
              </span>
              <span className="landing-socials__label">{social.label}</span>
            </a>
          ))}
        </div>
        <div className="landing-footer-note">XVGTokens.com 2026</div>
      </section>
    </main>
  );
}
