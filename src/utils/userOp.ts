import { BUNDLER_ENDPOINT } from "@/constants/constant";

export const waitForUserOperationReceipt = async (hash: string, timeout = 60000, interval = 5000): Promise<any> => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {        
        const receipt = await getUserOperationReceipt(hash);
        if (receipt) {
            return receipt;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Timeout waiting for UserOperation receipt');
}

export const getUserOperationReceipt = async (hash: string): Promise<any | null> => {
    try {
        const response = await fetch(`${BUNDLER_ENDPOINT}onchain/user-op-receipt/2484/${hash}`, {
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