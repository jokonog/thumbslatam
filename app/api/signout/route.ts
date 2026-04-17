import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const res = NextResponse.json({ ok: true });
  allCookies.forEach(c => {
    res.cookies.set(c.name, "", { maxAge: 0, path: "/" });
  });
  return res;
}
