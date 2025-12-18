import { serve } from "http/server";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encrypt } from "../_shared/encryption.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CLIENT_IDS = {
    facebook: Deno.env.get("FACEBOOK_CLIENT_ID"),
    linkedin: Deno.env.get("LINKEDIN_CLIENT_ID"),
    twitter: Deno.env.get("TWITTER_CLIENT_ID"),
};

const CLIENT_SECRETS = {
    facebook: Deno.env.get("FACEBOOK_CLIENT_SECRET"),
    linkedin: Deno.env.get("LINKEDIN_CLIENT_SECRET"),
    twitter: Deno.env.get("TWITTER_CLIENT_SECRET"),
};

const REDIRECT_URI = Deno.env.get("OAUTH_REDIRECT_URI") || "http://localhost:8081/api/oauth-callback";

serve(async (req) => {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Format: user_id:platform

    if (!code || !state) {
        return new Response("Missing code or state", { status: 400 });
    }

    const [userId, platform] = state.split(":");

    try {
        let tokenData;
        let accountId;
        let accountName;

        if (platform === "facebook") {
            // 1. Exchange code for access token
            const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${CLIENT_IDS.facebook}&redirect_uri=${REDIRECT_URI}&client_secret=${CLIENT_SECRETS.facebook}&code=${code}`);
            tokenData = await tokenRes.json();

            // 2. Get User Info
            const userRes = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}`);
            const userData = await userRes.json();
            accountId = userData.id;
            accountName = userData.name;
        } else if (platform === "linkedin") {
            // 1. Exchange code for access token
            const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: REDIRECT_URI,
                    client_id: CLIENT_IDS.linkedin!,
                    client_secret: CLIENT_SECRETS.linkedin!,
                }),
            });
            tokenData = await tokenRes.json();

            // 2. Get User Info
            const userRes = await fetch("https://api.linkedin.com/v2/me", {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const userData = await userRes.json();
            accountId = userData.id;
            accountName = `${userData.localizedFirstName} ${userData.localizedLastName}`;
        } else if (platform === "twitter") {
            // 1. Exchange code for access token
            const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${btoa(`${CLIENT_IDS.twitter}:${CLIENT_SECRETS.twitter}`)}`
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: REDIRECT_URI,
                    code_verifier: "challenge",
                }),
            });
            tokenData = await tokenRes.json();

            // 2. Get User Info
            const userRes = await fetch("https://api.twitter.com/2/users/me", {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const userData = await userRes.json();
            accountId = userData.data.id;
            accountName = userData.data.username;
        }

        if (!tokenData?.access_token) {
            throw new Error("Failed to obtain access token");
        }

        // 3. Encrypt tokens
        const encryptedAccess = await encrypt(tokenData.access_token);
        const encryptedRefresh = tokenData.refresh_token ? await encrypt(tokenData.refresh_token) : null;
        const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null;

        // 4. Store in Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error: dbError } = await supabase
            .from("social_accounts")
            .upsert({
                user_id: userId,
                platform,
                account_id: accountId,
                account_name: accountName,
                access_token: encryptedAccess,
                refresh_token: encryptedRefresh,
                expires_at: expiresAt,
            }, { onConflict: "user_id,platform,account_id" });

        if (dbError) throw dbError;

        // 5. Redirect back to frontend
        return Response.redirect(`${Deno.env.get("FRONTEND_URL") || "http://localhost:8081"}/dashboard?connected=${platform}`);

    } catch (error: any) {
        console.error("OAuth Callback Error:", error);
        return Response.redirect(`${Deno.env.get("FRONTEND_URL") || "http://localhost:8081"}/dashboard?error=${encodeURIComponent(error.message)}`);
    }
});
