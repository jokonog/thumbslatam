import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verificarAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session");
  return session?.value === process.env.ADMIN_SECRET;
}

export async function GET() {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { data } = await supabaseAdmin
    .from("codigos_regalo")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json({ codigos: data || [] });
}

export async function POST(request: Request) {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { codigo, creditos, creador_nombre } = await request.json();
  const { error } = await supabaseAdmin
    .from("codigos_regalo")
    .insert({ codigo, creditos, creador_nombre });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
