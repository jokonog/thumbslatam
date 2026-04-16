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
    const email = formData.get("email") as string;
    const productPermalink = formData.get("product_permalink") as string;
    const saleTimestamp = formData.get("sale_timestamp") as string;

    if (!email || !saleTimestamp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const planKey = productPermalink?.includes("studio") ? "studio" : "pro";
    const creditos = creditosMap[planKey] || 300;

    const { data: usuario } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .single();

    if (usuario) {
      await supabaseAdmin
        .from("usuarios")
        .update({ plan: planKey, creditos })
        .eq("id", usuario.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
