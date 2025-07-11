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

const companyFormSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

export default function CompanySettingsPage() {
    const { company, loading, fetchCompany, createCompany, updateCompany, deleteCompany } = useCompany()

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: "",
            address: "",
            phone: "",
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
                phone: company.phone || "",
            })
        }
    }, [company])

    const onSubmit = async (values: CompanyFormValues) => {
        if (company) {
            await updateCompany(company._id, values)
        } else {
            await createCompany(values)
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
