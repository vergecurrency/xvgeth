import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFarmConfig } from "@/lib/farm-context";

type RemoveLiquidityPanelProps = {
  lpBalance: string;
  lpSymbol: string;
  value: string;
  busy: boolean;
  connected: boolean;
  hasApproval: boolean;
  onValueChange: (value: string) => void;
  onMax: () => void;
  onApprove: () => Promise<void>;
  onRemove: () => Promise<void>;
};

export function RemoveLiquidityPanel({
  lpBalance,
  lpSymbol,
  value,
  busy,
  connected,
  hasApproval,
  onValueChange,
  onMax,
  onApprove,
  onRemove,
}: RemoveLiquidityPanelProps) {
  const farmConfig = useFarmConfig();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Claim Initial {farmConfig.quoteTokenSymbol}/{farmConfig.tokenSymbol}
          </CardTitle>
          <p className="text-sm text-slate-200">
            Remove liquidity from your LP position to receive your underlying {farmConfig.tokenSymbol} and {farmConfig.quoteTokenSymbol} back.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <div className="flex flex-col gap-1 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <label>LP amount to remove</label>
              <span>Wallet: {lpBalance} {lpSymbol}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input value={value} onChange={(event) => onValueChange(event.target.value)} placeholder="0.0" />
              <Button variant="secondary" onClick={onMax} className="w-full sm:w-auto">
                Max
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={onApprove}
              disabled={busy || !connected || hasApproval}
              variant={hasApproval ? "secondary" : "default"}
              className="h-auto min-h-11 w-full whitespace-normal py-3 text-center"
            >
              {hasApproval ? "LP Router Approved" : "Approve LP For Remove"}
            </Button>
            <Button
              onClick={onRemove}
              disabled={busy || !connected || !hasApproval}
              variant="outline"
              className="h-auto min-h-11 w-full whitespace-normal py-3 text-center"
            >
              Remove Liquidity
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
