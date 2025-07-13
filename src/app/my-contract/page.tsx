"use client";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, RefreshCw, AlertTriangle, History, FileText, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { useUserContracts } from "@/hooks/use-user-contracts";
import { UserRequestsCard } from "@/components/user-requests-card";
import { ContractRequestDialog } from "@/components/contract-request-dialog";

export default function MyContractPage() {
  const { user, updateUser } = useAuth();
  const { 
    currentContract, 
    contractHistory, 
    loading, 
    fetchUserContracts, 
    downloadContractPDF, 
    createContractRequest 
  } = useUserContracts();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: ''
  });
  const { toast } = useToast();

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      if (res.ok) {
        // Update the auth context with the new data
        updateUser({
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        });
        toast({
          title: "Success",
          description: "Your information has been updated.",
        });
      } else {
        const { error } = await res.json();
        throw new Error(error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (currentContract) {
      await downloadContractPDF(currentContract._id);
    }
  };

  const handleContractRequest = async (type: 'renewal' | 'termination') => {
    const success = await createContractRequest(type);
    if (success) {
      // Refresh contracts to get updated data
      fetchUserContracts();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expiring Soon':
        return 'destructive';
      case 'Expired':
      case 'Terminated':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'CDI':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
      case 'CDD':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
      case 'Internship':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading your contracts...</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
     return <div className="text-center">Please log in to view your contracts.</div>;
  }

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        {/* Current Contract Card */}
        <Card>
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Current Employment Contract
              </CardTitle>
              <CardDescription>
                {currentContract ? `${currentContract.type} Contract` : "No active contract found"}
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-1" 
                disabled={!currentContract}
                onClick={handleDownloadPDF}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Download PDF
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            {currentContract ? (
               <>
                <div className="grid gap-3">
                  <div className="font-semibold">Contract Details</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contract Type</span>
                      <Badge className={getContractTypeColor(currentContract.type)}>
                        {currentContract.type}
                      </Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{format(new Date(currentContract.startDate), "PPP")}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span>{currentContract.endDate ? format(new Date(currentContract.endDate), "PPP") : 'N/A'}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={getStatusBadgeVariant(currentContract.status)}>
                        {currentContract.status}
                      </Badge>
                    </li>
                    {currentContract.lastStatusUpdate && (
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{format(new Date(currentContract.lastStatusUpdate), "PPP")}</span>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="my-6 border-t" />
                <div className="grid gap-3">
                  <div className="font-semibold">Actions</div>
                  <div className="flex gap-2">
                    <ContractRequestDialog 
                      contractId={currentContract._id}
                      currentStatus={currentContract.status}
                    >
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Submit Request
                      </Button>
                    </ContractRequestDialog>
                  </div>
                </div>
              </>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Active Contract</p>
                    <p className="text-sm">You currently don't have an active employment contract.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Employment History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Employment History
            </CardTitle>
            <CardDescription>Your complete contract history and timeline.</CardDescription>
          </CardHeader>
          <CardContent>
            {contractHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractHistory.map((contract) => (
                    <TableRow key={contract._id}>
                      <TableCell>
                        <Badge variant="outline" className={getContractTypeColor(contract.type)}>
                          {contract.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(contract.startDate), "MMM dd, yyyy")}</div>
                          <div className="text-muted-foreground">
                            to {contract.endDate ? format(new Date(contract.endDate), "MMM dd, yyyy") : "Present"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadContractPDF(contract._id)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Contract History</p>
                <p className="text-sm">Your employment history will appear here once contracts are created.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Requests Card */}
        <UserRequestsCard />
      </div>
      {/* Personal Information Card */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Keep your contact details up to date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6" onSubmit={handleUpdateInformation}>
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue={user.name}
                  disabled
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="w-full"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  className="w-full"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, Anytown, USA"
                />
              </div>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Information'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
