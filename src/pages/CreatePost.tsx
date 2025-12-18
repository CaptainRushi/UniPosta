import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Link2, Sparkles, Instagram, Facebook, Twitter, Linkedin, Upload, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = mediaType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Please select a file smaller than ${mediaType === 'image' ? '10MB' : '100MB'}.`,
        variant: 'destructive',
      });
      return;
    }
    setMediaFile(file);
    setUploadProgress(0); // Reset progress when new file is selected
  };

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
    
    if (!mediaFile) {
      toast({
        title: 'Media file required',
        description: 'Please upload an image or video.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setUploading(true);
    let media_url = '';
    
    try {
      const fileExt = mediaFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, mediaFile, {
          cacheControl: '3600',
          upsert: false,
          // @ts-ignore
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for the media.');
      }
      media_url = publicUrlData.publicUrl;
      setUploading(false);

      // 1. Create Master Post
      const { data: masterPost, error: postError } = await supabase
        .from('master_posts')
        .insert({
          user_id: user.id,
          caption: caption,
          cta_link: ctaLink,
          media_url: media_url,
          media_type: mediaType
        })
        .select()
        .single();

      if (postError) throw postError;
      
      if (!masterPost) throw new Error("Failed to create master post");

      toast({
        title: "Master Post Created",
        description: "Your content has been saved securely.",
      });

      navigate("/adapt", { state: { caption, ctaLink, mediaType, mediaUrl: media_url, masterPostId: masterPost.id } });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
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
                  <Label>Media</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={mediaType === "image" ? "default" : "outline"}
                      onClick={() => { setMediaType("image"); setMediaFile(null); }}
                      className="flex-1"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant={mediaType === "video" ? "default" : "outline"}
                      onClick={() => { setMediaType("video"); setMediaFile(null); }}
                      className="flex-1"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                  <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <Input
                      id="file-upload"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept={mediaType === 'image' ? 'image/png, image/jpeg, image/webp' : 'video/mp4, video/quicktime'}
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mediaType === "image"
                          ? "PNG, JPG, WEBP (max. 10MB)"
                          : "MP4, MOV (max. 100MB)"}
                      </p>
                    </div>
                  </div>
                  {mediaFile && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Uploaded file:</p>
                      <div className="flex items-center gap-3 p-2 rounded-lg border bg-secondary/50">
                        {uploading ? (
                           <>
                            <div className="flex-shrink-0">
                              {mediaType === 'image' ? <Image className="h-5 w-5"/> : <Video className="h-5 w-5"/> }
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm truncate">{mediaFile.name}</p>
                              <Progress value={uploadProgress} className="h-2"/>
                            </div>
                          </>
                        ) : uploadProgress === 100 ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <p className="text-sm flex-1 truncate text-green-500">{mediaFile.name}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMediaFile(null)}><XCircle className="h-4 w-4"/></Button>
                          </>
                        ) : (
                           <>
                            <div className="flex-shrink-0">
                              {mediaType === 'image' ? <Image className="h-5 w-5 text-muted-foreground"/> : <Video className="h-5 w-5 text-muted-foreground"/> }
                            </div>
                            <p className="text-sm flex-1 truncate text-muted-foreground">{mediaFile.name}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMediaFile(null)}><XCircle className="h-4 w-4"/></Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
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
              <Button variant="outline" onClick={() => navigate("/dashboard")} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleAdapt} className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? 
                  (uploading ? 'Uploading...' : 'Saving...') :
                  <><Sparkles className="h-4 w-4" /> Save & Adapt Content</>}
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
                      {mediaFile && mediaType === 'image' ? 
                        <img src={URL.createObjectURL(mediaFile)} alt="preview" className="w-full h-full object-cover rounded-lg"/> : 
                        <Image className="h-8 w-8 text-muted-foreground" />
                      }
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
