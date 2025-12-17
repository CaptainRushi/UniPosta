import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PlatformBreakdown } from "@/components/dashboard/PlatformBreakdown";
import { DollarSign, Users, MousePointer, Target, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your ad performance across all platforms
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Spend"
            value="$12,450"
            change="+8.2% from last week"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Reach"
            value="1.2M"
            change="+15.3% from last week"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Total Clicks"
            value="45.2K"
            change="+12.1% from last week"
            changeType="positive"
            icon={MousePointer}
          />
          <StatsCard
            title="Conversions"
            value="2,340"
            change="-2.4% from last week"
            changeType="negative"
            icon={Target}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <PlatformBreakdown />
        </div>

        {/* Best Performing */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Performing Platform</p>
              <p className="text-xl font-bold text-foreground">Instagram</p>
              <p className="text-sm text-success">+28.3% higher engagement than average</p>
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <RecentCampaigns />
      </div>
    </DashboardLayout>
  );
}
