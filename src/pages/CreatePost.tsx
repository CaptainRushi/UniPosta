import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Link2, Sparkles, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAdapt = async () => {
    if (!caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please enter a caption before adapting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Master Post
      const { data: masterPost, error } = await supabase
        .from('master_posts')
        .insert({
          user_id: user.id,
          caption: caption,
          cta_link: ctaLink,
          // media_url: TODO: Implement actual upload
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!masterPost) throw new Error("Failed to create master post");

      toast({
        title: "Master Post Created",
        description: "Your content has been saved securely.",
      });

      navigate("/adapt", { state: { caption, ctaLink, mediaType, masterPostId: masterPost.id } });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Master Post</h1>
          <p className="text-muted-foreground">
            Create one post and we'll adapt it for all platforms
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Content Editor */}
          <div className="space-y-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Media Upload */}
                <div className="space-y-3">
                  <Label>Media Type</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={mediaType === "image" ? "default" : "outline"}
                      onClick={() => setMediaType("image")}
                      className="flex-1"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant={mediaType === "video" ? "default" : "outline"}
                      onClick={() => setMediaType("video")}
                      className="flex-1"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      {mediaType === "image" ? (
                        <Image className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <Video className="h-10 w-10 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mediaType === "image"
                          ? "PNG, JPG, WEBP up to 10MB"
                          : "MP4, MOV up to 100MB"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    placeholder="Write your post caption here..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {caption.length} characters
                  </p>
                </div>

                {/* CTA Link */}
                <div className="space-y-2">
                  <Label htmlFor="cta">CTA Link</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cta"
                      type="url"
                      placeholder="https://example.com/landing-page"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button onClick={handleAdapt} className="gap-2" disabled={isSubmitting}>
                <Sparkles className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save & Adapt Content"}
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <Card variant="gradient" className="h-fit">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Cards */}
              <div className="space-y-4">
                {[
                  { name: "Instagram", icon: Instagram, color: "bg-pink-500" },
                  { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
                  { name: "Twitter/X", icon: Twitter, color: "bg-foreground" },
                  { name: "LinkedIn", icon: Linkedin, color: "bg-blue-500" },
                ].map((platform) => (
                  <div
                    key={platform.name}
                    className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {platform.name}
                      </span>
                    </div>
                    <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {caption || "Your caption will appear here..."}
                    </p>
                    {ctaLink && (
                      <p className="text-xs text-primary truncate">{ctaLink}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
