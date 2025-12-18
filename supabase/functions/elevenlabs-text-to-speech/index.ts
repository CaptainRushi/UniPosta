import { serve } from "http/server";

serve(async (req) => {
  const { text } = await req.json();

  // TODO: Implement actual ElevenLabs API call
  console.log("Converting text to speech:", text);

  return new Response(JSON.stringify({ success: true, message: "Text-to-speech conversion successful" }), {
    headers: { "Content-Type": "application/json" },
  });
});
