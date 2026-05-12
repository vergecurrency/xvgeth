import { useEffect, useRef, useState } from "react";
import { ChevronDown, Sprout } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import type { FarmConfig } from "@/lib/farms";

type NavbarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  farms: FarmConfig[];
};

function getNetworkLabel(farm: FarmConfig) {
  if (farm.chainId === 8453) {
    return "Base";
  }

  if (farm.chainId === 56) {
    return "BNB";
  }

  return farm.chainName;
}

export function Navbar({ currentPath, onNavigate, farms }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const activeFarm = farms.find((farm) => farm.route === currentPath) ?? null;
  const selectedNetwork = activeFarm?.slug ?? "";

  async function handleNetworkChange(nextSlug: string) {
    const nextFarm = farms.find((farm) => farm.slug === nextSlug);
    if (!nextFarm) {
      return;
    }

    onNavigate(nextFarm.route);

    if (!isConnected || chain?.id === nextFarm.chainId || !switchChainAsync) {
      return;
    }

    try {
      await switchChainAsync({ chainId: nextFarm.chainId });
    } catch (error) {
      console.error(`Failed to switch wallet to ${nextFarm.chainName}.`, error);
    }
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-4 py-3 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
            <Sprout className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.32em] text-slate-300/70">
              XVGtokens.com
            </span>
            <span className="block text-lg font-semibold tracking-tight text-white">
              Farm
            </span>
          </span>
        </button>

        <nav className="flex items-center gap-2 text-sm text-slate-100 sm:gap-3">
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200 sm:gap-3">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:inline">
              Network
            </span>
            <select
              aria-label="Select network"
              value={selectedNetwork}
              onChange={(event) => {
                void handleNetworkChange(event.target.value);
              }}
              className="min-w-[4.5rem] bg-transparent text-sm font-medium text-white outline-none sm:min-w-[7rem]"
            >
              <option value="" disabled className="bg-slate-950 text-slate-300">
                Select
              </option>
              {farms.map((farm) => (
                <option
                  key={farm.slug}
                  value={farm.slug}
                  className="bg-slate-950 text-slate-100"
                >
                  {getNetworkLabel(farm)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className={`rounded-full px-4 py-2 transition ${
              currentPath === "/"
                ? "bg-white/12 text-white"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            Home
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                currentPath.startsWith("/farm/")
                  ? "bg-white/12 text-white"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              Tokens
              <ChevronDown
                className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] min-w-[12rem] rounded-3xl border border-white/10 bg-slate-950/92 p-2 shadow-[0_24px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                {farms.map((farm) => {
                  const active = currentPath === farm.route;

                  return (
                    <button
                      key={farm.route}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void handleNetworkChange(farm.slug);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm uppercase tracking-[0.18em] transition ${
                        active
                          ? "bg-emerald-400/14 text-white"
                          : "text-slate-200 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      {farm.projectName}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
