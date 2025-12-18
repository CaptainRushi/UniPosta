import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TemplateCard } from "./TemplateCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Interface locally defined until generated types are available
export interface Template {
    id: string;
    name: string;
    description: string | null;
    template_type: 'campaign' | 'post' | 'audience' | 'schedule';
    visibility: 'private' | 'team';
    platform_supported: string[] | null;
    configuration: any;
    usage_count: number;
    created_at: string;
}

export function TemplatesList() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        if (!user) return;
        fetchTemplates();
    }, [user]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('templates' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching templates:', error);
                // Fallback or empty handle
            } else {
                setTemplates(data as unknown as Template[]);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (template.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        const matchesType = typeFilter === "all" || template.template_type === typeFilter;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="campaign">Campaigns</SelectItem>
                        <SelectItem value="post">Posts</SelectItem>
                        <SelectItem value="audience">Audiences</SelectItem>
                        <SelectItem value="schedule">Schedules</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center animate-fade-in">
                    <div className="mb-4 rounded-full bg-secondary p-4">
                        <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No templates found</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {searchQuery || typeFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "Create your first template to get started."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                    {filteredTemplates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            )}
        </div>
    );
}
