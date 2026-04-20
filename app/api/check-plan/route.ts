import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
        cookieOptions: {
          name: "thumbslatam-auth",
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ plan: null, loggedIn: false });
    }

    const { data: usuario, error } = await supabaseAdmin
      .from("usuarios")
      .select("plan")
      .eq("id", user.id)
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
