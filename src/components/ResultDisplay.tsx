'use client';

import { GameResult } from '@/types/game';

interface ResultDisplayProps {
  result: GameResult;
  onPlayAgain: () => void;
}

const ResultDisplay = ({ result, onPlayAgain }: ResultDisplayProps) => {
  return (
    <div className="text-center mb-6 p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-2">
        {result.segment.prize > 0 ? 'Congratulations! 🎉' : 'Better luck next time! 🍀'}
      </h2>
      
      <div className="my-4 py-3 px-6 bg-white rounded-lg shadow-inner inline-block">
        <span className="text-xl font-semibold" style={{ color: result.segment.color }}>
          You won: {result.segment.text}
        </span>
      </div>
      
      {result.segment.prize > 0 ? (
        <p className="mb-4">Tokens have been transferred to your wallet via Universal Account.</p>
      ) : (
        <p className="mb-4">Try again for a chance to win prizes!</p>
      )}
      
      <div className="text-xs text-gray-500 mb-4">
        {/* Transaction Hash: {result.transactionHash.slice(0, 10)}...{result.transactionHash.slice(-6)} */}
      </div>
      
      <button 
        onClick={onPlayAgain}
        className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 
                   text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
      >
        Play Again
      </button>
    </div>
  );
};

export default ResultDisplay;