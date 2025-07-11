import {
  MoreHorizontal,
  PlusCircle,
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


const mockContracts = [
  { id: "CTR-001", employee: "John Doe", type: "CDD", startDate: "2023-01-15", endDate: "2024-01-14", status: "Expired" },
  { id: "CTR-002", employee: "Jane Smith", type: "CDI", startDate: "2022-03-01", endDate: "N/A", status: "Active" },
  { id: "CTR-003", employee: "Mike Johnson", type: "Internship", startDate: "2024-06-01", endDate: "2024-11-30", status: "Active" },
  { id: "CTR-004", employee: "Emily Davis", type: "CDD", startDate: "2023-08-15", endDate: "2024-08-14", status: "Expiring Soon" },
  { id: "CTR-005", employee: "Chris Brown", type: "CDI", startDate: "2021-05-20", endDate: "N/A", status: "Active" },
  { id: "CTR-006", employee: "Sarah Wilson", type: "Terminated", startDate: "2022-10-01", endDate: "2023-09-30", status: "Terminated" },
];


export default function ContractsPage() {
  return (
    <Tabs defaultValue="all">
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
          <Button size="sm" className="h-8 gap-1">
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
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContracts.map((contract) => (
                  <TableRow key={contract.id}>
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
                    <TableCell className="hidden md:table-cell">{contract.endDate}</TableCell>
                    <TableCell className="hidden md:table-cell">{contract.startDate}</TableCell>
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
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Renew</DropdownMenuItem>
                          <DropdownMenuItem>Terminate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
  )
}
