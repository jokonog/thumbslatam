import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verificarSuspension(userId: string): Promise<{ suspendido: boolean; permanente?: boolean; hasta?: string }> {
  const { data } = await supabaseAdmin
    .from("usuarios")
    .select("suspendido_hasta, intentos_prohibidos")
    .eq("id", userId)
    .single();

  if (!data?.suspendido_hasta) return { suspendido: false };

  // Suspension permanente
  if (data.suspendido_hasta === "9999-12-31T23:59:59.000Z") {
    return { suspendido: true, permanente: true };
  }

  const hasta = new Date(data.suspendido_hasta);
  if (hasta > new Date()) {
    return { suspendido: true, hasta: data.suspendido_hasta };
  }

  // Limpiar suspension temporal expirada — NO resetear intentos
  await supabaseAdmin
    .from("usuarios")
    .update({ suspendido_hasta: null })
    .eq("id", userId);

  return { suspendido: false };
}

export async function registrarIntentoProhibido(userId: string): Promise<{ suspendido: boolean; permanente?: boolean }> {
  const { data } = await supabaseAdmin
    .from("usuarios")
    .select("intentos_prohibidos, suspendido_hasta")
    .eq("id", userId)
    .single();

  const intentos = (data?.intentos_prohibidos || 0) + 1;
  const tuveSuspension = data?.suspendido_hasta !== null;

  // Si ya tuvo suspension de 24h y reincide -> suspension permanente
  if (intentos >= 4 || (tuveSuspension && intentos >= 4)) {
    await supabaseAdmin
      .from("usuarios")
      .update({
        intentos_prohibidos: intentos,
        suspendido_hasta: "9999-12-31T23:59:59.000Z",
        plan: "gratis",
        creditos: 0,
      })
      .eq("id", userId);

    // Email de notificacion
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "suspension_permanente", email: data ? "" : "" }),
    }).catch(() => {});

    return { suspendido: true, permanente: true };
  }

  // 3er intento -> suspension 24h
  if (intentos === 3) {
    const suspendido_hasta = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("usuarios")
      .update({ intentos_prohibidos: intentos, suspendido_hasta })
      .eq("id", userId);
    return { suspendido: true, permanente: false };
  }

  // 1er y 2do intento -> solo advertencia
  await supabaseAdmin
    .from("usuarios")
    .update({ intentos_prohibidos: intentos })
    .eq("id", userId);

  return { suspendido: false };
}
