import { Contract, type BrowserProvider, type JsonRpcSigner } from "ethers";
import {
  AERODROME_V2_ROUTER_ABI,
  ERC20_ABI,
  REWARDS_ABI,
  UNISWAP_V2_PAIR_ABI,
  UNISWAP_V2_ROUTER_ABI,
} from "@/lib/abis";
import type { FarmConfig } from "@/lib/farms";

export function getRewardsReadContract(provider: BrowserProvider, farmConfig: FarmConfig) {
  return new Contract(farmConfig.rewardsContractAddress, REWARDS_ABI, provider);
}

export function getLpReadContract(provider: BrowserProvider, farmConfig: FarmConfig) {
  return new Contract(farmConfig.lpTokenAddress, ERC20_ABI, provider);
}

export function getTokenReadContract(address: string, provider: BrowserProvider) {
  return new Contract(address, ERC20_ABI, provider);
}

export function getV2PairReadContract(provider: BrowserProvider, farmConfig: FarmConfig) {
  return new Contract(farmConfig.v2PoolAddress, UNISWAP_V2_PAIR_ABI, provider);
}

export function getRewardsWriteContract(signer: JsonRpcSigner, farmConfig: FarmConfig) {
  return new Contract(farmConfig.rewardsContractAddress, REWARDS_ABI, signer);
}

export function getLpWriteContract(signer: JsonRpcSigner, farmConfig: FarmConfig) {
  return new Contract(farmConfig.lpTokenAddress, ERC20_ABI, signer);
}

export function getTokenWriteContract(address: string, signer: JsonRpcSigner) {
  return new Contract(address, ERC20_ABI, signer);
}

export function getV2RouterWriteContract(signer: JsonRpcSigner, farmConfig: FarmConfig) {
  return new Contract(
    farmConfig.v2RouterAddress,
    farmConfig.routerKind === "aerodromeV2" ? AERODROME_V2_ROUTER_ABI : UNISWAP_V2_ROUTER_ABI,
    signer,
  );
}
