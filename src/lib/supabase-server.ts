// lib/supabase-server.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseServerInstance: SupabaseClient | null = null;

function createSupabaseServer(): SupabaseClient | null {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // avoid throwing during module import; throw when actually attempting to use the client
        console.warn("Supabase environment variables are not set: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        return null;
    }

    return createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                persistSession: false
            }
        }
    );
}

function getSupabaseServer() {
    if (supabaseServerInstance) return supabaseServerInstance;
    const client = createSupabaseServer();
    if (!client) throw new Error("Supabase not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    supabaseServerInstance = client;
    return supabaseServerInstance;
}

export const supabaseServer = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabaseServer();
        const property = prop as keyof SupabaseClient;
        return client[property];
    }
});