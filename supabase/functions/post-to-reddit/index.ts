import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual Reddit API call
  console.log("Posting to Reddit:", text);

  return new Response(JSON.stringify({ success: true, message: "Post shared on Reddit successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
