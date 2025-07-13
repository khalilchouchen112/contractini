"use client"

import { Suspense } from "react"
import {
  MoreHorizontal,
  PlusCircle,
  Download,
  FileSpreadsheet,
  Filter,
  X,
  Link,
  RefreshCw,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useContracts } from "@/hooks/use-contracts"
import { useContractStatusService } from "@/hooks/use-contract-status"
import { useCompany } from "@/hooks/use-company"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import * as XLSX from 'xlsx'
import { useToast } from "@/hooks/use-toast"

const contractFormSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
  company: z.string().min(1, "Company is required"),
  type: z.enum(['CDD', 'CDI', 'Internship', 'Terminated'], {
    required_error: "Contract type is required",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Expiring Soon', 'Terminated'], {
    required_error: "Status is required",
  }),
})

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface Contract {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
  } | string;
  company: {
    _id: string;
    name: string;
  },
  type: 'CDD' | 'CDI' | 'Internship' | 'Terminated';
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Terminated';
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadDate: string;
  }>;
};

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading contracts...</div>}>
      <ContractsContent />
    </Suspense>
  );
}

function ContractsContent() {
  const { contracts, loading, fetchContracts, createContract, updateContract, deleteContract } = useContracts();
  const { isUpdating, updateAllStatuses, getExpiringContracts } = useContractStatusService();
  const { companies, loading: loadingCompanies, fetchAllCompanies } = useCompany();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const userId = searchParams.get('userId');

  // Enhanced filter state
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    userId: userId || undefined,
    companyId: 'all'
  });

  // Fetch users function
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        // Filter only users with 'USER' role for contracts
        setUsers(data.data.filter((user: User) => user.role === 'USER'));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const form = useForm<z.infer<typeof contractFormSchema>>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      employee: "",
      company: "",
      type: undefined,
      startDate: "",
      endDate: "",
      status: "Active",
    },
  });

  useEffect(() => {
    // Set initial filters including userId from URL params
    const initialFilters = {
      status: 'all',
      type: 'all',
      userId: userId || undefined,
      companyId: 'all'
    };
    setFilters(initialFilters);
    fetchUsers();
    fetchAllCompanies();
  }, [userId, fetchAllCompanies]);

  useEffect(() => {
    // Fetch contracts when filters change
    fetchContracts(filters);

    // Update URL with current filters
    const params = new URLSearchParams();
    if (filters.userId) {
      params.set('userId', filters.userId);
    }

    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;

    if (newUrl !== `${pathname}${window.location.search}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, pathname, router]);

  // Handle tab change with backend filtering
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters(prev => ({
      ...prev,
      status: value === 'all' ? 'all' :
        value === 'active' ? 'Active' :
          value === 'expiring' ? 'Expiring Soon' :
            value === 'expired' ? 'Expired' :
              value === 'terminated' ? 'Terminated' : 'all'
    }));
  };

  // Reset filters function
  const resetFilters = () => {
    const resetFilterState = {
      status: 'all',
      type: 'all',
      userId: userId || undefined, // Keep userId if it came from URL params
      companyId: 'all'
    };
    setFilters(resetFilterState);
    setActiveTab('all');
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || filters.type !== 'all' || (filters.userId && !userId) || filters.companyId !== 'all';

  // Helper function to get shareable URL for a user's contracts
  const getShareableUserUrl = (userId: string) => {
    const baseUrl = window.location.origin + pathname;
    return `${baseUrl}?userId=${userId}`;
  };

  // Helper function to copy user contract URL to clipboard
  const copyUserContractUrl = async (userId: string) => {
    const url = getShareableUserUrl(userId);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL copied",
        description: "User contract URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (editingContract) {
      const employeeId = typeof editingContract.employee === 'object'
        ? editingContract.employee._id
        : editingContract.employee;

      const companyId = typeof editingContract.company === 'object'
        ? editingContract.company?._id
        : editingContract.company;

      form.reset({
        employee: employeeId,
        company: companyId || "",
        type: editingContract.type,
        startDate: editingContract.startDate,
        endDate: editingContract.endDate || "",
        status: editingContract.status,
      });
      setUploadedDocuments(editingContract.documents || []);
    }
  }, [editingContract, form]);

  // Process contracts to ensure consistent structure
  const processedContracts: Contract[] = contracts.map(contract => ({
    _id: contract._id,
    employee: contract.employee,
    type: contract.type || "CDD",
    startDate: contract.startDate || "",
    endDate: contract.endDate || "",
    status: contract.status || "Active",
    documents: contract.documents || [],
    company: typeof contract.company === "object" && contract.company !== null
      ? contract.company
      : (
        companies.find(c => c._id === contract.company)
        || { _id: typeof contract.company === "string" ? contract.company : "", name: "N/A" }
      )
  }));

  // Helper function to get employee name for display
  const getEmployeeName = (employee: Contract['employee']) => {
    if (typeof employee === 'object' && employee) {
      return employee.name;
    }
    // If it's just an ID, try to find the user in our users list
    const user = users.find(u => u._id === employee);
    return user ? user.name : employee;
  };

  // Helper function to get company name for display
  const getCompanyName = (company: Contract['company']) => {
    if (typeof company === 'object' && company) {
      return company.name;
    }
    // If it's just an ID, try to find the company in our companies list
    const companyObj = companies.find(c => c._id === company);
    return companyObj ? companyObj.name : company || 'N/A';
  };

  // Since filtering is now done on the backend, we use all processed contracts
  const filteredContracts = processedContracts;

  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ fileName: string; fileUrl: string; uploadDate: string }>>([]);

  const handleSubmit = async (values: z.infer<typeof contractFormSchema>) => {
    const contractData = {
      ...values,
      documents: uploadedDocuments
    };

    if (editingContract) {
      await updateContract(editingContract._id, contractData);
    } else {
      await createContract(contractData);
    }
    setIsCreateDialogOpen(false);
    setEditingContract(null);
    setUploadedDocuments([]);
    form.reset();
  };

  const handleFileUpload = async (urls: string[]) => {
    const newDocuments = urls.map(url => ({
      fileName: url.split('/').pop() || 'document.pdf',
      fileUrl: url,
      uploadDate: new Date().toISOString()
    }));
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      await deleteContract(id);
    }
  };

  const handleRenewContract = async (contract: Contract) => {
    const confirmed = window.confirm(
      `Are you sure you want to renew the contract for ${getEmployeeName(contract.employee)}?`
    );

    if (!confirmed) return;

    try {
      const currentEndDate = contract.endDate ? new Date(contract.endDate) : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      const renewalData = {
        endDate: newEndDate.toISOString().split('T')[0],
        status: 'Active' as const
      };

      const success = await updateContract(contract._id, renewalData);

      if (success) {
        toast({
          title: "Contract Renewed",
          description: `Contract for ${getEmployeeName(contract.employee)} has been renewed until ${format(newEndDate, "PPP")}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to renew contract",
        variant: "destructive",
      });
    }
  };

  const handleTerminateContract = async (contract: Contract) => {
    const confirmed = window.confirm(
      `Are you sure you want to terminate the contract for ${getEmployeeName(contract.employee)}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const terminationData = {
        status: 'Terminated' as const,
        endDate: new Date().toISOString().split('T')[0] // Set end date to today
      };

      const success = await updateContract(contract._id, terminationData);

      if (success) {
        toast({
          title: "Contract Terminated",
          description: `Contract for ${getEmployeeName(contract.employee)} has been terminated`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate contract",
        variant: "destructive",
      });
    }
  };

  // Handle manual status update
  const handleStatusUpdate = async () => {
    const result = await updateAllStatuses();
    if (result && result.updatedContracts > 0) {
      // Refresh contracts list to show updated statuses
      fetchContracts(filters);
    }
  };

  const handleExportToExcel = async () => {
    if (isExporting) return; // Prevent multiple exports

    setIsExporting(true);

    try {
      // Check if there are contracts to export
      if (filteredContracts.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no contracts matching your current filter to export.",
          variant: "destructive",
        });
        return;
      }

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Prepare data for export
      const exportData = filteredContracts.map(contract => ({
        'Employee Name': getEmployeeName(contract.employee),
        'Employee Email': typeof contract.employee === 'object' ? contract.employee.email :
          users.find(u => u._id === contract.employee)?.email || '',
        'Company Name': contract.company.name,
        'Contract Type': contract.type,
        'Status': contract.status,
        'Start Date': contract.startDate ? format(new Date(contract.startDate), "dd/MM/yyyy") : '',
        'End Date': contract.endDate ? format(new Date(contract.endDate), "dd/MM/yyyy") : 'N/A',
        'Documents Count': contract.documents?.length || 0,
        'Contract ID': contract._id
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-fit column widths
      const columnWidths = [
        { wch: 20 }, // Employee Name
        { wch: 25 }, // Employee Email
        { wch: 20 }, // Company Name
        { wch: 15 }, // Contract Type
        { wch: 12 }, // Status
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 15 }, // Documents Count
        { wch: 25 }, // Contract ID
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contracts');

      // Generate filename with current date and filter info
      const currentDate = format(new Date(), "yyyy-MM-dd");
      let filterSuffix = '';

      if (filters.status !== 'all') {
        filterSuffix += `-${filters.status.toLowerCase().replace(' ', '-')}`;
      }

      if (filters.type !== 'all') {
        filterSuffix += `-${filters.type.toLowerCase()}`;
      }

      if (filters.companyId !== 'all') {
        const companyName = companies.find(c => c._id === filters.companyId)?.name || 'company';
        filterSuffix += `-${companyName.toLowerCase().replace(/\s+/g, '-')}`;
      }

      const filename = `contracts-export${filterSuffix}-${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      // Show success message
      toast({
        title: "Export successful",
        description: `Exported ${filteredContracts.length} contract(s) to ${filename}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the contracts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <Tabs value={
          activeTab
        } onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="terminated" className="hidden sm:flex">Terminated</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-4 flex items-center gap-2">
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-32 h-8" disabled={loading}>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CDD">CDD</SelectItem>
              <SelectItem value="CDI">CDI</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.userId || 'all'}
            onValueChange={(value) => setFilters(prev => ({ ...prev, userId: value === 'all' ? undefined : value }))}
          >
            <SelectTrigger className="w-40 h-8" disabled={loading || loadingUsers}>
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.companyId || 'all'}
            onValueChange={(value) => setFilters(prev => ({ ...prev, companyId: value === 'all' ? 'all' : value }))}
          >
            <SelectTrigger className="w-40 h-8" disabled={loading || loadingCompanies}>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company._id} value={company._id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <div className="ml-4 flex items-center ml-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleStatusUpdate}
            disabled={isUpdating || loading}
            className="h-8 gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isUpdating ? 'Updating...' : 'Update Status'}
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportToExcel}
            disabled={isExporting || loading}
            className="h-8 gap-1"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={() => {
            setEditingContract(null);
            form.reset();
            setIsCreateDialogOpen(true);
          }}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Contract
            </span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>
            {hasActiveFilters ? (
              <>
                Showing filtered contracts
                {filters.status !== 'all' && ` • Status: ${filters.status}`}
                {filters.type !== 'all' && ` • Type: ${filters.type}`}
                {filters.userId && (
                  ` • Employee: ${users.find(u => u._id === filters.userId)?.name || 'Unknown'}`
                )}
                {filters.companyId !== 'all' && (
                  ` • Company: ${companies.find(c => c._id === filters.companyId)?.name || 'Unknown'}`
                )}
              </>
            ) : (
              'Manage all employee contracts.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden lg:table-cell">Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">End Date</TableHead>
                <TableHead className="hidden md:table-cell">Start Date</TableHead>
                <TableHead className="hidden md:table-cell">Documents</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading contracts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {hasActiveFilters ? (
                      <div className="text-center">
                        <p className="text-muted-foreground">No contracts match your current filters.</p>
                        <Button
                          variant="link"
                          onClick={resetFilters}
                          className="mt-2"
                        >
                          Clear filters to see all contracts
                        </Button>
                      </div>
                    ) : (
                      "No contracts found."
                    )}
                  </TableCell>
                </TableRow>
              ) : filteredContracts.map((contract) => (
                <TableRow key={contract._id}>
                  <TableCell className="font-medium">{getEmployeeName(contract.employee)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{getCompanyName(contract.company)}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={
                      contract.status === 'Active' ? 'secondary' :
                        contract.status === 'Expiring Soon' ? 'outline' :
                          'destructive'
                    }
                      className={
                        contract.status === 'Active' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          contract.status === 'Expiring Soon' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                            ''
                      }
                    >
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{contract.endDate ? format(new Date(contract.endDate), "PPP") : 'N/A'}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(contract.startDate), "PPP")}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contract.documents && contract.documents.length ? (
                      <div className="flex space-x-2">
                        {contract.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-100 rounded"
                            title={doc.fileName}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No documents</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(contract)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRenewContract(contract)}
                          disabled={contract.status === 'Terminated'}
                        >
                          Renew
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTerminateContract(contract)}
                          disabled={contract.status === 'Terminated'}
                          className={contract.status === 'Terminated' ? '' : 'text-orange-600 focus:text-orange-700'}
                        >
                          Terminate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const employeeId = typeof contract.employee === 'object'
                              ? contract.employee._id
                              : contract.employee;
                            copyUserContractUrl(employeeId);
                          }}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Copy User URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(contract._id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-fit max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContract ? 'Edit Contract' : 'Create New Contract'}</DialogTitle>
            <DialogDescription>
              {editingContract ? 'Edit the contract details below.' : 'Add a new contract by filling out the form below.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingUsers ? (
                          <SelectItem value="" disabled>Loading users...</SelectItem>
                        ) : users.length === 0 ? (
                          <SelectItem value="" disabled>No users available</SelectItem>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCompanies ? (
                          <SelectItem value="" disabled>Loading companies...</SelectItem>
                        ) : companies.length === 0 ? (
                          <SelectItem value="" disabled>No companies available</SelectItem>
                        ) : (
                          companies.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              {company.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                disabled={!!editingContract}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingContract} >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Documents
                  </label>
                  <FileUpload onUploadComplete={handleFileUpload} />
                </div>
                {uploadedDocuments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Uploaded Documents
                    </label>
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 border border-border rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{doc.fileName}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedDocuments(prev => prev.filter((_, i) => i !== index))}
                            className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingContract ? 'Update Contract' : 'Create Contract'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
