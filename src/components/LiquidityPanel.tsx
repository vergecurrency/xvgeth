import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LiquidityPanelProps = {
  tokenSymbol: string;
  quoteTokenSymbol: string;
  tokenBalance: string;
  quoteTokenBalance: string;
  tokenValue: string;
  quoteValue: string;
  hasTokenApproval: boolean;
  hasQuoteApproval: boolean;
  busy: boolean;
  connected: boolean;
  poolAddress: string;
  onTokenValueChange: (value: string) => void;
  onQuoteValueChange: (value: string) => void;
  onTokenMax: () => void;
  onQuoteMax: () => void;
  onApproveToken: () => Promise<void>;
  onApproveQuoteToken: () => Promise<void>;
  onAddLiquidity: () => Promise<void>;
};

export function LiquidityPanel({
  tokenSymbol,
  quoteTokenSymbol,
  tokenBalance,
  quoteTokenBalance,
  tokenValue,
  quoteValue,
  hasTokenApproval,
  hasQuoteApproval,
  busy,
  connected,
  poolAddress,
  onTokenValueChange,
  onQuoteValueChange,
  onTokenMax,
  onQuoteMax,
  onApproveToken,
  onApproveQuoteToken,
  onAddLiquidity,
}: LiquidityPanelProps) {
  return (
    <motion.div id="add-liquidity" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-blue-200/8 blur-3xl" />
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Add {tokenSymbol}/{quoteTokenSymbol} Liquidity</CardTitle>
          <p className="text-sm text-slate-200">
            Here you can add to the liquidity pool, in order to get LP Stake tokens for
            earning {tokenSymbol} rewards with. After these 3 steps are complete,
            continue to the &quot;Stake LP&quot; section below, you&apos;re almost there!
          </p>
          <p className="break-all text-xs text-slate-300">Pool: {poolAddress}</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 rounded-[24px] border border-blue-100/12 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-1 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <label>{tokenSymbol} amount</label>
              <span>Wallet: {tokenBalance} {tokenSymbol}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input value={tokenValue} onChange={(event) => onTokenValueChange(event.target.value)} placeholder="0.0" />
              <Button variant="secondary" onClick={onTokenMax} className="w-full sm:w-auto">
                Max
              </Button>
            </div>
          </div>

          <div className="grid gap-2 rounded-[24px] border border-blue-100/12 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-1 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <label>{quoteTokenSymbol} amount</label>
              <span>Wallet: {quoteTokenBalance} {quoteTokenSymbol}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input value={quoteValue} onChange={(event) => onQuoteValueChange(event.target.value)} placeholder="0.0" />
              <Button variant="secondary" onClick={onQuoteMax} className="w-full sm:w-auto">
                Max
              </Button>
            </div>
          </div>

          <div className="grid gap-2 rounded-[24px] border border-blue-100/12 bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              onClick={onApproveToken}
              disabled={busy || !connected || hasTokenApproval}
              variant={hasTokenApproval ? "secondary" : "default"}
              className="h-auto min-h-11 w-full whitespace-normal py-3 text-center"
            >
              {hasTokenApproval ? (
                <>
                  <strong>Step 1.</strong>&nbsp;{tokenSymbol} Approved
                </>
              ) : (
                <>
                  <strong>Step 1.</strong>&nbsp;Approve {tokenSymbol}
                </>
              )}
            </Button>
            <Button
              onClick={onApproveQuoteToken}
              disabled={busy || !connected || hasQuoteApproval}
              variant={hasQuoteApproval ? "secondary" : "default"}
              className="h-auto min-h-11 w-full whitespace-normal py-3 text-center"
            >
              {hasQuoteApproval ? (
                <>
                  <strong>Step 2.</strong>&nbsp;{quoteTokenSymbol} Approved
                </>
              ) : (
                <>
                  <strong>Step 2.</strong>&nbsp;Approve {quoteTokenSymbol}
                </>
              )}
            </Button>
            <Button
              onClick={onAddLiquidity}
              disabled={busy || !connected || !hasTokenApproval || !hasQuoteApproval}
              className="h-auto min-h-11 w-full whitespace-normal py-3 text-center sm:col-span-2 lg:col-span-1"
            >
              <strong>Step 3.</strong>&nbsp;Add Liquidity
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
