import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    User as UserIcon,
    Mail,
    AlertCircle,
    RotateCw,
    Crown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SocialAccount {
    id: string;
    platform: string;
    account_name: string;
    account_id: string;
    created_at: string;
}

const PLATFORMS = [
    {
        id: "google",
        name: "Google",
        icon: Mail,
        color: "text-red-500",
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: Facebook,
        color: "text-blue-600",
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        color: "text-pink-600",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: Linkedin,
        color: "text-blue-700",
    },
    {
        id: "twitter",
        name: "X (Twitter)",
        icon: Twitter,
        color: "text-foreground",
    },
];

export function SocialAccountsPanel() {
    const { user, signOut, plan } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchConnectedAccounts();
        }
    }, [user, connecting]); // Re-fetch when connection status changes or user logs in.

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
        } finally {
            setLoading(false);
        }
    }

    const handleConnect = (platform: string) => {
        if (!user) return;

        setConnecting(platform);
        toast({
            title: "Connecting...",
            description: `Redirecting to ${platform} for authentication.`,
        });

        // Redirect to our Edge Function which handles the OAuth redirect
        const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-connect?platform=${platform}&user_id=${user.id}`;

        if (platform === "google") {
            setTimeout(() => {
                setConnecting(null);
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
            toast({
                title: " disconnecting...",
                description: `Disconnecting your ${platform} account.`,
            });
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

    const getAccount = (platformId: string) => accounts.find(a => a.platform === platformId);

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`rounded-full hover:bg-secondary/80 relative h-10 w-10 ${plan === 'pro' ? 'bg-primary/20 hover:bg-primary/30' : 'bg-secondary'}`}>
                    <Avatar className={`h-9 w-9 border ${plan === 'pro' ? 'border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'border-border'}`}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                        <AvatarFallback>
                            {plan === 'pro' ? <Crown className="h-4 w-4 text-primary" /> : <UserIcon className="h-4 w-4" />}
                        </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Open user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="p-4 bg-muted/30 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <Avatar className={`h-10 w-10 border ${plan === 'pro' ? 'border-primary shadow-glow' : 'border-border/50'}`}>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                            <AvatarFallback>
                                {plan === 'pro' ? <Crown className="h-4 w-4 text-primary" /> : <UserIcon className="h-4 w-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-0.5 overflow-hidden">
                            <p className="text-sm font-medium leading-none truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] font-normal h-5 ${plan === 'pro' ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}`}>
                            {plan === 'pro' ? 'Pro' : 'Starter'}
                        </Badge>
                    </div>
                </div>

                <div className="p-2">
                    <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center justify-between">
                        Connected Social Accounts
                        {loading && <RotateCw className="h-3 w-3 animate-spin" />}
                    </DropdownMenuLabel>

                    <ScrollArea className="h-[280px] w-full rounded-md border p-1">
                        <div className="space-y-1">
                            {PLATFORMS.map((platform) => {
                                const account = getAccount(platform.id);
                                const isConnected = !!account;
                                const isConnecting = connecting === platform.id;

                                return (
                                    <div key={platform.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/40 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-md bg-secondary border border-border/50 ${platform.color}`}>
                                                <platform.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{platform.name}</span>
                                                {isConnected ? (
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={account.account_name}>{account.account_name}</span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground">Not Connected</span>
                                                )}
                                            </div>
                                        </div>

                                        {isConnected ? (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDisconnect(account.id, platform.name);
                                                    }}
                                                    title="Disconnect"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <div className="h-2 w-2 rounded-full bg-green-500" title="Connected" />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs px-2 gap-1 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                                disabled={isConnecting}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleConnect(platform.id);
                                                }}
                                            >
                                                {isConnecting ? (
                                                    <RotateCw className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Plus className="h-3 w-3" />
                                                )}
                                                Connect
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </div>

                <div className="p-2 bg-muted/20 text-[10px] text-center text-muted-foreground border-t border-border/50">
                    <p className="flex items-center justify-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" />
                        We care about your privacy
                    </p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
