import { BUNDLER_ENDPOINT } from "@/constants/constant";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const waitForUserOperationReceipt = async (hash: string, chainId: number, timeout = 60000, interval = 5000): Promise<any> => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {        
        const receipt = await getUserOperationReceipt(hash, chainId);
        if (receipt) {
            return receipt;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Timeout waiting for UserOperation receipt');
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getUserOperationReceipt = async (hash: string, chainId: number): Promise<any | null> => {
    try {
        const response = await fetch(`${BUNDLER_ENDPOINT}onchain/user-op-receipt/${chainId}/${hash}`, {
            method: 'GET'
        });
        const txReceiptData = await response.json();
        // If no receipt found
        if (!txReceiptData.data) {
            return null;
        }

        return txReceiptData.data;
    } catch (error) {
        console.error('Failed to get user operation receipt:', error);
        throw error;
    }
}