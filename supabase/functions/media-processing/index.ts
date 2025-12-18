// @ts-nocheck
import { serve } from "http/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { storage_path } = await req.json()
    
    if (!storage_path) {
      throw new Error('Missing storage_path')
    }

    const projectUrl = Deno.env.get('SUPABASE_URL') ?? 'https://PLACEHOLDER_PROJECT_ID.supabase.co'
    
    // Construct URLs for different aspect ratios
    // These use Supabase Image Transformation syntax
    const baseUrl = `${projectUrl}/storage/v1/object/public/media/${storage_path}`
    
    const variants = {
      square: `${baseUrl}?width=1080&height=1080&resize=cover`, // 1:1
      portrait: `${baseUrl}?width=1080&height=1920&resize=cover`, // 9:16
      landscape: `${baseUrl}?width=1920&height=1080&resize=cover`, // 16:9
      original: baseUrl
    }

    return new Response(JSON.stringify(variants), {
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
