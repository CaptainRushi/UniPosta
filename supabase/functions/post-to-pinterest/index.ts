import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual Pinterest API call
  console.log("Posting to Pinterest:", text);

  return new Response(JSON.stringify({ success: true, message: "Post shared on Pinterest successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
