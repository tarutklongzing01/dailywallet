import { useEffect, useState } from 'react';
import { subscribeToCategories } from '../services/categoryService';

export function useUserCategories(uid) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setCategories([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = subscribeToCategories(
      uid,
      (items) => {
        setCategories(items);
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
    categories,
    loading,
    error,
  };
}
