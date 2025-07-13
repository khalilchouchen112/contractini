'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRequests } from "@/hooks/use-requests";
import { format } from "date-fns";
import { MessageSquare, RefreshCw } from "lucide-react";

export function UserRequestsCard() {
  const { requests, loading, fetchRequests } = useRequests();

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My Requests
          </CardTitle>
          <CardDescription>Your submitted contract requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading requests...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              My Requests
            </CardTitle>
            <CardDescription>Your submitted contract requests</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Requests Submitted</p>
            <p className="text-sm">Your contract requests will appear here once submitted.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.slice(0, 5).map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {getRequestTypeBadge(request.type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {request.processedAt 
                      ? format(new Date(request.processedAt), 'MMM dd, yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={request.adminNotes || request.reason || ''}>
                      {request.adminNotes || request.reason || '-'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
