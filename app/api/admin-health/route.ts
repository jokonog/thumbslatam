import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verificarAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session");
  return session?.value === process.env.ADMIN_SECRET;
}

export async function GET() {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const checks = await Promise.allSettled([
    supabaseAdmin.from("usuarios").select("id").limit(1).then(() => ({ name: "Supabase", ok: true })),
    fetch("https://api.replicate.com/v1/models", {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` }
    }).then(r => ({ name: "Replicate", ok: r.ok })),
    fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image?max_results=1`, {
      headers: { Authorization: `Basic ${Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString("base64")}` }
    }).then(r => ({ name: "Cloudinary", ok: r.ok })),
    Promise.resolve({ name: "Resend", ok: !!process.env.RESEND_API_KEY }),
  ]);

  const results = checks.map((c, i) => {
    const names = ["Supabase", "Replicate", "Cloudinary", "Resend"];
    if (c.status === "fulfilled") return c.value;
    return { name: names[i], ok: false };
  });

  return NextResponse.json({ checks: results });
}
