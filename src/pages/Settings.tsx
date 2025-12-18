import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    CheckCircle2,
    Plus,
    LogOut,
    ShieldCheck,
    RefreshCw,
    Trash2,
    Info,
    User as UserIcon,
    Mail,
    AlertCircle
} from "lucide-react";

interface SocialAccount {
    id: string;
    platform: string;
    account_name: string;
    account_id: string;
    expires_at: string | null;
    created_at: string;
}

const PLATFORMS = [
    {
        id: "google",
        name: "Google",
        icon: Mail,
        color: "text-red-500",
        subtext: "Connect your Google account for ads and analytics"
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: Facebook,
        color: "text-blue-600",
        subtext: "Required for Instagram posting"
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        color: "text-pink-600",
        subtext: "Business or Creator account only"
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: Linkedin,
        color: "text-blue-700",
        subtext: "Professional networking and content"
    },
    {
        id: "twitter",
        name: "X (Twitter)",
        icon: Twitter,
        color: "text-foreground",
        subtext: "Direct publishing to your feed"
    },
];

export default function Settings() {
    const { user, signOut, plan } = useAuth();
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchConnectedAccounts();
        }
    }, [user]);

    async function fetchConnectedAccounts() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("social_accounts")
                .select("*");

            if (error) throw error;
            setAccounts(data || []);
        } catch (error: any) {
            console.error("Error fetching accounts:", error);
            toast({
                title: "Error",
                description: "Failed to load connected accounts.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    const handleConnect = (platform: string) => {
        if (!user) return;

        toast({
            title: "Connecting...",
            description: `Redirecting to ${platform} for authentication.`,
        });

        // Redirect to our Edge Function which handles the OAuth redirect
        const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-connect?platform=${platform}&user_id=${user.id}`;

        // In a real flow, we'd use this. For demo/unimplemented platforms like Google, we show a mock toast.
        if (platform === "google") {
            setTimeout(() => {
                toast({
                    title: "Coming Soon",
                    description: "Google integration is currently in development.",
                });
            }, 1000);
            return;
        }

        window.location.href = edgeFunctionUrl;
    };

    const handleDisconnect = async (accountId: string, platform: string) => {
        try {
            const { error } = await supabase
                .from("social_accounts")
                .delete()
                .eq("id", accountId);

            if (error) throw error;

            setAccounts(prev => prev.filter(a => a.id !== accountId));
            toast({
                title: "Account disconnected",
                description: `Successfully disconnected your ${platform} account.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleReconnect = (platform: string) => {
        handleConnect(platform);
    };

    const isConnected = (platformId: string) => accounts.some(a => a.platform === platformId);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Section 1: User Profile Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-glow">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                            <AvatarFallback><UserIcon /></AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-foreground">My Account</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className={`bg-primary/10 border-primary/20 ${plan === 'pro' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {plan === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" onClick={signOut} className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30">
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area: Social Connections */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    Connected Social Accounts
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Connect your social media accounts to publish posts directly from the dashboard.
                                </p>
                            </div>

                            {/* Section 2: Social Login Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PLATFORMS.map((platform) => {
                                    const connected = isConnected(platform.id);
                                    return (
                                        <Card key={platform.id} variant="glass" className="group hover:border-primary/30 transition-all duration-300">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div className={`p-2.5 rounded-xl bg-background border border-border/50 group-hover:border-primary/50 transition-colors ${platform.color}`}>
                                                        <platform.icon className="h-6 w-6" />
                                                    </div>
                                                    {connected ? (
                                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 px-2 py-0.5">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            Connected
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1 px-2 py-0.5">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                                            Not Connected
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="mt-4 text-lg">{platform.name}</CardTitle>
                                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                                    {platform.subtext || `Connect your ${platform.name} account to sync data.`}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter>
                                                {connected ? (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            const acct = accounts.find(a => a.platform === platform.id);
                                                            if (acct) handleDisconnect(acct.id, platform.name);
                                                        }}
                                                    >
                                                        Disconnect
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="glow"
                                                        className="w-full gap-2"
                                                        onClick={() => handleConnect(platform.id)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Connect {platform.name}
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Section 3: Attached Accounts List */}
                        <section>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold">Attached Accounts List</h2>
                                <p className="text-muted-foreground mt-1">Detailed view of all your linked profiles.</p>
                            </div>

                            <Card variant="glass" className="overflow-hidden border-border/40">
                                <CardContent className="p-0">
                                    {loading ? (
                                        <div className="p-8 flex flex-col items-center justify-center space-y-4">
                                            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                                            <p className="text-muted-foreground animate-pulse">Loading accounts...</p>
                                        </div>
                                    ) : accounts.length > 0 ? (
                                        <div className="divide-y divide-border/50">
                                            {accounts.map((account) => {
                                                const platformInfo = PLATFORMS.find(p => p.id === account.platform);
                                                const status = account.expires_at && new Date(account.expires_at) < new Date() ? 'Expired' : 'Active';

                                                return (
                                                    <div key={account.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-primary/5 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <Avatar className="h-12 w-12 border border-border">
                                                                    <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account.account_name}`} />
                                                                    <AvatarFallback>{account.account_name[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="absolute -bottom-1 -right-1 p-1 bg-background border border-border rounded-full">
                                                                    {platformInfo && <platformInfo.icon className={`h-3 w-3 ${platformInfo.color}`} />}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-foreground">{account.account_name}</h4>
                                                                    <Badge variant="outline" className={`text-[10px] h-4 px-1 ${status === 'Active' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>
                                                                        {status}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{account.platform}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                    Connected on {new Date(account.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-1 text-xs"
                                                                onClick={() => handleReconnect(account.platform)}
                                                            >
                                                                <RefreshCw className="h-3 w-3" />
                                                                Reconnect
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDisconnect(account.id, account.platform)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Disconnect
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                                                <Plus className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="max-w-[250px] space-y-2">
                                                <h3 className="font-semibold">No accounts connected</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Get started by connecting your first social media platform above.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Section 5: Security & Permissions Notice */}
                        <Card variant="glass" className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    Security & Privacy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                    <p>We only access your account to publish posts you approve and fetch analytics for those posts.</p>
                                </div>
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                    <p>All access tokens are encrypted and stored securely according to industry standards.</p>
                                </div>
                                <div className="pt-2 border-t border-primary/10">
                                    <p className="text-xs font-medium text-primary/80">You can disconnect any account at any time to immediately revoke our access.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Info Box */}
                        <Card variant="glass" className="border-border/40">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    Important Note
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    For Instagram, ensure you have a <strong>Business or Creator account</strong> linked to a Facebook Page. Standard personal accounts are not supported by the official API.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
