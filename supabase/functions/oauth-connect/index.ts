import { serve } from "http/server";

const CLIENT_IDS = {
    facebook: Deno.env.get("FACEBOOK_CLIENT_ID"),
    linkedin: Deno.env.get("LINKEDIN_CLIENT_ID"),
    twitter: Deno.env.get("TWITTER_CLIENT_ID"),
};

const REDIRECT_URI = Deno.env.get("OAUTH_REDIRECT_URI") || "http://localhost:8081/api/oauth-callback";

serve(async (req) => {
    const url = new URL(req.url);
    const platform = url.searchParams.get("platform");
    const userId = url.searchParams.get("user_id");

    if (!platform || !userId) {
        return new Response("Missing platform or user_id", { status: 400 });
    }

    let authUrl = "";

    switch (platform) {
        case "facebook":
            authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${CLIENT_IDS.facebook}&redirect_uri=${REDIRECT_URI}&state=${userId}:facebook&scope=pages_manage_posts,pages_read_engagement,instagram_content_publish,instagram_basic`;
            break;
        case "linkedin":
            authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_IDS.linkedin}&redirect_uri=${REDIRECT_URI}&state=${userId}:linkedin&scope=w_member_social`;
            break;
        case "twitter":
            authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_IDS.twitter}&redirect_uri=${REDIRECT_URI}&state=${userId}:twitter&scope=tweet.write%20users.read%20offline.access&code_challenge=challenge&code_challenge_method=plain`;
            break;
        default:
            return new Response("Unsupported platform", { status: 400 });
    }

    return Response.redirect(authUrl);
});
