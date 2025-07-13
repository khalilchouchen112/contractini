import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface Contract {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
  } | string;
  company?: {
    _id: string;
    name: string;
  } | string;
  type: 'CDD' | 'CDI' | 'Internship' | 'Terminated';
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Terminated';
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadDate: string;
  }>;
  statusHistory?: Array<{
    status: string;
    previousStatus: string;
    updatedAt: string;
    reason: string;
    updatedBy: string;
  }>;
  lastStatusUpdate?: string;
}

export function useUserContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [contractHistory, setContractHistory] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserContracts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/contracts?userId=${user._id}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        const userContracts = data.data;
        setContracts(userContracts);
        
        // Find current active contract
        const activeContract = userContracts.find((contract: Contract) => 
          contract.status === 'Active' || contract.status === 'Expiring Soon'
        );
        setCurrentContract(activeContract || null);
        
        // Set contract history (all contracts including terminated/expired)
        setContractHistory(userContracts);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch contracts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching user contracts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your contracts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadContractPDF = async (contractId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/contracts/pdf?contractId=${contractId}&userId=${user._id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_${contractId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Contract PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  const createContractRequest = async (type: 'renewal' | 'termination', reason?: string) => {
    if (!user || !currentContract) return false;

    try {
      const response = await fetch('/api/contracts/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contractId: currentContract._id,
          type,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Request Submitted",
          description: data.message,
        });
        // Refresh contracts to get updated data
        await fetchUserContracts();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to submit ${type} request`,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserContracts();
    }
  }, [user]);

  return {
    contracts,
    currentContract,
    contractHistory,
    loading,
    fetchUserContracts,
    downloadContractPDF,
    createContractRequest,
  };
}
