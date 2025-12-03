// client/src/features/public/hooks.js
import { useState, useEffect } from "react";
import publicApi from "./api";

/**
 * Hook to fetch public stats for homepage
 */
export const usePublicStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await publicApi.getStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching public stats:", err);
          setError(err.message || "Failed to fetch stats");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, isLoading, error };
};

export default { usePublicStats };
