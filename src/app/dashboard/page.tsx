"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  FileText, 
  FileClock, 
  FileX, 
  Users, 
  FileCheck2, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Activity,
  Calendar,
  BarChart3
} from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"
import { useRecentActivity } from "@/hooks/use-recent-activity"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const { data: analytics, loading, error } = useAnalytics();
  const { activities, loading: activitiesLoading } = useRecentActivity();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load analytics data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview } = analytics;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your contract management system.
        </p>
      </div>

      {/* Alert for urgent items */}
      {overview.expiringContracts > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Attention Required
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You have {overview.expiringContracts} contract{overview.expiringContracts > 1 ? 's' : ''} expiring in the next 30 days
                  {overview.pendingRequests > 0 && ` and ${overview.pendingRequests} pending request${overview.pendingRequests > 1 ? 's' : ''}`}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalContracts}</div>
            <p className="text-xs text-muted-foreground">All contracts in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.activeContracts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {overview.activeContractsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {overview.activeContractsChange >= 0 ? '+' : ''}{overview.activeContractsChange} from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{overview.expiringContracts}</div>
            <p className="text-xs text-muted-foreground">Contracts ending in next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminated</CardTitle>
            <FileX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.terminatedContracts}</div>
            <p className="text-xs text-muted-foreground">Contracts ended this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{overview.adminUsers} admins, {overview.regularUsers} users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">{overview.recentRequests} new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.recentContracts}</div>
            <p className="text-xs text-muted-foreground">New contracts this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Request Approval Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalRequests > 0 
                ? Math.round((overview.approvedRequests / overview.totalRequests) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.approvedRequests} approved, {overview.rejectedRequests} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Contract Activity</CardTitle>
            <CardDescription>
              Monthly contract renewals and new contracts created.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyRenewals}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Bar dataKey="renewals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contracts by Status</CardTitle>
            <CardDescription>
              A breakdown of all contracts based on their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.contractsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.contractsByStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contract Types</CardTitle>
            <CardDescription>
              Distribution of contract types in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.contractsByType.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                    <Badge variant="secondary">
                      {overview.totalContracts > 0 
                        ? Math.round((item.value / overview.totalContracts) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Expirations</CardTitle>
            <CardDescription>
              Contracts expiring in the next 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.expiringByMonth}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Area 
                  dataKey="expiring" 
                  stroke="hsl(var(--chart-4))" 
                  fill="hsl(var(--chart-4))" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Request Status Overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Management Overview</CardTitle>
            <CardDescription>
              Current status of all contract-related requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {analytics.requestsBreakdown.map((item: any) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      {item.name === 'Pending' && <Clock className="h-4 w-4 mr-2 text-yellow-500" />}
                      {item.name === 'Approved' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                      {item.name === 'Rejected' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                      {item.name}
                    </span>
                    <span className="text-2xl font-bold">{item.value}</span>
                  </div>
                  <Progress 
                    value={overview.totalRequests > 0 ? (item.value / overview.totalRequests) * 100 : 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {overview.totalRequests > 0 
                      ? Math.round((item.value / overview.totalRequests) * 100)
                      : 0}% of total requests
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activities and updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activitiesLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.slice(0, 6).map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-3 text-sm">
                    <div className="mt-1">
                      {activity.type === 'contract_created' && <FileText className="h-4 w-4 text-green-500" />}
                      {activity.type === 'contract_updated' && <FileCheck2 className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'request_submitted' && <Clock className="h-4 w-4 text-yellow-500" />}
                      {activity.type === 'request_approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {activity.type === 'contract_expired' && <FileX className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-muted-foreground text-xs">{activity.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity to display
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
