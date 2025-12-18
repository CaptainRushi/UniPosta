import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  const { table, social_network } = await req.json();

  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  for (const item of data) {
    const { data: socialData, error: socialError } = await supabase
      .from("social_posts")
      .insert([
        {
          social_network: social_network,
          content: item.content,
          schedule_date: item.schedule_date,
        },
      ]);

    if (socialError) {
      console.error(socialError);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
