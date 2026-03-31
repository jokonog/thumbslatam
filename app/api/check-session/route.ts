import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasSession = allCookies.some(c => c.name.includes("auth-token") && c.value.length > 10);
  return NextResponse.json({ loggedIn: hasSession });
}
