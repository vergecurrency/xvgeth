import { createContext, useContext } from "react";
import type { FarmConfig } from "@/lib/farms";

const FarmContext = createContext<FarmConfig | null>(null);

type FarmProviderProps = {
  config: FarmConfig;
  children: React.ReactNode;
};

export function FarmProvider({ config, children }: FarmProviderProps) {
  return <FarmContext.Provider value={config}>{children}</FarmContext.Provider>;
}

export function useFarmConfig() {
  const value = useContext(FarmContext);
  if (!value) {
    throw new Error("useFarmConfig must be used inside a FarmProvider.");
  }

  return value;
}
