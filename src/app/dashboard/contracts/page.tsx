"use client"

import {
  MoreHorizontal,
  PlusCircle,
  Download,
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
import { useSearchParams } from "next/navigation"
import { useContracts } from "@/hooks/use-contracts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const contractFormSchema = z.object({
  employee: z.string().min(1, "Employee name is required"),
  type: z.enum(['CDD', 'CDI', 'Internship', 'Terminated'], {
    required_error: "Contract type is required",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Expiring Soon', 'Terminated'], {
    required_error: "Status is required",
  }),
})

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
};

export default function ContractsPage() {
  const { contracts: rawContracts, loading, fetchContracts, createContract, updateContract, deleteContract } = useContracts();

  const contracts: Contract[] = rawContracts.map(contract => ({
    _id: contract._id,
    employee: contract.employee || "",
    type: contract.type || "",
    startDate: contract.startDate || "",
    endDate: contract.endDate || "",
    status: contract.status || "Active",
    documents: contract.documents || [],
  }));
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

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
    fetchContracts();
  }, []);

  useEffect(() => {
    if (editingContract) {
      form.reset({
        employee: editingContract.employee,
        type: editingContract.type,
        startDate: editingContract.startDate,
        endDate: editingContract.endDate || "",
        status: editingContract.status,
      });
      setUploadedDocuments(editingContract.documents || []);
    }
  }, [editingContract]);

  const filteredContracts = contracts.filter(contract => {
    if (userId) {
      // Filter by user if userId is provided
      return contract.employee === userId;
    }

    // Filter by tab
    switch (activeTab) {
      case "active":
        return contract.status === "Active";
      case "expiring":
        return contract.status === "Expiring Soon";
      case "expired":
        return contract.status === "Expired";
      case "terminated":
        return contract.status === "Terminated";
      default:
        return true;
    }
  });

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

  return (
    <>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="terminated" className="hidden sm:flex">Terminated</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline">
              Export
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
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>
                Manage all employee contracts.
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
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No contracts found.</TableCell>
                    </TableRow>
                  ) : filteredContracts.map((contract) => (
                    <TableRow key={contract._id}>
                      <TableCell className="font-medium">{contract.employee}</TableCell>
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
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm truncate">{doc.fileName}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedDocuments(prev => prev.filter((_, i) => i !== index))}
                          >
                            Remove
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
