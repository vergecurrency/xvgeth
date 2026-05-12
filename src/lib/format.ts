import { ethers } from "ethers";

export function formatUnitsSafe(
  value: bigint | null | undefined,
  decimals = 18,
  max = 6,
) {
  if (value == null) {
    return "0";
  }

  const raw = ethers.formatUnits(value, decimals);
  const [whole, fraction = ""] = raw.split(".");

  if (!fraction) {
    return whole;
  }

  const trimmed = fraction.slice(0, max).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function parseInputToUnits(value: string, decimals = 18) {
  const clean = value.trim();

  if (!clean) {
    return 0n;
  }

  return ethers.parseUnits(clean, decimals);
}

export function parseInputToUnitsSafe(value: string, decimals = 18) {
  try {
    return parseInputToUnits(value, decimals);
  } catch {
    return 0n;
  }
}

export function formatDateTime(unixSeconds: bigint | null | undefined) {
  if (!unixSeconds || unixSeconds === 0n) {
    return "-";
  }

  return new Date(Number(unixSeconds) * 1000).toLocaleString();
}

export function formatPerDay(ratePerSecond: bigint | null | undefined, decimals = 18) {
  if (!ratePerSecond) {
    return "0";
  }

  const perDay = ratePerSecond * 86400n;
  return formatUnitsSafe(perDay, decimals, 4);
}

export function shortAddress(address?: string) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
