import { useEffect, useState } from 'react';
import { subscribeToTransactions } from '../services/transactionService';

export function useUserTransactions(uid) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setTransactions([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = subscribeToTransactions(
      uid,
      (items) => {
        setTransactions(items);
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid]);

  return {
    transactions,
    loading,
    error,
  };
}
