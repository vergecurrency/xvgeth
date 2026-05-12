import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletConnectTrigger() {
  return (
    <ConnectButton.Custom>
      {({
        mounted,
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <Button onClick={openConnectModal} className="w-full sm:w-auto">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} variant="outline" className="w-full sm:w-auto">
              <Wallet className="mr-2 h-4 w-4" />
              Wrong Network
            </Button>
          );
        }

        return (
          <Button onClick={openAccountModal} className="w-full sm:w-auto">
            <Wallet className="mr-2 h-4 w-4" />
            {account.displayName}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
