import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, Droplets, RefreshCw, ShieldCheck, Waves } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarmConfig } from "@/lib/farm-context";

type WalletActionsProps = {
  chainName: string;
  title: string;
  description: string;
  busy: boolean;
  connected: boolean;
  onRefresh: () => Promise<void>;
};

export function WalletActions({
  chainName,
  title,
  description,
  busy,
  connected,
  onRefresh,
}: WalletActionsProps) {
  const farmConfig = useFarmConfig();
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const wrongFarmChain = Boolean(chain && chain.id !== farmConfig.chainId);
  const autoSwitchAttemptRef = useRef<number | null>(null);

  async function handleSwitchChain() {
    if (!switchChainAsync) {
      return;
    }

    try {
      await switchChainAsync({ chainId: farmConfig.chainId });
    } catch (error) {
      console.error(`Failed to switch wallet to ${farmConfig.chainName}.`, error);
    }
  }

  useEffect(() => {
    if (!connected || !wrongFarmChain || !chain?.id) {
      autoSwitchAttemptRef.current = null;
      return;
    }

    if (autoSwitchAttemptRef.current === chain.id) {
      return;
    }

    autoSwitchAttemptRef.current = chain.id;
    void handleSwitchChain();
  }, [chain?.id, connected, wrongFarmChain]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[26px] before:border before:border-white/5 before:content-['']">
        <div className="pointer-events-none absolute inset-0 bg-[var(--farm-card-sheen)]" />
        <div className="pointer-events-none absolute -left-12 top-8 h-40 w-40 rounded-full bg-[var(--farm-orb-left)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[var(--farm-orb-right)] blur-3xl" />
        <CardHeader className="relative space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--farm-muted-accent)]">
            {farmConfig.projectName} Yield Farm
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Live Farm
            </Badge>
            <Badge variant="secondary">{chainName}</Badge>
          </div>
          <CardTitle className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </CardTitle>
          <p className="max-w-2xl text-base leading-7 text-slate-200/95">{description}</p>
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            <div className="farm-hero-detail-card">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                <ShieldCheck className="h-4 w-4 text-[var(--farm-accent-text)]" />
                Connect
              </div>
              <div className="mt-2 text-sm text-slate-100">Link wallet and verify balances instantly.</div>
            </div>
            <div className="farm-hero-detail-card">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                <Droplets className="h-4 w-4 text-[var(--farm-accent-text)]" />
                Add Liquidity
              </div>
              <div className="mt-2 text-sm text-slate-100">
                Fund the {farmConfig.tokenSymbol}/{farmConfig.quoteTokenSymbol} pool and receive
                LP tokens.
              </div>
            </div>
            <div className="farm-hero-detail-card">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                <Waves className="h-4 w-4 text-[var(--farm-accent-text)]" />
                Farm
              </div>
              <div className="mt-2 text-sm text-slate-100">Stake LP positions and harvest rewards over time.</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative grid gap-3 sm:flex sm:flex-wrap">
          {connected && wrongFarmChain ? (
            <Button
              onClick={() => void handleSwitchChain()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Switch to {farmConfig.chainName}
            </Button>
          ) : null}
          <a
            href="#add-liquidity"
            className={buttonVariants("secondary", "w-full sm:w-auto")}
          >
            <Droplets className="mr-2 h-4 w-4" />
            Add Liquidity
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <Button
            onClick={onRefresh}
            disabled={busy || !connected}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
