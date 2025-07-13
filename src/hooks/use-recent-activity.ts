import { useState, useEffect } from 'react';

interface RecentActivity {
  id: string;
  type: 'contract_created' | 'contract_updated' | 'request_submitted' | 'request_approved' | 'contract_expired';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/activity');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }
      
      const data = await response.json();
      setActivities(data.activities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities
  };
}
