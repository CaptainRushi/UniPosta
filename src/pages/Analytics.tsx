import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, MousePointer, Target } from "lucide-react";

const performanceData: any[] = [];
const platformData: any[] = [];
const campaignCompare: any[] = [];
const metrics: any[] = [];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track performance across all your campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
        </div>

        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-lg bg-card/50">
            <div className="p-4 rounded-full bg-secondary/50">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No analytics data yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Connect your social accounts to start tracking your campaign performance across platforms.
            </p>
            <Button variant="glow" onClick={() => window.location.href = '/settings'}>
              Connect Accounts
            </Button>
            <p className="text-xs text-muted-foreground pt-4">
              Analytics will appear once Uniposta successfully syncs data from your connected social account.
            </p>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.title} variant="interactive" className="animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                        <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                        <div className="flex items-center gap-1">
                          {metric.changeType === "positive" ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-sm font-medium text-success">{metric.change}</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-secondary p-3">
                        <metric.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Performance Over Time */}
              <Card variant="default" className="lg:col-span-2 animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Performance Over Time</CardTitle>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">Reach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-success" />
                        <span className="text-xs text-muted-foreground">Clicks</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReachAnalytics" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorClicksAnalytics" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                        <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 8%)",
                            border: "1px solid hsl(222, 30%, 18%)",
                            borderRadius: "8px",
                            color: "hsl(210, 40%, 98%)",
                          }}
                        />
                        <Area type="monotone" dataKey="reach" stroke="hsl(262, 83%, 58%)" fillOpacity={1} fill="url(#colorReachAnalytics)" strokeWidth={2} />
                        <Area type="monotone" dataKey="clicks" stroke="hsl(142, 76%, 36%)" fillOpacity={1} fill="url(#colorClicksAnalytics)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Distribution */}
              <Card variant="default" className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 8%)",
                            border: "1px solid hsl(222, 30%, 18%)",
                            borderRadius: "8px",
                            color: "hsl(210, 40%, 98%)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {platformData.map((platform) => (
                      <div key={platform.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                          <span className="text-sm text-muted-foreground">{platform.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{platform.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Comparison */}
            <Card variant="default" className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Comparison</CardTitle>
                  <Badge variant="outline">All time</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignCompare} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                      <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222, 47%, 8%)",
                          border: "1px solid hsl(222, 30%, 18%)",
                          borderRadius: "8px",
                          color: "hsl(210, 40%, 98%)",
                        }}
                      />
                      <Bar dataKey="reach" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
