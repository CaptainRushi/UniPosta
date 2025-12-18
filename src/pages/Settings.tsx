import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Facebook, Instagram, Linkedin, Twitter, CheckCircle2, Plus } from "lucide-react";

const PLATFORMS = [
    { id: "facebook", name: "Facebook Pages", icon: Facebook, color: "text-blue-600" },
    { id: "instagram", name: "Instagram Business", icon: Instagram, color: "text-pink-600" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "text-foreground" },
];

export default function Settings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchConnectedAccounts();
        }
    }, [user]);

    async function fetchConnectedAccounts() {
        try {
            const { data, error } = await supabase
                .from("social_accounts")
                .select("platform");

            if (error) throw error;
            setConnectedAccounts(data.map(a => a.platform));
        } catch (error: any) {
            console.error("Error fetching accounts:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleConnect = (platform: string) => {
        if (!user) return;

        // Redirect to our Edge Function which handles the OAuth redirect
        const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-connect?platform=${platform}&user_id=${user.id}`;
        window.location.href = edgeFunctionUrl;
    };

    const handleDisconnect = async (platform: string) => {
        try {
            const { error } = await supabase
                .from("social_accounts")
                .delete()
                .eq("user_id", user?.id)
                .eq("platform", platform);

            if (error) throw error;

            setConnectedAccounts(prev => prev.filter(p => p !== platform));
            toast({
                title: "Account disconnected",
                description: `Successfully disconnected from ${platform}.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Manage your connected social media accounts and permissions.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>
                            Connect your social media accounts to enable one-click publishing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {PLATFORMS.map((platform) => {
                            const isConnected = connectedAccounts.includes(platform.id);
                            return (
                                <div key={platform.id} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-background border ${platform.color}`}>
                                            <platform.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{platform.name}</p>
                                            {isConnected ? (
                                                <div className="flex items-center gap-1 text-xs text-green-500">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Connected
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Not connected</p>
                                            )}
                                        </div>
                                    </div>
                                    {isConnected ? (
                                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(platform.id)}>
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={() => handleConnect(platform.id)} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Connect
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
