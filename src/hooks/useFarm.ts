import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserProvider,
  JsonRpcSigner,
  MaxUint256,
  isAddress,
  type Eip1193Provider,
} from "ethers";
import { parseAbi, type Abi } from "viem";
import { useAccount, useReadContracts, useSwitchChain } from "wagmi";
import { useFarmConfig } from "@/lib/farm-context";
import { ERC20_ABI, REWARDS_ABI, UNISWAP_V2_PAIR_ABI } from "@/lib/abis";
import {
  getTokenWriteContract,
  getV2RouterWriteContract,
  getLpWriteContract,
  getRewardsWriteContract,
} from "@/lib/contracts";
import { formatUnitsSafe, parseInputToUnits, parseInputToUnitsSafe } from "@/lib/format";

const FARM_REWARDS_READ_ABI = parseAbi([
  "function rewardRate() view returns (uint256)",
  "function periodFinish() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function earned(address account) view returns (uint256)",
]);

const FARM_ERC20_READ_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

const FARM_PAIR_READ_ABI = parseAbi([
  "function totalSupply() view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
]);

export type FarmState = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string;
  status: string;
  busy: boolean;
  walletLpBalance: bigint;
  walletTokenBalance: bigint;
  walletQuoteTokenBalance: bigint;
  stakedBalance: bigint;
  earnedRewards: bigint;
  rewardRate: bigint;
  periodFinish: bigint;
  allowance: bigint;
  tokenAllowanceToRouter: bigint;
  quoteTokenAllowanceToRouter: bigint;
  lpAllowanceToRouter: bigint;
  totalStaked: bigint;
  pairTokenReserve: bigint;
  pairQuoteReserve: bigint;
  liquidityTokenInput: string;
  liquidityQuoteInput: string;
  removeLiquidityInput: string;
  stakeInput: string;
  withdrawInput: string;
  hasApproval: boolean;
  hasLiquidityTokenApproval: boolean;
  hasLiquidityQuoteApproval: boolean;
  hasRemoveLiquidityApproval: boolean;
  setLiquidityTokenInput: (value: string) => void;
  setLiquidityQuoteInput: (value: string) => void;
  setRemoveLiquidityInput: (value: string) => void;
  setStakeInput: (value: string) => void;
  setWithdrawInput: (value: string) => void;
  refreshData: () => Promise<void>;
  approveTokenForRouter: () => Promise<void>;
  approveQuoteTokenForRouter: () => Promise<void>;
  approveLpForRouter: () => Promise<void>;
  addLiquidity: () => Promise<void>;
  removeLiquidity: () => Promise<void>;
  approveLp: () => Promise<void>;
  stakeLp: () => Promise<void>;
  withdrawLp: () => Promise<void>;
  claimRewards: () => Promise<void>;
  exitFarm: () => Promise<void>;
  fillMaxLiquidityToken: () => void;
  fillMaxLiquidityQuote: () => void;
  fillMaxRemoveLiquidity: () => void;
  fillMaxStake: () => void;
  fillMaxWithdraw: () => void;
};

function formatStatusError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();
  if (!message) {
    return fallback;
  }

  if (message.includes("missing revert data")) {
    return `${fallback} The router rejected the transaction. Check the router address, pool address, pool type, and entered amounts.`;
  }

  if (message.includes("execution reverted")) {
    return `${fallback} The router reverted the transaction. Refresh balances, confirm approvals, and try a smaller amount near the current pool ratio.`;
  }

  return message.length > 220 ? `${message.slice(0, 217)}...` : message;
}

async function waitForConfirmedTransaction(
  tx: { hash?: string | null; wait: () => Promise<unknown> },
  provider: BrowserProvider | null,
) {
  try {
    await tx.wait();
    return;
  } catch (error) {
    if (provider && tx.hash) {
      const receipt = await provider.waitForTransaction(tx.hash, 1, 15_000);

      if (receipt?.status === 1) {
        return;
      }
    }

    throw error;
  }
}

export function useFarm(): FarmState {
  const farmConfig = useFarmConfig();
  const { address, connector, chain, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const rewardsContractReady = isAddress(farmConfig.rewardsContractAddress);
  const tokenAddressReady = isAddress(farmConfig.tokenAddress);
  const quoteTokenAddressReady = isAddress(farmConfig.quoteTokenAddress);
  const lpTokenAddressReady = isAddress(farmConfig.lpTokenAddress);
  const routerAddressReady = isAddress(farmConfig.v2RouterAddress);
  const poolAddressReady = isAddress(farmConfig.v2PoolAddress);
  const {
    data: publicProgramInfoData,
    refetch: refetchPublicProgramInfo,
  } = useReadContracts({
    contracts: rewardsContractReady
      ? [
          {
            address: farmConfig.rewardsContractAddress as `0x${string}`,
            chainId: farmConfig.chainId,
            abi: FARM_REWARDS_READ_ABI,
            functionName: "rewardRate",
          },
          {
            address: farmConfig.rewardsContractAddress as `0x${string}`,
            chainId: farmConfig.chainId,
            abi: FARM_REWARDS_READ_ABI,
            functionName: "periodFinish",
          },
          {
            address: farmConfig.rewardsContractAddress as `0x${string}`,
            chainId: farmConfig.chainId,
            abi: FARM_REWARDS_READ_ABI,
            functionName: "totalSupply",
          },
        ]
      : [],
    allowFailure: true,
    query: {
      enabled: rewardsContractReady,
      refetchInterval: 30000,
    },
  });
  const walletSnapshotContracts = useMemo(() => {
    if (!address) {
      return [];
    }

    const contracts: Array<{
      key: "walletTokenBalance" | "walletQuoteTokenBalance" | "walletLpBalance";
      address: `0x${string}`;
      abi: typeof FARM_ERC20_READ_ABI;
      functionName: "balanceOf";
      args: [typeof address];
      chainId: number;
    }> = [];

    if (tokenAddressReady) {
      contracts.push({
        key: "walletTokenBalance",
        address: farmConfig.tokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "balanceOf",
        args: [address],
        chainId: farmConfig.chainId,
      });
    }

    if (quoteTokenAddressReady) {
      contracts.push({
        key: "walletQuoteTokenBalance",
        address: farmConfig.quoteTokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "balanceOf",
        args: [address],
        chainId: farmConfig.chainId,
      });
    }

    if (lpTokenAddressReady) {
      contracts.push({
        key: "walletLpBalance",
        address: farmConfig.lpTokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "balanceOf",
        args: [address],
        chainId: farmConfig.chainId,
      });
    }

    return contracts;
  }, [
    address,
    farmConfig.chainId,
    farmConfig.lpTokenAddress,
    farmConfig.quoteTokenAddress,
    farmConfig.tokenAddress,
    lpTokenAddressReady,
    quoteTokenAddressReady,
    tokenAddressReady,
  ]);
  const { data: walletSnapshotData, refetch: refetchWalletSnapshot } = useReadContracts({
    allowFailure: true,
    contracts: walletSnapshotContracts.map(({ key: _key, ...contract }) => contract),
    query: {
      enabled: walletSnapshotContracts.length > 0,
      refetchInterval: 30000,
    },
  });
  const accountContracts = useMemo(() => {
    if (!address) {
      return [];
    }

    const contracts: Array<{
      key:
        | "stakedBalance"
        | "earnedRewards"
        | "allowance"
        | "tokenAllowanceToRouter"
        | "quoteTokenAllowanceToRouter"
        | "lpAllowanceToRouter";
      address: `0x${string}`;
      abi: Abi;
      functionName: string;
      args: readonly unknown[];
      chainId: number;
    }> = [];

    if (rewardsContractReady) {
      contracts.push({
        key: "stakedBalance",
        address: farmConfig.rewardsContractAddress as `0x${string}`,
        abi: FARM_REWARDS_READ_ABI,
        functionName: "balanceOf",
        args: [address],
        chainId: farmConfig.chainId,
      });
      contracts.push({
        key: "earnedRewards",
        address: farmConfig.rewardsContractAddress as `0x${string}`,
        abi: FARM_REWARDS_READ_ABI,
        functionName: "earned",
        args: [address],
        chainId: farmConfig.chainId,
      });
    }

    if (lpTokenAddressReady && rewardsContractReady) {
      contracts.push({
        key: "allowance",
        address: farmConfig.lpTokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "allowance",
        args: [address, farmConfig.rewardsContractAddress],
        chainId: farmConfig.chainId,
      });
    }

    if (tokenAddressReady && routerAddressReady) {
      contracts.push({
        key: "tokenAllowanceToRouter",
        address: farmConfig.tokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "allowance",
        args: [address, farmConfig.v2RouterAddress],
        chainId: farmConfig.chainId,
      });
    }

    if (quoteTokenAddressReady && routerAddressReady) {
      contracts.push({
        key: "quoteTokenAllowanceToRouter",
        address: farmConfig.quoteTokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "allowance",
        args: [address, farmConfig.v2RouterAddress],
        chainId: farmConfig.chainId,
      });
    }

    if (lpTokenAddressReady && routerAddressReady) {
      contracts.push({
        key: "lpAllowanceToRouter",
        address: farmConfig.lpTokenAddress as `0x${string}`,
        abi: FARM_ERC20_READ_ABI,
        functionName: "allowance",
        args: [address, farmConfig.v2RouterAddress],
        chainId: farmConfig.chainId,
      });
    }

    return contracts;
  }, [
    address,
    farmConfig.chainId,
    farmConfig.lpTokenAddress,
    farmConfig.quoteTokenAddress,
    farmConfig.rewardsContractAddress,
    farmConfig.tokenAddress,
    farmConfig.v2RouterAddress,
    lpTokenAddressReady,
    quoteTokenAddressReady,
    rewardsContractReady,
    routerAddressReady,
    tokenAddressReady,
  ]);
  const { data: accountData, refetch: refetchAccountData } = useReadContracts({
    allowFailure: true,
    contracts: accountContracts.map(({ key: _key, ...contract }) => contract),
    query: {
      enabled: accountContracts.length > 0,
      refetchInterval: 30000,
    },
  });
  const poolContracts = useMemo(() => {
    if (!poolAddressReady) {
      return [];
    }

    return [
      {
        key: "pairLiquiditySupply" as const,
        address: farmConfig.v2PoolAddress as `0x${string}`,
        abi: FARM_PAIR_READ_ABI,
        functionName: "totalSupply" as const,
        chainId: farmConfig.chainId,
      },
      {
        key: "pairToken0" as const,
        address: farmConfig.v2PoolAddress as `0x${string}`,
        abi: FARM_PAIR_READ_ABI,
        functionName: "token0" as const,
        chainId: farmConfig.chainId,
      },
      {
        key: "pairToken1" as const,
        address: farmConfig.v2PoolAddress as `0x${string}`,
        abi: FARM_PAIR_READ_ABI,
        functionName: "token1" as const,
        chainId: farmConfig.chainId,
      },
      {
        key: "pairReserves" as const,
        address: farmConfig.v2PoolAddress as `0x${string}`,
        abi: FARM_PAIR_READ_ABI,
        functionName: "getReserves" as const,
        chainId: farmConfig.chainId,
      },
    ];
  }, [farmConfig.chainId, farmConfig.v2PoolAddress, poolAddressReady]);
  const { data: poolData, refetch: refetchPoolData } = useReadContracts({
    allowFailure: true,
    contracts: poolContracts.map(({ key: _key, ...contract }) => contract),
    query: {
      enabled: poolContracts.length > 0,
      refetchInterval: 30000,
    },
  });
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Connect your wallet to begin.");
  const [busy, setBusy] = useState(false);

  const [walletLpBalance, setWalletLpBalance] = useState(0n);
  const [walletTokenBalance, setWalletTokenBalance] = useState(0n);
  const [walletQuoteTokenBalance, setWalletQuoteTokenBalance] = useState(0n);
  const [stakedBalance, setStakedBalance] = useState(0n);
  const [earnedRewards, setEarnedRewards] = useState(0n);
  const [rewardRate, setRewardRate] = useState(0n);
  const [periodFinish, setPeriodFinish] = useState(0n);
  const [allowance, setAllowance] = useState(0n);
  const [tokenAllowanceToRouter, setTokenAllowanceToRouter] = useState(0n);
  const [quoteTokenAllowanceToRouter, setQuoteTokenAllowanceToRouter] = useState(0n);
  const [lpAllowanceToRouter, setLpAllowanceToRouter] = useState(0n);
  const [totalStaked, setTotalStaked] = useState(0n);
  const [pairLiquiditySupply, setPairLiquiditySupply] = useState(0n);
  const [pairTokenReserve, setPairTokenReserve] = useState(0n);
  const [pairQuoteReserve, setPairQuoteReserve] = useState(0n);

  const [liquidityTokenInput, setLiquidityTokenInput] = useState("");
  const [liquidityQuoteInput, setLiquidityQuoteInput] = useState("");
  const [removeLiquidityInput, setRemoveLiquidityInput] = useState("");
  const [stakeInput, setStakeInput] = useState("");
  const [withdrawInput, setWithdrawInput] = useState("");

  const rewardsWrite = useMemo(
    () => (signer ? getRewardsWriteContract(signer, farmConfig) : null),
    [farmConfig, signer],
  );
  const lpWrite = useMemo(
    () => (signer ? getLpWriteContract(signer, farmConfig) : null),
    [farmConfig, signer],
  );
  const tokenWrite = useMemo(
    () => (signer ? getTokenWriteContract(farmConfig.tokenAddress, signer) : null),
    [farmConfig.tokenAddress, signer],
  );
  const quoteTokenWrite = useMemo(
    () => (signer ? getTokenWriteContract(farmConfig.quoteTokenAddress, signer) : null),
    [farmConfig.quoteTokenAddress, signer],
  );
  const v2RouterWrite = useMemo(
    () => (signer ? getV2RouterWriteContract(signer, farmConfig) : null),
    [farmConfig, signer],
  );
  const isOnFarmChain = (chain?.id ?? farmConfig.chainId) === farmConfig.chainId;

  const ensureFarmChain = useCallback(async () => {
    if (!isConnected) {
      setStatus("Connect wallet first.");
      return false;
    }

    if (isOnFarmChain) {
      return true;
    }

    if (!switchChainAsync) {
      setStatus(`Switch wallet to ${farmConfig.chainName} first.`);
      return false;
    }

    try {
      setStatus(`Switching wallet to ${farmConfig.chainName}...`);
      await switchChainAsync({ chainId: farmConfig.chainId });
      setStatus(`Wallet switched to ${farmConfig.chainName}. Retry the action.`);
    } catch (error) {
      setStatus(formatStatusError(error, `Failed to switch to ${farmConfig.chainName}.`));
    }

    return false;
  }, [
    farmConfig.chainId,
    farmConfig.chainName,
    isConnected,
    isOnFarmChain,
    switchChainAsync,
  ]);

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        refetchPublicProgramInfo(),
        refetchWalletSnapshot(),
        refetchAccountData(),
        refetchPoolData(),
      ]);
    } catch (error) {
      setStatus(formatStatusError(error, "Failed to refresh contract data."));
    }
  }, [
    refetchAccountData,
    refetchPoolData,
    refetchPublicProgramInfo,
    refetchWalletSnapshot,
  ]);

  useEffect(() => {
    if (!publicProgramInfoData?.length) {
      return;
    }

    const [rewardRateResult, periodFinishResult, totalStakedResult] = publicProgramInfoData;

    if (rewardRateResult?.status === "success" && typeof rewardRateResult.result === "bigint") {
      setRewardRate(rewardRateResult.result);
    }

    if (
      periodFinishResult?.status === "success" &&
      typeof periodFinishResult.result === "bigint"
    ) {
      setPeriodFinish(periodFinishResult.result);
    }

    if (
      totalStakedResult?.status === "success" &&
      typeof totalStakedResult.result === "bigint"
    ) {
      setTotalStaked(totalStakedResult.result);
    }
  }, [publicProgramInfoData]);

  useEffect(() => {
    if (!walletSnapshotContracts.length || !walletSnapshotData?.length) {
      return;
    }

    for (const [index, contract] of walletSnapshotContracts.entries()) {
      const result = walletSnapshotData[index];

      if (result?.status !== "success" || typeof result.result !== "bigint") {
        continue;
      }

      if (contract.key === "walletTokenBalance") {
        setWalletTokenBalance(result.result);
      }

      if (contract.key === "walletQuoteTokenBalance") {
        setWalletQuoteTokenBalance(result.result);
      }

      if (contract.key === "walletLpBalance") {
        setWalletLpBalance(result.result);
      }
    }
  }, [walletSnapshotContracts, walletSnapshotData]);

  useEffect(() => {
    if (!accountContracts.length || !accountData?.length) {
      return;
    }

    for (const [index, contract] of accountContracts.entries()) {
      const result = accountData[index];

      if (result?.status !== "success" || typeof result.result !== "bigint") {
        continue;
      }

      if (contract.key === "stakedBalance") {
        setStakedBalance(result.result);
      }

      if (contract.key === "earnedRewards") {
        setEarnedRewards(result.result);
      }

      if (contract.key === "allowance") {
        setAllowance(result.result);
      }

      if (contract.key === "tokenAllowanceToRouter") {
        setTokenAllowanceToRouter(result.result);
      }

      if (contract.key === "quoteTokenAllowanceToRouter") {
        setQuoteTokenAllowanceToRouter(result.result);
      }

      if (contract.key === "lpAllowanceToRouter") {
        setLpAllowanceToRouter(result.result);
      }
    }
  }, [accountContracts, accountData]);

  useEffect(() => {
    if (!poolContracts.length || !poolData?.length) {
      setPairLiquiditySupply(0n);
      setPairTokenReserve(0n);
      setPairQuoteReserve(0n);
      return;
    }

    const pairLiquiditySupplyResult = poolData[0];
    const pairToken0Result = poolData[1];
    const pairToken1Result = poolData[2];
    const pairReservesResult = poolData[3];

    if (
      pairLiquiditySupplyResult?.status === "success" &&
      typeof pairLiquiditySupplyResult.result === "bigint"
    ) {
      setPairLiquiditySupply(pairLiquiditySupplyResult.result);
    } else {
      setPairLiquiditySupply(0n);
    }

    if (
      pairToken0Result?.status === "success" &&
      pairToken1Result?.status === "success" &&
      pairReservesResult?.status === "success"
    ) {
      const token0Address = String(pairToken0Result.result).toLowerCase();
      const token1Address = String(pairToken1Result.result).toLowerCase();
      const tokenAddress = farmConfig.tokenAddress.toLowerCase();
      const quoteTokenAddress = farmConfig.quoteTokenAddress.toLowerCase();
      const reserves = pairReservesResult.result as [bigint, bigint, number];

      if (token0Address === tokenAddress && token1Address === quoteTokenAddress) {
        setPairTokenReserve(reserves[0]);
        setPairQuoteReserve(reserves[1]);
      } else if (token0Address === quoteTokenAddress && token1Address === tokenAddress) {
        setPairTokenReserve(reserves[1]);
        setPairQuoteReserve(reserves[0]);
      } else {
        setPairTokenReserve(0n);
        setPairQuoteReserve(0n);
        setStatus(
          `Configured pair does not match the ${farmConfig.tokenSymbol}/${farmConfig.quoteTokenSymbol} token addresses.`,
        );
      }
    } else {
      setPairTokenReserve(0n);
      setPairQuoteReserve(0n);
    }
  }, [
    farmConfig.quoteTokenAddress,
    farmConfig.quoteTokenSymbol,
    farmConfig.tokenAddress,
    farmConfig.tokenSymbol,
    poolContracts.length,
    poolData,
  ]);

  const quoteFromTokenInput = useCallback((value: string) => {
    const amountIn = parseInputToUnitsSafe(value, farmConfig.tokenDecimals);
    if (!value.trim() || amountIn <= 0n || pairTokenReserve <= 0n || pairQuoteReserve <= 0n) {
      return "";
    }

    const quotedAmount = (amountIn * pairQuoteReserve) / pairTokenReserve;
    return formatUnitsSafe(quotedAmount, farmConfig.quoteTokenDecimals, 8);
  }, [pairQuoteReserve, pairTokenReserve]);

  const tokenFromQuoteInput = useCallback((value: string) => {
    const amountIn = parseInputToUnitsSafe(value, farmConfig.quoteTokenDecimals);
    if (!value.trim() || amountIn <= 0n || pairTokenReserve <= 0n || pairQuoteReserve <= 0n) {
      return "";
    }

    const quotedAmount = (amountIn * pairTokenReserve) / pairQuoteReserve;
    return formatUnitsSafe(quotedAmount, farmConfig.tokenDecimals, 8);
  }, [pairQuoteReserve, pairTokenReserve]);

  const handleLiquidityTokenInput = useCallback((value: string) => {
    setLiquidityTokenInput(value);
    setLiquidityQuoteInput(quoteFromTokenInput(value));
  }, [quoteFromTokenInput]);

  const handleLiquidityQuoteInput = useCallback((value: string) => {
    setLiquidityQuoteInput(value);
    setLiquidityTokenInput(tokenFromQuoteInput(value));
  }, [tokenFromQuoteInput]);

  const hasApproval = allowance > 0n;
  const requiredTokenApproval = parseInputToUnitsSafe(
    liquidityTokenInput || "0",
    farmConfig.tokenDecimals,
  );
  const requiredQuoteApproval = parseInputToUnitsSafe(
    liquidityQuoteInput || "0",
    farmConfig.quoteTokenDecimals,
  );
  const requiredRemoveLiquidityApproval = parseInputToUnitsSafe(
    removeLiquidityInput || "0",
    farmConfig.lpDecimals,
  );
  const hasLiquidityTokenApproval =
    requiredTokenApproval === 0n || tokenAllowanceToRouter >= requiredTokenApproval;
  const hasLiquidityQuoteApproval =
    requiredQuoteApproval === 0n || quoteTokenAllowanceToRouter >= requiredQuoteApproval;
  const hasLpRouterApproval = lpAllowanceToRouter > 0n;
  const hasRemoveLiquidityApproval =
    hasLpRouterApproval &&
    (requiredRemoveLiquidityApproval === 0n || lpAllowanceToRouter >= requiredRemoveLiquidityApproval);

  const approveLp = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!lpWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Sending LP approval...");
      const tx = await lpWrite.approve(farmConfig.rewardsContractAddress, MaxUint256);
      await waitForConfirmedTransaction(tx, provider);
      setStatus("LP approval confirmed.");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "LP approval failed."));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, lpWrite, refreshData]);

  const approveTokenForRouter = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!tokenWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setBusy(true);
      setStatus(`Approving ${farmConfig.tokenSymbol} for the V2 router...`);
      const tx = await tokenWrite.approve(farmConfig.v2RouterAddress, MaxUint256);
      await waitForConfirmedTransaction(tx, provider);
      setStatus(`${farmConfig.tokenSymbol} approval confirmed.`);
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, `${farmConfig.tokenSymbol} approval failed.`));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, refreshData, tokenWrite]);

  const approveQuoteTokenForRouter = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!quoteTokenWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setBusy(true);
      setStatus(`Approving ${farmConfig.quoteTokenSymbol} for the V2 router...`);
      const tx = await quoteTokenWrite.approve(farmConfig.v2RouterAddress, MaxUint256);
      await waitForConfirmedTransaction(tx, provider);
      setStatus(`${farmConfig.quoteTokenSymbol} approval confirmed.`);
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, `${farmConfig.quoteTokenSymbol} approval failed.`));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, quoteTokenWrite, refreshData]);

  const approveLpForRouter = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!lpWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setBusy(true);
      setStatus(`Approving ${farmConfig.lpSymbol} for the V2 router...`);
      const tx = await lpWrite.approve(farmConfig.v2RouterAddress, MaxUint256);
      await waitForConfirmedTransaction(tx, provider);
      setStatus(`${farmConfig.lpSymbol} router approval confirmed.`);
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "LP router approval failed."));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, lpWrite, refreshData]);

  const addLiquidity = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!v2RouterWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      const amountTokenDesired = parseInputToUnits(
        liquidityTokenInput,
        farmConfig.tokenDecimals,
      );
      const amountQuoteDesired = parseInputToUnits(
        liquidityQuoteInput,
        farmConfig.quoteTokenDecimals,
      );

      if (amountTokenDesired <= 0n || amountQuoteDesired <= 0n) {
        setStatus(
          `Enter valid ${farmConfig.tokenSymbol} and ${farmConfig.quoteTokenSymbol} amounts.`,
        );
        return;
      }

      if (!hasLiquidityTokenApproval || !hasLiquidityQuoteApproval) {
        setStatus(`Approve both ${farmConfig.tokenSymbol} and ${farmConfig.quoteTokenSymbol} before adding liquidity.`);
        return;
      }

      if (amountTokenDesired > walletTokenBalance) {
        setStatus(`Insufficient ${farmConfig.tokenSymbol} balance for this liquidity add.`);
        return;
      }

      if (amountQuoteDesired > walletQuoteTokenBalance) {
        setStatus(`Insufficient ${farmConfig.quoteTokenSymbol} balance for this liquidity add.`);
        return;
      }

      if (pairTokenReserve <= 0n || pairQuoteReserve <= 0n) {
        setStatus("Pool reserves are unavailable right now. Refresh and try again.");
        return;
      }

      const slippageBps = BigInt(farmConfig.liquiditySlippageBps);
      const amountTokenMin = (amountTokenDesired * (10000n - slippageBps)) / 10000n;
      const amountQuoteMin = (amountQuoteDesired * (10000n - slippageBps)) / 10000n;
      const deadline =
        BigInt(Math.floor(Date.now() / 1000)) +
        BigInt(farmConfig.liquidityDeadlineMinutes * 60);

      setBusy(true);
      setStatus(
        `Adding ${farmConfig.tokenSymbol}/${farmConfig.quoteTokenSymbol} liquidity...`,
      );

      const tx = await v2RouterWrite.addLiquidity(
        ...(farmConfig.routerKind === "aerodromeV2"
          ? [
              farmConfig.tokenAddress,
              farmConfig.quoteTokenAddress,
              farmConfig.poolStable,
              amountTokenDesired,
              amountQuoteDesired,
              amountTokenMin,
              amountQuoteMin,
              account,
              deadline,
            ]
          : [
              farmConfig.tokenAddress,
              farmConfig.quoteTokenAddress,
              amountTokenDesired,
              amountQuoteDesired,
              amountTokenMin,
              amountQuoteMin,
              account,
              deadline,
            ]),
      );

      await waitForConfirmedTransaction(tx, provider);
      setStatus("Liquidity added. Your LP tokens are ready to stake.");
      setLiquidityTokenInput("");
      setLiquidityQuoteInput("");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "Add liquidity failed."));
    } finally {
      setBusy(false);
    }
  }, [
    account,
    hasLiquidityQuoteApproval,
    hasLiquidityTokenApproval,
    liquidityQuoteInput,
    liquidityTokenInput,
    pairQuoteReserve,
    pairTokenReserve,
    refreshData,
    ensureFarmChain,
    v2RouterWrite,
    walletQuoteTokenBalance,
    walletTokenBalance,
  ]);

  const removeLiquidity = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!v2RouterWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      const liquidity = parseInputToUnits(removeLiquidityInput, farmConfig.lpDecimals);

      if (liquidity <= 0n) {
        setStatus("Enter a valid LP amount to remove.");
        return;
      }

      if (!hasRemoveLiquidityApproval) {
        setStatus("Approve your LP tokens for the router before removing liquidity.");
        return;
      }

      if (liquidity > walletLpBalance) {
        setStatus(`Insufficient ${farmConfig.lpSymbol} balance in your wallet to remove that amount.`);
        return;
      }

      const slippageBps = BigInt(farmConfig.liquiditySlippageBps);
      let amountTokenMin = 0n;
      let amountQuoteMin = 0n;

      if (pairLiquiditySupply > 0n && pairTokenReserve > 0n && pairQuoteReserve > 0n) {
        const expectedTokenOut = (liquidity * pairTokenReserve) / pairLiquiditySupply;
        const expectedQuoteOut = (liquidity * pairQuoteReserve) / pairLiquiditySupply;
        amountTokenMin = (expectedTokenOut * (10000n - slippageBps)) / 10000n;
        amountQuoteMin = (expectedQuoteOut * (10000n - slippageBps)) / 10000n;
      }

      const deadline =
        BigInt(Math.floor(Date.now() / 1000)) +
        BigInt(farmConfig.liquidityDeadlineMinutes * 60);

      setBusy(true);
      setStatus(`Removing ${farmConfig.lpSymbol} liquidity...`);

      const tx = await v2RouterWrite.removeLiquidity(
        ...(farmConfig.routerKind === "aerodromeV2"
          ? [
              farmConfig.tokenAddress,
              farmConfig.quoteTokenAddress,
              farmConfig.poolStable,
              liquidity,
              amountTokenMin,
              amountQuoteMin,
              account,
              deadline,
            ]
          : [
              farmConfig.tokenAddress,
              farmConfig.quoteTokenAddress,
              liquidity,
              amountTokenMin,
              amountQuoteMin,
              account,
              deadline,
            ]),
      );

      await waitForConfirmedTransaction(tx, provider);
      setStatus(`Liquidity removed. ${farmConfig.tokenSymbol} and ${farmConfig.quoteTokenSymbol} returned to your wallet.`);
      setRemoveLiquidityInput("");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "Remove liquidity failed."));
    } finally {
      setBusy(false);
    }
  }, [
    account,
    pairQuoteReserve,
    pairLiquiditySupply,
    pairTokenReserve,
    refreshData,
    removeLiquidityInput,
    ensureFarmChain,
    v2RouterWrite,
    hasRemoveLiquidityApproval,
    walletLpBalance,
  ]);

  const stakeLp = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!rewardsWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      const amount = parseInputToUnits(stakeInput, farmConfig.lpDecimals);

      if (amount <= 0n) {
        setStatus("Enter a valid LP amount to stake.");
        return;
      }

      setBusy(true);
      setStatus("Submitting stake transaction...");
      const tx = await rewardsWrite.stake(amount);
      await waitForConfirmedTransaction(tx, provider);
      setStatus("Stake confirmed.");
      setStakeInput("");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "Stake failed."));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, refreshData, rewardsWrite, stakeInput]);

  const withdrawLp = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!rewardsWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      const amount = parseInputToUnits(withdrawInput, farmConfig.lpDecimals);

      if (amount <= 0n) {
        setStatus("Enter a valid LP amount to withdraw.");
        return;
      }

      setBusy(true);
      setStatus("Submitting withdraw transaction...");
      const tx = await rewardsWrite.withdraw(amount);
      await waitForConfirmedTransaction(tx, provider);
      setStatus("Withdraw confirmed.");
      setWithdrawInput("");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "Withdraw failed."));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, refreshData, rewardsWrite, withdrawInput]);

  const claimRewards = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!rewardsWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setBusy(true);
      setStatus(`Claiming ${farmConfig.tokenSymbol} rewards...`);
      const tx = await rewardsWrite.getReward();
      await waitForConfirmedTransaction(tx, provider);
      setStatus("Rewards claimed.");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "Claim failed."));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, refreshData, rewardsWrite]);

  const exitFarm = useCallback(async () => {
    if (!(await ensureFarmChain())) {
      return;
    }

    if (!rewardsWrite) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Exiting farm: withdrawing LP and claiming rewards...");
      const tx = await rewardsWrite.exit();
      await waitForConfirmedTransaction(tx, provider);
      setStatus("Exit confirmed.");
      await refreshData();
    } catch (error) {
      setStatus(formatStatusError(error, "Exit failed."));
    } finally {
      setBusy(false);
    }
  }, [ensureFarmChain, refreshData, rewardsWrite]);

  const fillMaxStake = useCallback(() => {
    setStakeInput(formatUnitsSafe(walletLpBalance, farmConfig.lpDecimals, 8));
  }, [walletLpBalance]);

  const fillMaxWithdraw = useCallback(() => {
    setWithdrawInput(formatUnitsSafe(stakedBalance, farmConfig.lpDecimals, 8));
  }, [stakedBalance]);

  const fillMaxLiquidityToken = useCallback(() => {
    const nextValue = formatUnitsSafe(walletTokenBalance, farmConfig.tokenDecimals, 8);
    setLiquidityTokenInput(nextValue);
    setLiquidityQuoteInput(quoteFromTokenInput(nextValue));
  }, [quoteFromTokenInput, walletTokenBalance]);

  const fillMaxLiquidityQuote = useCallback(() => {
    const nextValue = formatUnitsSafe(walletQuoteTokenBalance, farmConfig.quoteTokenDecimals, 8);
    setLiquidityQuoteInput(nextValue);
    setLiquidityTokenInput(tokenFromQuoteInput(nextValue));
  }, [tokenFromQuoteInput, walletQuoteTokenBalance]);

  const fillMaxRemoveLiquidity = useCallback(() => {
    setRemoveLiquidityInput(formatUnitsSafe(walletLpBalance, farmConfig.lpDecimals, 8));
  }, [walletLpBalance]);

  useEffect(() => {
    if (isOnFarmChain) {
      return;
    }

    setAllowance(0n);
    setTokenAllowanceToRouter(0n);
    setQuoteTokenAllowanceToRouter(0n);
    setLpAllowanceToRouter(0n);
    setStakedBalance(0n);
    setEarnedRewards(0n);
    setPairTokenReserve(0n);
    setPairQuoteReserve(0n);
  }, [isOnFarmChain]);

  useEffect(() => {
    if (!isConnected || !connector || !address) {
      setAccount("");
      setSigner(null);
      setProvider(null);
      setStatus("Connect your wallet to begin.");
      return;
    }

    let cancelled = false;
    const activeConnector = connector;
    const activeAddress = address;

    async function syncWallet() {
      try {
        const walletProvider = (await activeConnector.getProvider()) as
          | Eip1193Provider
          | undefined;

        if (!walletProvider) {
          if (!cancelled) {
            setStatus("Wallet provider unavailable.");
          }
          return;
        }

        const browserProvider = new BrowserProvider(walletProvider);
        const nextSigner = await browserProvider.getSigner(activeAddress);

        if (cancelled) {
          return;
        }

        setProvider(browserProvider);
        setSigner(nextSigner);
        setAccount(activeAddress);

        if ((chain?.id ?? farmConfig.chainId) !== farmConfig.chainId) {
          setStatus(`Wrong network. Please switch to ${farmConfig.chainName}.`);
        } else {
          setStatus("Wallet connected.");
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to initialize wallet.";
          setStatus(message);
        }
      }
    }

    void syncWallet();

    return () => {
      cancelled = true;
    };
  }, [address, chain?.id, connector, farmConfig.chainId, farmConfig.chainName, isConnected]);

  return {
    provider,
    signer,
    account,
    status,
    busy,
    walletLpBalance,
    walletTokenBalance,
    walletQuoteTokenBalance,
    stakedBalance,
    earnedRewards,
    rewardRate,
    periodFinish,
    allowance,
    tokenAllowanceToRouter,
    quoteTokenAllowanceToRouter,
    lpAllowanceToRouter,
    totalStaked,
    pairTokenReserve,
    pairQuoteReserve,
    liquidityTokenInput,
    liquidityQuoteInput,
    removeLiquidityInput,
    stakeInput,
    withdrawInput,
    hasApproval,
    hasLiquidityTokenApproval,
    hasLiquidityQuoteApproval,
    hasRemoveLiquidityApproval,
    setLiquidityTokenInput: handleLiquidityTokenInput,
    setLiquidityQuoteInput: handleLiquidityQuoteInput,
    setRemoveLiquidityInput,
    setStakeInput,
    setWithdrawInput,
    refreshData,
    approveTokenForRouter,
    approveQuoteTokenForRouter,
    approveLpForRouter,
    addLiquidity,
    removeLiquidity,
    approveLp,
    stakeLp,
    withdrawLp,
    claimRewards,
    exitFarm,
    fillMaxLiquidityToken,
    fillMaxLiquidityQuote,
    fillMaxRemoveLiquidity,
    fillMaxStake,
    fillMaxWithdraw,
  };
}
