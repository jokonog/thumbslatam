"use client";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type Plan = "gratis" | "pro" | "studio" | null;

const translations = {
  es: {
    verificando: "Verificando tu plan...",
    badgePro: "Guia avanzada Pro",
    heroTitle1: "TECNICAS",
    heroTitle2: "PROFESIONALES",
    heroDesc: "12 principios avanzados usados por canales con mas de 100K suscriptores. Alineados con las politicas oficiales de YouTube y diseñados para resultados sostenibles a largo plazo.",
    volverDashboard: "Volver al dashboard",
    introParrafo1: "Esta guia no es sobre trucos ni clickbait.",
    introParrafo2: "Es sobre entender como piensa el algoritmo de YouTube en 2026 y disenar miniaturas que generen clics honestos, retencion alta y crecimiento compuesto.",
    introCaja: "Todo lo que leeras aqui esta alineado con las politicas oficiales de YouTube y con nuestros terminos de uso. Apostamos por herramientas que construyen canales sostenibles, no por tacticas de corto plazo que YouTube penaliza.",

    paywallTag: "Contenido exclusivo",
    paywallTitle: "Esta guia es solo para miembros Pro y Studio",
    paywallDesc: "12 tecnicas avanzadas con simuladores interactivos, infografias y ejemplos. Todo respaldado por datos oficiales de YouTube y miles de canales LATAM.",
    paywallIncluye: "Lo que incluye:",
    paywallItems: [
      "12 tecnicas profesionales con visuales detallados",
      "4 simuladores interactivos que calculan en tiempo real",
      "Framework AIDA aplicado a miniaturas",
      "Psicologia del color por nicho (gaming, beauty, tech, etc)",
      "Analisis del algoritmo YouTube 2026",
      "Benchmarks de CTR por categoria LATAM",
      "Checklist pre-publicacion de 7 puntos",
      "Prompts optimizados para ThumbsLatam",
      "+3 bonus exclusivos para miembros Studio",
    ],
    paywallBtnPro: "Suscribirme a Pro - $10/mes",
    paywallBtnStudio: "Suscribirme a Studio - $25/mes",
    paywallOrLogin: "¿Ya tienes plan Pro o Studio?",
    paywallLogin: "Inicia sesion",

    planBadgePro: "Plan Pro activo",
    planBadgeStudio: "Plan Studio activo",

    // Tecnica 01
    t01num: "01",
    t01categoria: "Fundamentos del algoritmo",
    t01titulo: "Como YouTube mide el exito",
    t01subtitulo: "No es solo el CTR. Es retencion + satisfaccion.",
    t01parrafo1: "El algoritmo de YouTube evalua dos señales en cada video: si lograste que hicieran clic (CTR) y si se quedaron viendo (retencion).",
    t01parrafo2: "Un CTR del 10 por ciento con retencion del 20 por ciento vale menos que un CTR del 5 por ciento con retencion del 60 por ciento. El algoritmo prioriza el segundo siempre.",
    t01simTitulo: "Simula el impacto real",
    t01simCtr: "Tu CTR",
    t01simRet: "Tu retencion",
    t01simImpr: "Impresiones mensuales",
    t01simResClicks: "Clicks generados",
    t01simResMin: "Minutos vistos totales",
    t01simResScore: "Score combinado",
    t01simResLabel: "El algoritmo premia retencion sobre CTR. Un 60 por ciento de retencion multiplica tu alcance futuro exponencialmente.",
    t01tipTitulo: "Tip accionable",
    t01tip: "Revisa tus ultimos 10 videos en YouTube Studio. Los que tienen retencion mayor a 50 por ciento son tu plantilla. Los que estan debajo del 30 por ciento son aviso de clickbait encubierto.",

    // Tecnica 02
    t02num: "02",
    t02categoria: "Fundamentos del algoritmo",
    t02titulo: "Las 3 fuentes de trafico",
    t02subtitulo: "Una miniatura para cada contexto.",
    t02parrafo1: "Los espectadores encuentran tu video de 3 formas principales: Busqueda (buscan algo especifico), Sugeridos (estaban viendo otro video parecido) y Home (estan navegando sin rumbo).",
    t02parrafo2: "Cada contexto requiere una estrategia visual diferente. La misma miniatura no puede ganar en los 3.",
    t02trafico1Titulo: "Busqueda",
    t02trafico1Desc: "El usuario ya sabe que quiere. Tu miniatura debe prometer la respuesta exacta. Texto directo, resultado claro.",
    t02trafico1Ejemplo: "Como hacer X en 2 minutos",
    t02trafico2Titulo: "Sugeridos",
    t02trafico2Desc: "El usuario ya vio algo parecido. Tu miniatura debe verse relacionada pero diferente. Consistencia + curiosidad.",
    t02trafico2Ejemplo: "Cara reconocible + nueva variacion",
    t02trafico3Titulo: "Home",
    t02trafico3Desc: "El usuario esta en piloto automatico. Tu miniatura debe detener el scroll. Visual impactante, emocion fuerte.",
    t02trafico3Ejemplo: "Contraste brutal + emocion clara",
    t02tipTitulo: "Tip accionable",
    t02tip: "En YouTube Studio, revisa de donde viene tu trafico en Analytics > Fuentes de trafico. Si la mayoria viene de Busqueda, optimiza miniaturas tipo Busqueda. Si viene de Sugeridos, consistencia visual. Si viene de Home, impacto maximo.",

    // Tecnica 03
    t03num: "03",
    t03categoria: "Fundamentos del algoritmo",
    t03titulo: "Por que el clickbait te destruye",
    t03subtitulo: "YouTube mide cuantos se quedan, no cuantos llegan.",
    t03parrafo1: "Desde mediados de 2025, YouTube renombro su politica a Inauthentic Content Policy. La plataforma evalua el canal completo, no solo video por video.",
    t03parrafo2: "Si tus miniaturas prometen algo que tus videos no entregan, el algoritmo detecta el patron y reduce tu alcance permanentemente. Ningun recupero organico te salva.",
    t03simTitulo: "Proyeccion a 90 dias",
    t03simHonesta: "Canal honesto",
    t03simClick: "Canal clickbait",
    t03simMes1: "Mes 1",
    t03simMes2: "Mes 2",
    t03simMes3: "Mes 3",
    t03simResLabel: "El clickbait genera picos iniciales. Pero el algoritmo aprende y te penaliza. El canal honesto crece compuesto.",
    t03tipTitulo: "Regla practica",
    t03tip: "Antes de publicar, preguntate: si alguien hace clic esperando esto, ¿estara satisfecho al minuto 2 del video? Si la respuesta es no, cambia la miniatura o cambia el video.",
    t03nota: "Nota: Los filtros de moderacion de ThumbsLatam bloquean prompts que buscan generar miniaturas engañosas o que infrinjan derechos. Parte de nuestra filosofia de sostenibilidad a largo plazo.",

    // Tecnica 04
    t04num: "04",
    t04categoria: "Diseno profesional",
    t04titulo: "Psicologia del color por nicho",
    t04subtitulo: "Cada industria tiene su paleta ganadora.",
    t04parrafo1: "El color no es decoracion. Es el primer filtro visual que tu cerebro usa para clasificar contenido en 50 milisegundos.",
    t04parrafo2: "Los canales ganadores por nicho convergen en paletas similares porque funcionan. Conocerlas te da ventaja competitiva inmediata.",
    t04nichoTitulo: "Selecciona un nicho",
    t04nichos: [
      { nombre: "Gaming", desc: "Alta saturacion, contraste brutal, accion", colores: ["#FF0040", "#00E5FF", "#FFD60A", "#000000"] },
      { nombre: "Beauty", desc: "Rosados, nudes, dorados. Limpieza visual", colores: ["#FFB6C1", "#F4C2C2", "#D4AF37", "#FFFFFF"] },
      { nombre: "Tech", desc: "Azules profundos, naranjas de acento, minimalismo", colores: ["#0A192F", "#FF4D00", "#64FFDA", "#CCD6F6"] },
      { nombre: "Finanzas", desc: "Verdes, azules serios, dorados de autoridad", colores: ["#0D4F3C", "#1E3A5F", "#D4AF37", "#F5F5F5"] },
      { nombre: "Lifestyle", desc: "Pasteles, tierra, luz natural", colores: ["#F4E4C1", "#C9A27E", "#8B7355", "#F9F6F1"] },
    ],
    t04tipTitulo: "Tip accionable",
    t04tip: "Mira los 10 canales mas grandes de tu nicho. Toma nota de sus 3 colores mas repetidos. Esa es tu paleta base de competencia. Luego elige 1 color de ruptura que te diferencie sin salirte del esquema.",

    proximamenteTag: "Continuara",
    proximamenteTitulo: "Las 8 tecnicas restantes + bonus Studio",
    proximamenteDesc: "Esta guia se entrega en 2 partes. Las primeras 4 tecnicas ya estan listas. Las siguientes se publicaran proximamente:",
    proximamenteItems: [
      "05. Framework AIDA aplicado a miniaturas",
      "06. Tipografia: serif vs sans-serif",
      "07. Composicion: regla de tercios + punto unico",
      "08. A/B testing que realmente funciona",
      "09. Consistencia visual del canal",
      "10. Shorts vs videos largos",
      "11. Prompts optimizados para ThumbsLatam",
      "12. Checklist pre-publicacion de 7 puntos",
      "Bonus Studio: Analisis competitivo, calendario editorial, biblioteca de prompts",
    ],
  },
  en: {
    verificando: "Verifying your plan...",
    badgePro: "Advanced Pro guide",
    heroTitle1: "PROFESSIONAL",
    heroTitle2: "TECHNIQUES",
    heroDesc: "12 advanced principles used by channels with 100K+ subscribers. Aligned with official YouTube policies and designed for sustainable long-term results.",
    volverDashboard: "Back to dashboard",
    introParrafo1: "This guide is not about tricks or clickbait.",
    introParrafo2: "It is about understanding how the YouTube algorithm thinks in 2026 and designing thumbnails that generate honest clicks, high retention and compound growth.",
    introCaja: "Everything you will read here is aligned with official YouTube policies and with our terms of use. We bet on tools that build sustainable channels, not short-term tactics that YouTube penalizes.",

    paywallTag: "Exclusive content",
    paywallTitle: "This guide is only for Pro and Studio members",
    paywallDesc: "12 advanced techniques with interactive simulators, infographics and examples. All backed by official YouTube data and thousands of LATAM channels.",
    paywallIncluye: "What it includes:",
    paywallItems: [
      "12 professional techniques with detailed visuals",
      "4 interactive simulators that calculate in real time",
      "AIDA Framework applied to thumbnails",
      "Color psychology by niche (gaming, beauty, tech, etc)",
      "2026 YouTube algorithm analysis",
      "CTR benchmarks by LATAM category",
      "Pre-publication 7-point checklist",
      "Optimized prompts for ThumbsLatam",
      "+3 exclusive bonuses for Studio members",
    ],
    paywallBtnPro: "Subscribe to Pro - $10/month",
    paywallBtnStudio: "Subscribe to Studio - $25/month",
    paywallOrLogin: "Already have Pro or Studio plan?",
    paywallLogin: "Sign in",

    planBadgePro: "Pro plan active",
    planBadgeStudio: "Studio plan active",

    t01num: "01",
    t01categoria: "Algorithm fundamentals",
    t01titulo: "How YouTube measures success",
    t01subtitulo: "It is not just CTR. It is retention + satisfaction.",
    t01parrafo1: "The YouTube algorithm evaluates two signals in each video: whether you got them to click (CTR) and whether they stayed watching (retention).",
    t01parrafo2: "A 10 percent CTR with 20 percent retention is worth less than a 5 percent CTR with 60 percent retention. The algorithm always prioritizes the second.",
    t01simTitulo: "Simulate the real impact",
    t01simCtr: "Your CTR",
    t01simRet: "Your retention",
    t01simImpr: "Monthly impressions",
    t01simResClicks: "Clicks generated",
    t01simResMin: "Total minutes watched",
    t01simResScore: "Combined score",
    t01simResLabel: "The algorithm rewards retention over CTR. 60 percent retention exponentially multiplies your future reach.",
    t01tipTitulo: "Actionable tip",
    t01tip: "Review your last 10 videos in YouTube Studio. Those with retention above 50 percent are your template. Those below 30 percent are a warning of hidden clickbait.",

    t02num: "02",
    t02categoria: "Algorithm fundamentals",
    t02titulo: "The 3 traffic sources",
    t02subtitulo: "One thumbnail for each context.",
    t02parrafo1: "Viewers find your video in 3 main ways: Search (they look for something specific), Suggested (they were watching a similar video) and Home (they are browsing aimlessly).",
    t02parrafo2: "Each context requires a different visual strategy. The same thumbnail cannot win in all 3.",
    t02trafico1Titulo: "Search",
    t02trafico1Desc: "The user already knows what they want. Your thumbnail must promise the exact answer. Direct text, clear result.",
    t02trafico1Ejemplo: "How to do X in 2 minutes",
    t02trafico2Titulo: "Suggested",
    t02trafico2Desc: "The user already saw something similar. Your thumbnail must look related but different. Consistency + curiosity.",
    t02trafico2Ejemplo: "Recognizable face + new variation",
    t02trafico3Titulo: "Home",
    t02trafico3Desc: "The user is on autopilot. Your thumbnail must stop the scroll. Impactful visual, strong emotion.",
    t02trafico3Ejemplo: "Brutal contrast + clear emotion",
    t02tipTitulo: "Actionable tip",
    t02tip: "In YouTube Studio, review where your traffic comes from in Analytics > Traffic sources. If most comes from Search, optimize Search-style thumbnails. If it comes from Suggested, visual consistency. If it comes from Home, maximum impact.",

    t03num: "03",
    t03categoria: "Algorithm fundamentals",
    t03titulo: "Why clickbait destroys you",
    t03subtitulo: "YouTube measures who stays, not who arrives.",
    t03parrafo1: "Since mid-2025, YouTube renamed its policy to Inauthentic Content Policy. The platform evaluates the entire channel, not just video by video.",
    t03parrafo2: "If your thumbnails promise something your videos do not deliver, the algorithm detects the pattern and permanently reduces your reach. No organic comeback saves you.",
    t03simTitulo: "90-day projection",
    t03simHonesta: "Honest channel",
    t03simClick: "Clickbait channel",
    t03simMes1: "Month 1",
    t03simMes2: "Month 2",
    t03simMes3: "Month 3",
    t03simResLabel: "Clickbait generates initial spikes. But the algorithm learns and penalizes you. The honest channel grows compounded.",
    t03tipTitulo: "Practical rule",
    t03tip: "Before publishing, ask yourself: if someone clicks expecting this, will they be satisfied at minute 2 of the video? If the answer is no, change the thumbnail or change the video.",
    t03nota: "Note: ThumbsLatam moderation filters block prompts that seek to generate misleading or rights-infringing thumbnails. Part of our long-term sustainability philosophy.",

    t04num: "04",
    t04categoria: "Professional design",
    t04titulo: "Color psychology by niche",
    t04subtitulo: "Each industry has its winning palette.",
    t04parrafo1: "Color is not decoration. It is the first visual filter your brain uses to classify content in 50 milliseconds.",
    t04parrafo2: "Winning channels by niche converge on similar palettes because they work. Knowing them gives you immediate competitive advantage.",
    t04nichoTitulo: "Select a niche",
    t04nichos: [
      { nombre: "Gaming", desc: "High saturation, brutal contrast, action", colores: ["#FF0040", "#00E5FF", "#FFD60A", "#000000"] },
      { nombre: "Beauty", desc: "Pinks, nudes, golds. Visual cleanliness", colores: ["#FFB6C1", "#F4C2C2", "#D4AF37", "#FFFFFF"] },
      { nombre: "Tech", desc: "Deep blues, accent oranges, minimalism", colores: ["#0A192F", "#FF4D00", "#64FFDA", "#CCD6F6"] },
      { nombre: "Finance", desc: "Greens, serious blues, authority golds", colores: ["#0D4F3C", "#1E3A5F", "#D4AF37", "#F5F5F5"] },
      { nombre: "Lifestyle", desc: "Pastels, earth tones, natural light", colores: ["#F4E4C1", "#C9A27E", "#8B7355", "#F9F6F1"] },
    ],
    t04tipTitulo: "Actionable tip",
    t04tip: "Look at the 10 biggest channels in your niche. Take note of their 3 most repeated colors. That is your competitive base palette. Then choose 1 breaking color that differentiates you without leaving the scheme.",

    proximamenteTag: "To be continued",
    proximamenteTitulo: "The remaining 8 techniques + Studio bonus",
    proximamenteDesc: "This guide is delivered in 2 parts. The first 4 techniques are ready. The following will be published soon:",
    proximamenteItems: [
      "05. AIDA Framework applied to thumbnails",
      "06. Typography: serif vs sans-serif",
      "07. Composition: rule of thirds + single point",
      "08. A/B testing that really works",
      "09. Visual channel consistency",
      "10. Shorts vs long videos",
      "11. Optimized prompts for ThumbsLatam",
      "12. Pre-publication 7-point checklist",
      "Studio bonus: Competitive analysis, editorial calendar, prompt library",
    ],
  },
};

// Simulador 1: CTR vs Retencion
function SimuladorCtr({ t }: { t: typeof translations.es }) {
  const [ctr, setCtr] = useState(5);
  const [retencion, setRetencion] = useState(40);
  const [impresiones, setImpresiones] = useState(10000);

  const clicks = Math.round(impresiones * (ctr / 100));
  const duracionMedia = 6; // minutos promedio
  const minutosVistos = Math.round(clicks * duracionMedia * (retencion / 100));
  const scoreCombinado = Math.round((ctr * retencion) / 10);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Syne', sans-serif" }}>{t.t01simTitulo}</h3>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "2rem" }}>{t.t01simResLabel}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem" }}>{t.t01simCtr}</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>{ctr}%</span>
          </div>
          <input type="range" min="1" max="20" value={ctr} onChange={(e) => setCtr(Number(e.target.value))} className="simSlider" />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem" }}>{t.t01simRet}</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>{retencion}%</span>
          </div>
          <input type="range" min="10" max="90" value={retencion} onChange={(e) => setRetencion(Number(e.target.value))} className="simSlider" />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem" }}>{t.t01simImpr}</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>{impresiones.toLocaleString()}</span>
          </div>
          <input type="range" min="1000" max="100000" step="1000" value={impresiones} onChange={(e) => setImpresiones(Number(e.target.value))} className="simSlider" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.25rem", borderLeft: "3px solid #FF4D00" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>{t.t01simResClicks}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{clicks.toLocaleString()}</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.25rem", borderLeft: "3px solid #FFD60A" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>{t.t01simResMin}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{minutosVistos.toLocaleString()}</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.25rem", borderLeft: "3px solid #06D6A0" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>{t.t01simResScore}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06D6A0" }}>{scoreCombinado}</div>
        </div>
      </div>
    </div>
  );
}

// Simulador 2: Clickbait vs Honesto
function SimuladorClickbait({ t }: { t: typeof translations.es }) {
  const honestoData = [100, 180, 320];
  const clickbaitData = [250, 150, 60];
  const max = Math.max(...clickbaitData, ...honestoData);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "2rem", fontFamily: "'Syne', sans-serif" }}>{t.t03simTitulo}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
        {[t.t03simMes1, t.t03simMes2, t.t03simMes3].map((mes, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>{mes}</div>
            <div style={{ position: "relative", height: "200px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "8px", padding: "8px" }}>
              <div style={{ flex: 1, background: "linear-gradient(180deg, #06D6A0 0%, #04A578 100%)", height: (honestoData[i] / max * 100) + "%", borderRadius: "4px 4px 0 0", transition: "height 0.5s", minHeight: "10px" }} title={"Honesto: " + honestoData[i]}></div>
              <div style={{ flex: 1, background: "linear-gradient(180deg, #FF4D4D 0%, #CC0000 100%)", height: (clickbaitData[i] / max * 100) + "%", borderRadius: "4px 4px 0 0", transition: "height 0.5s", minHeight: "10px" }} title={"Clickbait: " + clickbaitData[i]}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "0.5rem", fontSize: "0.7rem" }}>
              <span style={{ color: "#06D6A0" }}>{honestoData[i]}</span>
              <span style={{ color: "#FF4D4D" }}>{clickbaitData[i]}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "16px", height: "16px", background: "#06D6A0", borderRadius: "4px" }}></div>
          <span style={{ fontSize: "0.9rem" }}>{t.t03simHonesta}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "16px", height: "16px", background: "#FF4D4D", borderRadius: "4px" }}></div>
          <span style={{ fontSize: "0.9rem" }}>{t.t03simClick}</span>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginTop: "1.5rem", fontStyle: "italic" }}>
        {t.t03simResLabel}
      </p>
    </div>
  );
}

// Selector de nichos de color
function SelectorColor({ t }: { t: typeof translations.es }) {
  const [nichoActivo, setNichoActivo] = useState(0);
  const nicho = t.t04nichos[nichoActivo];

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "rgba(255,255,255,0.7)" }}>{t.t04nichoTitulo}</h3>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {t.t04nichos.map((n, i) => (
          <button
            key={i}
            onClick={() => setNichoActivo(i)}
            style={{
              padding: "0.6rem 1.2rem",
              background: nichoActivo === i ? "#FF4D00" : "rgba(255,255,255,0.05)",
              color: nichoActivo === i ? "#fff" : "rgba(255,255,255,0.7)",
              border: "1px solid " + (nichoActivo === i ? "#FF4D00" : "rgba(255,255,255,0.1)"),
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {n.nombre}
          </button>
        ))}
      </div>

      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {nicho.colores.map((color, i) => (
            <div
              key={i}
              style={{
                width: "80px",
                height: "80px",
                background: color,
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                padding: "8px",
                boxShadow: "0 8px 24px " + color + "40",
              }}
            >
              <span style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>
                {color}
              </span>
            </div>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", fontStyle: "italic" }}>
          {nicho.desc}
        </p>
      </div>

      <div style={{ position: "relative", height: "180px", background: "linear-gradient(135deg, " + nicho.colores[0] + " 0%, " + nicho.colores[2] + " 100%)", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 50%, " + nicho.colores[1] + "40 0%, transparent 70%)" }}></div>
        <div style={{ fontSize: "2.5rem", fontWeight: 900, color: nicho.colores[3], fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em", zIndex: 1, textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}>
          {nicho.nombre.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export default function TipsMiniaturasPro() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState<Plan>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tl_lang");
    if (saved === "es" || saved === "en") setLang(saved);

    fetch("/api/check-plan")
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) {
          setPlan(data.plan || "gratis");
        } else {
          setPlan("gratis");
        }
        setVerificando(false);
      })
      .catch(() => {
        setPlan("gratis");
        setVerificando(false);
      });
  }, []);

  const changeLang = (l: "es" | "en") => {
    setLang(l);
    localStorage.setItem("tl_lang", l);
  };

  const t = translations[lang];
  const esPro = plan === "pro" || plan === "studio";

  if (!mounted) return null;

  if (verificando) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E27", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,77,0,0.2)", borderTopColor: "#FF4D00", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
          <p>{t.verificando}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body { margin: 0; background: #0A0E27; }
        .simSlider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .simSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          background: #FF4D00;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(255,77,0,0.2), 0 4px 12px rgba(255,77,0,0.3);
          transition: all 0.2s;
        }
        .simSlider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 0 6px rgba(255,77,0,0.3), 0 4px 16px rgba(255,77,0,0.5);
        }
        .simSlider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          background: #FF4D00;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(255,77,0,0.2), 0 4px 12px rgba(255,77,0,0.3);
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0A0E27 0%, #050816 100%)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,77,0,0.12) 0%, transparent 70%)", filter: "blur(60px)" }}></div>
          <div style={{ position: "absolute", bottom: "20%", right: "5%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(6,214,160,0.06) 0%, transparent 70%)", filter: "blur(80px)" }}></div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>

          <header style={{ padding: "1.5rem clamp(1rem, 4vw, 3rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <Logo />
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 0, border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", overflow: "hidden" }}>
                <button onClick={() => changeLang("es")} style={{ background: lang === "es" ? "#FF4D00" : "transparent", border: "none", color: lang === "es" ? "white" : "#8B8FA8", fontSize: "0.8rem", padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>ES</button>
                <span style={{ width: "1px", background: "rgba(255,255,255,0.2)" }}></span>
                <button onClick={() => changeLang("en")} style={{ background: lang === "en" ? "#FF4D00" : "transparent", border: "none", color: lang === "en" ? "white" : "#8B8FA8", fontSize: "0.8rem", padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>EN</button>
              </div>
              <a href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                {t.volverDashboard}
              </a>
            </div>
          </header>

          {!esPro ? (
            <PaywallSection t={t} />
          ) : (
            <ContenidoPro t={t} plan={plan} />
          )}

        </div>
      </div>
    </>
  );
}

function PaywallSection({ t }: { t: typeof translations.es }) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1.5rem", textTransform: "uppercase" }}>
          🔒 {t.paywallTag}
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
          {t.paywallTitle}
        </h1>
        <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: "700px", margin: "0 auto" }}>
          {t.paywallDesc}
        </p>
      </div>

      <div style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.12) 0%, rgba(255,214,10,0.03) 100%)", border: "1px solid rgba(255,77,0,0.25)", borderRadius: "24px", padding: "clamp(2rem, 4vw, 3rem)", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", marginBottom: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {t.paywallIncluye}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
          {t.paywallItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "rgba(0,0,0,0.25)", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#FF4D00", fontSize: "1rem", flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
        <a
          href="/#pricing"
          style={{ padding: "1rem 2rem", background: "#FF4D00", color: "#fff", borderRadius: "999px", fontSize: "1rem", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 30px rgba(255,77,0,0.3)", transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,77,0,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,77,0,0.3)"; }}
        >
          {t.paywallBtnPro}
        </a>
        <a
          href="/#pricing"
          style={{ padding: "1rem 2rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "999px", fontSize: "1rem", fontWeight: 700, textDecoration: "none", transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FF4D00"; e.currentTarget.style.borderColor = "#FF4D00"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
        >
          {t.paywallBtnStudio}
        </a>
      </div>

      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
        {t.paywallOrLogin} <a href="/registro" style={{ color: "#FF4D00", textDecoration: "none" }}>{t.paywallLogin}</a>
      </div>
    </div>
  );
}

function ContenidoPro({ t, plan }: { t: typeof translations.es; plan: Plan }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem clamp(1rem, 4vw, 3rem)" }}>

      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{
          display: "inline-block",
          padding: "0.4rem 1rem",
          background: "rgba(6,214,160,0.15)",
          border: "1px solid rgba(6,214,160,0.5)",
          borderRadius: "999px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#06D6A0",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
        }}>
          ✓ {plan === "studio" ? t.planBadgeStudio : t.planBadgePro}
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>
          {t.badgePro}
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 0.95, letterSpacing: "-0.03em", marginBottom: "1.5rem", wordBreak: "break-word" }}>
          {t.heroTitle1}
          <br />
          <span style={{ color: "#FF4D00" }}>{t.heroTitle2}</span>
        </h1>
        <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "rgba(255,255,255,0.7)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.5 }}>
          {t.heroDesc}
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto 5rem", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)", color: "rgba(255,255,255,0.95)", lineHeight: 1.5, fontWeight: 300, marginBottom: "1rem", fontFamily: "'Syne', sans-serif" }}>
          {t.introParrafo1}
        </p>
        <p style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "2rem" }}>
          {t.introParrafo2}
        </p>
        <div style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.25)", borderRadius: "16px", padding: "1.5rem 2rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>
          <span style={{ color: "#06D6A0", fontWeight: 700, marginRight: "0.5rem" }}>★</span>
          {t.introCaja}
        </div>
      </div>

      <TecnicaSection numero={t.t01num} categoria={t.t01categoria} titulo={t.t01titulo} subtitulo={t.t01subtitulo} parrafos={[t.t01parrafo1, t.t01parrafo2]} tipTitulo={t.t01tipTitulo} tip={t.t01tip} color="#FF4D00">
        <SimuladorCtr t={t} />
      </TecnicaSection>

      <TecnicaSection numero={t.t02num} categoria={t.t02categoria} titulo={t.t02titulo} subtitulo={t.t02subtitulo} parrafos={[t.t02parrafo1, t.t02parrafo2]} tipTitulo={t.t02tipTitulo} tip={t.t02tip} color="#FFD60A">
        <Trafico3Fuentes t={t} />
      </TecnicaSection>

      <TecnicaSection numero={t.t03num} categoria={t.t03categoria} titulo={t.t03titulo} subtitulo={t.t03subtitulo} parrafos={[t.t03parrafo1, t.t03parrafo2]} tipTitulo={t.t03tipTitulo} tip={t.t03tip} nota={t.t03nota} color="#06D6A0">
        <SimuladorClickbait t={t} />
      </TecnicaSection>

      <TecnicaSection numero={t.t04num} categoria={t.t04categoria} titulo={t.t04titulo} subtitulo={t.t04subtitulo} parrafos={[t.t04parrafo1, t.t04parrafo2]} tipTitulo={t.t04tipTitulo} tip={t.t04tip} color="#FF4D00">
        <SelectorColor t={t} />
      </TecnicaSection>

      <div style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.08) 0%, rgba(255,214,10,0.02) 100%)", border: "1px dashed rgba(255,77,0,0.3)", borderRadius: "24px", padding: "clamp(2rem, 4vw, 3.5rem)", textAlign: "center", marginTop: "4rem", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>
          {t.proximamenteTag}
        </div>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: "1rem" }}>
          {t.proximamenteTitulo}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          {t.proximamenteDesc}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.5rem", maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
          {t.proximamenteItems.map((item, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", borderLeft: "2px solid rgba(255,77,0,0.4)" }}>
              {item}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function TecnicaSection({ numero, categoria, titulo, subtitulo, parrafos, tipTitulo, tip, nota, color, children }: { numero: string; categoria: string; titulo: string; subtitulo: string; parrafos: string[]; tipTitulo: string; tip: string; nota?: string; color: string; children?: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ marginBottom: "6rem", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div style={{ fontSize: "clamp(4rem, 10vw, 7rem)", fontWeight: 900, color: color, lineHeight: 0.8, letterSpacing: "-0.05em", fontFamily: "'Syne', sans-serif", textShadow: "0 0 80px " + color + "40", flexShrink: 0 }}>
          {numero}
        </div>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {categoria}
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "0.5rem", wordBreak: "break-word" }}>
            {titulo}
          </h2>
          <p style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)", color: color, fontStyle: "italic", fontWeight: 500 }}>
            {subtitulo}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        {parrafos.map((p, i) => (
          <p key={i} style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "1.25rem" }}>
            {p}
          </p>
        ))}
      </div>

      {children}

      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid " + color + "30", borderLeft: "3px solid " + color, padding: "1.25rem 1.5rem", borderRadius: "0 12px 12px 0", marginTop: "2rem", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          ★ {tipTitulo}
        </div>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>{tip}</p>
      </div>

      {nota && (
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "1rem", fontStyle: "italic", textAlign: "center", maxWidth: "700px", marginLeft: "auto", marginRight: "auto" }}>
          {nota}
        </div>
      )}
    </section>
  );
}

function Trafico3Fuentes({ t }: { t: typeof translations.es }) {
  const fuentes = [
    { titulo: t.t02trafico1Titulo, desc: t.t02trafico1Desc, ejemplo: t.t02trafico1Ejemplo, color: "#FF4D00", icono: "🔍" },
    { titulo: t.t02trafico2Titulo, desc: t.t02trafico2Desc, ejemplo: t.t02trafico2Ejemplo, color: "#FFD60A", icono: "▶" },
    { titulo: t.t02trafico3Titulo, desc: t.t02trafico3Desc, ejemplo: t.t02trafico3Ejemplo, color: "#06D6A0", icono: "🏠" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
      {fuentes.map((f, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + f.color + "30", borderRadius: "20px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: f.color }}></div>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icono}</div>
          <h4 style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: "0.5rem", color: f.color }}>
            {f.titulo}
          </h4>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5, marginBottom: "1rem" }}>
            {f.desc}
          </p>
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontStyle: "italic", borderLeft: "2px solid " + f.color }}>
            {f.ejemplo}
          </div>
        </div>
      ))}
    </div>
  );
}
