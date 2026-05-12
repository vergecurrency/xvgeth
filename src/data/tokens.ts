type TokenGlow = "sky" | "emerald" | "amber" | "violet" | "cyan" | "rose";
type LinkKind = "explorer" | "market" | "dex" | "farm";

type TokenLink = {
  label: string;
  href: string;
  kind: LinkKind;
};

type WalletConfig = {
  networkName: string;
  chainId: string;
  rpcUrl: string;
  nativeSymbol: string;
  explorerUrl: string;
};

export type TokenSlug = "xvgeth";

export type TokenDefinition = {
  slug: TokenSlug;
  symbol: string;
  chainName: string;
  chainMenuLabel: string;
  marketChartId?: string;
  contractAddress: string;
  description: string;
  icon: string;
  glow: TokenGlow;
  landingGlow: string;
  landingGlowSecondary?: string;
  landingGlowMode?: "solid" | "rainbow" | "dual";
  links: TokenLink[];
  wallet: WalletConfig;
};

export const sharedContractAddress = "0x85614a474dbeed440d5bbdb8ac50b0f22367f997";

export const tokenOrder: TokenSlug[] = ["xvgeth"];

export const tokensBySlug: Record<TokenSlug, TokenDefinition> = {
  xvgeth: {
    slug: "xvgeth",
    symbol: "XVGETH",
    chainName: "Ethereum",
    chainMenuLabel: "Ethereum",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgeth.jpg",
    glow: "sky",
    landingGlow: "#627eea",
    landingGlowSecondary: "#8db8ff",
    landingGlowMode: "dual",
    description:
      "XVGETH is the Ethereum-based XVG branded token for the xvgtokens ecosystem. XVGETH holders have received numerous FREE airdrops of other XVG tokens, including $XVGBASE, $XVGBSC, $XVGPOLY, and $XVGUNI. This subdomain is dedicated to the token that started them all, $XVGETH",
    links: [
      {
        label: "View on Etherscan",
        href: "https://etherscan.io/token/0x85614a474dbeed440d5bbdb8ac50b0f22367f997",
        kind: "explorer",
      },
      {
        label: "CoinGecko",
        href: "https://www.coingecko.com/en/coins/verge-eth",
        kind: "market",
      },
      {
        label: "CoinMarketCap",
        href: "https://coinmarketcap.com/currencies/verge-eth/",
        kind: "market",
      },
      {
        label: "View on GeckoTerminal",
        href: "https://www.geckoterminal.com/eth/pools/0x0c42f082569045e89ae9eef6ecddada48fe40f3dbc663cfbd480d1ec7876cc9c",
        kind: "dex",
      },
      {
        label: "View on DexTools",
        href: "https://www.dextools.io/app/ether/pair-explorer/0x0c42f082569045e89ae9eef6ecddada48fe40f3dbc663cfbd480d1ec7876cc9c",
        kind: "dex",
      },
    ],
    wallet: {
      networkName: "Ethereum Mainnet",
      chainId: "0x1",
      rpcUrl: "https://ethereum-rpc.publicnode.com",
      nativeSymbol: "ETH",
      explorerUrl: "https://etherscan.io",
    },
  },
};

export const socials = [
  { label: "Discord", href: "https://discord.gg/vergecurrency" },
  { label: "X", href: "https://www.twitter.com/xvgeth" },
  { label: "Telegram", href: "https://t.me/officialxvg" },
  { label: "GitHub", href: "https://github.com/vergecurrency/erc20/" },
  { label: "YouTube", href: "https://www.youtube.com/vergecurrencyofficial" },
];
