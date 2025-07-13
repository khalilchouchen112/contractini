import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ContractStatusUpdate {
  contractId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  updatedAt: Date;
}

interface StatusUpdateResult {
  success: boolean;
  updatedContracts: number;
  updates: ContractStatusUpdate[];
  duration?: string;
}

interface ExpiringContract {
  _id: string;
  employee: {
    name: string;
    email: string;
  };
  type: string;
  status: string;
  endDate: string;
}

export const useContractStatusService = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingExpiring, setIsLoadingExpiring] = useState(false);
  const { toast } = useToast();

  /**
   * Manually trigger contract status updates
   */
  const updateAllStatuses = useCallback(async (): Promise<StatusUpdateResult | null> => {
    if (isUpdating) return null;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/contracts/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const result: StatusUpdateResult = {
          success: true,
          updatedContracts: data.data.length,
          updates: data.data,
        };

        if (result.updatedContracts > 0) {
          toast({
            title: "Status Update Complete",
            description: `Updated ${result.updatedContracts} contract status(es)`,
          });
        } else {
          toast({
            title: "No Updates Needed",
            description: "All contract statuses are already up to date",
          });
        }

        return result;
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update contract statuses",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Error updating contract statuses:', error);
      toast({
        title: "Update Error",
        description: "An error occurred while updating contract statuses",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, toast]);

  /**
   * Get contracts that are expiring soon
   */
  const getExpiringContracts = useCallback(async (days: number = 30): Promise<ExpiringContract[]> => {
    setIsLoadingExpiring(true);
    try {
      const response = await fetch(`/api/contracts/status?days=${days}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        toast({
          title: "Failed to Load",
          description: data.error || "Failed to fetch expiring contracts",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      toast({
        title: "Fetch Error",
        description: "An error occurred while fetching expiring contracts",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingExpiring(false);
    }
  }, [toast]);

  /**
   * Check cron service status
   */
  const checkCronStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/contracts/cron');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking cron status:', error);
      return { success: false, error: 'Failed to check cron status' };
    }
  }, []);

  return {
    // State
    isUpdating,
    isLoadingExpiring,

    // Actions
    updateAllStatuses,
    getExpiringContracts,
    checkCronStatus,
  };
};
