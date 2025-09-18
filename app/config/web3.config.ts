import { sepolia } from "viem/chains";
import { getDefaultConfig } from "connectkit";
import { createConfig, http, injected, webSocket } from "wagmi";
import { siteConfig } from "./site.config";

export const projectId = `${process.env.NEXT_PUBLIC_REOWN_PROJECT_ID}`;
export const rpcUrl = "https://rpc.sepolia.org";
export const wsRpcUrl = "wss://ethereum-sepolia.publicnode.com";

export const web3Config = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    connectors: [injected()],
    transports: {
      [sepolia.id]: webSocket(wsRpcUrl),
    },
    walletConnectProjectId: projectId,
    appName: siteConfig.name,
    appDescription: siteConfig.description,
    appUrl: siteConfig.url,
    appIcon: siteConfig.icon,
    storage: null,
  })
);
