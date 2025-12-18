import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<string>("post");
    const [visibility, setVisibility] = useState("private");

    const handleSave = async () => {
        if (!user) return;
        if (!name) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // In a real app, we'd probably select an existing item to base this on, 
            // or open an editor. For now, we'll save a placeholder configuration.
            const placeholderConfig = {
                created_from: "scratch",
                default_settings: {}
            };

            const { error } = await supabase
                .from('templates' as any)
                .insert({
                    user_id: user.id,
                    name,
                    description,
                    template_type: type,
                    visibility,
                    configuration: placeholderConfig,
                    platform_supported: [] // Default empty
                });

            if (error) throw error;

            toast({ title: "Template created successfully" });
            onOpenChange(false);
            // Ideally trigger a refresh of the list here
            window.location.reload(); // Quick and dirty refresh for now
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to create template", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                    <DialogDescription>
                        Save a configuration as a reusable template.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Template Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="post">Post Template</SelectItem>
                                <SelectItem value="campaign">Campaign Template</SelectItem>
                                <SelectItem value="audience">Audience Template</SelectItem>
                                <SelectItem value="schedule">Schedule Template</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="e.g., Monthly Newsletter"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe what this template is for..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Visibility</Label>
                        <RadioGroup defaultValue="private" value={visibility} onValueChange={setVisibility} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private">Private</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="team" id="team" />
                                <Label htmlFor="team">Team</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Creating..." : "Create Template"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
