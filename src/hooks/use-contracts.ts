import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface Contract {
  _id: string;
  employee: string;
  type: 'CDD' | 'CDI' | 'Internship' | 'Terminated';
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Terminated';
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadDate: string;
  }>;
}

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      
      if (data.success) {
        setContracts(data.data);
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contracts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData: Omit<Contract, '_id'>) => {
    try {
      // Format the dates and ensure documents array exists
      const formattedData = {
        ...contractData,
        documents: contractData.documents || [],
        startDate: new Date(contractData.startDate).toISOString(),
        endDate: contractData.endDate ? new Date(contractData.endDate).toISOString() : undefined,
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Contract created successfully",
        });
        await fetchContracts();
        return true;
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contract",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateContract = async (id: string, updateData: Partial<Contract>) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Contract updated successfully",
        });
        await fetchContracts();
        return true;
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contract",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const response = await fetch(`/api/contracts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Contract deleted successfully",
        });
        await fetchContracts();
        return true;
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contract",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    contracts,
    loading,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
  };
}