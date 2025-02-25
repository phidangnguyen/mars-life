import { ethers } from "ethers";

// Define the ABI for the SpinCompleted event
const abi = [
    "event SpinCompleted(address indexed player, uint256 indexed spinIndex, uint256 segment, uint256 prize)"
];

// Create an interface from the ABI
const interfaceABI = new ethers.utils.Interface(abi);

// Function to decode a SpinCompleted event from transaction receipt
/* eslint-disable @typescript-eslint/no-explicit-any */
export function decodeSpinCompletedEvent(receipt: any, contractAddress: string) {
    // Convert the contract address to lowercase for comparison
    contractAddress = contractAddress.toLowerCase();

    // Find the SpinCompleted log in the receipt
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const spinLog = receipt.logs.find((log: any) =>
        log.address.toLowerCase() === contractAddress
        // We don't need to check the topic[0] because we'll try to decode it later
    );

    if (!spinLog) {
        throw new Error(`No logs found for contract: ${contractAddress}`);
    }

    try {
        // Parse the log using the interface
        const parsedLog = interfaceABI.parseLog(spinLog);

        // Extract the values
        const result = {
            player: parsedLog.args.player,
            spinIndex: parsedLog.args.spinIndex.toString(),
            segment: parsedLog.args.segment.toString(),
            prize: parsedLog.args.prize.toString(),
            // Format prize for display (assuming 18 decimals)
            formattedPrize: ethers.utils.formatUnits(parsedLog.args.prize, 18)
        };

        return result;
    } catch (error) {
        console.error("Error parsing log:", error);

        // If we can't parse it with our interface, let's try to be helpful
        // and look for the SpinCompleted event signature
        const spinCompletedTopic = ethers.utils.id("SpinCompleted(address,uint256,uint256,uint256)");

        const manualLog = receipt.logs.find((log: any) =>
            log.address.toLowerCase() === contractAddress &&
            log.topics[0] === spinCompletedTopic
        );

        if (manualLog) {
            // Manual decode
            return {
                player: ethers.utils.getAddress("0x" + manualLog.topics[1].slice(26)),
                spinIndex: parseInt(manualLog.topics[2], 16).toString(),
                segment: parseInt(manualLog.data.slice(0, 66), 16).toString(),
                prize: manualLog.data.slice(66),
                formattedPrize: ethers.utils.formatUnits(
                    ethers.BigNumber.from("0x" + manualLog.data.slice(66)),
                    18
                )
            };
        }

        throw new Error("Failed to decode SpinCompleted event");
    }
}