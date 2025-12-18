import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
} from "lucide-react";

type Provider = "facebook" | "instagram" | "twitter" | "linkedin";

interface Props {
    provider: Provider;
    label?: string;
}

export default function SocialSignInButton({ provider, label }: Props) {
    const { toast } = useToast();

    const handleClick = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider as any,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                }
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                title: "Social sign-in failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const Icon = {
        facebook: Facebook,
        instagram: Instagram,
        twitter: Twitter,
        linkedin: Linkedin,
    }[provider];

    return (
        <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 w-full hover:bg-secondary/50 transition-colors"
            onClick={handleClick}
        >
            <Icon className="h-5 w-5" />
            {label ?? `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
        </Button>
    );
}
