import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { tipo, email, nombre, codigo, mensaje } = await request.json();

    let subject = "";
    let html = "";

    if (tipo === "bienvenida") {
      subject = "Bienvenido a ThumbsLatam — tus 5 creditos te esperan";
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060810;color:white;padding:32px;border-radius:12px">
          <img src="https://www.thumbslatam.com/logo.png" alt="ThumbsLatam" style="height:36px;margin-bottom:24px"/>
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px">Bienvenido a ThumbsLatam 🎉</h1>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 20px">
            Tu cuenta esta lista. Te hemos cargado <strong style="color:#FF4D00">5 creditos gratis</strong> para que empieces a crear miniaturas cinematograficas ahora mismo.
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


    if (tipo === "invitacion_codigo") {
      subject = "Te ganaste acceso gratuito a ThumbsLatam 🎁";
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060810;color:white;padding:32px;border-radius:12px">
          <img src="https://www.thumbslatam.com/logo.png" alt="ThumbsLatam" style="height:36px;margin-bottom:24px"/>
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px">Hola ${nombre}, te lo ganaste 🏆</h1>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 16px">
            Notamos tu trabajo y quisimos reconocerlo. Te hemos reservado acceso <strong style="color:#FF4D00">completamente gratis</strong> a ThumbsLatam — la herramienta que están usando creadores en LatAm para generar miniaturas profesionales con IA.
          </p>
          <div style="background:#0D1020;border:1px solid #FF4D00;border-radius:10px;padding:20px;margin:0 0 24px;text-align:center">
            <p style="color:#8B8FA8;font-size:0.8rem;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em">Tu código exclusivo</p>
            <p style="font-size:1.6rem;font-weight:900;letter-spacing:0.15em;color:#FF4D00;margin:0">${codigo}</p>
          </div>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 24px;font-size:0.9rem">
            Crea miniaturas cinematográficas para tus streams y videos en segundos. Sin tarjeta de crédito, sin compromisos.
          </p>
          <a href="https://www.thumbslatam.com/registro" style="display:inline-block;padding:14px 28px;background:#FF4D00;color:white;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.95rem">
            Canjear mi código →
          </a>
          <div style="margin-top:24px;padding:16px;background:#0D1020;border-radius:8px;border-left:3px solid #3A3D52">
            <p style="color:#8B8FA8;font-size:0.82rem;margin:0 0 8px;line-height:1.6">
              <strong style="color:white">¿Eres nuevo en ThumbsLatam?</strong> Crea tu cuenta gratis en <a href="https://www.thumbslatam.com/registro" style="color:#FF4D00;text-decoration:none">thumbslatam.com/registro</a> e ingresa tu código al momento del registro.
            </p>
            <p style="color:#8B8FA8;font-size:0.82rem;margin:0;line-height:1.6">
              <strong style="color:white">¿Ya eres parte de la comunidad?</strong> Entra a tu dashboard y canjea tu código en el apartado de canje de créditos.
            </p>
          </div>
          <p style="color:#3A3D52;font-size:0.78rem;margin-top:32px">ThumbsLatam — Miniaturas para streamers latinos · <a href="https://www.thumbslatam.com" style="color:#3A3D52">thumbslatam.com</a></p>
        </div>
      `;
    }

    if (tipo === "encuesta") {
      subject = "Tu opinion nos importa — ThumbsLatam";
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060810;color:white;padding:32px;border-radius:12px">
          <img src="https://www.thumbslatam.com/logo.png" alt="ThumbsLatam" style="height:36px;margin-bottom:24px"/>
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px">Hola ${nombre}, ¿como va todo? 👋</h1>
          <p style="color:#8B8FA8;line-height:1.6;margin:0 0 20px">
            Llevamos un tiempo juntos y nos gustaria saber tu opinion. Toma 2 minutos y ayudanos a mejorar ThumbsLatam para ti y toda la comunidad.
          </p>
          <a href="https://www.thumbslatam.com/feedback?email=${email}" style="display:inline-block;padding:14px 28px;background:#FF4D00;color:white;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.95rem">
            Compartir mi opinion →
          </a>
          <p style="color:#8B8FA8;font-size:0.82rem;margin-top:24px;line-height:1.6">
            Son solo 5 preguntas rapidas. Tu feedback es lo que nos permite seguir mejorando.
          </p>
          <p style="color:#3A3D52;font-size:0.78rem;margin-top:32px">ThumbsLatam — Miniaturas para streamers latinos · <a href="https://www.thumbslatam.com" style="color:#3A3D52">thumbslatam.com</a></p>
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
      from: tipo === "invitacion_codigo" ? "ThumbsLatam <hola@thumbslatam.com>" : "ThumbsLatam <noreply@thumbslatam.com>",
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
