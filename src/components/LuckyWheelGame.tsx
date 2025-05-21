'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowBigDown, Loader2, RotateCw, LogOut } from 'lucide-react';
import { WheelSegment, TransactionState, GameResult } from '@/types/game';
import Login from '@/components/Login';
import TransactionStatus from '@/components/TransactionStatus';
import ResultDisplay from '@/components/ResultDisplay';
import { useToast } from './ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { API_KEY, BUNDLER_ENDPOINT, LUCKY_WHEEL_CONTRACT, LUCKY_WHEEL_CONTRACT_A8_TESTNET } from '@/constants/constant';
import { buildContractCallRequest } from '@layerg-ua-sdk/aa-sdk';
import { WHEEL_ABI } from '@/constants/abis';
import { waitForUserOperationReceipt } from '@/utils/userOp';
import { decodeSpinCompletedEvent } from '@/utils/logs';

const LuckyWheelGame = () => {
  const { isAuthenticated, user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: '',
    hash: null,
    error: null,
  });
  const wheelRef = useRef<HTMLDivElement>(null);

  // Wheel segments configuration
  const segments: WheelSegment[] = [
    { color: '#FF8C42', text: '100 G', prize: 100 },
    { color: '#4CB944', text: '500 G', prize: 500 },
    { color: '#4F86C6', text: '50 G', prize: 50 },
    { color: '#A42CD6', text: '1000 G', prize: 1000 },
    { color: '#FF3C38', text: 'No Win', prize: 0 },
    { color: '#FFD700', text: '250 G', prize: 250 },
    { color: '#42CAFD', text: '150 G', prize: 150 },
    { color: '#E6A0C4', text: '20 G', prize: 20 },
  ];

  useEffect(() => {
    console.log("user: ", user);

    if (isAuthenticated && user) {
      toast({
        title: `Welcome, ${user.name}`,
        description: "Your Universal Account wallet is ready to use",
      });
    }
  }, [isAuthenticated, user]);



  const spinWheel = async (chainId: number) => {
    if (spinning || !isAuthenticated) return;
    setLoading(true);
    setTransactionState({
      status: 'Initiating smart contract transaction...',
      hash: null,
      error: null,
    });

    try {
      // Create authentication signature

      const wheel_contract = chainId === 2484 ? LUCKY_WHEEL_CONTRACT : LUCKY_WHEEL_CONTRACT_A8_TESTNET

      const txRequest = buildContractCallRequest({
        sender: "0x5da884e2602089AAc923E897b298282a40287C89",
        contractAddress: wheel_contract,
        abi: WHEEL_ABI,
        method: "spin",
        params: []
      })

      // Call API to spin the wheel
      const response = await fetch(`${BUNDLER_ENDPOINT}onchain/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          "chainId": chainId,
          "sponsor": true,
          "transactionReq": {
            "to": txRequest.to,
            "value": "0",
            "data": txRequest.data,
            "maxPriorityFeePerGas": "1800000000"
          }
        }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate spin transaction');
      }

      const txData = await response.json();
      console.log("response: ", txData);

      setTransactionState({
        status: 'Transaction bundled with Account Abstraction, executing...',
        hash: txData.data.userOpHash || txData.data.txHash || null,
        error: null,
      });

      // Simulate blockchain confirmation
      // In a real implementation, you'd poll for transaction status
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTransactionState({
        status: 'Transaction confirmed on-chain!',
        hash: txData.data.userOpHash || txData.data.txHash,
        error: null,
      });

      setSpinning(true);
      setLoading(false);

      const receipt = await waitForUserOperationReceipt(txData.data.userOpHash, chainId)
      console.log("receipt::", receipt.receipt);


      const spinResult = decodeSpinCompletedEvent(receipt.receipt, wheel_contract);
      console.log("Decoded Spin Event:", spinResult);


      // // Calculate spin result
      // // In a real implementation, this would come from the transaction result
      const randomDegrees = txData.degrees || (1800 + Math.random() * 1800);

      console.log("randomDegrees: ", randomDegrees);


      // Calculate the winning segment
      const segmentSize = 360 / segments.length;
      const winningSegmentIndex = Number(spinResult.segment)
      const winningSegment = segments[winningSegmentIndex]; // Use the correct index directly

      const baseDegrees = 1800; // Minimum 5 full rotations
      const segmentOffset = segmentSize * (segments.length - 1 - winningSegmentIndex);
      const randomOffset = Math.random() * (segmentSize * 0.8); // Random position within the segment
      const finalDegrees = baseDegrees + segmentOffset + randomOffset;

      // Animate the wheel
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheelRef.current.style.transform = `rotate(${finalDegrees}deg)`;
      }
      // Set the result after the spin animation finishes
      setTimeout(async () => {
        // Set the result in your state
        setResult({
          segment: winningSegment,
          transactionHash: transactionState.hash || ""
        });

        // Update UI states
        setSpinning(false);
        setTransactionState({
          status: 'Transaction complete!',
          hash: transactionState.hash,
          error: null,
        });
      }, 5000);
    } catch (error) {
      console.error("Error spinning wheel:", error);
      setTransactionState({
        status: 'Transaction failed',
        hash: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setLoading(false);
    }
  };

  const resetGame = () => {
    setResult(null);
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  };

  const handleLoginStart = () => {
    toast({
      title: "Redirecting to login",
      description: "You'll be redirected to Social for authentication",
    });
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-md flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {!isAuthenticated ? (
        <Login onLoginStart={handleLoginStart} />
      ) : (
        <div className="p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold">Lucky Wheel Game</h2>
            <p className="text-gray-600 mt-2">
              Spin the wheel to win G token prizes! All transactions secured on-chain using Account Abstraction.
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {user?.walletAddress ?
                  `Wallet: ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` :
                  'Wallet connected'
                }
              </span>
              <button
                onClick={logout}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          <div className="relative mx-auto mb-8" style={{ width: '280px', height: '280px' }}>
            {/* Wheel */}
            <div
              ref={wheelRef}
              className="absolute w-full h-full rounded-full shadow-lg"
              style={{
                background: `conic-gradient(
                  ${segments.map((segment, i) =>
                  `${segment.color} ${i * (100 / segments.length)}% ${(i + 1) * (100 / segments.length)}%`
                ).join(', ')}
                )`,
              }}
            >
              {segments.map((segment, index) => {
                const angle = (index * 360) / segments.length;
                return (
                  <div
                    key={index}
                    className="absolute w-full h-full flex justify-center text-white font-bold"
                    style={{
                      transform: `rotate(${angle + 360 / segments.length / 2}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <span
                      className="relative text-xs h-full"
                      style={{ top: '30px' }}
                    >
                      {segment.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center hub */}
            <div className="absolute bg-white rounded-full shadow-inner"
              style={{
                width: '50px',
                height: '50px',
                left: 'calc(50% - 25px)',
                top: 'calc(50% - 25px)',
                zIndex: 10
              }}
            ></div>

            {/* Pointer */}
            <div className="absolute" style={{ left: '50%', top: '-15px', transform: 'translateX(-50%)', zIndex: 20 }}>
              <ArrowBigDown size={40} color="#333" className="filter drop-shadow-md" />
            </div>
          </div>

          {result ? (
            <ResultDisplay result={result} onPlayAgain={resetGame} />
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={() => spinWheel(2484)}
                disabled={spinning || loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                           text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg flex items-center 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : spinning ? (
                  <>
                    <RotateCw className="animate-spin mr-2" size={20} />
                    Spinning...
                  </>
                ) : (
                  'U2U Spin the Wheel'
                )}
              </button>

              <button
                onClick={() => spinWheel(28122024)}
                disabled={spinning || loading}
                className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-green-600 hover:to-emerald-700 
                           text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg flex items-center 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : spinning ? (
                  <>
                    <RotateCw className="animate-spin mr-2" size={20} />
                    Spinning...
                  </>
                ) : (
                  'A8 Spin the Wheel'
                )}
              </button>

              <TransactionStatus state={transactionState} />

              <div className="mt-6 text-gray-700 text-sm text-center">
                <p>All transactions processed via Universal Account</p>
                <p className="text-emerald-600 font-medium">Gas fees sponsored for all your spins!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LuckyWheelGame;
