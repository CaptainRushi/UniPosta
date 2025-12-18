import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesList } from "@/components/templates/TemplatesList";
import { PresetsList } from "@/components/templates/PresetsList";
import { Button } from "@/components/ui/button";
import { Copy, Plus, SlidersHorizontal } from "lucide-react";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import { CreatePresetDialog } from "@/components/templates/CreatePresetDialog";

export default function Templates() {
    const [activeTab, setActiveTab] = useState("templates");
    const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
    const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Templates & Presets</h1>
                        <p className="text-muted-foreground">
                            Manage your reusable configurations for faster campaign creation
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeTab === "templates" ? (
                            <Button onClick={() => setIsCreateTemplateOpen(true)} className="gap-2 gradient-primary">
                                <Plus className="h-4 w-4" />
                                Create Template
                            </Button>
                        ) : (
                            <Button onClick={() => setIsCreatePresetOpen(true)} className="gap-2 gradient-primary">
                                <Plus className="h-4 w-4" />
                                Create Preset
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-border">
                        <TabsList className="mb-[-1px] bg-transparent p-0">
                            <TabsTrigger
                                value="templates"
                                className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground"
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Templates
                            </TabsTrigger>
                            <TabsTrigger
                                value="presets"
                                className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground"
                            >
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Presets
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="templates" className="mt-6">
                        <TemplatesList />
                    </TabsContent>

                    <TabsContent value="presets" className="mt-6">
                        <PresetsList />
                    </TabsContent>
                </Tabs>

                <CreateTemplateDialog
                    open={isCreateTemplateOpen}
                    onOpenChange={setIsCreateTemplateOpen}
                />
                <CreatePresetDialog
                    open={isCreatePresetOpen}
                    onOpenChange={setIsCreatePresetOpen}
                />
            </div>
        </DashboardLayout>
    );
}
