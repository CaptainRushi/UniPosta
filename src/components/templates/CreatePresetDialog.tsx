import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreatePresetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePresetDialog({ open, onOpenChange }: CreatePresetDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState<string>("hashtag");

    const handleSave = async () => {
        if (!user) return;
        if (!name) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Placeholder config
            const placeholderConfig = {
                value: "Sample config"
            };

            const { error } = await supabase
                .from('presets' as any)
                .insert({
                    user_id: user.id,
                    name,
                    preset_type: type,
                    configuration: placeholderConfig,
                });

            if (error) throw error;

            toast({ title: "Preset created successfully" });
            onOpenChange(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to create preset", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Preset</DialogTitle>
                    <DialogDescription>
                        Create a reusable setting for quick access.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Preset Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hashtag">Hashtag Group</SelectItem>
                                <SelectItem value="audience">Audience Targeting</SelectItem>
                                <SelectItem value="budget">Budget Rule</SelectItem>
                                <SelectItem value="caption_tone">Caption Tone</SelectItem>
                                <SelectItem value="schedule">Schedule Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="e.g., Luxury Hashtags"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Creating..." : "Create Preset"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
