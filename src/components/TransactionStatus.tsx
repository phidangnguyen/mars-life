'use client';

import { Loader2 } from 'lucide-react';
import { TransactionState } from '@/types/game';

interface TransactionStatusProps {
  state: TransactionState;
}

const TransactionStatus = ({ state }: TransactionStatusProps) => {
  if (!state.status) return null;
  
  return (
    <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex items-center">
      <Loader2 className="animate-spin mr-2" size={16} />
      <div>
        <p className="text-sm font-medium">{state.status}</p>
        {state.hash && (
          <p className="text-xs mt-1 text-blue-600">
            Tx: {state.hash.slice(0, 10)}...{state.hash.slice(-6)}
          </p>
        )}
        {state.error && (
          <p className="text-xs mt-1 text-red-600">{state.error}</p>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;