import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const campaigns = [
  {
    id: 1,
    name: "Summer Sale Campaign",
    status: "active",
    platforms: ["instagram", "facebook"],
    spend: "$1,234",
    reach: "45.2K",
    trend: "up",
    change: "+12.5%",
  },
  {
    id: 2,
    name: "Product Launch Q4",
    status: "active",
    platforms: ["instagram", "twitter", "linkedin"],
    spend: "$2,890",
    reach: "128K",
    trend: "up",
    change: "+28.3%",
  },
  {
    id: 3,
    name: "Brand Awareness",
    status: "paused",
    platforms: ["facebook"],
    spend: "$567",
    reach: "23.1K",
    trend: "down",
    change: "-5.2%",
  },
  {
    id: 4,
    name: "Holiday Promo",
    status: "draft",
    platforms: ["instagram", "facebook", "twitter"],
    spend: "$0",
    reach: "—",
    trend: "neutral",
    change: "—",
  },
];

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
};

export function RecentCampaigns() {
  return (
    <Card variant="default" className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Campaigns</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-all duration-200 hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{campaign.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusStyles[campaign.status as keyof typeof statusStyles]}
                    >
                      {campaign.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {campaign.platforms.length} platforms
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Spend</p>
                  <p className="font-medium text-foreground">{campaign.spend}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="font-medium text-foreground">{campaign.reach}</p>
                </div>
                <div className="flex items-center gap-1">
                  {campaign.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-success" />
                  )}
                  {campaign.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span
                    className={
                      campaign.trend === "up"
                        ? "text-success"
                        : campaign.trend === "down"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {campaign.change}
                  </span>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
