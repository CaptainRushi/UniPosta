import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual Instagram API call
  console.log("Posting to Instagram:", text);

  return new Response(JSON.stringify({ success: true, message: "Post shared on Instagram successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
