import { useState, useEffect } from 'react';

interface AnalyticsOverview {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  terminatedContracts: number;
  activeContractsChange: number;
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentContracts: number;
  pendingRequests: number;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  recentRequests: number;
}

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface MonthlyData {
  month: string;
  renewals?: number;
  expiring?: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  contractsByStatus: ChartData[];
  contractsByType: ChartData[];
  monthlyRenewals: MonthlyData[];
  expiringByMonth: MonthlyData[];
  requestsBreakdown: ChartData[];
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  };
}
