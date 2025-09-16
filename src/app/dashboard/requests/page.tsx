'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminRequests } from "@/hooks/use-requests";
import { format } from "date-fns";

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

export default function RequestsPage() {
  const { requests, loading, fetchRequests, processRequest } = useAdminRequests();
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessing(requestId);
    
    try {
      const result = await processRequest(requestId, action, adminNotes);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Request ${action}d successfully`
        });
        
        setDialogOpen(false);
        setAdminNotes('');
        setSelectedRequest(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRequestTypeBadge = (type: string) => {
    const colors = {
      renewal: 'bg-blue-100 text-blue-800',
      termination: 'bg-red-100 text-red-800',
      status_change: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[type as keyof typeof colors] || colors.status_change}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const openDialog = (request: Request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Requests</h1>
        <Button onClick={fetchRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          <CardDescription>
            Requests waiting for admin approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Requested Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee?.name || 'Unknown Employee'}</div>
                        <div className="text-sm text-gray-500">{request.employee?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRequestTypeBadge(request.type)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.currentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.requestedStatus ? (
                        <Badge variant="outline">{request.requestedStatus}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={request.reason || ''}>
                        {request.reason || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openDialog(request)}
                          disabled={processing === request._id}
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Processed Requests ({processedRequests.length})</CardTitle>
          <CardDescription>
            Recently approved or rejected requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No processed requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Processed Date</TableHead>
                  <TableHead>Admin Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.slice(0, 10).map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee?.name || 'Unknown Employee'}</div>
                        <div className="text-sm text-gray-500">{request.employee?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRequestTypeBadge(request.type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {request.processedBy?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {request.processedAt 
                        ? format(new Date(request.processedAt), 'MMM dd, yyyy HH:mm')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={request.adminNotes || ''}>
                        {request.adminNotes || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
            <DialogDescription>
              Review and process this employee request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Employee</label>
                  <p className="text-sm text-gray-600">{selectedRequest.employee?.name || 'Unknown Employee'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Request Type</label>
                  <div className="mt-1">
                    {getRequestTypeBadge(selectedRequest.type)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Current Status</label>
                  <p className="text-sm text-gray-600">{selectedRequest.currentStatus}</p>
                </div>
                {selectedRequest.requestedStatus && (
                  <div>
                    <label className="text-sm font-medium">Requested Status</label>
                    <p className="text-sm text-gray-600">{selectedRequest.requestedStatus}</p>
                  </div>
                )}
              </div>
              
              {selectedRequest.reason && (
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reject</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject this request? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selectedRequest && handleRequestAction(selectedRequest._id, 'reject')}
                    disabled={processing === selectedRequest?._id}
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Approve</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve this request? This will update the contract status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selectedRequest && handleRequestAction(selectedRequest._id, 'approve')}
                    disabled={processing === selectedRequest?._id}
                  >
                    Approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
