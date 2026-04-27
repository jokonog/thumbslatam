"use server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Verificar que es una llamada autorizada de Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener todos los usuarios con plan pro o studio
    const { data: usuarios } = await supabaseAdmin
      .from("usuarios")
      .select("id, email, plan")
      .in("plan", ["pro", "studio"]);

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ ok: true, message: "No active subscribers" });
    }

    // Consultar suscripciones activas en Gumroad
    const response = await fetch(
      "https://api.gumroad.com/v2/subscribers?access_token=" + process.env.GUMROAD_ACCESS_TOKEN
    );
    const gumroadData = await response.json();
    const activeSubs = gumroadData.subscribers || [];
    const activeEmails = activeSubs
      .filter((s: any) => s.status === "alive")
      .map((s: any) => s.email.toLowerCase());

    let cancelados = 0;

    for (const usuario of usuarios) {
      const email = usuario.email.toLowerCase();
      if (!activeEmails.includes(email)) {
        // El usuario ya no tiene suscripción activa — bajar a gratis
        await supabaseAdmin
          .from("usuarios")
          .update({ plan: "gratis", creditos: 5, fecha_cancelacion: new Date().toISOString() })
          .eq("id", usuario.id);

        // Email de notificación
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "cancelacion", email: usuario.email }),
        }).catch(() => {});

        cancelados++;
      }
    }

    return NextResponse.json({ ok: true, cancelados, total: usuarios.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
