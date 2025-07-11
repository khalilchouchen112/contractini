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
import { Download, Edit, Send } from "lucide-react"

export default function MyContractPage() {
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Employment Contract - John Doe
              </CardTitle>
              <CardDescription>
                Contract Type: CDI (Contrat à Durée Indéterminée)
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Download className="h-3.5 w-3.5" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Download
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-3">
              <div className="font-semibold">Contract Details</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>January 15, 2023</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span>N/A</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Active</Badge>
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
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue="John Doe"
                  disabled
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="w-full"
                  defaultValue="john.doe@example.com"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="w-full"
                  defaultValue="+1 234 567 890"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  className="w-full"
                  defaultValue="123 Main St, Anytown, USA"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-start border-t p-6">
            <Button>Update Information</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
