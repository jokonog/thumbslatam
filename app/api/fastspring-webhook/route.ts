import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events = body.events || [body];

    for (const event of events) {
      const type = event.type;

      if (type === "subscription.activated" || type === "subscription.charge.completed") {
        const email = event.data?.customer?.email;
        const productPath = event.data?.subscription?.product?.product;

        if (!email) continue;

        let creditos = 0;
        if (productPath?.includes("pro")) creditos = 300;
        if (productPath?.includes("studio")) creditos = 1000;

        const { data: usuario } = await supabaseAdmin
          .from("usuarios")
          .select("id")
          .eq("email", email)
          .single();

        if (usuario) {
          await supabaseAdmin
            .from("usuarios")
            .update({
              creditos: creditos,
              plan: productPath?.includes("studio") ? "studio" : "pro",
            })
            .eq("id", usuario.id);
        } else {
          await supabaseAdmin.from("usuarios").insert({
            email,
            creditos,
            plan: productPath?.includes("studio") ? "studio" : "pro",
          });
        }
      }

      if (type === "subscription.deactivated") {
        const email = event.data?.customer?.email;
        if (!email) continue;

        await supabaseAdmin
          .from("usuarios")
          .update({ plan: "free", creditos: 0 })
          .eq("email", email);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("FastSpring webhook error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}