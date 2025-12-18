import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual TikTok API call
  console.log("Posting to TikTok:", text);

  return new Response(JSON.stringify({ success: true, message: "Post shared on TikTok successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
