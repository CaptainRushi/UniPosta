import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Calendar, Megaphone, MoreVertical, Archive, PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

// Helper for status badge colors
const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        default: return 'bg-secondary text-muted-foreground border-border';
    }
};

export default function Campaigns() {
    const [search, setSearch] = useState("");

    const { data: campaigns, isLoading } = useQuery({
        queryKey: ["campaigns"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("campaigns")
                .select("id, name, status, created_at, user_id, master_posts(count)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const filteredCampaigns = campaigns?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
                        <p className="text-muted-foreground">
                            Manage and track all your publishing campaigns.
                        </p>
                    </div>
                    <CreateCampaignDialog>
                        <Button variant="glow" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Campaign
                        </Button>
                    </CreateCampaignDialog>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredCampaigns?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-lg bg-card/50">
                        <div className="p-4 rounded-full bg-secondary/50">
                            <Megaphone className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No campaigns yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Create your first campaign to organize your posts and track performance across platforms.
                        </p>
                        <CreateCampaignDialog>
                            <Button variant="outline">Create Campaign</Button>
                        </CreateCampaignDialog>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCampaigns?.map((campaign: any) => (
                            <Card key={campaign.id} variant="interactive" className="group">
                                <CardHeader className="relative">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={getStatusColor(campaign.status)}>
                                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <PlayCircle className="mr-2 h-4 w-4" /> Activate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <PauseCircle className="mr-2 h-4 w-4" /> Pause
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Archive className="mr-2 h-4 w-4" /> Archive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardTitle className="mt-2 line-clamp-1">
                                        <Link to={`/campaigns/${campaign.id}`} className="hover:text-primary transition-colors">
                                            {campaign.name}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">
                                        {campaign.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{campaign.start_date ? format(new Date(campaign.start_date), 'MMM d, yyyy') : 'No date'}</span>
                                        </div>
                                        <div>•</div>
                                        <div>
                                            {campaign.master_posts?.[0]?.count || 0} posts
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Link to={`/campaigns/${campaign.id}`} className="w-full">
                                        <Button variant="secondary" className="w-full group-hover:bg-secondary/80">
                                            View Details
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
