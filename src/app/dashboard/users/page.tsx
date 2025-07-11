"use client"

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
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { UserForm } from "./user-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const { data } = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch users." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleViewContracts = (userId: string) => {
    router.push(`/dashboard/contracts?userId=${userId}`);
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/users/${userToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      toast({ title: "Success", description: "User has been deleted." });
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    } finally {
      setIsAlertOpen(false);
      setUserToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchUsers();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage system users and their roles.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" className="h-8 gap-1" onClick={handleAddUser}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add User
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewContracts(user._id)}>View Contracts</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteConfirm(user)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <UserForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose}
        user={selectedUser}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
