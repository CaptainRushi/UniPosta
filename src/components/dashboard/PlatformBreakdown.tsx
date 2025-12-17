import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const platforms = [
  { name: "Instagram", color: "bg-pink-500", percentage: 42, spend: "$2,340" },
  { name: "Facebook", color: "bg-blue-500", percentage: 28, spend: "$1,560" },
  { name: "Twitter/X", color: "bg-foreground", percentage: 18, spend: "$1,002" },
  { name: "LinkedIn", color: "bg-blue-400", percentage: 12, spend: "$668" },
];

export function PlatformBreakdown() {
  return (
    <Card variant="default" className="animate-fade-in">
      <CardHeader>
        <CardTitle>Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {platforms.map((platform) => (
          <div key={platform.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${platform.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {platform.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {platform.spend}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {platform.percentage}%
                </span>
              </div>
            </div>
            <Progress value={platform.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
