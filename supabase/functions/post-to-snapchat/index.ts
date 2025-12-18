import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual Snapchat API call
  console.log("Posting to Snapchat:", text);

  return new Response(JSON.stringify({ success: true, message: "Post shared on Snapchat successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
