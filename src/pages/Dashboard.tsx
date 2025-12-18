import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PlatformBreakdown } from "@/components/dashboard/PlatformBreakdown";
import { DollarSign, Users, MousePointer, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    spend: 0,
    reach: 0,
    clicks: 0,
    conversions: 0
  });

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      // In a real app, you would probably have a materialized view or a more complex query.
      // For MVP, we'll fetch from analytics_events.
      const { data, error } = await supabase
        .from('analytics_events')
        .select('metric_type, value');

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      if (!data) return;

      const newStats = {
        spend: 0,
        reach: 0,
        clicks: 0,
        conversions: 0
      };

      data.forEach((event) => {
        if (event.metric_type === 'spend') newStats.spend += Number(event.value);
        if (event.metric_type === 'reach') newStats.reach += Number(event.value);
        if (event.metric_type === 'clicks') newStats.clicks += Number(event.value);
        if (event.metric_type === 'conversions') newStats.conversions += Number(event.value);
      });

      // If no data, keep defaults (or mock data for demo purposes if preferred)
      // For now, let's mix real data with the static demo data if real data is empty
      if (data.length > 0) {
        setStats(newStats);
      } else {
        // Fallback to demo data so the dashboard isn't empty for the user immediately
        setStats({
          spend: 12450,
          reach: 1200000,
          clicks: 45200,
          conversions: 2340
        });
      }
    }

    fetchStats();
  }, [user]);

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
            value={`$${stats.spend.toLocaleString()}`}
            change="+8.2% from last week"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Reach"
            value={(stats.reach > 1000000 ? (stats.reach / 1000000).toFixed(1) + 'M' : stats.reach.toLocaleString())}
            change="+15.3% from last week"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Total Clicks"
            value={(stats.clicks > 1000 ? (stats.clicks / 1000).toFixed(1) + 'K' : stats.clicks.toLocaleString())}
            change="+12.1% from last week"
            changeType="positive"
            icon={MousePointer}
          />
          <StatsCard
            title="Conversions"
            value={stats.conversions.toLocaleString()}
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


      </div>
    </DashboardLayout>
  );
}
