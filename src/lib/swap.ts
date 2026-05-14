export type SwapChainKey = "xvgeth";
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

const supportedSwapSlugs: SwapChainKey[] = ["xvgeth"];

function localSwapIcon(filename: string) {
  return `/images/networks/${filename}.webp`;
}

function getChainMetadata(key: SwapChainKey) {
  return ethereumSwapChain;
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
