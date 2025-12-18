import { serve } from "http/server";

serve(async (req) => {
  const { prompt } = await req.json();

  // TODO: Implement actual image generation API call
  console.log("Generating image with prompt:", prompt);

  return new Response(JSON.stringify({ success: true, message: "Image generation successful" }), {
    headers: { "Content-Type": "application/json" },
  });
});
