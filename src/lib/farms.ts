export type FarmSlug = "xvgbase" | "xvgbsc";

export type FarmTheme = {
  key: FarmSlug;
  route: string;
  backgroundClassName: string;
  panelClassName: string;
  sectionClassName: string;
};

export type FarmConfig = {
  slug: FarmSlug;
  route: string;
  routerKind: "aerodromeV2" | "uniswapV2";
  chainId: number;
  chainName: string;
  projectName: string;
  projectTicker: string;
  tokenSymbol: string;
  tokenAddress: string;
  quoteTokenSymbol: string;
  quoteTokenAddress: string;
  quoteTokenDecimals: number;
  lpSymbol: string;
  rewardsContractAddress: string;
  lpTokenAddress: string;
  v2RouterAddress: string;
  v2PoolAddress: string;
  poolStable: boolean;
  liquiditySlippageBps: number;
  liquidityDeadlineMinutes: number;
  tokenDecimals: number;
  lpDecimals: number;
  theme: FarmTheme;
};

function getEnv(name: string, fallback: string) {
  const raw = import.meta.env[name];
  if (typeof raw !== "string") {
    return fallback;
  }

  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function getNumberEnv(name: string, fallback: number) {
  const raw = import.meta.env[name];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBooleanEnv(name: string, fallback: boolean) {
  const raw = import.meta.env[name];
  if (typeof raw !== "string") {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return fallback;
}

function getRouterKindEnv(
  name: string,
  fallback: FarmConfig["routerKind"],
): FarmConfig["routerKind"] {
  const raw = getEnv(name, fallback);
  return raw === "uniswapV2" ? "uniswapV2" : "aerodromeV2";
}

function createFarmConfig(
  prefix: "VITE_XVGBASE" | "VITE_XVGBSC",
  defaults: FarmConfig,
): FarmConfig {
  return {
    ...defaults,
    routerKind: getRouterKindEnv(`${prefix}_ROUTER_KIND`, defaults.routerKind),
    chainId: getNumberEnv(`${prefix}_CHAIN_ID`, defaults.chainId),
    chainName: getEnv(`${prefix}_CHAIN_NAME`, defaults.chainName),
    projectName: getEnv(`${prefix}_PROJECT_NAME`, defaults.projectName),
    projectTicker: getEnv(`${prefix}_PROJECT_TICKER`, defaults.projectTicker),
    tokenSymbol: getEnv(`${prefix}_TOKEN_SYMBOL`, defaults.tokenSymbol),
    tokenAddress: getEnv(`${prefix}_TOKEN_ADDRESS`, defaults.tokenAddress),
    quoteTokenSymbol: getEnv(`${prefix}_QUOTE_TOKEN_SYMBOL`, defaults.quoteTokenSymbol),
    quoteTokenAddress: getEnv(`${prefix}_QUOTE_TOKEN_ADDRESS`, defaults.quoteTokenAddress),
    quoteTokenDecimals: getNumberEnv(
      `${prefix}_QUOTE_TOKEN_DECIMALS`,
      defaults.quoteTokenDecimals,
    ),
    lpSymbol: getEnv(`${prefix}_LP_SYMBOL`, defaults.lpSymbol),
    rewardsContractAddress: getEnv(
      `${prefix}_REWARDS_CONTRACT_ADDRESS`,
      defaults.rewardsContractAddress,
    ),
    lpTokenAddress: getEnv(`${prefix}_LP_TOKEN_ADDRESS`, defaults.lpTokenAddress),
    v2RouterAddress: getEnv(`${prefix}_V2_ROUTER_ADDRESS`, defaults.v2RouterAddress),
    v2PoolAddress: getEnv(`${prefix}_V2_POOL_ADDRESS`, defaults.v2PoolAddress),
    poolStable: getBooleanEnv(`${prefix}_POOL_STABLE`, defaults.poolStable),
    liquiditySlippageBps: getNumberEnv(
      `${prefix}_LIQUIDITY_SLIPPAGE_BPS`,
      defaults.liquiditySlippageBps,
    ),
    liquidityDeadlineMinutes: getNumberEnv(
      `${prefix}_LIQUIDITY_DEADLINE_MINUTES`,
      defaults.liquidityDeadlineMinutes,
    ),
    tokenDecimals: getNumberEnv(`${prefix}_TOKEN_DECIMALS`, defaults.tokenDecimals),
    lpDecimals: getNumberEnv(`${prefix}_LP_DECIMALS`, defaults.lpDecimals),
  };
}

export const farmConfigs: Record<FarmSlug, FarmConfig> = {
  xvgbase: createFarmConfig("VITE_XVGBASE", {
    slug: "xvgbase",
    route: "/farm/xvgbase",
    routerKind: "aerodromeV2",
    chainId: 8453,
    chainName: "Base Network",
    projectName: "XVGBASE",
    projectTicker: "XVGBASE",
    tokenSymbol: "XVGBASE",
    tokenAddress: "0xe061aa40be525a13296cb4bf69f513242349d708",
    quoteTokenSymbol: "WETH",
    quoteTokenAddress: "0x4200000000000000000000000000000000000006",
    quoteTokenDecimals: 18,
    lpSymbol: "XVGBASE/WETH LP",
    rewardsContractAddress: "0xYourXvgbaseRewardsContractAddressHere",
    lpTokenAddress: "0xYourXvgbaseLpTokenAddressHere",
    v2RouterAddress: "0xYourXvgbaseV2RouterAddressHere",
    v2PoolAddress: "0xYourXvgbasePoolAddressHere",
    poolStable: false,
    liquiditySlippageBps: 100,
    liquidityDeadlineMinutes: 20,
    tokenDecimals: 18,
    lpDecimals: 18,
    theme: {
      key: "xvgbase",
      route: "/farm/xvgbase",
      backgroundClassName: "farm-dashboard-theme-base",
      panelClassName: "farm-section-shell",
      sectionClassName: "farm-section-shell",
    },
  }),
  xvgbsc: createFarmConfig("VITE_XVGBSC", {
    slug: "xvgbsc",
    route: "/farm/xvgbsc",
    routerKind: "uniswapV2",
    chainId: 56,
    chainName: "BNB Smart Chain",
    projectName: "XVGBSC",
    projectTicker: "XVGBSC",
    tokenSymbol: "XVGBSC",
    tokenAddress: "0xe061aa40be525a13296cb4bf69f513242349d708",
    quoteTokenSymbol: "WBNB",
    quoteTokenAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    quoteTokenDecimals: 18,
    lpSymbol: "XVGBSC/WBNB LP",
    rewardsContractAddress: "0xYourXvgbscRewardsContractAddressHere",
    lpTokenAddress: "0xYourXvgbscLpTokenAddressHere",
    v2RouterAddress: "0xYourXvgbscV2RouterAddressHere",
    v2PoolAddress: "0xYourXvgbscPoolAddressHere",
    poolStable: false,
    liquiditySlippageBps: 100,
    liquidityDeadlineMinutes: 20,
    tokenDecimals: 18,
    lpDecimals: 18,
    theme: {
      key: "xvgbsc",
      route: "/farm/xvgbsc",
      backgroundClassName: "farm-dashboard-theme-bsc",
      panelClassName: "farm-section-shell farm-section-shell-bsc",
      sectionClassName: "farm-section-shell farm-section-shell-bsc",
    },
  }),
};

export const farmList = Object.values(farmConfigs);

export function getFarmConfig(slug: FarmSlug) {
  return farmConfigs[slug];
}
