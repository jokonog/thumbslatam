import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { tipo, email, nombre } = await request.json();

    let subject = "";
    let html = "";

    if (tipo === "bienvenida") {
      subject = "Bienvenido a ThumbsLatam — tus 10 creditos te esperan";
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060810;color:white;padding:32px;border-radius:12px">
          <img src="https://www.thumbslatam.com/logo.png" alt="ThumbsLatam" style="height:36px;margin-bottom:24px"/>
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px">Bienvenido a ThumbsLatam 🎉</h1>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 20px">
            Tu cuenta esta lista. Te hemos cargado <strong style="color:#FF4D00">10 creditos gratis</strong> para que empieces a crear miniaturas cinematograficas ahora mismo.
          </p>
          <a href="https://www.thumbslatam.com/dashboard" style="display:inline-block;padding:12px 24px;background:#FF4D00;color:white;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.95rem">
            Ir al dashboard →
          </a>
          <p style="color:#3A3D52;font-size:0.78rem;margin-top:32px">ThumbsLatam — Miniaturas para streamers latinos</p>
        </div>
      `;
    }

    if (tipo === "creditos_bajos") {
      subject = "Te quedan pocos creditos en ThumbsLatam";
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060810;color:white;padding:32px;border-radius:12px">
          <img src="https://www.thumbslatam.com/logo.png" alt="ThumbsLatam" style="height:36px;margin-bottom:24px"/>
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px">Te quedan menos de 5 creditos ⚡</h1>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 20px">
            No te quedes sin poder crear miniaturas. Mejora tu plan y sigue generando contenido cinematografico sin limites.
          </p>
          <a href="https://www.thumbslatam.com/#pricing" style="display:inline-block;padding:12px 24px;background:#FF4D00;color:white;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.95rem">
            Ver planes →
          </a>
          <p style="color:#3A3D52;font-size:0.78rem;margin-top:32px">ThumbsLatam — Miniaturas para streamers latinos</p>
        </div>
      `;
    }

    if (tipo === "codigo_canjeado") {
      subject = "Codigo canjeado exitosamente en ThumbsLatam";
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060810;color:white;padding:32px;border-radius:12px">
          <img src="https://www.thumbslatam.com/logo.png" alt="ThumbsLatam" style="height:36px;margin-bottom:24px"/>
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px">Codigo canjeado 🎁</h1>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 20px">
            Tu codigo de regalo fue canjeado exitosamente. Los creditos ya estan disponibles en tu cuenta.
          </p>
          <a href="https://www.thumbslatam.com/dashboard" style="display:inline-block;padding:12px 24px;background:#FF4D00;color:white;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.95rem">
            Ir al dashboard →
          </a>
          <p style="color:#3A3D52;font-size:0.78rem;margin-top:32px">ThumbsLatam — Miniaturas para streamers latinos</p>
        </div>
      `;
    }

    if (tipo === "nuevo_usuario_admin") {
      subject = `Nuevo usuario registrado: ${email}`;
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h2>Nuevo usuario en ThumbsLatam</h2>
          <p>Email: <strong>${email}</strong></p>
        </div>
      `;
    }

    if (!subject) return NextResponse.json({ error: "Tipo desconocido" }, { status: 400 });

    const { data, error } = await resend.emails.send({
      from: "ThumbsLatam <noreply@thumbslatam.com>",
      to: tipo === "nuevo_usuario_admin" ? "soporte@thumbslatam.com" : email,
      subject,
      html,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
