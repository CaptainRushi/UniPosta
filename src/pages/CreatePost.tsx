import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Link2, Sparkles, Instagram, Facebook, Twitter, Linkedin, Upload, CheckCircle, XCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "bg-foreground" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-500" },
];

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConnectedPlatforms();
    }
  }, [user]);

  async function fetchConnectedPlatforms() {
    const { data, error } = await supabase
      .from("social_accounts")
      .select("platform");

    if (!error && data) {
      const platforms = data.map(a => a.platform);
      setConnectedPlatforms(platforms);
      setSelectedPlatforms(platforms); // Select all by default
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file?.name, file?.size, file?.type);
    if (!file) return;

    const maxSize = mediaType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Please select a file smaller than ${mediaType === 'image' ? '10MB' : '100MB'}.`,
        variant: 'destructive',
      });
      return;
    }
    setMediaFile(file);
    setUploadProgress(0);
  };

  const handleAdapt = async () => {
    console.log("handleAdapt called. Caption:", caption, "MediaFile:", mediaFile?.name);
    if (!caption.trim()) {
      toast({ title: "Caption required", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }
    if (!mediaFile) {
      toast({ title: 'Media file required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    setUploading(true);

    try {
      const fileExt = mediaFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const uploadOptions: any = {
        onUploadProgress: (progress: any) => {
          setUploadProgress((progress.loaded / progress.total) * 100);
        },
      };

      console.log("Starting upload to path:", filePath);
      let uploadError = null;
      try {
        const { error } = await supabase.storage
          .from('media')
          .upload(filePath, mediaFile, uploadOptions);
        uploadError = error;
      } catch (err: any) {
        uploadError = err;
      }

      if (uploadError && (uploadError as any).message?.includes('Bucket not found')) {
        console.log("Bucket 'media' not found, attempting to create...");
        const { error: createError } = await supabase.storage.createBucket('media', { public: true });
        if (!createError) {
          console.log("Bucket created, retrying upload...");
          const { error: retryError } = await supabase.storage
            .from('media')
            .upload(filePath, mediaFile, uploadOptions);
          uploadError = retryError;
        } else {
          console.error("Failed to create bucket:", createError);
          uploadError = createError;
        }
      }

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful. Getting public URL...");
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
      const media_url = publicUrlData.publicUrl;
      console.log("Public URL:", media_url);
      setUploading(false);

      console.log("Inserting master post into database...");
      const { data: masterPost, error: postError } = await supabase
        .from('master_posts')
        .insert({
          user_id: user.id,
          caption,
          cta_link: ctaLink,
          media_url,
          media_type: mediaType
        })
        .select().single();

      if (postError) {
        console.error("Database insertion error:", postError);
        throw postError;
      }

      console.log("Master post created successfully:", masterPost.id);
      toast({ title: "Master Post Created" });
      navigate("/adapt", { state: { caption, ctaLink, mediaType, mediaUrl: media_url, masterPostId: masterPost.id } });

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      toast({ title: "Select at least one platform", variant: "destructive" });
      return;
    }

    setIsPublishing(true);

    try {
      let media_url = "";
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const filePath = `${user?.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, mediaFile);

        if (uploadError && uploadError.message?.includes('Bucket not found')) {
          await supabase.storage.createBucket('media', { public: true });
          await supabase.storage.from('media').upload(filePath, mediaFile);
        }

        media_url = supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
      }

      const publishPromises = selectedPlatforms.map(platform =>
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publish-post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            text: caption,
            media_url,
            user_id: user?.id
          })
        }).then(res => res.json())
      );

      const results = await Promise.all(publishPromises);
      const failures = results.filter(r => !r.success);

      if (failures.length > 0) {
        toast({
          title: "Partial Success",
          description: `Failed to publish to ${failures.length} platforms.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Published Successfully!",
          description: `Your post is now live on ${selectedPlatforms.join(", ")}.`,
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({ title: "Publishing Error", description: error.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Master Post</h1>
          <p className="text-muted-foreground">Create one post and publish it everywhere instantly.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Content</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Media</Label>
                  <div className="flex gap-3">
                    <Button variant={mediaType === "image" ? "default" : "outline"} onClick={() => setMediaType("image")} className="flex-1"><Image className="h-4 w-4 mr-2" />Image</Button>
                    <Button variant={mediaType === "video" ? "default" : "outline"} onClick={() => setMediaType("video")} className="flex-1"><Video className="h-4 w-4 mr-2" />Video</Button>
                  </div>
                  <div className="relative border-2 border-dashed rounded-xl p-20 text-center hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                    </div>
                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer h-full w-full" onChange={handleFileChange} disabled={uploading} />
                  </div>
                  {mediaFile && (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {mediaType === 'image' ? <Image className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
                        <p className="text-sm font-medium truncate">{mediaFile.name}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setMediaFile(null)}>
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea id="caption" placeholder="Write your post caption here..." value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} />
                </div>

                <div className="space-y-2">
                  <Label>Publish to:</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {PLATFORMS.map(platform => {
                      const isConnected = connectedPlatforms.includes(platform.id);
                      return (
                        <div key={platform.id} className={`flex items-center space-x-2 p-3 rounded-lg border ${isConnected ? 'bg-secondary/30' : 'opacity-50 grayscale'}`}>
                          <Checkbox
                            id={`p-${platform.id}`}
                            disabled={!isConnected}
                            checked={selectedPlatforms.includes(platform.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedPlatforms(prev => [...prev, platform.id]);
                              else setSelectedPlatforms(prev => prev.filter(p => p !== platform.id));
                            }}
                          />
                          <Label htmlFor={`p-${platform.id}`} className="flex items-center gap-2 cursor-pointer">
                            <platform.icon className="h-4 w-4" />
                            {platform.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  {connectedPlatforms.length === 0 && (
                    <p className="text-xs text-amber-500">No accounts connected. Go to Settings to connect.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")} disabled={isSubmitting || isPublishing}>Cancel</Button>
              <Button onClick={handleAdapt} variant="secondary" disabled={isSubmitting || isPublishing}>
                <Sparkles className="h-4 w-4 mr-2" /> Save & Adapt
              </Button>
              <Button onClick={handlePublish} className="gap-2" disabled={isSubmitting || isPublishing || selectedPlatforms.length === 0}>
                {isPublishing ? 'Publishing...' : <><Send className="h-4 w-4" /> Publish Now</>}
              </Button>
            </div>
          </div>

          <Card variant="gradient" className="h-fit">
            <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {PLATFORMS.filter(p => selectedPlatforms.includes(p.id)).map((platform) => (
                <div key={platform.id} className="rounded-lg border bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded ${platform.color} flex items-center justify-center`}>
                      <platform.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                    {mediaFile && mediaType === 'image' ? <img src={URL.createObjectURL(mediaFile)} className="w-full h-full object-cover" /> : <Image className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{caption || "Preview..."}</p>
                </div>
              ))}
              {selectedPlatforms.length === 0 && <p className="text-center text-muted-foreground py-8">Select platforms to see previews</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
