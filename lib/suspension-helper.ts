import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verificarSuspension(userId: string): Promise<{ suspendido: boolean; hasta?: string }> {
  const { data } = await supabaseAdmin
    .from("usuarios")
    .select("suspendido_hasta")
    .eq("id", userId)
    .single();
  
  if (!data?.suspendido_hasta) return { suspendido: false };
  
  const hasta = new Date(data.suspendido_hasta);
  if (hasta > new Date()) {
    return { suspendido: true, hasta: data.suspendido_hasta };
  }
  
  // Limpiar suspensión expirada
  await supabaseAdmin
    .from("usuarios")
    .update({ suspendido_hasta: null, intentos_prohibidos: 0 })
    .eq("id", userId);
  
  return { suspendido: false };
}

export async function registrarIntentoProhibido(userId: string): Promise<{ suspendido: boolean }> {
  const { data } = await supabaseAdmin
    .from("usuarios")
    .select("intentos_prohibidos")
    .eq("id", userId)
    .single();
  
  const intentos = (data?.intentos_prohibidos || 0) + 1;
  
  if (intentos >= 3) {
    const suspendido_hasta = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("usuarios")
      .update({ intentos_prohibidos: intentos, suspendido_hasta })
      .eq("id", userId);
    return { suspendido: true };
  }
  
  await supabaseAdmin
    .from("usuarios")
    .update({ intentos_prohibidos: intentos })
    .eq("id", userId);
  
  return { suspendido: false };
}
