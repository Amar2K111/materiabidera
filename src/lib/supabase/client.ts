"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/env";

/** Client Supabase navigateur. Utilise exclusivement la cle anonyme. */
export function createClient() {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
