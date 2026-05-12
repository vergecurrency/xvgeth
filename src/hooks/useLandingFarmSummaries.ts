import type { FarmConfig, FarmSlug } from "@/lib/farms";

export type LandingFarmSummary = {
  status: "unconfigured" | "ready";
  rewardPerDay: number | null;
};

function getLandingRewardEnv(slug: FarmSlug) {
  return slug === "xvgbase" ? import.meta.env.VITE_BASE_REWARD : import.meta.env.VITE_BSC_REWARD;
}

function getFarmRewardSummary(farm: FarmConfig): LandingFarmSummary {
  const raw = getLandingRewardEnv(farm.slug);

  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      status: "unconfigured",
      rewardPerDay: null,
    };
  }

  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed)) {
    return {
      status: "unconfigured",
      rewardPerDay: null,
    };
  }

  return {
    status: "ready",
    rewardPerDay: parsed,
  };
}

export function useLandingFarmSummaries(farms: FarmConfig[]) {
  const summaries = {} as Record<FarmSlug, LandingFarmSummary>;
  for (const farm of farms) {
    summaries[farm.slug] = getFarmRewardSummary(farm);
  }

  return {
    summaries,
    isLoading: false,
  };
}
