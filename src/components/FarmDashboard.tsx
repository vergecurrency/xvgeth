import { motion } from "framer-motion";
import { Coins, Droplets, Gift } from "lucide-react";
import { LiquidityPanel } from "@/components/LiquidityPanel";
import { MetricCard } from "@/components/MetricCard";
import { ProgramInfoCard } from "@/components/ProgramInfoCard";
import { RemoveLiquidityPanel } from "@/components/RemoveLiquidityPanel";
import { StakePanel } from "@/components/StakePanel";
import { StatusAlert } from "@/components/StatusAlert";
import { WalletActions } from "@/components/WalletActions";
import { useFarm } from "@/hooks/useFarm";
import { useFarmConfig } from "@/lib/farm-context";
import {
  formatDateTime,
  formatPerDay,
  formatUnitsSafe,
} from "@/lib/format";

export function FarmDashboard() {
  const farmConfig = useFarmConfig();
  const farm = useFarm();

  return (
    <div className={`farm-dashboard-shell min-h-screen min-h-[calc(var(--app-height,1vh)*100)] overflow-x-hidden px-4 pb-6 pt-28 text-slate-100 sm:px-6 sm:pb-8 sm:pt-32 md:px-10 md:pb-10 ${farmConfig.theme.backgroundClassName}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--farm-page-top-glow)]" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-[linear-gradient(90deg,transparent,var(--farm-grid-line-strong),transparent)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-32 h-64 w-64 rounded-full bg-[var(--farm-orb-left)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-80 h-72 w-72 rounded-full bg-[var(--farm-orb-right)] blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-4 sm:gap-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
          <WalletActions
            chainName={farmConfig.chainName}
            title={`${farmConfig.projectName} Farm`}
            description={`Add liquidity, stake your ${farmConfig.lpSymbol}, and earn ${farmConfig.tokenSymbol} rewards over time.`}
            busy={farm.busy}
            connected={Boolean(farm.account)}
            onRefresh={farm.refreshData}
          />
          <ProgramInfoCard
	    rewardRate={`${formatPerDay(farm.rewardRate, farmConfig.tokenDecimals)} ${farmConfig.tokenSymbol}/day`}
            totalStaked={`${formatUnitsSafe(farm.totalStaked, farmConfig.lpDecimals)} ${farmConfig.lpSymbol}`}
            programEnds={formatDateTime(farm.periodFinish)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-100/92">
              Wallet Snapshot
            </div>
            <div className="mt-1 text-sm text-slate-200/85">
              Current balances for your {farmConfig.tokenSymbol}, {farmConfig.quoteTokenSymbol},
              and LP positions.
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            icon={<Coins className="h-5 w-5" />}
            title={`Wallet ${farmConfig.tokenSymbol}`}
            value={formatUnitsSafe(farm.walletTokenBalance, farmConfig.tokenDecimals)}
            subtitle={farmConfig.tokenSymbol}
          />
          <MetricCard
            icon={<Coins className="h-5 w-5" />}
            title={`Wallet ${farmConfig.quoteTokenSymbol}`}
            value={formatUnitsSafe(
              farm.walletQuoteTokenBalance,
              farmConfig.quoteTokenDecimals,
            )}
            subtitle={farmConfig.quoteTokenSymbol}
            delay={0.05}
          />
          <MetricCard
            icon={<Coins className="h-5 w-5" />}
            title="Wallet LP"
            value={formatUnitsSafe(farm.walletLpBalance, farmConfig.lpDecimals)}
            subtitle={farmConfig.lpSymbol}
            delay={0.1}
          />
        </div>

        <div className={farmConfig.theme.sectionClassName}>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-100/92">
            Liquidity Flow
          </div>
          <div className="mb-5 max-w-3xl text-sm text-slate-200/80">
            Approve both assets, add liquidity to the {farmConfig.tokenSymbol} pool, then stake
            those new wallet LP tokens below.
          </div>
        </div>
        <div id="add-liquidity">
          <LiquidityPanel
            tokenSymbol={farmConfig.tokenSymbol}
            quoteTokenSymbol={farmConfig.quoteTokenSymbol}
            tokenBalance={formatUnitsSafe(farm.walletTokenBalance, farmConfig.tokenDecimals)}
            quoteTokenBalance={formatUnitsSafe(
              farm.walletQuoteTokenBalance,
              farmConfig.quoteTokenDecimals,
            )}
            tokenValue={farm.liquidityTokenInput}
            quoteValue={farm.liquidityQuoteInput}
            hasTokenApproval={farm.hasLiquidityTokenApproval}
            hasQuoteApproval={farm.hasLiquidityQuoteApproval}
            busy={farm.busy}
            connected={Boolean(farm.account)}
            poolAddress={farmConfig.v2PoolAddress}
            onTokenValueChange={farm.setLiquidityTokenInput}
            onQuoteValueChange={farm.setLiquidityQuoteInput}
            onTokenMax={farm.fillMaxLiquidityToken}
            onQuoteMax={farm.fillMaxLiquidityQuote}
            onApproveToken={farm.approveTokenForRouter}
            onApproveQuoteToken={farm.approveQuoteTokenForRouter}
            onAddLiquidity={farm.addLiquidity}
          />
        </div>

        <div className={farmConfig.theme.sectionClassName}>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-100/92">
            Farm Performance
          </div>
          <div className="mb-5 max-w-3xl text-sm text-slate-200/80">
            Track your wallet LP tokens staked in the farm and your earned rewards from staking,
            updated roughly every 10 seconds.
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={<Droplets className="h-5 w-5" />}
            title="Staked LP"
            value={formatUnitsSafe(farm.stakedBalance, farmConfig.lpDecimals)}
            subtitle="Deposited in farm"
            delay={0}
          />
          <MetricCard
            icon={<Gift className="h-5 w-5" />}
            title="Earned Rewards"
            value={formatUnitsSafe(farm.earnedRewards, farmConfig.tokenDecimals)}
            subtitle={farmConfig.tokenSymbol}
            delay={0.05}
          />
        </div>

        <div className={farmConfig.theme.sectionClassName}>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-100/92">
            Position Controls
          </div>
          <div className="mb-5 max-w-3xl text-sm text-slate-200/80">
            Stake LP, withdraw LP, and claim {farmConfig.tokenSymbol} rewards from one place.
            Once your LP is staked, your staked LP and earned rewards balances update here. You
            can claim {farmConfig.tokenSymbol} rewards as often as you like without withdrawing
            your staked LP, and your position will continue earning after each claim. If you want
            to fully exit, first withdraw your LP tokens from the farm here, then proceed to the
            final step to remove liquidity and receive your underlying tokens back.
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <StakePanel
              title="Stake LP"
              label="Amount to stake"
              value={farm.stakeInput}
              onValueChange={farm.setStakeInput}
              onMax={farm.fillMaxStake}
              primaryActionLabel="Step 2. Stake LP"
              secondaryActionLabel={farm.hasApproval ? "Step 1. LP Approved" : "Step 1. Approve LP"}
              onPrimaryAction={farm.stakeLp}
              onSecondaryAction={farm.approveLp}
              primaryDisabled={farm.busy || !farm.account}
              secondaryDisabled={farm.busy || !farm.account || farm.hasApproval}
              secondaryVariant={farm.hasApproval ? "secondary" : "default"}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
          >
            <StakePanel
              title="Withdraw / Claim"
              label="Amount to withdraw"
              value={farm.withdrawInput}
              onValueChange={farm.setWithdrawInput}
              onMax={farm.fillMaxWithdraw}
              primaryActionLabel={`Claim ${farmConfig.tokenSymbol} Rewards only`}
              secondaryActionLabel="Withdraw LP Staking Tokens"
              onPrimaryAction={farm.claimRewards}
              onSecondaryAction={farm.withdrawLp}
              primaryDisabled={farm.busy || !farm.account}
              secondaryDisabled={farm.busy || !farm.account}
              primaryVariant="default"
              secondaryVariant="secondary"
              footerActionLabel="Exit Farm"
              onFooterAction={farm.exitFarm}
              footerDisabled={farm.busy || !farm.account}
            />
          </motion.div>
        </div>

        <StatusAlert status={farm.status} />

        <RemoveLiquidityPanel
          lpBalance={formatUnitsSafe(farm.walletLpBalance, farmConfig.lpDecimals)}
          lpSymbol={farmConfig.lpSymbol}
          value={farm.removeLiquidityInput}
          busy={farm.busy}
          connected={Boolean(farm.account)}
          hasApproval={farm.hasRemoveLiquidityApproval}
          onValueChange={farm.setRemoveLiquidityInput}
          onMax={farm.fillMaxRemoveLiquidity}
          onApprove={farm.approveLpForRouter}
          onRemove={farm.removeLiquidity}
        />

        <div className="pb-2 pt-4 text-center text-xs text-slate-300/70">
          Copyright XVGtokens.com 2026
        </div>
      </div>
    </div>
  );
}
