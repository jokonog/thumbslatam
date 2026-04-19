import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session");
  const autorizado = session?.value === process.env.ADMIN_SECRET;
  return NextResponse.json({ autorizado });
}
