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

export async function GET(request: Request) {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const buscar = searchParams.get("q") || "";

  const { data: usuarios } = await supabaseAdmin
    .from("usuarios")
    .select("id, email, creditos, plan, created_at, avatar_url")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

  const resultado = usuarios?.map(u => {
    const authUser = authUsers?.users?.find(a => a.id === u.id);
    return { ...u, email: authUser?.email || "—" };
  }).filter(u => 
    buscar ? u.email.toLowerCase().includes(buscar.toLowerCase()) : true
  );

  return NextResponse.json({ usuarios: resultado || [] });
}

export async function PATCH(request: Request) {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { userId, creditos, plan } = await request.json();
  const update: any = {};
  if (creditos !== undefined) update.creditos = creditos;
  if (plan !== undefined) update.plan = plan;

  const { error } = await supabaseAdmin
    .from("usuarios")
    .update(update)
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
