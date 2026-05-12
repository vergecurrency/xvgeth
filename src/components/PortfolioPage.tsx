import { BarChart3, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { useAccount } from "wagmi";
import { type TokenDefinition } from "@/data/tokens";

const PORTFOLIO_BALANCE_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

type PortfolioPageProps = {
  tokens: TokenDefinition[];
  onNavigate: (path: string) => void;
};

type PriceMap = Record<string, number>;

type GeckoTerminalToken = {
  network: string;
  address: string;
};

type GeckoTerminalPool = {
  network: string;
  poolAddress: string;
};

type CachedGeckoTerminalPrice = {
  cachedAt: number;
  priceUsd: number;
};

const portfolioRpcFallbacks: Partial<Record<TokenDefinition["slug"], string[]>> = {
  xvgpoly: ["https://polygon-bor-rpc.publicnode.com"],
  xvgbsc: [
    "https://bsc-dataseed.bnbchain.org",
    "https://bsc-dataseed1.bnbchain.org",
    "https://bsc-dataseed.binance.org",
  ],
};

const geckoTerminalPriceCacheTtlMs = 10 * 60 * 1000;

function formatBalance(value: bigint) {
  const formatted = Number.parseFloat(formatUnits(value, 18));

  if (!Number.isFinite(formatted) || formatted <= 0) {
    return "0.00";
  }

  if (formatted >= 1000) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(formatted);
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(formatted);
}

function formatUsdValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value);
}

function getCoinGeckoCoinId(token: TokenDefinition) {
  const marketLink = token.links.find(
    (link) => link.kind === "market" && link.label === "CoinGecko" && link.href.includes("/coins/"),
  );

  if (!marketLink) {
    return null;
  }

  const match = marketLink.href.match(/\/coins\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function getPortfolioPriceKey(token: TokenDefinition) {
  return getCoinGeckoCoinId(token) ?? token.slug;
}

function getPortfolioRpcUrls(token: TokenDefinition) {
  return Array.from(
    new Set([token.wallet.rpcUrl, ...(portfolioRpcFallbacks[token.slug] ?? [])].filter(Boolean)),
  );
}

function getGeckoTerminalToken(token: TokenDefinition): GeckoTerminalToken | null {
  const geckoTerminalLink = token.links.find((link) => link.href.includes("geckoterminal.com/"));

  if (!geckoTerminalLink) {
    return null;
  }

  const match = geckoTerminalLink.href.match(/geckoterminal\.com\/([^/?#]+)\//i);

  if (!match) {
    return null;
  }

  return {
    network: match[1],
    address: token.contractAddress.toLowerCase(),
  };
}

function getGeckoTerminalPool(token: TokenDefinition): GeckoTerminalPool | null {
  const geckoTerminalLink = token.links.find((link) => link.href.includes("geckoterminal.com/") && link.href.includes("/pools/"));

  if (!geckoTerminalLink) {
    return null;
  }

  const match = geckoTerminalLink.href.match(/geckoterminal\.com\/([^/?#]+)\/pools\/(0x[a-fA-F0-9]{40,})/i);

  if (!match) {
    return null;
  }

  return {
    network: match[1],
    poolAddress: match[2].toLowerCase(),
  };
}

function getGeckoTerminalPriceCacheKey(token: TokenDefinition) {
  return `portfolio-geckoterminal-price:${token.slug}`;
}

function readCachedGeckoTerminalPrice(token: TokenDefinition) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getGeckoTerminalPriceCacheKey(token));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedGeckoTerminalPrice;

    if (
      !Number.isFinite(parsed.priceUsd) ||
      !Number.isFinite(parsed.cachedAt) ||
      Date.now() - parsed.cachedAt > geckoTerminalPriceCacheTtlMs
    ) {
      return null;
    }

    return parsed.priceUsd;
  } catch {
    return null;
  }
}

function writeCachedGeckoTerminalPrice(token: TokenDefinition, priceUsd: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: CachedGeckoTerminalPrice = {
      cachedAt: Date.now(),
      priceUsd,
    };

    window.sessionStorage.setItem(getGeckoTerminalPriceCacheKey(token), JSON.stringify(payload));
  } catch {
    // Ignore cache write failures.
  }
}

export function PortfolioPage({ tokens, onNavigate }: PortfolioPageProps) {
  const { address, isConnected } = useAccount();
  const [pricesByCoinId, setPricesByCoinId] = useState<PriceMap>({});
  const [balancesBySlug, setBalancesBySlug] = useState<Record<string, bigint>>({});
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const tokenCoinIds = useMemo(
    () =>
      tokens.map((token) => ({
        slug: token.slug,
        priceKey: getPortfolioPriceKey(token),
        coinId: getCoinGeckoCoinId(token),
        geckoTerminalToken: getGeckoTerminalToken(token),
        geckoTerminalPool: getGeckoTerminalPool(token),
      })),
    [tokens],
  );

  useEffect(() => {
    const coinIds = Array.from(new Set(tokenCoinIds.map((entry) => entry.coinId).filter((value): value is string => Boolean(value))));

    const controller = new AbortController();

    async function loadPrices() {
      let nextPrices: PriceMap = {};

      if (coinIds.length) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${encodeURIComponent(coinIds.join(","))}`,
            { signal: controller.signal },
          );

          if (!response.ok) {
            throw new Error(`CoinGecko request failed with ${response.status}`);
          }

          const payload = (await response.json()) as Record<string, { usd?: number }>;
          nextPrices = Object.fromEntries(
            Object.entries(payload)
              .map(([coinId, value]) => [coinId, value?.usd])
              .filter((entry): entry is [string, number] => Number.isFinite(entry[1])),
          );
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          console.error("Failed loading portfolio USD prices", error);
        }
      }

      const geckoTerminalFallbacks = tokenCoinIds.filter((entry) => {
        if (nextPrices[entry.priceKey] != null) {
          return false;
        }

        return Boolean(entry.geckoTerminalPool || entry.geckoTerminalToken);
      });

      await Promise.all(
        geckoTerminalFallbacks.map(async (entry) => {
          const token = tokens.find((item) => item.slug === entry.slug);

          if (!token) {
            return;
          }

          const cachedPrice = readCachedGeckoTerminalPrice(token);

          if (cachedPrice != null) {
            nextPrices[entry.priceKey] = cachedPrice;
            return;
          }

          try {
            let priceUsd = Number.NaN;

            if (entry.geckoTerminalPool) {
              const response = await fetch(
                `https://api.geckoterminal.com/api/v2/networks/${entry.geckoTerminalPool.network}/pools/${entry.geckoTerminalPool.poolAddress}?include=base_token,quote_token`,
                { signal: controller.signal },
              );

              if (!response.ok) {
                throw new Error(`GeckoTerminal pool request failed with ${response.status}`);
              }

              const payload = (await response.json()) as {
                data?: {
                  relationships?: {
                    base_token?: { data?: { id?: string } };
                    quote_token?: { data?: { id?: string } };
                  };
                  attributes?: {
                    base_token_price_usd?: string;
                    quote_token_price_usd?: string;
                  };
                };
              };

              const baseTokenId = payload.data?.relationships?.base_token?.data?.id ?? "";
              const quoteTokenId = payload.data?.relationships?.quote_token?.data?.id ?? "";
              const tokenAddress = token.contractAddress.toLowerCase();

              if (baseTokenId.toLowerCase().includes(tokenAddress)) {
                priceUsd = Number.parseFloat(payload.data?.attributes?.base_token_price_usd ?? "");
              } else if (quoteTokenId.toLowerCase().includes(tokenAddress)) {
                priceUsd = Number.parseFloat(payload.data?.attributes?.quote_token_price_usd ?? "");
              }
            }

            if (!Number.isFinite(priceUsd) && entry.geckoTerminalToken) {
              const response = await fetch(
                `https://api.geckoterminal.com/api/v2/networks/${entry.geckoTerminalToken.network}/tokens/${entry.geckoTerminalToken.address}`,
                { signal: controller.signal },
              );

              if (!response.ok) {
                throw new Error(`GeckoTerminal token request failed with ${response.status}`);
              }

              const payload = (await response.json()) as {
                data?: {
                  attributes?: {
                    price_usd?: string;
                  };
                };
              };

              priceUsd = Number.parseFloat(payload.data?.attributes?.price_usd ?? "");
            }

            if (Number.isFinite(priceUsd)) {
              nextPrices[entry.priceKey] = priceUsd;
              writeCachedGeckoTerminalPrice(token, priceUsd);
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error(`Failed loading GeckoTerminal USD price for ${token.symbol}`, error);
            }
          }
        }),
      );

      if (!controller.signal.aborted) {
        setPricesByCoinId(nextPrices);
      }
    }

    void loadPrices();

    return () => controller.abort();
  }, [tokenCoinIds]);

  useEffect(() => {
    if (!address) {
      setBalancesBySlug({});
      setIsBalanceLoading(false);
      return;
    }

    let cancelled = false;
    const account = address;

    async function loadBalances() {
      setIsBalanceLoading(true);

      try {
        const entries = await Promise.all(
          tokens.map(async (token) => {
            try {
              let lastError: unknown = null;

              for (const rpcUrl of getPortfolioRpcUrls(token)) {
                const client = createPublicClient({
                  transport: http(rpcUrl, {
                    timeout: 12_000,
                  }),
                  batch: {
                    multicall: false,
                  },
                });

                try {
                  const balance = await client.readContract({
                    abi: PORTFOLIO_BALANCE_ABI,
                    address: token.contractAddress as `0x${string}`,
                    functionName: "balanceOf",
                    args: [account],
                  });

                  return [token.slug, typeof balance === "bigint" ? balance : 0n] as const;
                } catch (error) {
                  lastError = error;
                }
              }

              throw lastError;
            } catch (error) {
              console.error(`Failed loading ${token.symbol} portfolio balance`, error);
              return [token.slug, 0n] as const;
            }
          }),
        );

        if (!cancelled) {
          setBalancesBySlug(Object.fromEntries(entries));
        }
      } finally {
        if (!cancelled) {
          setIsBalanceLoading(false);
        }
      }
    }

    void loadBalances();

    return () => {
      cancelled = true;
    };
  }, [address, tokens]);

  return (
    <main className="portfolio-page">
      <section className="portfolio-hero">
        <div className="portfolio-hero__copy">
          <div className="portfolio-hero__eyebrow">
            <BarChart3 className="h-4 w-4" />
            Portfolio
          </div>
          <h1 className="portfolio-hero__title">Multi-Chain Portfolio</h1>
        </div>
        <div className="portfolio-hero__actions">
          <div className="portfolio-hero__status">
            <Wallet className="h-4 w-4" />
            {isConnected ? "Wallet connected" : "Use the navbar wallet button to load balances"}
          </div>
        </div>
      </section>

      <section className="portfolio-list">
        {tokens.map((token, index) => {
          const balanceValue = balancesBySlug[token.slug] ?? 0n;
          const priceKey = tokenCoinIds[index]?.priceKey;
          const tokenPriceUsd = priceKey ? pricesByCoinId[priceKey] : undefined;
          const balanceDecimal = Number.parseFloat(formatUnits(balanceValue, 18));
          const usdValue =
            Number.isFinite(balanceDecimal) && tokenPriceUsd !== undefined
              ? balanceDecimal * tokenPriceUsd
              : null;

          return (
            <button
              key={token.slug}
              type="button"
              className="portfolio-row"
              onClick={() => onNavigate(`/${token.slug}`)}
            >
              <div className="portfolio-row__token">
                <img src={token.icon} alt="" className="portfolio-row__icon" />
                <div className="portfolio-row__copy">
                  <strong>${token.symbol}</strong>
                  <span>{token.chainMenuLabel}</span>
                </div>
              </div>
              <div className="portfolio-row__balance">
                {address ? (
                  isBalanceLoading ? (
                    <span className="portfolio-row__loading">Checking...</span>
                  ) : (
                    <>
                      <strong>{formatBalance(balanceValue)} {token.symbol}</strong>
                      {usdValue !== null ? <span className="portfolio-row__usd">{formatUsdValue(usdValue)}</span> : null}
                    </>
                  )
                ) : (
                  <>
                    <strong>0.00 {token.symbol}</strong>
                    <span className="portfolio-row__usd">$0.00</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </section>
    </main>
  );
}
