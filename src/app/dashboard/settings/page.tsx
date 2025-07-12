"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system-wide settings for ContractZenith.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement save logic here (e.g., API call or state update)
              alert("Settings saved!");
            }}
          >
            <div className="grid gap-3">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                type="text"
                className="w-full max-w-lg"
                defaultValue="My Company Inc."
              />
            </div>
            <div className="grid gap-3">
              <Label>Notification Preferences</Label>
              <p className="text-sm text-muted-foreground">
                Set up automated alerts for contract expirations.
              </p>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-30" defaultChecked />
                  <label
                    htmlFor="alert-30"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    1 month before expiration
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-14" defaultChecked />
                  <label
                    htmlFor="alert-14"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    2 weeks before expiration
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-7" />
                  <label
                    htmlFor="alert-7"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    1 week before expiration
                  </label>
                </div>
              </div>
            </div>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
