// useAnalytics.ts
import { useEffect, useState } from "react";
import api from "./api";

export interface AnalyticsData {
  signed_up?: string;
  payment_pending?: string;
  payment_completed?: string;
  total?: string;
  batched_candidates?: string;
  rebatched_candidates?: string;
  [key: string]: any;
}

const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/analytics');
        setAnalytics(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { analytics, loading, error };
};

export default useAnalytics;
