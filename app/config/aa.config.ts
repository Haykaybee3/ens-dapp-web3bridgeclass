"use client";

import { sepolia } from "viem/chains";

export const AA_CHAIN = sepolia;
export const BUNDLER_URL = `https://api.pimlico.io/v2/${AA_CHAIN.id}/rpc?apikey=${process.env.NEXT_PIMLICO_API_KEY}`;
export const PAYMASTER_URL = `https://api.pimlico.io/v2/${AA_CHAIN.id}/rpc?apikey=${process.env.NEXT_PIMLICO_API_KEY}`;


