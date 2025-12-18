import { serve } from "http/server";

serve(async (req) => {
  const { audio } = await req.json();

  // TODO: Implement actual audio transcription API call
  console.log("Transcribing audio:", audio);

  return new Response(JSON.stringify({ success: true, message: "Audio transcription successful" }), {
    headers: { "Content-Type": "application/json" },
  });
});
