// @ts-nocheck
import { serve } from "http/server";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { OpenAI } from "https://esm.sh/openai@4.24.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { master_post_content, target_platform, tone, objective } = await req.json()

    if (!master_post_content || !target_platform) {
      throw new Error('Missing required fields')
    }

    // Initialize OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Construct the prompt
    const prompt = `
      You are an expert social media manager.
      Adapt the following content for ${target_platform}.
      
      Original Content: "${master_post_content}"
      
      Requirements:
      - Tone: ${tone || 'professional'}
      - Objective: ${objective || 'engagement'}
      
      Output strictly in JSON format with the following structure:
      {
        "caption": "The adapted caption...",
        "hashtags": ["#tag1", "#tag2"],
        "posting_time": "Best time to post (e.g., 'Tuesday 10AM EST')"
      }
    `

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }
    
    const result = JSON.parse(content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
