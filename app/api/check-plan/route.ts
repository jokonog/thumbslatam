import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Buscar cookie de auth-token
    const authCookie = allCookies.find(c => c.name.includes("auth-token") && c.value.length > 10);

    if (!authCookie) {
      return NextResponse.json({ plan: null, loggedIn: false });
    }

    // Extraer el user_id del auth token de Supabase
    let userId: string | null = null;
    try {
      const tokenValue = authCookie.value;
      const decoded = tokenValue.startsWith("base64-")
        ? JSON.parse(Buffer.from(tokenValue.slice(7), "base64").toString())
        : JSON.parse(tokenValue);

      if (Array.isArray(decoded) && decoded[0]) {
        const jwtParts = decoded[0].split(".");
        if (jwtParts.length === 3) {
          const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString());
          userId = payload.sub;
        }
      }
    } catch (e) {
      return NextResponse.json({ plan: null, loggedIn: false });
    }

    if (!userId) {
      return NextResponse.json({ plan: null, loggedIn: false });
    }

    // Consultar plan en Supabase
    const { data: usuario, error } = await supabaseAdmin
      .from("usuarios")
      .select("plan")
      .eq("id", userId)
      .single();

    if (error || !usuario) {
      return NextResponse.json({ plan: "gratis", loggedIn: true });
    }

    return NextResponse.json({
      plan: usuario.plan || "gratis",
      loggedIn: true
    });
  } catch (error) {
    return NextResponse.json({ plan: null, loggedIn: false });
  }
}
