import type { LandingFarmSummary } from "@/hooks/useLandingFarmSummaries";
import type { FarmConfig } from "@/lib/farms";
export function formatLandingRewardRate(
  farm: FarmConfig,
  summary?: LandingFarmSummary,
) {
  if (summary?.status === "unconfigured") {
    return "Not configured";
  }

  if (!summary || summary.rewardPerDay == null) {
    return "Loading...";
  }

  return `${summary.rewardPerDay.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })} ${farm.tokenSymbol}/day`;
}
