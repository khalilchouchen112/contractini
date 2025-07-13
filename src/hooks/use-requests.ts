import { useState, useEffect } from 'react';

interface Request {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
  };
  contract: {
    _id: string;
    type: string;
    status: string;
  };
  type: 'renewal' | 'termination' | 'status_change';
  currentStatus: string;
  requestedStatus?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const useRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/contracts/requests');
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.error || 'Failed to fetch requests');
      }
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: {
    contractId: string;
    type: 'renewal' | 'termination' | 'status_change';
    reason?: string;
    requestedStatus?: string;
  }) => {
    try {
      const response = await fetch('/api/contracts/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh requests list
        await fetchRequests();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to create request' };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
  };
};

export const useAdminRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/requests');
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.error || 'Failed to fetch requests');
      }
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          adminNotes,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the request in the list
        setRequests(prev => prev.map(req => 
          req._id === requestId ? data.data : req
        ));
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to process request' };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    processRequest,
  };
};
