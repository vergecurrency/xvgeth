import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Droplets,
  Orbit,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  TimerReset,
} from "lucide-react";
import type { LandingFarmSummary } from "@/hooks/useLandingFarmSummaries";
import type { FarmConfig } from "@/lib/farms";
import { formatLandingRewardRate } from "@/lib/landing";

type LandingPageProps = {
  farms: FarmConfig[];
  farmSummaries: Partial<Record<FarmConfig["slug"], LandingFarmSummary>>;
  onNavigateToFarm: (path: string) => void;
};

export function LandingPage({ farms, farmSummaries, onNavigateToFarm }: LandingPageProps) {
  function formatAddress(address: string) {
    if (address.length < 12) {
      return address;
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function getRewardRateLabel(farm: FarmConfig) {
    return formatLandingRewardRate(farm, farmSummaries[farm.slug]);
  }

  return (
    <main className="min-h-screen min-h-[calc(var(--app-height,1vh)*100)] overflow-x-hidden px-4 pb-10 pt-28 text-slate-100 sm:px-6 sm:pt-32 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-emerald-200/10 via-sky-300/10 to-transparent" />
      <div className="pointer-events-none absolute left-[-10rem] top-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-40 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-44 h-56 w-56 -translate-x-1/2 rounded-full border border-white/10 opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-52 h-80 w-80 -translate-x-1/2 rounded-full border border-emerald-200/10 opacity-20" />

      <div className="relative mx-auto grid max-w-6xl gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="farm-landing-panel">
              <div className="relative z-[1] flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300/80">
                <div className="farm-landing-eyebrow farm-landing-eyebrow-inline">
                  <Sprout className="h-4 w-4" />
                  XVG Farm Network
                </div>
              </div>
              <div className="farm-landing-inner-card relative z-[1] mt-4">
                <h1 className="max-w-4xl text-4xl font-extrabold tracking-[-0.03em] text-slate-50 sm:text-5xl lg:text-6xl">
                  Welcome to the XVG Farm!
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200/85 sm:text-lg">
                  Join one of the XVGToken Farms and start staking right away!
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="farm-landing-pill">
                    <CheckCircle2 className="h-4 w-4" />
                    Two active farm deployments
                  </div>
                  <div className="farm-landing-pill">
                    <Shield className="h-4 w-4" />
                    Direct contract reads
                  </div>
                  <div className="farm-landing-pill">
                    <TimerReset className="h-4 w-4" />
                    Wallet snapshot updates
                  </div>
                </div>
                <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                  <div className="farm-landing-mini-card">
                    <div className="farm-landing-mini-title">
                      <Sparkles className="h-4 w-4" />
                      Easy To Use
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-200/80">
                      All steps are numbered to get new users started.
                    </div>
                  </div>
                  <div className="farm-landing-mini-card">
                    <div className="farm-landing-mini-title">
                      <Orbit className="h-4 w-4" />
                      Real Time Rewards
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-200/80">
                      Users can monitor their rewards in real time!
                    </div>
                  </div>
                  <div className="farm-landing-mini-card">
                    <div className="farm-landing-mini-title">
                      <ShieldCheck className="h-4 w-4" />
                      Clear Status
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-200/80">
                      Each farm reads the contract directly and shows the current status.
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {farms.map((farm) => (
                    <button
                      key={farm.route}
                      type="button"
                      onClick={() => onNavigateToFarm(farm.route)}
                      className={`farm-landing-action ${
                        farm.slug === "xvgbsc" ? "farm-landing-action-bsc" : "farm-landing-action-market"
                      }`}
                    >
                      <span>
                        Open ${farm.projectName} Farm
                        <ArrowRight className="ml-2 inline h-4 w-4" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}
            className="farm-landing-panel farm-landing-panel-compact"
          >
            <div className="relative z-[1] flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300/80">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]" />
              </span>
              Active Farms
            </div>
            <div className="relative z-[1] mt-4 grid gap-4">
              {farms.map((farm) => (
                <div
                  key={farm.slug}
                  className={`farm-landing-inner-card ${
                    farm.slug === "xvgbsc" ? "farm-landing-inner-card-bsc" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm uppercase tracking-[0.26em] text-emerald-100/80">
                        {farm.chainName}
                      </div>
                      <div className="mt-2 text-3xl font-semibold text-white">{farm.projectName}</div>
                    </div>
                    <div className="farm-landing-status farm-landing-status-live inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                      </span>
                      Live
                    </div>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-200/80">
                    Liquidity Farm dashboard for the {farm.tokenSymbol}/
                    {farm.quoteTokenSymbol} LP.
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="farm-landing-mini-card farm-landing-mini-card-interactive">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Pair
                        </div>
                        <div className="text-sky-200/80">
                          <Droplets className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-white">
                        {farm.tokenSymbol}/{farm.quoteTokenSymbol}
                      </div>
                      <div className="mt-1 text-xs text-slate-300/65">Configured LP market</div>
                    </div>
                    <div className="farm-landing-mini-card farm-landing-mini-card-interactive">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Chain
                        </div>
                        <div className="text-sky-200/80">
                          <Orbit className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-white">{farm.chainName}</div>
                      <div className="mt-1 text-xs text-slate-300/65">Wallet and contract network</div>
                    </div>
                    <div className="farm-landing-mini-card farm-landing-mini-card-interactive">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Reward Rate
                        </div>
                        <div className="text-sky-200/80">
                          <Coins className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-white">
                        {getRewardRateLabel(farm)}
                      </div>
                      <div className="mt-1 text-xs text-slate-300/65">
                        Current emission for stakers
                      </div>
                    </div>
                  </div>
                  <div className="farm-landing-address-list mt-5">
                    <div className="farm-landing-address-row">
                      <span>Farm Contract</span>
                      <span>{formatAddress(farm.rewardsContractAddress)}</span>
                    </div>
                    <div className="farm-landing-address-row">
                      <span>LP Contract</span>
                      <span>{formatAddress(farm.lpTokenAddress)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToFarm(farm.route)}
                    className={`farm-landing-action mt-6 ${
                      farm.slug === "xvgbsc" ? "farm-landing-action-bsc" : "farm-landing-action-dex"
                    }`}
                  >
                    <span>
                      Enter Farm
                      <ArrowRight className="ml-2 inline h-4 w-4" />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="pb-2 pt-2 text-center text-xs text-slate-300/70">
          Copyright 2026 XVGTokens.com
        </div>
      </div>
    </main>
  );
}
