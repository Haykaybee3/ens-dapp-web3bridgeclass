import { Contract } from "ethers";
import { ensureEthereumAvailable, getENSContract } from ".";
import { handleErrorMessage } from "@/utils/utils";

export const getNameAvailable = async (name: string): Promise<boolean> => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getENSContract();
        
        if (!contract) {
            throw new Error("Contract not initialized. Please check your wallet connection.");
        }
        
        const isAvailable: boolean = await contract.isNameAvailable(name);
        return isAvailable;
    } catch(error: any) {
        console.error("Error checking name availability:", error);
        handleErrorMessage(error);
        throw error;
    }
}

export const registerName = async (name: string, imageHash: string, targetAddr: string) => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getENSContract();
        
        if (!contract) {
            throw new Error("Contract not initialized. Please check your wallet connection.");
        }
        
        const tx = await contract.registerName(name, imageHash, targetAddr);
        await tx.wait();

        return tx;
    } catch(error) {
        handleErrorMessage(error);
        throw error;
    }
}

export const getNamesOwned = async (owner: string): Promise<string[]> => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getENSContract();
        
        if (!contract) {
            throw new Error("Contract not initialized. Please check your wallet connection.");
        }
        
        const names: string[] = await contract.getNamesOwnedBy(owner);

        return names;
    } catch(error) {
        handleErrorMessage(error);
        throw error;
    }
}

