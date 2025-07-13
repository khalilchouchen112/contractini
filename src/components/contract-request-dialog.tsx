'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, MessageSquare, AlertTriangle } from "lucide-react";
import { useUserContracts } from "@/hooks/use-user-contracts";

interface ContractRequestDialogProps {
  children: React.ReactNode;
  contractId: string;
  currentStatus: string;
}

export function ContractRequestDialog({ children, contractId, currentStatus }: ContractRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState<'renewal' | 'termination' | 'status_change'>('renewal');
  const [requestedStatus, setRequestedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitRequest = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for your request",
        variant: "destructive"
      });
      return;
    }

    if (requestType === 'status_change' && !requestedStatus) {
      toast({
        title: "Error",
        description: "Please select the requested status",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/contracts/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          type: requestType,
          reason: reason.trim(),
          requestedStatus: requestType === 'status_change' ? requestedStatus : undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        });
        
        // Reset form and close dialog
        setReason('');
        setRequestedStatus('');
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Expiring Soon', label: 'Expiring Soon' },
  ].filter(option => option.value !== currentStatus);

  const getRequestIcon = () => {
    switch (requestType) {
      case 'renewal':
        return <FileText className="h-4 w-4" />;
      case 'termination':
        return <AlertTriangle className="h-4 w-4" />;
      case 'status_change':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRequestTypeDescription = () => {
    switch (requestType) {
      case 'renewal':
        return 'Request to renew your current contract';
      case 'termination':
        return 'Request to terminate your current contract';
      case 'status_change':
        return 'Request to change your contract status';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRequestIcon()}
            Submit Contract Request
          </DialogTitle>
          <DialogDescription>
            Submit a request to modify your contract. This will be sent to HR for review.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="requestType">Request Type</Label>
            <Select value={requestType} onValueChange={(value: 'renewal' | 'termination' | 'status_change') => setRequestType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renewal">Contract Renewal</SelectItem>
                <SelectItem value="termination">Contract Termination</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {getRequestTypeDescription()}
            </p>
          </div>

          {requestType === 'status_change' && (
            <div>
              <Label htmlFor="requestedStatus">Requested Status</Label>
              <Select value={requestedStatus} onValueChange={setRequestedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Reason for Request</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the reason for your request..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Current Status:</strong> {currentStatus}
            </p>
            {requestType === 'status_change' && requestedStatus && (
              <p className="text-sm text-muted-foreground">
                <strong>Requested Status:</strong> {requestedStatus}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          
          {requestType === 'termination' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={submitting}>
                  Submit Termination Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Termination Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to submit a termination request? This is a serious action that will be reviewed by HR.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={submitRequest}
                    disabled={submitting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Submit Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
