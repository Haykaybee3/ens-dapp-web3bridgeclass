"use client"

import { MdOutlineWaterDrop } from "react-icons/md";
import { TbPlugConnectedX } from "react-icons/tb";
import { Loader } from "lucide-react";
import { ConnectKitButton } from "connectkit";

import { useAccount } from "wagmi";
import { web3Config } from "../../config/web3.config";
import Wrapper from "./wrapper";
import Link from "next/link";

export default function Header() {
  const { status } = useAccount({
    config: web3Config,
  });

  return (
    <header className="h-20 w-full sticky z-50 top-0 inset-x-0 bg-primary-purple border-b border-accent-purple">
      <Wrapper className="flex items-center px-6 size-full">
        {status === "connected" ? (
          <Link
            href="https://www.alchemy.com/faucets/ethereum-sepolia"
            target="_blank"
            className="flex items-center gap-2 h-10 px-4 bg-green-600 rounded-lg text-sm font-medium text-white cursor-pointer border border-green-500 hover:bg-green-700 transition-all duration-200"
          >
            <MdOutlineWaterDrop className="size-5 cursor-pointer" />
            <span className="hidden sm:block">
              Sepolia Faucet
            </span>
          </Link>
        ) : status === "connecting" || status === "reconnecting" ? (
          <p className="flex items-center gap-2 h-10 px-4 bg-accent-purple rounded-lg text-sm font-medium text-white cursor-pointer border border-light-purple">
            <Loader className="size-4 animate-spin" />
            <span className="hidden sm:block capitalize">{status}...</span>
          </p>
        ) : (
          <p className="flex items-center gap-2 h-10 px-4 bg-red-600 rounded-lg text-sm font-medium text-white border border-red-500">
            <TbPlugConnectedX className="size-5" />
            <span className="hidden sm:block">No account connected</span>
          </p>
        )}

        <div className="ml-auto">
          <ConnectKitButton showBalance showAvatar={true} />
        </div>
      </Wrapper>
    </header>
  );
}
