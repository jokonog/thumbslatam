import { NextResponse } from "next/server";
import { TOTP } from "otplib";
import { cookies } from "next/headers";

const totp = new TOTP();

export async function POST(request: Request) {
  try {
    const { email, password, totp: totpCode } = await request.json();

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    if (totpCode) {
      const valid = totp.verify({
        token: totpCode,
        secret: process.env.ADMIN_TOTP_SECRET!,
      });
      if (!valid) {
        return NextResponse.json({ error: "Codigo 2FA incorrecto" }, { status: 401 });
      }
      const res = NextResponse.json({ ok: true, step: "done" });
      res.cookies.set("admin-session", process.env.ADMIN_TOTP_SECRET!, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 8,
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ ok: true, step: "totp" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
