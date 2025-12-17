import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Rocket, Instagram, Facebook, Twitter, Linkedin, Users, Target, DollarSign, Eye, MousePointer, ShoppingCart, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500", connected: true },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600", connected: true },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-foreground", connected: true },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-500", connected: false },
];

const objectives = [
  { id: "awareness", name: "Brand Awareness", icon: Eye, description: "Maximize reach and impressions" },
  { id: "traffic", name: "Traffic", icon: MousePointer, description: "Drive visitors to your website" },
  { id: "engagement", name: "Engagement", icon: Users, description: "Get likes, comments, and shares" },
  { id: "conversions", name: "Conversions", icon: ShoppingCart, description: "Drive purchases or signups" },
];

const audiences = [
  { id: "broad", name: "Broad Audience", size: "2.5M - 3.2M" },
  { id: "interest", name: "Interest-based", size: "800K - 1.2M" },
  { id: "lookalike", name: "Lookalike", size: "1.5M - 2M" },
  { id: "retargeting", name: "Retargeting", size: "45K - 60K" },
];

export default function LaunchAds() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);
  const [selectedObjective, setSelectedObjective] = useState("traffic");
  const [selectedAudience, setSelectedAudience] = useState("interest");
  const [budget, setBudget] = useState("500");
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const { toast } = useToast();

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleLaunch = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform to launch your ad.",
        variant: "destructive",
      });
      return;
    }

    setIsLaunching(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsLaunching(false);
    setIsLaunched(true);

    toast({
      title: "Ads launched successfully!",
      description: `Your campaign is now live on ${selectedPlatforms.length} platforms.`,
    });
  };

  if (isLaunched) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-scale-in">
          <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Campaign Launched!</h1>
            <p className="text-muted-foreground">
              Your ads are now live on {selectedPlatforms.length} platforms
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsLaunched(false)}>
              Launch Another
            </Button>
            <Button variant="glow" onClick={() => window.location.href = "/analytics"}>
              View Analytics
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Launch Ads</h1>
          <p className="text-muted-foreground">
            Configure and launch your campaign across platforms
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Selection */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Select Platforms</CardTitle>
                <CardDescription>Choose where to publish your ads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      onClick={() => platform.connected && togglePlatform(platform.id)}
                      className={`relative flex items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                        selectedPlatforms.includes(platform.id)
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border hover:border-primary/30"
                      } ${!platform.connected && "opacity-50 cursor-not-allowed"}`}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        disabled={!platform.connected}
                      />
                      <div className={`h-10 w-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{platform.name}</p>
                        {!platform.connected && (
                          <Badge variant="outline" className="text-xs">
                            Not connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objective Selection */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Campaign Objective</CardTitle>
                <CardDescription>What's the goal of this campaign?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {objectives.map((objective) => (
                    <div
                      key={objective.id}
                      onClick={() => setSelectedObjective(objective.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                        selectedObjective === objective.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="rounded-lg bg-secondary p-2">
                        <objective.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{objective.name}</p>
                        <p className="text-xs text-muted-foreground">{objective.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audience Selection */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Target Audience</CardTitle>
                <CardDescription>Select your audience segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audiences.map((audience) => (
                    <div
                      key={audience.id}
                      onClick={() => setSelectedAudience(audience.id)}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                        selectedAudience === audience.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-secondary p-2">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-medium text-foreground">{audience.name}</p>
                      </div>
                      <Badge variant="outline">{audience.size}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Launch */}
          <div className="space-y-6">
            <Card variant="glow">
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget */}
                <div className="space-y-2">
                  <Label>Daily Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platforms</span>
                    <span className="font-medium text-foreground">{selectedPlatforms.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Objective</span>
                    <span className="font-medium text-foreground capitalize">{selectedObjective}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Reach</span>
                    <span className="font-medium text-foreground">
                      {audiences.find((a) => a.id === selectedAudience)?.size}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-bold text-foreground">${budget}/day</span>
                  </div>
                </div>

                <Button
                  variant="glow"
                  size="lg"
                  className="w-full"
                  onClick={handleLaunch}
                  disabled={isLaunching}
                >
                  {isLaunching ? (
                    "Launching..."
                  ) : (
                    <>
                      <Rocket className="h-5 w-5 mr-2" />
                      Launch Campaign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
