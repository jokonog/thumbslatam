import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, codigo } = await request.json();

    // Buscar el codigo
    const { data: codigoData, error } = await supabaseAdmin
      .from("codigos_regalo")
      .select("*")
      .eq("codigo", codigo.toUpperCase().trim())
      .single();

    if (error || !codigoData) {
      return NextResponse.json({ error: "Codigo no valido" }, { status: 400 });
    }

    if (codigoData.usado) {
      return NextResponse.json({ error: "Este codigo ya fue canjeado" }, { status: 400 });
    }

    // Obtener creditos actuales del usuario
    const { data: usuarioData } = await supabaseAdmin
      .from("usuarios")
      .select("creditos")
      .eq("id", userId)
      .single();

    const creditosActuales = usuarioData?.creditos || 0;
    const nuevoTotal = creditosActuales + codigoData.creditos;

    // Actualizar creditos
    await supabaseAdmin
      .from("usuarios")
      .update({ creditos: nuevoTotal })
      .eq("id", userId);

    // Marcar codigo como usado
    await supabaseAdmin
      .from("codigos_regalo")
      .update({ usado: true, usado_por: userId, usado_at: new Date().toISOString() })
      .eq("id", codigoData.id);

    return NextResponse.json({ 
      ok: true, 
      creditos: codigoData.creditos,
      nuevoTotal 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
