import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.event_type;

    if (eventType === "subscription.activated" || eventType === "transaction.completed") {
      const userId = body.data?.custom_data?.userId;
      const planKey = body.data?.custom_data?.plan || "pro";

      const creditosMap: Record<string, number> = {
        pro: 300,
        studio: 1000,
      };

      const creditos = creditosMap[planKey] || 300;

      if (userId) {
        await supabaseAdmin
          .from("usuarios")
          .update({ plan: planKey, creditos })
          .eq("id", userId);
      }
    }

    if (eventType === "subscription.canceled") {
      const userId = body.data?.custom_data?.userId;
      if (userId) {
        await supabaseAdmin
          .from("usuarios")
          .update({ plan: "gratis" })
          .eq("id", userId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
