import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";

const hasEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasEnv) {
  // Warn once in dev but don't crash the app at import time
  console.warn(
    "Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Supabase features."
  );
}

// Provide a safe no-op fallback so imports won't crash when env is missing
const fallbackSupabase = {
  auth: {
    async getUser() {
      return { data: { user: null }, error: null } as const;
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } } as any;
    },
    async signInWithPassword() {
      return { data: null, error: { message: "Supabase not configured" } } as any;
    },
    async signOut() {
      return { data: null, error: null } as any;
    },
  },
} as const;

export const supabase = hasEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (fallbackSupabase as unknown as ReturnType<typeof createClient>);