"use client";
import Logo from "@/components/Logo";
import { useState, useEffect } from "react";

const content = {
  es: {
    title: "Centro de ayuda",
    subtitle: "Todo lo que necesitas saber sobre ThumbsLatam",
    tabs: ["FAQ", "Terminos", "Privacidad", "Soporte"],
    faq_title: "Preguntas frecuentes",
    faqs: [
      { q: "Que es ThumbsLatam?", a: "ThumbsLatam es una plataforma de IA que genera miniaturas cinematograficas para YouTube y redes sociales." },
      { q: "Como funcionan los creditos?", a: "Solo fondo IA: 4 creditos, incluye 2 variaciones. Con mi cara: 5 creditos. Plan gratis: 5 creditos unicos al registrarte." },
      { q: "Cuantas miniaturas puedo generar?", a: "Plan Gratis: 5 creditos. Creador Pro ($10/mes, 300 creditos): ~75 fondos o 60 con cara. Studio ($25/mes, 1000 creditos): ~250 fondos o 200 con cara." },
      { q: "Los creditos se acumulan?", a: "Los creditos del plan gratis son unicos. Los de planes pagos se renuevan mensualmente. Los no utilizados no se acumulan." },
      { q: "Puedo usar las imagenes comercialmente?", a: "Si. Las imagenes que generas son tuyas y puedes usarlas libremente." },
      { q: "Como funciona Con mi cara?", a: "Subes una foto, describes la escena, y la IA coloca tu rostro cinematograficamente. Toma entre 30 y 120 segundos." },
      { q: "Mis fotos estan seguras?", a: "Si. Tu avatar se almacena de forma segura y solo se usa para generar tus imagenes. No lo compartimos con terceros." },
      { q: "Que pasa si la imagen no me gusta?", a: "Puedes generar nuevamente. Cada generacion consume creditos, por lo que te recomendamos describir bien la escena." },
      { q: "En que formato se descargan las imagenes?", a: "Las imagenes se descargan en PNG de alta resolucion." },
      { q: "Puedo cancelar mi plan?", a: "Si. Puedes cancelar cuando quieras y seguiras teniendo acceso hasta el final del periodo pagado." },
      { q: "Como contacto al soporte?", a: "Escribe a soporte@thumbslatam.com. Respondemos en 24 a 48 horas habiles." },
    ],
    terms_title: "Terminos y condiciones",
    terms_updated: "Ultima actualizacion: marzo 2025",
    terms: [
      { h: "1. Aceptacion de los terminos", p: "Al registrarte y usar ThumbsLatam aceptas estos terminos en su totalidad." },
      { h: "2. Descripcion del servicio", p: "ThumbsLatam es una plataforma SaaS que utiliza IA para generar imagenes tipo miniatura para YouTube y redes sociales." },
      { h: "3. Creditos y planes", p: "El plan gratuito otorga 5 creditos unicos al registro. Los planes pagos incluyen creditos que se renuevan mensualmente. Los creditos no utilizados no se acumulan ni se reembolsan." },
      { h: "4. Propiedad de las imagenes", p: "Las imagenes que generas son de tu propiedad y puedes usarlas con fines personales y comerciales." },
      { h: "5. Uso aceptable", p: "Queda prohibido generar contenido ilegal, ofensivo o que infrinja derechos de terceros. El usuario es el unico responsable del contenido que genera." },
      { h: "6. Cancelacion y reembolsos", p: "Puedes cancelar en cualquier momento. Ofrecemos reembolso completo dentro de los primeros 7 dias si no has usado creditos. Escribe a soporte@thumbslatam.com con asunto Solicitud de reembolso." },
      { h: "7. Limitacion de responsabilidad", p: "ThumbsLatam no garantiza resultados especificos. El servicio se ofrece tal cual, sin garantias implicitas." },
      { h: "8. Modificaciones", p: "ThumbsLatam puede modificar estos terminos en cualquier momento. Los cambios se notificaran por correo o aviso en la plataforma." },
    ],
    privacy_title: "Politica de privacidad",
    privacy_updated: "Ultima actualizacion: marzo 2025",
    privacy: [
      { h: "1. Datos que recopilamos", p: "Recopilamos: correo electronico, nombre de usuario, foto de perfil (avatar) y los prompts que ingresas." },
      { h: "2. Como usamos tus datos", p: "Tus datos se usan para autenticar tu sesion, procesar generaciones, gestionar tu cuenta y enviarte comunicaciones del servicio." },
      { h: "3. Tu foto de perfil", p: "La foto que subes se almacena de forma segura y se usa unicamente para generar tus imagenes. No la compartimos con terceros ni la usamos para entrenar modelos de IA." },
      { h: "4. Imagenes generadas", p: "Las imagenes se almacenan en nuestros servidores para tu galeria. No las compartimos con terceros. Puedes eliminarlas cuando quieras." },
      { h: "5. Servicios de terceros", p: "Usamos Supabase (auth y base de datos), Cloudinary (imagenes) y Replicate (IA). Cada uno tiene sus propias politicas de privacidad." },
      { h: "6. Cookies", p: "Usamos cookies unicamente para mantener tu sesion activa. No usamos cookies de rastreo publicitario." },
      { h: "7. Tus derechos", p: "Tienes derecho a acceder, corregir o eliminar tus datos personales escribiendo a soporte@thumbslatam.com." },
      { h: "8. Seguridad", p: "Implementamos medidas de seguridad estandar de la industria. Te recomendamos usar una contrasena segura y no compartir tu cuenta." },
    ],
    support_title: "Soporte",
    support_email_title: "Correo electronico",
    support_email_desc: "Respondemos en un plazo de 24 a 48 horas habiles.",
    support_tips_title: "Antes de escribirnos, revisa esto:",
    support_tips: [
      { icono: "💳", texto: "Problemas con creditos: verifica tu plan activo en el dashboard" },
      { icono: "🖼️", texto: "Imagen de baja calidad: intenta con un prompt mas detallado" },
      { icono: "👤", texto: "Cara no reconocida: sube una foto con buena iluminacion y rostro visible" },
      { icono: "🔄", texto: "Error al generar: espera unos segundos y vuelve a intentarlo" },
    ],
    footer: "ThumbsLatam — Santo Domingo, Republica Dominicana",
  },
  en: {
    title: "Help Center",
    subtitle: "Everything you need to know about ThumbsLatam",
    tabs: ["FAQ", "Terms", "Privacy", "Support"],
    faq_title: "Frequently asked questions",
    faqs: [
      { q: "What is ThumbsLatam?", a: "ThumbsLatam is an AI platform that generates cinematic thumbnails for YouTube and social media." },
      { q: "How do credits work?", a: "AI background only: 4 credits, includes 2 variations. With my face: 5 credits. Free plan: 5 unique credits when you sign up." },
      { q: "How many thumbnails can I generate?", a: "Free Plan: 5 credits. Creator Pro ($10/month, 300 credits): ~75 backgrounds or 60 with face. Studio ($25/month, 1000 credits): ~250 backgrounds or 200 with face." },
      { q: "Do credits accumulate?", a: "Free plan credits are unique. Paid plan credits renew monthly. Unused credits do not accumulate." },
      { q: "Can I use images commercially?", a: "Yes. The images you generate are yours and you can use them freely." },
      { q: "How does With my face work?", a: "You upload a photo, describe the scene, and AI places your face cinematically. Takes between 30 and 120 seconds." },
      { q: "Are my photos safe?", a: "Yes. Your avatar is stored securely and only used to generate your images. We do not share it with third parties." },
      { q: "What if I do not like the image?", a: "You can generate again. Each generation consumes credits, so we recommend describing the scene well." },
      { q: "In what format are images downloaded?", a: "Images are downloaded in high resolution PNG." },
      { q: "Can I cancel my plan?", a: "Yes. You can cancel whenever you want and will keep access until the end of the paid period." },
      { q: "How do I contact support?", a: "Write to soporte@thumbslatam.com. We respond within 24 to 48 business hours." },
    ],
    terms_title: "Terms and Conditions",
    terms_updated: "Last updated: March 2025",
    terms: [
      { h: "1. Acceptance of terms", p: "By registering and using ThumbsLatam you accept these terms in their entirety." },
      { h: "2. Service description", p: "ThumbsLatam is a SaaS platform that uses AI to generate thumbnail images for YouTube and social media." },
      { h: "3. Credits and plans", p: "The free plan grants 5 unique credits at registration. Paid plans include credits that renew monthly. Unused credits do not accumulate or are refunded." },
      { h: "4. Ownership of images", p: "The images you generate are your property and you can use them for personal and commercial purposes." },
      { h: "5. Acceptable use", p: "It is prohibited to generate illegal, offensive content or content that infringes third party rights. The user is solely responsible for the content they generate." },
      { h: "6. Cancellation and refunds", p: "You can cancel at any time. We offer a full refund within the first 7 days if you have not used credits. Write to soporte@thumbslatam.com with subject Refund Request." },
      { h: "7. Limitation of liability", p: "ThumbsLatam does not guarantee specific results. The service is provided as is, without any implied warranties." },
      { h: "8. Modifications", p: "ThumbsLatam may modify these terms at any time. Changes will be notified by email or notice on the platform." },
    ],
    privacy_title: "Privacy Policy",
    privacy_updated: "Last updated: March 2025",
    privacy: [
      { h: "1. Data we collect", p: "We collect: email address, username, profile photo (avatar) and the prompts you enter." },
      { h: "2. How we use your data", p: "Your data is used to authenticate your session, process generations, manage your account and send you service communications." },
      { h: "3. Your profile photo", p: "The photo you upload is stored securely and used only to generate your images. We do not share it with third parties or use it to train AI models." },
      { h: "4. Generated images", p: "Images are stored on our servers for your gallery. We do not share them with third parties. You can delete them whenever you want." },
      { h: "5. Third party services", p: "We use Supabase (auth and database), Cloudinary (images) and Replicate (AI). Each has their own privacy policies." },
      { h: "6. Cookies", p: "We use cookies only to keep your session active. We do not use advertising tracking cookies." },
      { h: "7. Your rights", p: "You have the right to access, correct or delete your personal data by writing to soporte@thumbslatam.com." },
      { h: "8. Security", p: "We implement industry standard security measures. We recommend using a strong password and not sharing your account." },
    ],
    support_title: "Support",
    support_email_title: "Email",
    support_email_desc: "We respond within 24 to 48 business hours.",
    support_tips_title: "Before writing to us, check this:",
    support_tips: [
      { icono: "💳", texto: "Credit issues: check your active plan in the dashboard" },
      { icono: "🖼️", texto: "Low quality image: try with a more detailed prompt" },
      { icono: "👤", texto: "Face not recognized: upload a photo with good lighting and visible face" },
      { icono: "🔄", texto: "Generation error: wait a few seconds and try again" },
    ],
    footer: "ThumbsLatam — Santo Domingo, Dominican Republic",
  }
};

export default function LegalPage() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [activa, setActiva] = useState(0);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tl_lang");
    if (saved === "en") setLang("en");
  }, []);

  const toggleLang = (l: "es" | "en") => {
    setLang(l);
    localStorage.setItem("tl_lang", l);
    setActiva(0);
    setFaqAbierta(null);
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Logo height={26} href="/" />
        <div style={{display:"flex",gap:0,border:"1px solid rgba(255,255,255,0.2)",borderRadius:"6px",overflow:"hidden"}}>
          <button onClick={() => toggleLang("es")} style={{background:lang==="es"?"#FF4D00":"transparent",border:"none",color:lang==="es"?"white":"#8B8FA8",fontSize:"0.8rem",padding:"6px 12px",cursor:"pointer",fontWeight:600}}>ES</button>
          <span style={{width:"1px",background:"rgba(255,255,255,0.2)",display:"inline-block"}}></span>
          <button onClick={() => toggleLang("en")} style={{background:lang==="en"?"#FF4D00":"transparent",border:"none",color:lang==="en"?"white":"#8B8FA8",fontSize:"0.8rem",padding:"6px 12px",cursor:"pointer",fontWeight:600}}>EN</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-white/50 text-sm">{t.subtitle}</p>
        </div>

        <div className="flex gap-1 mb-10 bg-white/5 rounded-xl p-1 w-fit">
          {t.tabs.map((s, i) => (
            <button key={i} onClick={() => { setActiva(i); setFaqAbierta(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activa === i ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>

        {activa === 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-6">{t.faq_title}</h2>
            {t.faqs.map((item, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-white/5 transition-colors">
                  <span className="text-sm font-medium">{item.q}</span>
                  <span className="text-white/40 text-lg ml-4">{faqAbierta === i ? "−" : "+"}</span>
                </button>
                {faqAbierta === i && (
                  <div className="px-5 pb-4 text-sm text-white/60 leading-relaxed border-t border-white/5 pt-3">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {activa === 1 && (
          <div className="space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-semibold text-white mb-6">{t.terms_title}</h2>
            <p className="text-white/40 text-xs">{t.terms_updated}</p>
            {t.terms.map((s, i) => (
              <section key={i}>
                <h3 className="text-white font-medium mb-2">{s.h}</h3>
                <p>{s.p}</p>
              </section>
            ))}
          </div>
        )}

        {activa === 2 && (
          <div className="space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-semibold text-white mb-6">{t.privacy_title}</h2>
            <p className="text-white/40 text-xs">{t.privacy_updated}</p>
            {t.privacy.map((s, i) => (
              <section key={i}>
                <h3 className="text-white font-medium mb-2">{s.h}</h3>
                <p>{s.p}</p>
              </section>
            ))}
          </div>
        )}

        {activa === 3 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6">{t.support_title}</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">✉️</div>
                <div>
                  <h3 className="font-medium mb-1">{t.support_email_title}</h3>
                  <p className="text-white/50 text-sm mb-3">{t.support_email_desc}</p>
                  <a href="mailto:soporte@thumbslatam.com" className="inline-block bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
                    soporte@thumbslatam.com
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white/80">{t.support_tips_title}</h3>
              <div className="space-y-3">
                {t.support_tips.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/60 bg-white/5 rounded-xl px-4 py-3">
                    <span>{item.icono}</span>
                    <span>{item.texto}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 text-xs text-white/30">{t.footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
