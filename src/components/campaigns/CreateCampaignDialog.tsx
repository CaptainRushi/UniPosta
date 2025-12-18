import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

interface CreateCampaignDialogProps {
    children: React.ReactNode;
}

export function CreateCampaignDialog({ children }: CreateCampaignDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        objective: "awareness",
        startDate: "",
        endDate: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user found");

            const { data: campaign, error } = await supabase.from("campaigns").insert({
                user_id: user.id,
                name: formData.name,
                // description: formData.description, // DB Migration missing
                // objective: formData.objective,     // DB Migration missing
                // start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                // end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                status: "draft",
            }).select('id').single();

            if (error) throw error;

            toast({
                title: "Campaign created",
                description: "Your new campaign has been created successfully.",
            });

            setOpen(false);
            setFormData({
                name: "",
                description: "",
                objective: "awareness",
                startDate: "",
                endDate: "",
            });
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });

            if (campaign) {
                navigate(`/campaigns/${campaign.id}`);
            }

        } catch (error: any) {
            toast({
                title: "Error creating campaign",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Campaign</DialogTitle>
                        <DialogDescription>
                            Set up a new campaign to organize your posts and track performance.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Campaign Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Summer Sale 2024"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What is this campaign about?"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="objective">Objective</Label>
                            <Select
                                value={formData.objective}
                                onValueChange={(value) => setFormData({ ...formData, objective: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select objective" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                                    <SelectItem value="engagement">Engagement</SelectItem>
                                    <SelectItem value="traffic">Traffic</SelectItem>
                                    <SelectItem value="conversions">Conversions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Campaign"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
