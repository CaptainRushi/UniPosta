import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual LinkedIn API call
  console.log("Posting to LinkedIn:", text);

  return new Response(JSON.stringify({ success: true, message: "Post shared on LinkedIn successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
