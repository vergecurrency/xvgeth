import { useState } from "react";
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarmConfig } from "@/lib/farm-context";

type ProgramInfoCardProps = {
  rewardRate: string;
  totalStaked: string;
  programEnds: string;
};

export function ProgramInfoCard({
  rewardRate,
  totalStaked,
  programEnds,
}: ProgramInfoCardProps) {
  const farmConfig = useFarmConfig();
  const [copiedField, setCopiedField] = useState<"token" | "quote" | null>(null);

  async function copyAddress(value: string, field: "token" | "quote") {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1600);
    } catch {
      setCopiedField(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Program Info</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-slate-200">
        <div className="flex items-center justify-between gap-4">
          <span>Reward Rate</span>
          <span className="text-right">{rewardRate}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Total Staked</span>
          <span className="text-right">{totalStaked}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Program Ends</span>
          <span className="text-right">{programEnds}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span>{farmConfig.tokenSymbol} Contract</span>
          <div className="text-right">
            <button
              type="button"
              onClick={() => copyAddress(farmConfig.tokenAddress, "token")}
              className="inline-flex items-center gap-2 break-all text-[var(--farm-accent-text)] underline underline-offset-4"
            >
              {farmConfig.tokenAddress}
              <Copy className="h-4 w-4 shrink-0" />
            </button>
            {copiedField === "token" ? (
              <div className="mt-1 inline-block rounded-md border border-[var(--farm-card-border-strong)] bg-[var(--farm-badge-bg)] px-2 py-1 text-xs text-[var(--farm-accent-text)]">
                Copied
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span>{farmConfig.quoteTokenSymbol} Contract</span>
          <div className="text-right">
            <button
              type="button"
              onClick={() => copyAddress(farmConfig.quoteTokenAddress, "quote")}
              className="inline-flex items-center gap-2 break-all text-[var(--farm-accent-text)] underline underline-offset-4"
            >
              {farmConfig.quoteTokenAddress}
              <Copy className="h-4 w-4 shrink-0" />
            </button>
            {copiedField === "quote" ? (
              <div className="mt-1 inline-block rounded-md border border-[var(--farm-card-border-strong)] bg-[var(--farm-badge-bg)] px-2 py-1 text-xs text-[var(--farm-accent-text)]">
                Copied
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
