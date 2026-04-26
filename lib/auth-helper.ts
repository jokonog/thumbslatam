import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verificarAuth(request: NextRequest | Request): Promise<{ userId: string; email: string } | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return { userId: user.id, email: user.email || "" };
  } catch {
    return null;
  }
}
