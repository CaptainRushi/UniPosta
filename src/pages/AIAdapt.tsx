import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sparkles, RefreshCw, Check, Copy, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type PlatformType = Database['public']['Enums']['platform_type'];

const tones = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "sales", label: "Sales-focused", emoji: "🎯" },
];

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-foreground" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-500" },
];

export default function AIAdapt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedTone, setSelectedTone] = useState("professional");
  const [hashtagsEnabled, setHashtagsEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState<Record<string, boolean>>({});
  const [adaptedContent, setAdaptedContent] = useState<Record<string, string>>({});
  
  const originalCaption = (location.state as any)?.caption || "Check out our amazing new product! It's designed to make your life easier. Click the link to learn more.";
  const masterPostId = (location.state as any)?.masterPostId;

  const generateVariants = async () => {
    setIsGenerating(true);
    
    try {
      const newVariants: Record<string, string> = {};

      const promises = platforms.map(async (platform) => {
        try {
          const result = await api.ai.adaptContent({
            master_post_content: originalCaption,
            target_platform: platform.name,
            tone: selectedTone,
            objective: "engagement"
          });
          
          let content = result.caption;
          if (hashtagsEnabled && result.hashtags && result.hashtags.length > 0) {
            content += `\n\n${result.hashtags.join(" ")}`;
          }

          newVariants[platform.id] = content;

          if (user && masterPostId) {
             await supabase.from('platform_variants').insert({
               master_post_id: masterPostId,
               user_id: user.id,
               platform: platform.id as PlatformType,
               caption: content,
               hashtags: result.hashtags,
             });
          }

        } catch (e) {
          console.error(`Failed to adapt for ${platform.name}`, e);
          newVariants[platform.id] = "Error generating content. Please try again.";
        }
      });

      await Promise.all(promises);
      
      setAdaptedContent(newVariants);
      
      toast({
        title: "Content adapted!",
        description: "Your content has been optimized for all platforms.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate variants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard.",
    });
  };

  const handlePost = async (platformId: string, content: string) => {
    setIsPosting(prev => ({...prev, [platformId]: true}));
    try {
      switch (platformId) {
        case 'twitter':
          await api.social.postToTwitter(content);
          toast({ title: "Posted to Twitter!" });
          break;
        case 'facebook':
          await api.social.postToFacebook(content);
          toast({ title: "Posted to Facebook!" });
          break;
        case 'instagram':
          await api.social.postToInstagram(content);
          toast({ title: "Posted to Instagram!" });
          break;
        case 'linkedin':
          await api.social.postToLinkedin(content);
          toast({ title: "Posted to LinkedIn!" });
          break;
        default:
          toast({ title: "Posting not implemented for this platform yet." });
      }
    } catch (error: any) {
      toast({ title: "Error posting", description: error.message, variant: "destructive" });
    } finally {
      setIsPosting(prev => ({...prev, [platformId]: false}));
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Content Adaptation</h1>
            <p className="text-muted-foreground">
              Optimize your content for each platform with AI
            </p>
          </div>
          <Button variant="glow" onClick={generateVariants} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Variants
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Adaptation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Original Caption</Label>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-sm text-muted-foreground">{originalCaption}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => (
                    <Badge
                      key={tone.id}
                      variant={selectedTone === tone.id ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedTone === tone.id
                          ? "gradient-primary border-0"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTone(tone.id)}
                    >
                      {tone.emoji} {tone.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Optimize Hashtags</Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-generate relevant hashtags
                  </p>
                </div>
                <Switch
                  checked={hashtagsEnabled}
                  onCheckedChange={setHashtagsEnabled}
                />
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Shorten caption
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Expand caption
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Add emojis
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {platforms.map((platform) => (
              <Card
                key={platform.id}
                variant={adaptedContent[platform.id] ? "glow" : "default"}
                className="animate-fade-in"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                    </div>
                    {adaptedContent[platform.id] && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(adaptedContent[platform.id])}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPosting[platform.id]}
                          onClick={() => handlePost(platform.id, adaptedContent[platform.id])}
                        >
                           {isPosting[platform.id] ? "Posting..." : `Post to ${platform.name}`}
                        </Button>
                        <Badge variant="outline" className="text-success border-success/30">
                          <Check className="h-3 w-3 mr-1" /> Optimized
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={adaptedContent[platform.id] || ""}
                    onChange={(e) =>
                      setAdaptedContent((prev) => ({
                        ...prev,
                        [platform.id]: e.target.value,
                      }))
                    }
                    placeholder={`Click "Generate Variants" to create optimized content for ${platform.name}...`}
                    rows={4}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            ))}

            {Object.keys(adaptedContent).length > 0 && (
              <Button
                variant="glow"
                size="lg"
                className="w-full"
                onClick={() => navigate("/launch", { state: { adaptedContent } })}
              >
                Continue to Launch
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
