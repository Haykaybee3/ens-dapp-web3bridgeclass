import { Contract, ethers } from "ethers";
import { ENSContract } from "./contract";
import { rpcUrl } from "../config/web3.config";

declare global {
    interface Window {
      ethereum?: any;
    }
  }
  
const ethereumProvider = typeof window !== "undefined" ? window.ethereum : null;

export async function ensureEthereumAvailable(): Promise<void> {
    if (!ethereumProvider) {
      throw new Error(
        "No Ethereum provider found. Please install an EVM wallet (e.g., MetaMask)."
      );
    }
  
    if (typeof ethereumProvider.request !== "function") {
      throw new Error(
        "Ethereum provider does not support 'request' method. Ensure MetaMask is up to date."
      );
    }
}

export async function getSigner(): Promise<ethers.Signer> {
    await ensureEthereumAvailable();
  
    try {
      const provider: ethers.BrowserProvider = new ethers.BrowserProvider(ethereumProvider);
      const network = await provider.getNetwork();
      const sepoliaChainIdHex = "0xaa36a7"; // 11155111

      if (network.chainId !== BigInt(11155111)) {
        try {
          await ethereumProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: sepoliaChainIdHex }],
          });
        } catch (switchError: any) {
          if (switchError?.code === 4902) {
            await ethereumProvider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: sepoliaChainIdHex,
                  chainName: "Sepolia",
                  rpcUrls: ["https://rpc.sepolia.org"],
                  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      return provider.getSigner();
    } catch (error: any) {
      console.error("Error getting signer:", error);
      
      if (error.code === 4001) {
        throw new Error("User rejected wallet connection");
      } else if (error.message?.includes("User denied")) {
        throw new Error("User denied wallet access");
      } else {
        throw new Error(`Failed to get signer: ${error.message || "Unknown error"}`);
      }
    }
}

export async function getENSContract(): Promise<Contract> {
    await ensureEthereumAvailable();
  
    try {
      const signer: ethers.Signer = await getSigner();
      return new ethers.Contract(
        ENSContract.contractAddr,
        ENSContract.contractABI,
        signer
      );
    } catch (error: any) {
      console.error("Error initializing contract:", error);
      
      if (error.message?.includes("User rejected") || error.message?.includes("User denied")) {
        throw new Error("Wallet connection was rejected. Please connect your wallet and try again.");
      } else {
        throw new Error(`Failed to initialize the ENS contract: ${error.message || "Unknown error"}`);
      }
    }
  }

export async function validateContract(contract: Contract): Promise<void> {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Contract validation timeout")), 10000)
      );
      
      const validationPromise = contract.contractOwner();
      
      await Promise.race([validationPromise, timeoutPromise]);
    } catch (error: any) {
      console.error("Contract validation failed:", error);
      
      if (error.message === "Contract validation timeout") {
        throw new Error(`Contract validation failed: Request timed out - check network connection`);
      } else if (error.code === "CALL_EXCEPTION") {
        throw new Error(`Contract validation failed: Contract may not exist at address ${ENSContract.contractAddr}`);
      } else if (error.message?.includes("missing revert data")) {
        throw new Error(`Contract validation failed: No contract found at address ${ENSContract.contractAddr}`);
      } else {
        throw new Error(`Contract validation failed: ${error.message || "Unknown error"}`);
      }
    }
  }
  