// Basic encryption utility using Web Crypto API
// In a real production app, use a more robust library or a KMS

const ENCRYPTION_KEY = Deno.env.get("ENCRYPTION_KEY") || "default-secret-key-32-chars-long!!";

export async function encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const keyBuf = encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const key = await crypto.subtle.importKey(
        "raw",
        keyBuf,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedBase64: string): Promise<string> {
    const combined = new Uint8Array(
        atob(encryptedBase64)
            .split("")
            .map((c) => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const encoder = new TextEncoder();
    const keyBuf = encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const key = await crypto.subtle.importKey(
        "raw",
        keyBuf,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}
