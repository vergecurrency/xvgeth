import { tokensBySlug, type TokenSlug } from "@/data/tokens";

export type SwapChainKey = TokenSlug | "xvgeth";
export type SwapAssetKind = "xvg" | "native" | "stable" | "eth" | "governance";

export type SwapAsset = {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  address?: string;
  chainId: number;
  chainIdHex: string;
  chainName: string;
  identifier: string;
  decimals: number;
  kind: SwapAssetKind;
  isNativeLike: boolean;
  coingeckoId?: string;
  tokenSlug?: SwapChainKey;
};

export type SwapChain = {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  nativeSymbol: string;
  tokenSlug: SwapChainKey;
  tokenSymbol: string;
};

export type ZeroExIssueAllowance = {
  actual: string;
  spender: `0x${string}`;
};

export type ZeroExIssueBalance = {
  actual: string;
  expected: string;
  token: string;
};

export type ZeroExQuote = {
  buyAmount: string;
  buyToken: string;
  fees?: {
    zeroExFee?: {
      amount: string;
      token: string;
      type: string;
    } | null;
  };
  gas?: string;
  gasPrice?: string;
  issues?: {
    allowance?: ZeroExIssueAllowance | null;
    balance?: ZeroExIssueBalance | null;
    simulationIncomplete?: boolean;
  };
  liquidityAvailable?: boolean;
  minBuyAmount?: string;
  sellAmount: string;
  sellToken: string;
  totalNetworkFee?: string;
  transaction?: {
    data: `0x${string}`;
    gas?: string;
    gasPrice?: string;
    to: `0x${string}`;
    value?: string;
  };
};

export const ZEROX_API_BASE_URL = "https://api.0x.org";
export const ZEROX_API_KEY_ENV = "VITE_ZEROX_API_KEY";
export const ZEROX_PROXY_URL_ENV = "VITE_ZEROX_PROXY_URL";
export const ZEROX_FEE_BPS_ENV = "VITE_ZEROX_FEE_BPS";
export const ZEROX_FEE_RECIPIENT_ENV = "VITE_ZEROX_FEE_RECIPIENT";

const ethereumSwapChain = {
  chainId: 1,
  chainIdHex: "0x1",
  chainName: "Ethereum",
  nativeSymbol: "ETH",
  tokenSlug: "xvgeth" as const,
  tokenSymbol: "XVGETH",
};

const supportedSwapSlugs: SwapChainKey[] = [
  "xvgeth",
  "xvgzke",
  "xvgbase",
  "xvgopt",
  "xvgson",
  "xvgarb",
  "xvgava",
  "xvgpoly",
  "xvglin",
  "xvgbsc",
  "xvgmnt",
  "xvgcro",
  "xvguni",
  "xvgblast",
  "xvggnosis",
  "xvgbera",
  "xvgworld",
  "xvghemi",
];

function hexToNumber(chainIdHex: string) {
  return Number.parseInt(chainIdHex, 16);
}

function localSwapIcon(filename: string) {
  return `/images/networks/${filename}.webp`;
}

function getChainMetadata(key: SwapChainKey) {
  if (key === "xvgeth") {
    return ethereumSwapChain;
  }

  const token = tokensBySlug[key];
  return {
    chainId: hexToNumber(token.wallet.chainId),
    chainIdHex: token.wallet.chainId,
    chainName: token.chainName,
    nativeSymbol: token.wallet.nativeSymbol,
    tokenSlug: key,
    tokenSymbol: token.symbol,
  };
}

function createAsset(
  slug: SwapChainKey,
  config: {
    symbol: string;
    identifier: string;
    decimals: number;
    kind: SwapAssetKind;
    coingeckoId?: string;
    icon?: string;
    address?: string;
    isNativeLike?: boolean;
    tokenSlug?: SwapChainKey;
  },
): SwapAsset {
  const chain = getChainMetadata(slug);
  const address = config.address ?? (config.identifier.startsWith("0x") ? config.identifier : undefined);

  return {
    id: `${chain.chainId}:${config.symbol}:${config.identifier}`,
    symbol: config.symbol,
    name: `${config.symbol} on ${chain.chainName}`,
    icon: config.icon ?? `/images/${slug}.png`,
    address,
    chainId: chain.chainId,
    chainIdHex: chain.chainIdHex,
    chainName: chain.chainName,
    identifier: config.identifier,
    decimals: config.decimals,
    kind: config.kind,
    isNativeLike: config.isNativeLike ?? false,
    coingeckoId: config.coingeckoId,
    tokenSlug: config.tokenSlug,
  };
}

const swapAssetsBySlug: Record<SwapChainKey, SwapAsset[]> = {
  xvgeth: [
    createAsset("xvgeth", {
      symbol: "XVGETH",
      identifier: "0x85614a474dbeed440d5bbdb8ac50b0f22367f997",
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgeth",
      icon: "/images/xvgeth.jpg",
      tokenSlug: "xvgeth",
    }),
    createAsset("xvgeth", {
      symbol: "ETH",
      identifier: "ETH",
      decimals: 18,
      kind: "eth",
      coingeckoId: "ethereum",
      icon: localSwapIcon("ethereum"),
      isNativeLike: true,
    }),
    createAsset("xvgeth", {
      symbol: "WETH",
      identifier: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      kind: "eth",
      coingeckoId: "ethereum",
      icon: localSwapIcon("ethereum"),
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    }),
    createAsset("xvgeth", {
      symbol: "USDC",
      identifier: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      kind: "stable",
      coingeckoId: "usd-coin",
      icon: "/images/usdc.webp",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    }),
    createAsset("xvgeth", {
      symbol: "USDT",
      identifier: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      kind: "stable",
      coingeckoId: "tether",
      icon: "/images/usdt.png",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    }),
    createAsset("xvgeth", {
      symbol: "PEPE",
      identifier: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
      decimals: 18,
      kind: "governance",
      coingeckoId: "pepe",
      icon: "/images/pepe.png",
      address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    }),
    createAsset("xvgeth", {
      symbol: "LINK",
      identifier: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      decimals: 18,
      kind: "governance",
      coingeckoId: "chainlink",
      icon: "/images/chainlink.webp",
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    }),
    createAsset("xvgeth", {
      symbol: "DOT",
      identifier: "0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430",
      decimals: 10,
      kind: "governance",
      coingeckoId: "polkadot",
      icon: "/images/polkadot.png",
      address: "0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430",
    }),
  ],
  xvgzke: [
    createAsset("xvgzke", {
      symbol: "XVGZKE",
      identifier: tokensBySlug.xvgzke.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgzke",
      tokenSlug: "xvgzke",
    }),
    createAsset("xvgzke", {
      symbol: "ZK",
      identifier: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E",
      decimals: 18,
      kind: "governance",
      coingeckoId: "zksync",
      icon: localSwapIcon("zksync"),
    }),
  ],
  xvgbase: [
    createAsset("xvgbase", {
      symbol: "XVGBASE",
      identifier: tokensBySlug.xvgbase.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgbase",
      tokenSlug: "xvgbase",
    }),
    createAsset("xvgbase", {
      symbol: "WETH",
      identifier: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      kind: "eth",
      coingeckoId: "ethereum",
      icon: localSwapIcon("base"),
      address: "0x4200000000000000000000000000000000000006",
    }),
    createAsset("xvgbase", {
      symbol: "USDC",
      identifier: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      kind: "stable",
      coingeckoId: "usd-coin",
      icon: "/images/usdc.webp",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    }),
    createAsset("xvgbase", {
      symbol: "AERO",
      identifier: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
      decimals: 18,
      kind: "governance",
      coingeckoId: "aerodrome-finance",
      icon: "/images/aero.png",
      address: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
    }),
  ],
  xvgopt: [
    createAsset("xvgopt", {
      symbol: "XVGOPT",
      identifier: tokensBySlug.xvgopt.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgopt",
      tokenSlug: "xvgopt",
    }),
    createAsset("xvgopt", {
      symbol: "OP",
      identifier: "0x4200000000000000000000000000000000000042",
      decimals: 18,
      kind: "governance",
      coingeckoId: "optimism",
      icon: localSwapIcon("optimism"),
    }),
  ],
  xvgson: [
    createAsset("xvgson", {
      symbol: "XVGSON",
      identifier: tokensBySlug.xvgson.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgson",
      tokenSlug: "xvgson",
    }),
    createAsset("xvgson", {
      symbol: "WS",
      identifier: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
      decimals: 18,
      kind: "native",
      coingeckoId: "sonic-3",
      icon: localSwapIcon("sonic"),
      address: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
    }),
  ],
  xvgarb: [
    createAsset("xvgarb", {
      symbol: "XVGARB",
      identifier: tokensBySlug.xvgarb.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgarb",
      tokenSlug: "xvgarb",
    }),
    createAsset("xvgarb", {
      symbol: "ARB",
      identifier: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      decimals: 18,
      kind: "governance",
      coingeckoId: "arbitrum",
      icon: localSwapIcon("arbitrum"),
    }),
    createAsset("xvgarb", {
      symbol: "USDC",
      identifier: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      kind: "stable",
      coingeckoId: "usd-coin",
      icon: "/images/usdc.webp",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    }),
  ],
  xvgava: [
    createAsset("xvgava", {
      symbol: "XVGAVA",
      identifier: tokensBySlug.xvgava.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgava",
      tokenSlug: "xvgava",
    }),
    createAsset("xvgava", {
      symbol: "WAVAX",
      identifier: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
      kind: "native",
      coingeckoId: "avalanche-2",
      icon: localSwapIcon("avalanche"),
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    }),
  ],
  xvgpoly: [
    createAsset("xvgpoly", {
      symbol: "XVGPOLY",
      identifier: tokensBySlug.xvgpoly.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgpoly",
      tokenSlug: "xvgpoly",
    }),
    createAsset("xvgpoly", {
      symbol: "WPOL",
      identifier: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      decimals: 18,
      kind: "native",
      coingeckoId: "matic-network",
      icon: localSwapIcon("polygon"),
      address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    }),
  ],
  xvglin: [
    createAsset("xvglin", {
      symbol: "XVGLIN",
      identifier: tokensBySlug.xvglin.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvglin",
      tokenSlug: "xvglin",
    }),
    createAsset("xvglin", {
      symbol: "LINEA",
      identifier: "0x1789e0043623282d5dcc7f213d703c6d8bafbb04",
      decimals: 18,
      kind: "governance",
      coingeckoId: "bridged-usdc-linea-bridged-usdc-linea",
      icon: localSwapIcon("linea"),
    }),
  ],
  xvgbsc: [
    createAsset("xvgbsc", {
      symbol: "XVGBSC",
      identifier: tokensBySlug.xvgbsc.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgbsc",
      tokenSlug: "xvgbsc",
    }),
    createAsset("xvgbsc", {
      symbol: "WBNB",
      identifier: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      kind: "native",
      coingeckoId: "binancecoin",
      icon: localSwapIcon("bsc"),
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    }),
  ],
  xvgmnt: [
    createAsset("xvgmnt", {
      symbol: "XVGMNT",
      identifier: tokensBySlug.xvgmnt.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgmnt",
      tokenSlug: "xvgmnt",
    }),
    createAsset("xvgmnt", {
      symbol: "WMNT",
      identifier: "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8",
      decimals: 18,
      kind: "native",
      coingeckoId: "mantle",
      icon: localSwapIcon("mantle"),
      address: "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8",
    }),
  ],
  xvgcro: [
    createAsset("xvgcro", {
      symbol: "XVGCRO",
      identifier: tokensBySlug.xvgcro.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgcro",
      tokenSlug: "xvgcro",
    }),
    createAsset("xvgcro", {
      symbol: "WCRO",
      identifier: "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
      decimals: 18,
      kind: "native",
      coingeckoId: "cronos",
      icon: localSwapIcon("cronos"),
      address: "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
    }),
  ],
  xvguni: [
    createAsset("xvguni", {
      symbol: "XVGUNI",
      identifier: tokensBySlug.xvguni.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvguni",
      tokenSlug: "xvguni",
    }),
    createAsset("xvguni", {
      symbol: "UNI",
      identifier: "0x8f187aa05619a017077f5308904739877ce9ea21",
      decimals: 18,
      kind: "governance",
      coingeckoId: "uniswap",
      icon: localSwapIcon("unichain"),
      address: "0x8f187aa05619a017077f5308904739877ce9ea21",
    }),
  ],
  xvgblast: [
    createAsset("xvgblast", {
      symbol: "XVGBLAST",
      identifier: tokensBySlug.xvgblast.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgblast",
      tokenSlug: "xvgblast",
    }),
    createAsset("xvgblast", {
      symbol: "BLAST",
      identifier: "0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad",
      decimals: 18,
      kind: "governance",
      coingeckoId: "blast",
      icon: localSwapIcon("blast"),
      address: "0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad",
    }),
  ],
  xvggnosis: [
    createAsset("xvggnosis", {
      symbol: "XVGGNOSIS",
      identifier: tokensBySlug.xvggnosis.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvggnosis",
      tokenSlug: "xvggnosis",
    }),
    createAsset("xvggnosis", {
      symbol: "WXDAI",
      identifier: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
      decimals: 18,
      kind: "native",
      coingeckoId: "xdai",
      icon: localSwapIcon("gnosis"),
      address: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
    }),
    createAsset("xvggnosis", {
      symbol: "GNO",
      identifier: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
      decimals: 18,
      kind: "governance",
      coingeckoId: "gnosis",
      icon: localSwapIcon("gnosis"),
    }),
  ],
  xvgbera: [
    createAsset("xvgbera", {
      symbol: "XVGBERA",
      identifier: tokensBySlug.xvgbera.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgbera",
      tokenSlug: "xvgbera",
    }),
    createAsset("xvgbera", {
      symbol: "WBERA",
      identifier: "0x6969696969696969696969696969696969696969",
      decimals: 18,
      kind: "native",
      coingeckoId: "berachain-bera",
      icon: localSwapIcon("berachain"),
      address: "0x6969696969696969696969696969696969696969",
    }),
  ],
  xvgworld: [
    createAsset("xvgworld", {
      symbol: "XVGWORLD",
      identifier: tokensBySlug.xvgworld.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvgworld",
      tokenSlug: "xvgworld",
    }),
    createAsset("xvgworld", {
      symbol: "WLD",
      identifier: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      decimals: 18,
      kind: "governance",
      coingeckoId: "worldcoin-wld",
      icon: localSwapIcon("worldchain"),
      address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    }),
  ],
  xvghemi: [
    createAsset("xvghemi", {
      symbol: "XVGHEMI",
      identifier: tokensBySlug.xvghemi.contractAddress,
      decimals: 18,
      kind: "xvg",
      coingeckoId: "xvghemi",
      tokenSlug: "xvghemi",
    }),
    createAsset("xvghemi", {
      symbol: "HEMI",
      identifier: "0x99e3dE3817F6081B2568208337ef83295b7f591D",
      decimals: 18,
      kind: "governance",
      coingeckoId: "hemi",
      icon: localSwapIcon("hemi"),
      address: "0x99e3dE3817F6081B2568208337ef83295b7f591D",
    }),
  ],
  xvgcbtc: [],
  xvgzora: [],
};

export const swapChains: SwapChain[] = supportedSwapSlugs.map((slug) => {
  return getChainMetadata(slug);
});

export const swapAssets: SwapAsset[] = supportedSwapSlugs.flatMap((slug) => swapAssetsBySlug[slug]);

export function getAssetsForChain(chainId: number) {
  return swapAssets.filter((asset) => asset.chainId === chainId);
}

export function getDefaultSellAsset(chainId: number) {
  return getAssetsForChain(chainId).find((asset) => asset.kind === "xvg") ?? null;
}

export function getDefaultBuyAsset(chainId: number) {
  return (
    getAssetsForChain(chainId).find((asset) => asset.kind === "stable") ??
    getAssetsForChain(chainId).find((asset) => asset.kind === "governance") ??
    getAssetsForChain(chainId).find((asset) => asset.kind !== "xvg") ??
    null
  );
}
