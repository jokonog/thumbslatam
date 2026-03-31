import { NextResponse } from "next/server";
import * as otplib from "otplib";
const authenticator = otplib.authenticator || (otplib as any).default?.authenticator || (otplib as any).totp;
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password, totp } = await request.json();

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    if (totp) {
      const valid = authenticator.verify({
        token: totp,
        secret: process.env.ADMIN_TOTP_SECRET!,
      });
      if (!valid) {
        return NextResponse.json({ error: "Codigo 2FA incorrecto" }, { status: 401 });
      }

      const cookieStore = await cookies();
      const res = NextResponse.json({ ok: true, step: "done" });
      res.cookies.set("admin-session", process.env.ADMIN_TOTP_SECRET!, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 8, // 8 horas
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ ok: true, step: "totp" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
