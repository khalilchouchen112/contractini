"use client"

import {
  MoreHorizontal,
  PlusCircle,
  Download,
  FileSpreadsheet,
  Filter,
  X,
  Link,
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import * as XLSX from 'xlsx'
import { useToast } from "@/hooks/use-toast"

const contractFormSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
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
  const { contracts, loading, fetchContracts, createContract, updateContract, deleteContract } = useContracts();
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
    userId: userId || undefined
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
      userId: userId || undefined
    };
    setFilters(initialFilters);
    fetchUsers();
  }, [userId]);

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
      userId: userId || undefined // Keep userId if it came from URL params
    };
    setFilters(resetFilterState);
    setActiveTab('all');
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || filters.type !== 'all' || (filters.userId && !userId);

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

      form.reset({
        employee: employeeId,
        type: editingContract.type,
        startDate: editingContract.startDate,
        endDate: editingContract.endDate || "",
        status: editingContract.status,
      });
      setUploadedDocuments(editingContract.documents || []);
    }
  }, [editingContract]);

  // Process contracts to ensure consistent structure
  const processedContracts: Contract[] = contracts.map(contract => ({
    _id: contract._id,
    employee: contract.employee,
    type: contract.type || "CDD",
    startDate: contract.startDate || "",
    endDate: contract.endDate || "",
    status: contract.status || "Active",
    documents: contract.documents || [],
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
        <div className="ml-auto flex items-center gap-2">
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading contracts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
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
                        <DropdownMenuItem>Renew</DropdownMenuItem>
                        <DropdownMenuItem>Terminate</DropdownMenuItem>
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
        <DialogContent className="w-fit">
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
