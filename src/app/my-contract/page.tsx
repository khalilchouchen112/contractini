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
import { Download } from "lucide-react"
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";


interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
}

interface Contract {
  _id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export default function MyContractPage() {
  const [user, setUser] = useState<User | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you'd get the logged-in user's ID from a session.
    // For now, we'll fetch the first user with the 'USER' role as a placeholder.
    const fetchUserData = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        const employee = usersData.data.find((u: User) => u.role === 'USER');
        
        if (employee) {
          const contractRes = await fetch('/api/contracts');
          const contractData = await contractRes.json();
          // Find a contract for this employee
          const employeeContract = contractData.data.find((c: Contract) => c.employee === employee.name);

          setUser(employee);
          setContract(employeeContract || null);
        }
      } catch (error) {
        console.error("Failed to fetch user or contract data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your data.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [toast]);

  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          phone: user.phone,
          address: user.address,
        }),
      });

      if (res.ok) {
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
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
     return <div className="text-center">No employee user found to display.</div>;
  }

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Employment Contract - {user.name}
              </CardTitle>
              <CardDescription>
                {contract ? `Contract Type: ${contract.type}` : "No active contract found."}
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-8 gap-1" disabled={!contract}>
                <Download className="h-3.5 w-3.5" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Download
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            {contract ? (
               <>
                <div className="grid gap-3">
                  <div className="font-semibold">Contract Details</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{format(new Date(contract.startDate), "PPP")}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span>{contract.endDate ? format(new Date(contract.endDate), "PPP") : 'N/A'}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">{contract.status}</Badge>
                    </li>
                  </ul>
                </div>
                <div className="my-6 border-t" />
                <div className="grid gap-3">
                  <div className="font-semibold">Actions</div>
                  <div className="flex gap-2">
                    <Button variant="outline">Request Renewal</Button>
                    <Button variant="destructive">Request Termination</Button>
                  </div>
                </div>
              </>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No contract details to display.</p>
                </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Track the status of your submitted requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>No requests submitted yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
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
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="w-full"
                  value={user.phone || ''}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  className="w-full"
                  value={user.address || ''}
                   onChange={(e) => setUser({ ...user, address: e.target.value })}
                  placeholder="123 Main St, Anytown, USA"
                />
              </div>
               <Button type="submit">Update Information</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
