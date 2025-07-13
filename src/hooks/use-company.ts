import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface Company {
  _id: string;
  name: string;
  address: string;
  email?: string;
  phone?: string;
  settings: {
    expiringSoonDays: number;
    autoRenewal: boolean;
    terminationNoticeDays: number;
    contractNotifications: {
      enabled: boolean;
      expiringContractDays: number;
      expiredContractGraceDays: number;
      reminderFrequency: 'daily' | 'weekly' | 'monthly';
      emailNotifications: boolean;
      dashboardNotifications: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchCompany = useCallback(async () => {
    if (loading || fetched) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    console.log('Fetching company data...'); // Debug log
    try {
      const response = await fetch('/api/company');
      const data = await response.json();
      
      if (data.success) {
        setCompany(data.data);
        setFetched(true);
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
        description: "Failed to fetch company information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, fetched]);

  const fetchAllCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company?all=true');
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data || []);
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
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = useCallback(async (companyData: Omit<Company, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      const data = await response.json();
      
      if (data.success) {
        setCompany(data.data);
        setFetched(true); // Mark as fetched since we now have data
        toast({
          title: "Success",
          description: "Company created successfully",
        });
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
        description: "Failed to create company",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const updateCompany = useCallback(async (id: string, updateData: Partial<Omit<Company, '_id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
      });
      const data = await response.json();
      
      if (data.success) {
        setCompany(data.data);
        setFetched(true); // Mark as fetched since we now have updated data
        toast({
          title: "Success",
          description: "Company updated successfully",
        });
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
        description: "Failed to update company",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/company?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setCompany(null);
        toast({
          title: "Success",
          description: "Company deleted successfully",
        });
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
        description: "Failed to delete company",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  return {
    company,
    companies,
    loading,
    fetchCompany,
    fetchAllCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}
