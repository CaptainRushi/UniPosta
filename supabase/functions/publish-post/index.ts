// @ts-ignore
import { serve } from "http/server";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt, encrypt } from "../_shared/encryption.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    try {
        const { platform, text, media_url, user_id } = await req.json();

        if (!platform || !text || !user_id) {
            throw new Error("Missing required fields: platform, text, user_id");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Get the social account for this user and platform
        const { data: account, error: accountError } = await supabase
            .from("social_accounts")
            .select("*")
            .eq("user_id", user_id)
            .eq("platform", platform)
            .single();

        if (accountError || !account) {
            throw new Error(`No connected account found for platform: ${platform}`);
        }

        // 2. Check if token is expired and refresh if necessary
        let accessToken = await decrypt(account.access_token);

        if (account.expires_at && new Date(account.expires_at) < new Date()) {
            console.log(`Token expired for ${platform}, refreshing...`);
            const refreshedData = await refreshPlatformToken(platform, await decrypt(account.refresh_token));

            if (refreshedData) {
                accessToken = refreshedData.access_token;
                const encryptedAccess = await encrypt(refreshedData.access_token);
                const encryptedRefresh = refreshedData.refresh_token ? await encrypt(refreshedData.refresh_token) : account.refresh_token;
                const expiresAt = refreshedData.expires_in ? new Date(Date.now() + refreshedData.expires_in * 1000).toISOString() : null;

                await supabase
                    .from("social_accounts")
                    .update({
                        access_token: encryptedAccess,
                        refresh_token: encryptedRefresh,
                        expires_at: expiresAt,
                    })
                    .eq("id", account.id);
            }
        }

        // 3. Dispatch to platform-specific logic
        let result;
        switch (platform) {
            case "facebook":
                result = await postToFacebook(accessToken, account.account_id, text, media_url);
                break;
            case "instagram":
                result = await postToInstagram(accessToken, account.account_id, text, media_url);
                break;
            case "linkedin":
                result = await postToLinkedIn(accessToken, account.account_id, text, media_url);
                break;
            case "twitter":
                result = await postToTwitter(accessToken, text, media_url);
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        return new Response(JSON.stringify({ success: true, data: result }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });

    } catch (error: any) {
        console.error("Publishing Error:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
});

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
}

async function refreshPlatformToken(platform: string, refreshToken: string): Promise<TokenResponse | null> {
    // Implementation for token refresh logic for each platform
    // This would involve calling the platform's token endpoint with grant_type=refresh_token
    console.log(`Refreshing token for ${platform}`);
    return null; // Placeholder
}

async function postToFacebook(token: string, pageId: string, text: string, mediaUrl?: string) {
    console.log("Posting to FB...");
    return { platform: "facebook", status: "success" };
}

async function postToInstagram(token: string, igUserId: string, text: string, mediaUrl?: string) {
    console.log("Posting to IG...");
    return { platform: "instagram", status: "success" };
}

async function postToLinkedIn(token: string, personId: string, text: string, mediaUrl?: string) {
    console.log("Posting to LinkedIn...");
    return { platform: "linkedin", status: "success" };
}

async function postToTwitter(token: string, text: string, mediaUrl?: string) {
    console.log("Posting to Twitter...");
    return { platform: "twitter", status: "success" };
}
