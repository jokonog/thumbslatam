"use client";
import Logo from "@/components/Logo";
import { useState } from "react";
import Link from "next/link";

const secciones = ["FAQ", "Terminos", "Privacidad", "Soporte"];

const faqs = [
  {
    q: "¿Que es ThumbsLatam?",
    a: "ThumbsLatam es una plataforma de inteligencia artificial que genera miniaturas cinematograficas personalizadas para YouTube y redes sociales. Puedes crear imagenes con fondos epicos o con tu propia cara integrada en la escena.",
  },
  {
    q: "¿Como funcionan los creditos?",
    a: "Cada generacion consume creditos segun el tipo: Solo fondo consume 4 creditos (incluye 2 variaciones) y Con mi cara consume 5 creditos. Los creditos del plan gratuito son unicos al registrarte. Los creditos de planes pagos se renuevan cada mes.",
  },
  {
    q: "¿Los creditos se acumulan mes a mes?",
    a: "No. Los creditos se renuevan al inicio de cada ciclo mensual. Los creditos no utilizados del mes anterior no se transfieren al siguiente.",
  },
  {
    q: "¿Puedo usar las imagenes generadas comercialmente?",
    a: "Si. Las imagenes que generates con ThumbsLatam son tuyas y puedes usarlas libremente en tus canales, redes sociales, proyectos comerciales y cualquier otro uso.",
  },
  {
    q: "¿Como funciona el flujo Con mi cara?",
    a: "Subes una foto de perfil (avatar), describes la escena que quieres, y nuestra IA coloca tu rostro en esa escena de forma cinematografica. El proceso toma entre 30 y 60 segundos.",
  },
  {
    q: "¿Mis fotos estan seguras?",
    a: "Si. Tu avatar se almacena de forma segura y solo se usa para generar tus propias imagenes. No compartimos tu foto con terceros ni la usamos para entrenar modelos de IA.",
  },
  {
    q: "¿Que pasa si la imagen generada no me gusta?",
    a: "Puedes generar nuevamente con el mismo o diferente prompt. Cada generacion consume creditos, por lo que te recomendamos describir bien la escena antes de generar.",
  },
  {
    q: "¿En que formato se descargan las imagenes?",
    a: "Las imagenes se descargan en formato JPG de alta resolucion, listas para usar como miniatura en YouTube u otras plataformas.",
  },
  {
    q: "¿Puedo cancelar mi plan en cualquier momento?",
    a: "Si. Puedes cancelar tu suscripcion cuando quieras. Seguiras teniendo acceso a tus creditos hasta el final del periodo pagado.",
  },
  {
    q: "¿Como contacto al soporte?",
    a: "Puedes escribirnos a soporte@thumbslatam.com. Respondemos en un plazo de 24 a 48 horas habiles.",
  },
];

export default function LegalPage() {
  const [activa, setActiva] = useState("FAQ");
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">
          ← Volver al dashboard
        </Link>
        <Logo height={26} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Titulo */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Centro de ayuda</h1>
          <p className="text-white/50 text-sm">Todo lo que necesitas saber sobre ThumbsLatam</p>
        </div>

        {/* Navegacion por tabs */}
        <div className="flex gap-1 mb-10 bg-white/5 rounded-xl p-1 w-fit">
          {secciones.map((s) => (
            <button
              key={s}
              onClick={() => setActiva(s)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activa === s
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activa === "FAQ" && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-6">Preguntas frecuentes</h2>
            {faqs.map((item, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <span className="text-white/40 text-lg ml-4">
                    {faqAbierta === i ? "−" : "+"}
                  </span>
                </button>
                {faqAbierta === i && (
                  <div className="px-5 pb-4 text-sm text-white/60 leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Terminos */}
        {activa === "Terminos" && (
          <div className="space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-semibold text-white mb-6">Terminos y condiciones</h2>
            <p className="text-white/40 text-xs">Ultima actualizacion: marzo 2025</p>

            <section>
              <h3 className="text-white font-medium mb-2">1. Aceptacion de los terminos</h3>
              <p>Al registrarte y usar ThumbsLatam aceptas estos terminos en su totalidad. Si no estas de acuerdo con alguna parte, te pedimos que no uses el servicio.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">2. Descripcion del servicio</h3>
              <p>ThumbsLatam es una plataforma SaaS que utiliza inteligencia artificial para generar imagenes tipo miniatura para YouTube y redes sociales. El servicio se ofrece mediante planes de suscripcion mensual y un plan gratuito con creditos limitados.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">3. Creditos y planes</h3>
              <p>Los creditos son la unidad de consumo del servicio. Se asignan segun el plan contratado y se renuevan mensualmente. Los creditos no utilizados no se acumulan ni se reembolsan. El plan gratuito otorga 10 creditos unicos al momento del registro.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">4. Propiedad de las imagenes generadas</h3>
              <p>Las imagenes que generas con ThumbsLatam son de tu propiedad y puedes usarlas libremente con fines personales y comerciales. ThumbsLatam no reclama derechos sobre las imagenes generadas por sus usuarios.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">5. Uso aceptable</h3>
              <p>Queda prohibido usar ThumbsLatam para generar contenido ilegal, ofensivo, discriminatorio, que infrinja derechos de terceros, o que promueva violencia. ThumbsLatam se reserva el derecho de suspender cuentas que violen esta politica.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">6. Cancelacion y reembolsos</h3>
              <p>Puedes cancelar tu suscripcion en cualquier momento. No se ofrecen reembolsos por periodos parciales. Al cancelar, mantendras acceso al servicio hasta el fin del periodo pagado.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">7. Limitacion de responsabilidad</h3>
              <p>ThumbsLatam no garantiza resultados especificos en las imagenes generadas. La calidad de los resultados depende de los prompts y configuraciones del usuario. El servicio se ofrece tal cual, sin garantias implicitas de ningun tipo.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">8. Modificaciones</h3>
              <p>ThumbsLatam puede modificar estos terminos en cualquier momento. Los cambios se notificaran por correo o mediante aviso en la plataforma. El uso continuado del servicio tras la notificacion implica la aceptacion de los nuevos terminos.</p>
            </section>
          </div>
        )}

        {/* Privacidad */}
        {activa === "Privacidad" && (
          <div className="space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-semibold text-white mb-6">Politica de privacidad</h2>
            <p className="text-white/40 text-xs">Ultima actualizacion: marzo 2025</p>

            <section>
              <h3 className="text-white font-medium mb-2">1. Datos que recopilamos</h3>
              <p>Recopilamos unicamente los datos necesarios para operar el servicio: correo electronico, nombre de usuario, foto de perfil (avatar) y los prompts que ingresas para generar imagenes.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">2. Como usamos tus datos</h3>
              <p>Tus datos se usan exclusivamente para: autenticar tu sesion, procesar tus generaciones de imagenes, gestionar tu cuenta y creditos, y enviarte comunicaciones relacionadas con el servicio.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">3. Tu foto de perfil (avatar)</h3>
              <p>La foto que subes como avatar se almacena de forma segura en nuestros servidores y se usa unicamente para generar tus imagenes. No la compartimos con terceros, no la usamos para entrenar modelos de IA, y puedes eliminarla en cualquier momento desde tu perfil.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">4. Imagenes generadas</h3>
              <p>Las imagenes que generates se almacenan en nuestros servidores para que puedas acceder a tu galeria. No las compartimos publicamente ni con terceros. Puedes eliminarlas desde tu galeria cuando quieras.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">5. Servicios de terceros</h3>
              <p>ThumbsLatam utiliza servicios externos para operar: Supabase para autenticacion y base de datos, Cloudinary para almacenamiento de imagenes, y Replicate para procesamiento de IA. Estos servicios tienen sus propias politicas de privacidad.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">6. Cookies</h3>
              <p>Usamos cookies unicamente para mantener tu sesion activa. No usamos cookies de rastreo publicitario ni compartimos datos de navegacion con terceros.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">7. Tus derechos</h3>
              <p>Tienes derecho a acceder, corregir o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos escribe a soporte@thumbslatam.com.</p>
            </section>

            <section>
              <h3 className="text-white font-medium mb-2">8. Seguridad</h3>
              <p>Implementamos medidas de seguridad estandar de la industria para proteger tu informacion. Sin embargo, ningun sistema es 100% seguro. Te recomendamos usar una contrasena segura y no compartir tu cuenta.</p>
            </section>
          </div>
        )}

        {/* Soporte */}
        {activa === "Soporte" && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6">Soporte</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                  ✉️
                </div>
                <div>
                  <h3 className="font-medium mb-1">Correo electronico</h3>
                  <p className="text-white/50 text-sm mb-3">Respondemos en un plazo de 24 a 48 horas habiles.</p>
                  <a
                    href="mailto:soporte@thumbslatam.com"
                    className="inline-block bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    soporte@thumbslatam.com
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-white/80">Antes de escribirnos, revisa esto:</h3>
              <div className="space-y-3">
                {[
                  { icono: "💳", texto: "Problemas con creditos: verifica tu plan activo en el dashboard" },
                  { icono: "🖼️", texto: "Imagen de baja calidad: intenta con un prompt mas detallado" },
                  { icono: "👤", texto: "Cara no reconocida: sube una foto con buena iluminacion y rostro visible" },
                  { icono: "🔄", texto: "Error al generar: espera unos segundos y vuelve a intentarlo" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/60 bg-white/5 rounded-xl px-4 py-3">
                    <span>{item.icono}</span>
                    <span>{item.texto}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 text-xs text-white/30">
              ThumbsLatam — Santo Domingo, Republica Dominicana
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
