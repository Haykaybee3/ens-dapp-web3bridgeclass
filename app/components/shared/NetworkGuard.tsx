"use client";

import React, { useEffect, useState } from "react";

const SEPOLIA_HEX = "0xaa36a7"; // 11155111

export const NetworkGuard: React.FC = () => {
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;

    const check = async () => {
      try {
        const chainId: string = await eth.request({ method: "eth_chainId" });
        setWrongNetwork(chainId?.toLowerCase() !== SEPOLIA_HEX);
      } catch (_) {}
    };

    check();

    const onChainChanged = () => {
      setError(null);
      check();
    };
    eth.on?.("chainChanged", onChainChanged);
    return () => {
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const handleSwitch = async () => {
    setError(null);
    setSwitching(true);
    try {
      const eth = (window as any)?.ethereum;
      if (!eth) throw new Error("No wallet detected");
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_HEX }] });
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_HEX,
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
    } catch (e: any) {
      setError(e?.message || "Failed to switch network");
    } finally {
      setSwitching(false);
    }
  };

  if (!wrongNetwork) return null;

  return (
    <div className="bg-red-600 border border-red-500 rounded-2xl p-4 mb-6 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold">Wrong network</p>
          <p className="text-red-200 text-sm">Please switch to Ethereum Sepolia to continue.</p>
          {error && <p className="text-white/90 text-xs mt-1">{error}</p>}
        </div>
        <button
          onClick={handleSwitch}
          disabled={switching}
          className="px-4 py-2 rounded-lg bg-white text-red-600 font-medium hover:bg-red-50 disabled:opacity-70"
        >
          {switching ? "Switching..." : "Switch to Sepolia"}
        </button>
      </div>
    </div>
  );
};

export default NetworkGuard;


