import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, FileText, BarChart2, FolderPen, Plus, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface CampaignWithPosts {
    id: string;
    name: string;
    description: string;
    objective: string;
    status: string;
    start_date: string;
    end_date: string;
    master_posts: {
        id: string;
        caption: string;
        created_at: string;
        media_url: string;
        platform_variants: {
            platform: string;
            status: string;
            posting_time: string;
        }[];
    }[];
}

export default function CampaignDetails() {
    const { id } = useParams();

    const { data: campaign, isLoading } = useQuery({
        queryKey: ["campaign", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("campaigns")
                .select(`
          *,
          master_posts (
            id,
            caption,
            created_at,
            media_url,
            platform_variants (
              platform,
              status,
              posting_time
            )
          )
        `)
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as any as CampaignWithPosts;
        }
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    if (!campaign) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <h2 className="text-xl font-semibold">Campaign not found</h2>
                    <Link to="/campaigns">
                        <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Link to="/campaigns" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit">
                        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-foreground">{campaign.name}</h1>
                                <Badge variant="outline" className="capitalize">
                                    {campaign.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">
                                {campaign.description || "No description provided."}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/create?campaignId=${campaign.id}`}>
                                <Button variant="glow" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Post
                                </Button>
                            </Link>
                            <Button variant="outline" size="icon">
                                <FolderPen className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{campaign.master_posts?.length || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Start Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-lg">
                                {campaign.start_date ? format(new Date(campaign.start_date), 'MMM d, yyyy') : '-'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Objective</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize text-lg">{campaign.objective || '-'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-lg">
                                {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d, yyyy') : 'Ongoing'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList>
                        <TabsTrigger value="posts" className="gap-2">
                            <FileText className="h-4 w-4" /> Posts
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2">
                            <BarChart2 className="h-4 w-4" /> Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4 pt-4">
                        {campaign.master_posts && campaign.master_posts.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {campaign.master_posts.map((post: any) => (
                                    <Card key={post.id} className="hover:border-primary/50 transition-colors">
                                        <CardHeader className="pb-2">
                                            <div className="text-sm text-muted-foreground mb-1">
                                                {format(new Date(post.created_at), 'MMM d, h:mm a')}
                                            </div>
                                            <CardDescription className="line-clamp-3 font-medium text-foreground">
                                                {post.caption || "No caption"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xs text-muted-foreground">
                                                {post.platform_variants?.length || 0} platforms
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
                                <p className="text-muted-foreground mb-4">No posts in this campaign yet.</p>
                                <Link to={`/create?campaignId=${campaign.id}`}>
                                    <Button variant="outline">Create First Post</Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="pt-4">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-lg bg-card/50">
                            <div className="p-4 rounded-full bg-secondary/50">
                                <BarChart2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">No analytics data available</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Analytics will appear once data is synced from connected platforms.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                                <AlertCircle className="h-3 w-3" />
                                Waiting for platform sync
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
