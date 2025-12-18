import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Tag, Hash, Calendar, DollarSign, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Preset {
    id: string;
    name: string;
    preset_type: 'audience' | 'budget' | 'caption_tone' | 'hashtag' | 'schedule';
    configuration: any;
    usage_count: number;
}

const typeIcons = {
    audience: Tag,
    budget: DollarSign,
    caption_tone: Tag,
    hashtag: Hash,
    schedule: Calendar,
};

export function PresetsList() {
    const { user } = useAuth();
    const [presets, setPresets] = useState<Preset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchPresets();
    }, [user]);

    const fetchPresets = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('presets' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPresets(data as unknown as Preset[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (presets.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-center">
                <p className="text-muted-foreground">No presets created yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => {
                const Icon = typeIcons[preset.preset_type] || Tag;
                return (
                    <Card key={preset.id} className="group relative overflow-hidden transition-all hover:border-primary/50">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{preset.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{preset.preset_type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
