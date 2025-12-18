import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Template } from "./TemplatesList";
import { Copy, Megaphone, Calendar, Users, FileText, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

interface TemplateCardProps {
    template: Template;
}

const typeIcons = {
    campaign: Megaphone,
    post: FileText,
    audience: Users,
    schedule: Calendar,
};

const platformIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
};

export function TemplateCard({ template }: TemplateCardProps) {
    const navigate = useNavigate();
    const TypeIcon = typeIcons[template.template_type] || FileText;

    const handleUseTemplate = () => {
        // Navigate to appropriate creation flow with templateId
        switch (template.template_type) {
            case 'campaign':
                // navigate(`/campaigns/create?template=${template.id}`); // Campaigns removed per previous request, redirecting to launch maybe?
                navigate(`/launch?template=${template.id}`);
                break;
            case 'post':
                navigate(`/create?template=${template.id}`);
                break;
            default:
                console.log("Template usage not implemented for this type yet");
        }
    };

    return (
        <Card className="flex h-full flex-col transition-all hover:border-primary/50">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
                <div className="flex items-center gap-2">
                    <div className="rounded-md bg-secondary p-2">
                        <TypeIcon className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant="outline" className="capitalize">
                        {template.template_type}
                    </Badge>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
                <CardTitle className="line-clamp-1 text-base font-semibold">
                    {template.name}
                </CardTitle>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {template.description || "No description provided."}
                </p>

                {template.platform_supported && template.platform_supported.length > 0 && (
                    <div className="mt-4 flex gap-1">
                        {template.platform_supported.map((platform) => {
                            const Icon = platformIcons[platform.toLowerCase()];
                            return Icon ? (
                                <div key={platform} className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/50 p-1">
                                    <Icon className="h-3 w-3 text-muted-foreground" />
                                </div>
                            ) : null;
                        })}
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t bg-secondary/10 p-4">
                <Button
                    className="w-full gap-2"
                    variant="outline"
                    onClick={handleUseTemplate}
                >
                    <Copy className="h-4 w-4" />
                    Use Template
                </Button>
            </CardFooter>
        </Card>
    );
}
