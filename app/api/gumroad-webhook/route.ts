import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const creditosMap: Record<string, number> = {
  pro: 300,
  studio: 1000,
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sellerId = formData.get("seller_id") as string;
    if (sellerId && process.env.GUMROAD_SELLER_ID && sellerId !== process.env.GUMROAD_SELLER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = formData.get("email") as string;
    const productPermalink = formData.get("product_permalink") as string;
    const saleTimestamp = formData.get("sale_timestamp") as string;
    const refunded = formData.get("refunded") as string;
    const subscriptionCancelled = formData.get("subscription_cancelled") as string;
    const subscriptionEnded = formData.get("subscription_ended") as string;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const { data: usuario } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .single();

    if (!usuario) return NextResponse.json({ ok: true });

    // Cancelación, fin de suscripción o reembolso — bajar a gratis
    if (subscriptionCancelled === "true" || subscriptionEnded === "true" || refunded === "true") {
      await supabaseAdmin
        .from("usuarios")
        .update({ plan: "gratis", creditos: 5 })
        .eq("id", usuario.id);

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "cancelacion", email }),
      }).catch(() => {});

      return NextResponse.json({ ok: true });
    }

    // Compra nueva o renovación
    if (!saleTimestamp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const planKey = productPermalink?.includes("studio") ? "studio" : "pro";
    const creditos = creditosMap[planKey] || 300;

    await supabaseAdmin
      .from("usuarios")
      .update({ plan: planKey, creditos })
      .eq("id", usuario.id);

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
