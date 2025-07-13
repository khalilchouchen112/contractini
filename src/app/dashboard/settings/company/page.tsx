"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCompany } from "@/hooks/use-company"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useAuth } from "@/contexts/auth-context"

const companyFormSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Please enter a valid email address").optional(),
    phone: z.string().optional(),
    settings: z.object({
        expiringSoonDays: z.number().min(1).max(365),
        autoRenewal: z.boolean(),
        terminationNoticeDays: z.number().min(1).max(365),
        contractNotifications: z.object({
            enabled: z.boolean(),
            expiringContractDays: z.number().min(1).max(365),
            expiredContractGraceDays: z.number().min(0).max(30),
            reminderFrequency: z.enum(['daily', 'weekly', 'monthly']),
            emailNotifications: z.boolean(),
            dashboardNotifications: z.boolean(),
        }),
    }),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

export default function CompanySettingsPage() {
    const { company, loading, fetchCompany, createCompany, updateCompany, deleteCompany } = useCompany()

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: "",
            address: "",
            email: "",
            phone: "",
            settings: {
                expiringSoonDays: 30,
                autoRenewal: true,
                terminationNoticeDays: 60,
                contractNotifications: {
                    enabled: true,
                    expiringContractDays: 30,
                    expiredContractGraceDays: 7,
                    reminderFrequency: 'weekly',
                    emailNotifications: true,
                    dashboardNotifications: true,
                },
            },
        },
    })

    useEffect(() => {
        fetchCompany()
    }, [])

    useEffect(() => {
        if (company) {
            form.reset({
                name: company.name,
                address: company.address,
                email: company.email || "",
                phone: company.phone || "",
                settings: {
                    expiringSoonDays: company.settings?.expiringSoonDays || 30,
                    autoRenewal: company.settings?.autoRenewal ?? true,
                    terminationNoticeDays: company.settings?.terminationNoticeDays || 60,
                    contractNotifications: {
                        enabled: company.settings?.contractNotifications?.enabled ?? true,
                        expiringContractDays: company.settings?.contractNotifications?.expiringContractDays || 30,
                        expiredContractGraceDays: company.settings?.contractNotifications?.expiredContractGraceDays || 7,
                        reminderFrequency: company.settings?.contractNotifications?.reminderFrequency || 'weekly',
                        emailNotifications: company.settings?.contractNotifications?.emailNotifications ?? true,
                        dashboardNotifications: company.settings?.contractNotifications?.dashboardNotifications ?? true,
                    },
                },
            })
        }
    }, [company])

    const { user } = useAuth() // Assuming useCompany provides the authenticated user

    const onSubmit = async (values: CompanyFormValues) => {
        const payload = { ...values, owner: user?._id }
        if (company) {
            await updateCompany(company._id, payload)
        } else {
            await createCompany(payload)
        }
    }

    const onDelete = async () => {
        if (company) {
            await deleteCompany(company._id)
            form.reset()
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Company Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your company information and preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                        Update your company details. This information will be used across the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="company@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 pt-4">
                                <h4 className="text-sm font-medium">Contract Settings</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="settings.expiringSoonDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expiring Soon Days</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="settings.terminationNoticeDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Termination Notice Days</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="settings.autoRenewal"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Auto Renewal
                                                </FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    Automatically renew contracts when possible
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-sm font-medium">Contract Notification Settings</h4>

                                <FormField
                                    control={form.control}
                                    name="settings.contractNotifications.enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Enable Contract Notifications
                                                </FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    Receive notifications about contract status changes
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="settings.contractNotifications.expiringContractDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notify Before Expiry (Days)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="settings.contractNotifications.expiredContractGraceDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grace Period (Days)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="settings.contractNotifications.reminderFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reminder Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select reminder frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="settings.contractNotifications.emailNotifications"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Email Notifications
                                                    </FormLabel>
                                                    <div className="text-sm text-muted-foreground">
                                                        Send notifications via email
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="settings.contractNotifications.dashboardNotifications"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Dashboard Notifications
                                                    </FormLabel>
                                                    <div className="text-sm text-muted-foreground">
                                                        Show notifications in the dashboard
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button type="submit">
                                    {company ? 'Update Company' : 'Create Company'}
                                </Button>

                                {company && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Delete Company</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your
                                                    company data and remove all associated records.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {company && (
                <Card>
                    <CardHeader>
                        <CardTitle>Last Updated</CardTitle>
                        <CardDescription>
                            Information about when this company profile was last modified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <span className="font-medium">Created: </span>
                                <span>{new Date(company.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="font-medium">Last Updated: </span>
                                <span>{new Date(company.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
