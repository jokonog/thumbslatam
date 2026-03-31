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

  // Total usuarios
  const { count: totalUsuarios } = await supabaseAdmin
    .from("usuarios")
    .select("*", { count: "exact", head: true });

  // Usuarios por plan
  const { data: porPlan } = await supabaseAdmin
    .from("usuarios")
    .select("plan");

  const planes = { gratis: 0, pro: 0, studio: 0 };
  porPlan?.forEach(u => {
    const p = u.plan?.toLowerCase();
    if (p === "pro") planes.pro++;
    else if (p === "studio") planes.studio++;
    else planes.gratis++;
  });

  // Total miniaturas
  const { count: totalMiniaturas } = await supabaseAdmin
    .from("miniatura")
    .select("*", { count: "exact", head: true });

  // Miniaturas esta semana
  const semanaAtras = new Date();
  semanaAtras.setDate(semanaAtras.getDate() - 7);
  const { count: miniaturasSemanales } = await supabaseAdmin
    .from("miniatura")
    .select("*", { count: "exact", head: true })
    .gte("created_at", semanaAtras.toISOString());

  // Usuarios esta semana
  const { count: usuariosSemanales } = await supabaseAdmin
    .from("usuarios")
    .select("*", { count: "exact", head: true })
    .gte("created_at", semanaAtras.toISOString());

  // Codigos canjeados
  const { count: codigosCanjeados } = await supabaseAdmin
    .from("codigos_regalo")
    .select("*", { count: "exact", head: true })
    .eq("usado", true);

  // Total codigos
  const { count: totalCodigos } = await supabaseAdmin
    .from("codigos_regalo")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    totalUsuarios,
    usuariosSemanales,
    totalMiniaturas,
    miniaturasSemanales,
    planes,
    codigosCanjeados,
    totalCodigos,
  });
}
