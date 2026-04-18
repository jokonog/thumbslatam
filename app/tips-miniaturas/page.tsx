"use client";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const tips = [
  {
    numero: "01",
    titulo: "La regla de los 3 segundos",
    resumen: "Si no captas la atencion en 3 segundos, perdiste el clic.",
    contenido: "Los usuarios hacen scroll en YouTube a velocidad absurda. Tu miniatura tiene que comunicar UN mensaje claro que se entienda de un vistazo. Si alguien necesita estudiar tu miniatura para entenderla, ya perdiste.",
    tip: "Antes de publicar, ensena la miniatura a alguien durante 3 segundos y preguntale de que cree que trata el video. Si no lo adivina, redisena.",
    color: "#FF4D00",
  },
  {
    numero: "02",
    titulo: "Contraste brutal, no decoracion",
    resumen: "Los colores deben pelear entre si, no abrazarse.",
    contenido: "Las miniaturas compiten en un feed con decenas de otras. Colores tibios o armonicos se pierden. Necesitas contraste agresivo: fondos oscuros con elementos brillantes, o viceversa. El amarillo sobre azul oscuro sigue funcionando porque el ojo humano no puede ignorarlo.",
    tip: "Entrecierra los ojos viendo tu miniatura. Si los elementos importantes desaparecen, no hay suficiente contraste.",
    color: "#FFD60A",
  },
  {
    numero: "03",
    titulo: "Rostros humanos ganan siempre",
    resumen: "Las caras con emociones fuertes ganan siempre.",
    contenido: "Nuestro cerebro esta cableado para detectar caras antes que cualquier otro estimulo visual. Por eso los canales grandes casi siempre usan un rostro humano con expresion exagerada: sorpresa, miedo, alegria, indignacion. No tiene que ser tu cara, pero debe haber un rostro con emocion clara.",
    tip: "Si usas ThumbsLatam con referencia facial, exagera la emocion en la descripcion: cara de total sorpresa, expresion de horror, sonrisa victoriosa.",
    color: "#06D6A0",
  },
  {
    numero: "04",
    titulo: "Maximo 3 a 5 palabras de texto",
    resumen: "La miniatura no es el titulo. Es el gancho.",
    contenido: "Tu titulo ya esta debajo. La miniatura es para complementar, no repetir. Si metes mas de 5 palabras, nadie las lee en un telefono. Usa palabras con peso emocional: EPICO, PELIGROSO, NO LO CREI, POR FIN. Lo que genera curiosidad o urgencia.",
    tip: "Si tu texto de miniatura tiene articulos (el, la, los), probablemente sobran palabras.",
    color: "#FF4D00",
  },
  {
    numero: "05",
    titulo: "Coherencia con el titulo",
    resumen: "YouTube penaliza el desajuste de expectativas.",
    contenido: "Segun YouTube oficial, cuando la miniatura promete algo que el video no entrega, la retencion cae, y con ella tu alcance. El algoritmo mide viewer satisfaction y te deprioriza. El clickbait funciona una vez; la honestidad escala un canal.",
    tip: "Preguntate si un espectador que haga clic esperando esto va a quedarse satisfecho. Si la respuesta es no, cambia la miniatura o el video.",
    color: "#FFD60A",
  },
  {
    numero: "06",
    titulo: "Consistencia visual entre videos",
    resumen: "Tu canal debe verse como una marca, no como un collage.",
    contenido: "YouTube recomienda crear un estilo de titulo y miniatura consistente para que las audiencias reconozcan tu contenido al instante en el feed de sugeridos. Usa siempre los mismos 2 o 3 colores, la misma tipografia, el mismo tipo de composicion. La coherencia multiplica el CTR en videos sugeridos.",
    tip: "Mira las miniaturas de tus ultimos 10 videos juntas. Si no parecen del mismo canal, ahi esta tu problema.",
    color: "#06D6A0",
  },
  {
    numero: "07",
    titulo: "Piensa en movil, no en desktop",
    resumen: "El 70 por ciento de YouTube se ve en telefonos. Disena para eso.",
    contenido: "Una miniatura se ve a 320 por 180 pixeles en movil. Cualquier detalle menor a eso desaparece. Si tu miniatura tiene texto pequeno, bordes sutiles o expresiones faciales matizadas, en movil no se ven. Disena para el tamano mas pequeno primero.",
    tip: "Reduce tu miniatura al 20 por ciento de su tamano original. Si sigue siendo clara, funcionara en movil.",
    color: "#FF4D00",
  },
  {
    numero: "08",
    titulo: "Errores que matan tu CTR",
    resumen: "Lo que NO debes hacer, por experiencia de miles de canales.",
    contenido: "Demasiados elementos compitiendo por atencion. Texto largo que nadie lee. Fondos que son foto literal del video sin edicion. Colores que se mezclan con el fondo de YouTube como gris o blanco sucio. Flechas rojas y circulos amarillos exagerados que ya huelen a spam. Logos enormes que ocupan el centro.",
    tip: "Si tu miniatura tiene flechas rojas senalando algo, probablemente necesitas redisenarla. Eso funcionaba en 2015.",
    color: "#FFD60A",
  },
];

function TipCard({ tip, index }: { tip: typeof tips[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: isEven ? "row" : "row-reverse",
        gap: "3rem",
        alignItems: "center",
        marginBottom: "8rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(60px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
        flexWrap: "wrap",
      }}
      className="tip-card"
    >
      <div style={{ flex: "0 0 40%", position: "relative", minWidth: "280px" }}>
        <div
          style={{
            fontSize: "clamp(6rem, 18vw, 14rem)",
            fontWeight: 900,
            color: tip.color,
            lineHeight: 0.8,
            letterSpacing: "-0.02em",
            textShadow: "0 0 80px " + tip.color + "40",
            userSelect: "none",
          }}
        >
          {tip.numero}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: "280px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            border: "1px solid " + tip.color + "30",
            borderRadius: "24px",
            padding: "2.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              background: tip.color,
            }}
          />
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "0.75rem",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {tip.titulo}
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: tip.color,
              fontWeight: 600,
              marginBottom: "1.5rem",
              fontStyle: "italic",
            }}
          >
            {tip.resumen}
          </p>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
            }}
          >
            {tip.contenido}
          </p>
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              borderLeft: "3px solid " + tip.color,
              padding: "1rem 1.25rem",
              borderRadius: "0 12px 12px 0",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: tip.color,
                letterSpacing: "0.1em",
                marginBottom: "0.5rem",
              }}
            >
              TIP PRACTICO
            </div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
              {tip.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TipsMiniaturas() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0A0E27 0%, #050816 100%)",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(255,77,0,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "5%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background: "rgba(255,255,255,0.05)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: scrollProgress + "%",
            height: "100%",
            background: "linear-gradient(90deg, #FF4D00, #FFD60A)",
            transition: "width 0.1s",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          style={{
            padding: "2rem 3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <Logo />
          <Link
            href="/"
            style={{
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Volver al inicio
          </Link>
        </header>

        <section
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#FF4D00",
              letterSpacing: "0.2em",
              marginBottom: "1.5rem",
              textTransform: "uppercase",
            }}
          >
            Guia gratuita
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              marginBottom: "2rem",
              maxWidth: "1000px",
            }}
          >
            MINIATURAS QUE
            <br />
            <span style={{ color: "#FF4D00" }}>GENERAN CLICS</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "700px",
              lineHeight: 1.5,
              marginBottom: "3rem",
            }}
          >
            8 principios fundamentales respaldados por YouTube oficial y miles de canales LATAM que los aplican todos los dias.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: "0.75rem 1.5rem",
                background: "rgba(255,77,0,0.1)",
                border: "1px solid rgba(255,77,0,0.3)",
                borderRadius: "999px",
                fontSize: "0.9rem",
                color: "#FF4D00",
                fontWeight: 600,
              }}
            >
              8 min de lectura
            </div>
            <div
              style={{
                padding: "0.75rem 1.5rem",
                background: "rgba(6,214,160,0.1)",
                border: "1px solid rgba(6,214,160,0.3)",
                borderRadius: "999px",
                fontSize: "0.9rem",
                color: "#06D6A0",
                fontWeight: 600,
              }}
            >
              Basado en datos oficiales
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            El <strong style={{ color: "#FF4D00", fontWeight: 700 }}>CTR (Click-Through Rate)</strong> es lo que decide si tu video despega o muere. YouTube puede mostrarte a 100,000 personas, pero si solo 1,000 hacen clic, el algoritmo lo interpreta como que tu contenido no interesa y deja de mostrarlo.
          </p>
          <p
            style={{
              fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7,
              marginTop: "1.5rem",
              fontWeight: 300,
            }}
          >
            La miniatura es el <strong style={{ color: "#FFD60A", fontWeight: 700 }}>80 por ciento de ese CTR</strong>. El titulo es el 20 por ciento.
          </p>
        </section>

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "4rem 2rem",
          }}
        >
          {tips.map((tip, i) => (
            <TipCard key={i} tip={tip} index={i} />
          ))}
        </section>

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "6rem 2rem",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,77,0,0.15) 0%, rgba(255,214,10,0.05) 100%)",
              border: "1px solid rgba(255,77,0,0.3)",
              borderRadius: "32px",
              padding: "clamp(2rem, 5vw, 5rem)",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#FF4D00",
                letterSpacing: "0.2em",
                marginBottom: "1.5rem",
                textTransform: "uppercase",
              }}
            >
              Contenido exclusivo Pro
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}
            >
              Quieres las tecnicas que usan
              <br />
              <span style={{ color: "#FF4D00" }}>los canales con mas de 100K suscriptores?</span>
            </h2>
            <p
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                color: "rgba(255,255,255,0.7)",
                maxWidth: "700px",
                margin: "0 auto 3rem",
                lineHeight: 1.6,
              }}
            >
              En nuestra <strong style={{ color: "#fff" }}>Guia Avanzada</strong> exclusiva para miembros Pro y Studio te ensenamos:
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                maxWidth: "900px",
                margin: "0 auto 3rem",
              }}
            >
              {[
                "Psicologia del color por nicho",
                "Framework AIDA aplicado",
                "A/B testing que realmente funciona",
                "Benchmarks por categoria LATAM",
                "Prompts optimizados para ThumbsLatam",
                "Casos reales con numeros",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "1rem 1.25rem",
                    fontSize: "0.95rem",
                    color: "rgba(255,255,255,0.85)",
                    textAlign: "left",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              
              <a href="https://thumbslatam.gumroad.com/l/thumbslatam-pro"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "1rem 2rem",
                  background: "#FF4D00",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 8px 30px rgba(255,77,0,0.3)",
                }}
              >
                Comenzar Pro - 10 USD/mes
              </a>
              
              <a href="https://thumbslatam.gumroad.com/l/thumbslatam-studio"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "1rem 2rem",
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "999px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Ver plan Studio - 25 USD/mes
              </a>
            </div>
          </div>
        </section>

        <footer
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.9rem",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            ThumbsLatam - Miniaturas con IA para creadores latinoamericanos
          </p>
          <p>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", marginRight: "1.5rem" }}>
              Inicio
            </Link>
            <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", marginRight: "1.5rem" }}>
              Dashboard
            </Link>
            <Link href="/legal" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              Legal
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
