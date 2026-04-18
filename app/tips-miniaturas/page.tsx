"use client";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const translations = {
  es: {
    volverInicio: "Volver al inicio",
    guiaGratuita: "Guia gratuita",
    heroTitle1: "MINIATURAS QUE",
    heroTitle2: "GENERAN CLICS",
    heroDesc: "8 principios fundamentales respaldados por YouTube oficial y miles de canales LATAM que los aplican todos los dias.",
    badge1: "8 min de lectura",
    badge2: "Basado en datos oficiales",
    intro1Part1: "El ",
    intro1Strong: "CTR (Click-Through Rate)",
    intro1Part2: " es lo que decide si tu video despega o muere. YouTube puede mostrarte a 100,000 personas, pero si solo 1,000 hacen clic, el algoritmo lo interpreta como que tu contenido no interesa y deja de mostrarlo.",
    intro2Part1: "La miniatura es el ",
    intro2Strong: "80 por ciento de ese CTR",
    intro2Part2: ". El titulo es el 20 por ciento.",
    tipLabel: "TIP PRACTICO",
    ctaTag: "Contenido exclusivo Pro",
    ctaTitle1: "Quieres las tecnicas que usan",
    ctaTitle2: "los canales con mas de 100K suscriptores?",
    ctaDescPart1: "En nuestra ",
    ctaDescStrong: "Guia Avanzada",
    ctaDescPart2: " exclusiva para miembros Pro y Studio te ensenamos:",
    ctaItems: [
      "Psicologia del color por nicho",
      "Framework AIDA aplicado",
      "A/B testing que realmente funciona",
      "Benchmarks por categoria LATAM",
      "Prompts optimizados para ThumbsLatam",
      "Casos reales con numeros",
    ],
    btnPro: "Comenzar Pro - 10 USD/mes",
    btnStudio: "Ver plan Studio - 25 USD/mes",
    footerText: "ThumbsLatam - Miniaturas con IA para creadores latinoamericanos",
    footerInicio: "Inicio",
    footerDashboard: "Dashboard",
    footerLegal: "Legal",
    tips: [
      {
        titulo: "La regla de los 3 segundos",
        resumen: "Si no captas la atencion en 3 segundos, perdiste el clic.",
        contenido: "Los usuarios hacen scroll en YouTube a velocidad absurda. Tu miniatura tiene que comunicar UN mensaje claro que se entienda de un vistazo. Si alguien necesita estudiar tu miniatura para entenderla, ya perdiste.",
        tip: "Antes de publicar, ensena la miniatura a alguien durante 3 segundos y preguntale de que cree que trata el video. Si no lo adivina, redisena.",
      },
      {
        titulo: "Contraste brutal, no decoracion",
        resumen: "Los colores deben pelear entre si, no abrazarse.",
        contenido: "Las miniaturas compiten en un feed con decenas de otras. Colores tibios o armonicos se pierden. Necesitas contraste agresivo: fondos oscuros con elementos brillantes, o viceversa. El amarillo sobre azul oscuro sigue funcionando porque el ojo humano no puede ignorarlo.",
        tip: "Entrecierra los ojos viendo tu miniatura. Si los elementos importantes desaparecen, no hay suficiente contraste.",
      },
      {
        titulo: "Rostros humanos ganan siempre",
        resumen: "Las caras con emociones fuertes ganan siempre.",
        contenido: "Nuestro cerebro esta cableado para detectar caras antes que cualquier otro estimulo visual. Por eso los canales grandes casi siempre usan un rostro humano con expresion exagerada: sorpresa, miedo, alegria, indignacion. No tiene que ser tu cara, pero debe haber un rostro con emocion clara.",
        tip: "Si usas ThumbsLatam con referencia facial, exagera la emocion en la descripcion: cara de total sorpresa, expresion de horror, sonrisa victoriosa.",
      },
      {
        titulo: "Maximo 3 a 5 palabras de texto",
        resumen: "La miniatura no es el titulo. Es el gancho.",
        contenido: "Tu titulo ya esta debajo. La miniatura es para complementar, no repetir. Si metes mas de 5 palabras, nadie las lee en un telefono. Usa palabras con peso emocional: EPICO, PELIGROSO, NO LO CREI, POR FIN. Lo que genera curiosidad o urgencia.",
        tip: "Si tu texto de miniatura tiene articulos (el, la, los), probablemente sobran palabras.",
      },
      {
        titulo: "Coherencia con el titulo",
        resumen: "YouTube penaliza el desajuste de expectativas.",
        contenido: "Segun YouTube oficial, cuando la miniatura promete algo que el video no entrega, la retencion cae, y con ella tu alcance. El algoritmo mide viewer satisfaction y te deprioriza. El clickbait funciona una vez; la honestidad escala un canal.",
        tip: "Preguntate si un espectador que haga clic esperando esto va a quedarse satisfecho. Si la respuesta es no, cambia la miniatura o el video.",
      },
      {
        titulo: "Consistencia visual entre videos",
        resumen: "Tu canal debe verse como una marca, no como un collage.",
        contenido: "YouTube recomienda crear un estilo de titulo y miniatura consistente para que las audiencias reconozcan tu contenido al instante en el feed de sugeridos. Usa siempre los mismos 2 o 3 colores, la misma tipografia, el mismo tipo de composicion. La coherencia multiplica el CTR en videos sugeridos.",
        tip: "Mira las miniaturas de tus ultimos 10 videos juntas. Si no parecen del mismo canal, ahi esta tu problema.",
      },
      {
        titulo: "Piensa en movil, no en desktop",
        resumen: "El 70 por ciento de YouTube se ve en telefonos. Disena para eso.",
        contenido: "Una miniatura se ve a 320 por 180 pixeles en movil. Cualquier detalle menor a eso desaparece. Si tu miniatura tiene texto pequeno, bordes sutiles o expresiones faciales matizadas, en movil no se ven. Disena para el tamano mas pequeno primero.",
        tip: "Reduce tu miniatura al 20 por ciento de su tamano original. Si sigue siendo clara, funcionara en movil.",
      },
      {
        titulo: "Errores que matan tu CTR",
        resumen: "Lo que NO debes hacer, por experiencia de miles de canales.",
        contenido: "Demasiados elementos compitiendo por atencion. Texto largo que nadie lee. Fondos que son foto literal del video sin edicion. Colores que se mezclan con el fondo de YouTube como gris o blanco sucio. Flechas rojas y circulos amarillos exagerados que ya huelen a spam. Logos enormes que ocupan el centro.",
        tip: "Si tu miniatura tiene flechas rojas senalando algo, probablemente necesitas redisenarla. Eso funcionaba en 2015.",
      },
    ],
  },
  en: {
    volverInicio: "Back to home",
    guiaGratuita: "Free guide",
    heroTitle1: "THUMBNAILS THAT",
    heroTitle2: "GENERATE CLICKS",
    heroDesc: "8 fundamental principles backed by official YouTube and thousands of LATAM channels that apply them every day.",
    badge1: "8 min read",
    badge2: "Based on official data",
    intro1Part1: "The ",
    intro1Strong: "CTR (Click-Through Rate)",
    intro1Part2: " is what decides whether your video takes off or dies. YouTube can show you to 100,000 people, but if only 1,000 click, the algorithm interprets it as your content not being interesting and stops showing it.",
    intro2Part1: "The thumbnail is ",
    intro2Strong: "80 percent of that CTR",
    intro2Part2: ". The title is 20 percent.",
    tipLabel: "PRACTICAL TIP",
    ctaTag: "Exclusive Pro content",
    ctaTitle1: "Want the techniques used by",
    ctaTitle2: "channels with 100K+ subscribers?",
    ctaDescPart1: "In our ",
    ctaDescStrong: "Advanced Guide",
    ctaDescPart2: " exclusive for Pro and Studio members we teach:",
    ctaItems: [
      "Color psychology by niche",
      "AIDA Framework applied",
      "A/B testing that really works",
      "Benchmarks by LATAM category",
      "Optimized prompts for ThumbsLatam",
      "Real cases with numbers",
    ],
    btnPro: "Start Pro - 10 USD/month",
    btnStudio: "See Studio plan - 25 USD/month",
    footerText: "ThumbsLatam - AI thumbnails for Latin American creators",
    footerInicio: "Home",
    footerDashboard: "Dashboard",
    footerLegal: "Legal",
    tips: [
      {
        titulo: "The 3-second rule",
        resumen: "If you do not capture attention in 3 seconds, you lost the click.",
        contenido: "Users scroll YouTube at absurd speed. Your thumbnail must communicate ONE clear message that is understood at a glance. If someone needs to study your thumbnail to understand it, you already lost.",
        tip: "Before publishing, show the thumbnail to someone for 3 seconds and ask what they think the video is about. If they cannot guess, redesign.",
      },
      {
        titulo: "Brutal contrast, not decoration",
        resumen: "Colors should fight each other, not hug each other.",
        contenido: "Thumbnails compete in a feed with dozens of others. Lukewarm or harmonious colors get lost. You need aggressive contrast: dark backgrounds with bright elements, or vice versa. Yellow on dark blue still works because the human eye cannot ignore it.",
        tip: "Squint while looking at your thumbnail. If important elements disappear, there is not enough contrast.",
      },
      {
        titulo: "Human faces always win",
        resumen: "Faces with strong emotions always win.",
        contenido: "Our brain is wired to detect faces before any other visual stimulus. That is why big channels almost always use a human face with exaggerated expression: surprise, fear, joy, indignation. It does not have to be your face, but there must be a face with clear emotion.",
        tip: "If you use ThumbsLatam with face reference, exaggerate the emotion in the description: total surprise face, horror expression, victorious smile.",
      },
      {
        titulo: "Maximum 3 to 5 words of text",
        resumen: "The thumbnail is not the title. It is the hook.",
        contenido: "Your title is already below. The thumbnail is to complement, not repeat. If you put more than 5 words, no one reads them on a phone. Use words with emotional weight: EPIC, DANGEROUS, CANNOT BELIEVE IT, FINALLY. What generates curiosity or urgency.",
        tip: "If your thumbnail text has articles (the, a, an), you probably have extra words.",
      },
      {
        titulo: "Coherence with the title",
        resumen: "YouTube penalizes expectation mismatch.",
        contenido: "According to official YouTube, when the thumbnail promises something the video does not deliver, retention drops, and with it your reach. The algorithm measures viewer satisfaction and deprioritizes you. Clickbait works once; honesty scales a channel.",
        tip: "Ask yourself if a viewer clicking expecting this will be satisfied. If the answer is no, change the thumbnail or the video.",
      },
      {
        titulo: "Visual consistency between videos",
        resumen: "Your channel should look like a brand, not a collage.",
        contenido: "YouTube recommends creating a consistent title and thumbnail style so audiences instantly recognize your content in the suggested feed. Always use the same 2 or 3 colors, the same typography, the same type of composition. Consistency multiplies CTR in suggested videos.",
        tip: "Look at the thumbnails of your last 10 videos together. If they do not look like the same channel, there is your problem.",
      },
      {
        titulo: "Think mobile, not desktop",
        resumen: "70 percent of YouTube is watched on phones. Design for that.",
        contenido: "A thumbnail is seen at 320 by 180 pixels on mobile. Any detail smaller than that disappears. If your thumbnail has small text, subtle borders or nuanced facial expressions, they cannot be seen on mobile. Design for the smallest size first.",
        tip: "Reduce your thumbnail to 20 percent of its original size. If it is still clear, it will work on mobile.",
      },
      {
        titulo: "Mistakes that kill your CTR",
        resumen: "What NOT to do, based on experience from thousands of channels.",
        contenido: "Too many elements competing for attention. Long text that no one reads. Backgrounds that are literal video screenshots without editing. Colors that blend with YouTube background like gray or dirty white. Exaggerated red arrows and yellow circles that already smell like spam. Huge logos that take up the center.",
        tip: "If your thumbnail has red arrows pointing at something, you probably need to redesign it. That worked in 2015.",
      },
    ],
  },
};

const tipColors = ["#FF4D00", "#FFD60A", "#06D6A0", "#FF4D00", "#FFD60A", "#06D6A0", "#FF4D00", "#FFD60A"];

function TipCard({ tip, index, color, tipLabel }: { tip: { titulo: string; resumen: string; contenido: string; tip: string }; index: number; color: string; tipLabel: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;
  const numero = String(index + 1).padStart(2, "0");

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
        <div style={{ fontSize: "clamp(6rem, 18vw, 14rem)", fontWeight: 800, color: color, lineHeight: 0.8, letterSpacing: "-0.02em", textShadow: "0 0 80px " + color + "40", userSelect: "none", fontFamily: "'Syne', sans-serif" }}>
          {numero}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", border: "1px solid " + color + "30", borderRadius: "24px", padding: "2.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: color }} />
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: "#fff", marginBottom: "0.75rem", lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>
            {tip.titulo}
          </h2>
          <p style={{ fontSize: "1.1rem", color: color, fontWeight: 500, marginBottom: "1.5rem", fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>
            {tip.resumen}
          </p>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: "1.5rem", fontFamily: "'DM Sans', sans-serif" }}>
            {tip.contenido}
          </p>
          <div style={{ background: "rgba(0,0,0,0.4)", borderLeft: "3px solid " + color, padding: "1rem 1.25rem", borderRadius: "0 12px 12px 0" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, letterSpacing: "0.1em", marginBottom: "0.5rem", fontFamily: "'DM Sans', sans-serif" }}>
              {tipLabel}
            </div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
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
  const [hoverButton, setHoverButton] = useState<"pro" | "studio" | null>(null);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tl_lang");
    if (saved === "es" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeLang = (l: "es" | "en") => {
    setLang(l);
    localStorage.setItem("tl_lang", l);
  };

  const t = translations[lang];
  const proBg = hoverButton === "pro" ? "#FF4D00" : hoverButton === "studio" ? "transparent" : "#FF4D00";
  const proBorder = hoverButton === "studio" ? "1px solid rgba(255,255,255,0.3)" : "1px solid #FF4D00";
  const studioBg = hoverButton === "studio" ? "#FF4D00" : "transparent";
  const studioBorder = hoverButton === "studio" ? "1px solid #FF4D00" : "1px solid rgba(255,255,255,0.3)";

  if (!mounted) return null;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0A0E27 0%, #050816 100%)", position: "relative", overflow: "hidden", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,77,0,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "5%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", zIndex: 100 }}>
          <div style={{ width: scrollProgress + "%", height: "100%", background: "linear-gradient(90deg, #FF4D00, #FFD60A)", transition: "width 0.1s" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <header style={{ padding: "1.5rem clamp(1rem, 4vw, 3rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <Logo />
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 0, border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", overflow: "hidden" }}>
                <button onClick={() => changeLang("es")} style={{ background: lang === "es" ? "#FF4D00" : "transparent", border: "none", color: lang === "es" ? "white" : "#8B8FA8", fontSize: "0.8rem", padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  ES
                </button>
                <span style={{ width: "1px", background: "rgba(255,255,255,0.2)", display: "inline-block" }}></span>
                <button onClick={() => changeLang("en")} style={{ background: lang === "en" ? "#FF4D00" : "transparent", border: "none", color: lang === "en" ? "white" : "#8B8FA8", fontSize: "0.8rem", padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  EN
                </button>
              </div>
              <a href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                {t.volverInicio}
              </a>
            </div>
          </header>
          <section style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1.5rem", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
              {t.guiaGratuita}
            </div>
            <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 6rem)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em", marginBottom: "2rem", maxWidth: "100%", wordBreak: "break-word", fontFamily: "'Syne', sans-serif" }}>
              {t.heroTitle1}<br /><span style={{ color: "#FF4D00" }}>{t.heroTitle2}</span>
            </h1>
            <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.3rem)", color: "rgba(255,255,255,0.7)", maxWidth: "700px", lineHeight: 1.5, marginBottom: "3rem", fontFamily: "'DM Sans', sans-serif" }}>
              {t.heroDesc}
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ padding: "0.75rem 1.5rem", background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.3)", borderRadius: "999px", fontSize: "0.9rem", color: "#FF4D00", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {t.badge1}
              </div>
              <div style={{ padding: "0.75rem 1.5rem", background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: "999px", fontSize: "0.9rem", color: "#06D6A0", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {t.badge2}
              </div>
            </div>
          </section>
          <section style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)", color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>
              {t.intro1Part1}<strong style={{ color: "#FF4D00", fontWeight: 700 }}>{t.intro1Strong}</strong>{t.intro1Part2}
            </p>
            <p style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)", color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginTop: "1.5rem", fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>
              {t.intro2Part1}<strong style={{ color: "#FFD60A", fontWeight: 700 }}>{t.intro2Strong}</strong>{t.intro2Part2}
            </p>
          </section>
          <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem" }}>
            {t.tips.map((tip, i) => (<TipCard key={i} tip={tip} index={i} color={tipColors[i]} tipLabel={t.tipLabel} />))}
          </section>
          <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "6rem 2rem" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.15) 0%, rgba(255,214,10,0.05) 100%)", border: "1px solid rgba(255,77,0,0.3)", borderRadius: "32px", padding: "clamp(2rem, 5vw, 5rem)", position: "relative", overflow: "hidden", textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1.5rem", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                {t.ctaTag}
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1, marginBottom: "1.5rem", fontFamily: "'Syne', sans-serif" }}>
                {t.ctaTitle1}<br /><span style={{ color: "#FF4D00" }}>{t.ctaTitle2}</span>
              </h2>
              <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "rgba(255,255,255,0.7)", maxWidth: "700px", margin: "0 auto 3rem", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                {t.ctaDescPart1}<strong style={{ color: "#fff" }}>{t.ctaDescStrong}</strong>{t.ctaDescPart2}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", maxWidth: "900px", margin: "0 auto 3rem" }}>
                {t.ctaItems.map((item, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1rem 1.25rem", fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/#pricing" onMouseEnter={() => setHoverButton("pro")} onMouseLeave={() => setHoverButton(null)} style={{ padding: "1rem 2rem", background: proBg, color: "#fff", border: proBorder, borderRadius: "999px", fontSize: "1rem", fontWeight: 700, textDecoration: "none", boxShadow: hoverButton === "pro" ? "0 8px 30px rgba(255,77,0,0.5)" : "0 8px 30px rgba(255,77,0,0.2)", transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}>
                  {t.btnPro}
                </a>
                <a href="/#pricing" onMouseEnter={() => setHoverButton("studio")} onMouseLeave={() => setHoverButton(null)} style={{ padding: "1rem 2rem", background: studioBg, color: "#fff", border: studioBorder, borderRadius: "999px", fontSize: "1rem", fontWeight: 700, textDecoration: "none", transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}>
                  {t.btnStudio}
                </a>
              </div>
            </div>
          </section>
          <footer style={{ padding: "3rem 2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif" }}>
            <p style={{ marginBottom: "0.5rem" }}>{t.footerText}</p>
            <p>
              <a href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", marginRight: "1.5rem" }}>{t.footerInicio}</a>
              <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", marginRight: "1.5rem" }}>{t.footerDashboard}</Link>
              <Link href="/legal" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t.footerLegal}</Link>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
