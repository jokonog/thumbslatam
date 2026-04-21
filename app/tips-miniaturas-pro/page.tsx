"use client";
import Logo from "@/components/Logo";
import { useState, useEffect, useRef } from "react";

type Plan = "gratis" | "pro" | "studio" | null;

const translations = {
  es: {
    verificando: "Verificando tu plan...",
    badgePro: "Guia avanzada Pro",
    heroTitle1: "TECNICAS",
    heroTitle2: "PROFESIONALES",
    heroDesc: "12 principios avanzados usados por canales con mas de 100K suscriptores. Alineados con las politicas oficiales de YouTube y disenados para resultados sostenibles a largo plazo.",
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
      "Simuladores interactivos que calculan en tiempo real",
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
    paywallOrLogin: "Ya tienes plan Pro o Studio?",
    paywallLogin: "Inicia sesion",
    planBadgePro: "Plan Pro activo",
    planBadgeStudio: "Plan Studio activo",

    t01num: "01",
    t01categoria: "Fundamentos del algoritmo",
    t01titulo: "Como YouTube mide el exito",
    t01subtitulo: "No es solo el CTR. Es retencion + satisfaccion.",
    t01parrafo1: "El algoritmo de YouTube evalua dos senales en cada video: si lograste que hicieran clic (CTR) y si se quedaron viendo (retencion).",
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

    t02num: "02",
    t02categoria: "Fundamentos del algoritmo",
    t02titulo: "Las 3 fuentes de trafico",
    t02subtitulo: "Una miniatura para cada contexto. Haz clic para explorar cada una.",
    t02parrafo1: "Los espectadores encuentran tu video de 3 formas principales: Busqueda (buscan algo especifico), Sugeridos (estaban viendo otro video parecido) y Home (estan navegando sin rumbo).",
    t02parrafo2: "Cada contexto requiere una estrategia visual diferente. La misma miniatura no puede ganar en los 3.",
    t02fuentes: [
      { titulo: "Busqueda", desc: "El usuario ya sabe que quiere. Tu miniatura debe prometer la respuesta exacta.", icono: "🔍", color: "#FF4D00", ejemplos: ["Texto grande y directo", "Resultado final visible", "Numero o dato concreto"], ejemploVisual: "COMO X EN 2 MIN" },
      { titulo: "Sugeridos", desc: "Ya vio algo parecido. Tu miniatura debe verse relacionada pero diferente.", icono: "▶", color: "#FFD60A", ejemplos: ["Misma paleta del canal", "Rostro reconocible", "Variacion del tema"], ejemploVisual: "PARTE 2 · NUEVA VARIACION" },
      { titulo: "Home", desc: "El usuario esta en piloto automatico. Debes detener el scroll.", icono: "🏠", color: "#06D6A0", ejemplos: ["Contraste extremo", "Emocion facial intensa", "Elemento inesperado"], ejemploVisual: "!NO LO CREERAS!" },
    ],
    t02tipTitulo: "Tip accionable",
    t02tip: "En YouTube Studio, revisa de donde viene tu trafico en Analytics > Fuentes de trafico. Si la mayoria viene de Busqueda, optimiza miniaturas tipo Busqueda. Si viene de Sugeridos, consistencia visual. Si viene de Home, impacto maximo.",

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
    t03tip: "Antes de publicar, preguntate: si alguien hace clic esperando esto, estara satisfecho al minuto 2 del video? Si la respuesta es no, cambia la miniatura o cambia el video.",
    t03nota: "Nota: Los filtros de moderacion de ThumbsLatam bloquean prompts que buscan generar miniaturas enganosas o que infrinjan derechos. Parte de nuestra filosofia de sostenibilidad a largo plazo.",

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

    t05num: "05",
    t05categoria: "Diseno profesional",
    t05titulo: "Framework AIDA aplicado",
    t05subtitulo: "4 capas psicologicas en 320 por 180 pixeles. Pasa el cursor sobre cada letra.",
    t05parrafo1: "AIDA (Atencion, Interes, Deseo, Accion) es un framework de publicidad de 1898 que sigue funcionando porque se basa en como procesa informacion el cerebro humano, no en modas.",
    t05parrafo2: "Una miniatura profesional tiene las 4 capas simultaneamente. Cada una ocupa una zona visual diferente y juntas construyen la decision de clic en menos de 2 segundos.",
    t05aidaTitulo: "Interactua con la anatomia AIDA",
    t05aida: [
      { letra: "A", nombre: "Atencion", desc: "Contraste extremo, rostro con emocion, o movimiento sugerido. Rompe el scroll.", zona: "Zona central superior" },
      { letra: "I", nombre: "Interes", desc: "Elemento misterioso o incompleto que genera curiosidad. Algo que el ojo quiere resolver.", zona: "Zona central inferior" },
      { letra: "D", nombre: "Deseo", desc: "Promesa de beneficio concreto. Texto que responde que gano yo viendo esto.", zona: "Esquina superior o inferior" },
      { letra: "A", nombre: "Accion", desc: "Senal visual que invita al clic: flecha sutil, contorno de play, direccion de mirada.", zona: "Elementos dirigidos al centro" },
    ],
    t05tipTitulo: "Tip accionable",
    t05tip: "Antes de exportar tu miniatura, cubre con tu dedo cada una de las 4 zonas y pregunta: que capa falta? Si no puedes identificar las 4, tu miniatura solo tiene 1 o 2 capas y pierde contra las que tienen las 4.",

    t06num: "06",
    t06categoria: "Diseno profesional",
    t06titulo: "Tipografia: serif o sans-serif",
    t06subtitulo: "Escribe algo y compara en vivo.",
    t06parrafo1: "La tipografia no es solo legibilidad. Es lenguaje emocional silencioso. Un mismo texto en Times New Roman vs en Impact comunica cosas radicalmente distintas.",
    t06parrafo2: "Los canales profesionales eligen su familia tipografica estrategicamente segun la emocion que quieren asociar con su marca. No es decoracion, es posicionamiento.",
    t06inputLabel: "Escribe tu texto aqui",
    t06inputPlaceholder: "Ej: EPICO",
    t06serif: "Serif",
    t06serifDesc: "Elegante, tradicional, con autoridad.",
    t06serifUsos: ["Finanzas", "Documentales", "Educacion", "Lujo"],
    t06sans: "Sans-serif",
    t06sansDesc: "Moderno, directo, energico.",
    t06sansUsos: ["Gaming", "Tech", "Fitness", "Videos virales"],
    t06tipTitulo: "Tip accionable",
    t06tip: "Elige 1 tipografia para titulo y 1 para texto secundario. Usala en el 100 por ciento de tus miniaturas. La consistencia tipografica es lo que diferencia canales amateur de profesionales.",

    t07num: "07",
    t07categoria: "Diseno profesional",
    t07titulo: "Composicion: regla de tercios",
    t07subtitulo: "Mueve el punto de fuerza y activa el grid para ver.",
    t07parrafo1: "Si divides tu miniatura en 9 cuadrantes (3x3), los 4 puntos donde las lineas se cruzan son los zonas donde el ojo humano va naturalmente primero.",
    t07parrafo2: "Las miniaturas amateur ponen todo en el centro. Las profesionales colocan el elemento principal en uno de los 4 puntos de fuerza para generar tension visual y movimiento.",
    t07toggleGrid: "Mostrar grid de tercios",
    t07puntoLabel: "Elige un punto de fuerza",
    t07puntos: ["Superior izquierdo", "Superior derecho", "Inferior izquierdo", "Inferior derecho", "Centrado (amateur)"],
    t07tipTitulo: "Tip accionable",
    t07tip: "Pon el rostro o elemento clave en el tercio izquierdo o derecho (no centrado). Deja el tercio opuesto para texto o espacio negativo. Esto crea el balance visual que usan todos los canales grandes.",

    t08num: "08",
    t08categoria: "Estrategia avanzada",
    t08titulo: "A/B testing que funciona",
    t08subtitulo: "Haz clic en cada variante para ver su hipotesis.",
    t08parrafo1: "Desde 2024 YouTube permite hacer test A/B nativos de hasta 3 miniaturas. El algoritmo reparte impresiones entre las opciones, mide retencion y elige la ganadora automaticamente.",
    t08parrafo2: "Pero la mayoria lo usa mal. Hacer 3 versiones casi iguales no ensena nada. El test funciona cuando cada variante prueba una hipotesis diferente.",
    t08abTitulo: "Haz clic en cada variante",
    t08variantes: [
      { label: "Version A", titulo: "Version control", desc: "Tu estilo habitual.", hipotesis: "Partimos de tu linea base para medir contra ella. No esperamos que gane, es la referencia.", ctr: 4.2, retencion: 38, veredicto: "Linea base", color: "#8B8FA8" },
      { label: "Version B", titulo: "Cambio de emocion", desc: "Misma estructura, diferente expresion facial.", hipotesis: "Cambiar la emocion principal del rostro (de neutral a sorpresa, por ejemplo) genera mas clicks sin afectar retencion.", ctr: 6.8, retencion: 42, veredicto: "GANADORA +62% CTR", color: "#06D6A0" },
      { label: "Version C", titulo: "Cambio de promesa", desc: "Diferente angulo del contenido.", hipotesis: "Cambiar el angulo (de educativo a entretenimiento, por ejemplo) atrae otro tipo de espectador con retencion distinta.", ctr: 5.1, retencion: 31, veredicto: "Mas clicks, peor retencion", color: "#FFD60A" },
    ],
    t08tipTitulo: "Tip accionable",
    t08tip: "Nunca pruebes 3 variantes de color o tipografia. Esas diferencias son muy pequenas para que el algoritmo las detecte con datos significativos. Prueba diferencias radicales de emocion, angulo o promesa.",

    proximamenteTag: "Continuará",
    proximamenteTitulo: "Las 4 tecnicas restantes + bonus Studio",
    proximamenteDesc: "Esta guia se completa en partes. Las primeras 8 tecnicas ya estan listas. Las siguientes se publicaran proximamente:",
    proximamenteItems: [
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
      "Interactive simulators that calculate in real time",
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
    t02subtitulo: "One thumbnail for each context. Click to explore each.",
    t02parrafo1: "Viewers find your video in 3 main ways: Search (they look for something specific), Suggested (they were watching a similar video) and Home (they are browsing aimlessly).",
    t02parrafo2: "Each context requires a different visual strategy. The same thumbnail cannot win in all 3.",
    t02fuentes: [
      { titulo: "Search", desc: "The user already knows what they want. Your thumbnail must promise the exact answer.", icono: "🔍", color: "#FF4D00", ejemplos: ["Large direct text", "Visible final result", "Concrete number or data"], ejemploVisual: "HOW TO X IN 2 MIN" },
      { titulo: "Suggested", desc: "They already saw something similar. Your thumbnail must look related but different.", icono: "▶", color: "#FFD60A", ejemplos: ["Same channel palette", "Recognizable face", "Topic variation"], ejemploVisual: "PART 2 · NEW VARIATION" },
      { titulo: "Home", desc: "The user is on autopilot. You must stop the scroll.", icono: "🏠", color: "#06D6A0", ejemplos: ["Extreme contrast", "Intense facial emotion", "Unexpected element"], ejemploVisual: "YOU WON'T BELIEVE IT" },
    ],
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

    t05num: "05",
    t05categoria: "Professional design",
    t05titulo: "AIDA Framework applied",
    t05subtitulo: "4 psychological layers in 320 by 180 pixels. Hover over each letter.",
    t05parrafo1: "AIDA (Attention, Interest, Desire, Action) is an 1898 advertising framework that still works because it is based on how the human brain processes information, not on trends.",
    t05parrafo2: "A professional thumbnail has all 4 layers simultaneously. Each occupies a different visual zone and together they build the click decision in under 2 seconds.",
    t05aidaTitulo: "Interact with AIDA anatomy",
    t05aida: [
      { letra: "A", nombre: "Attention", desc: "Extreme contrast, emotional face, or suggested movement. Break the scroll.", zona: "Upper center zone" },
      { letra: "I", nombre: "Interest", desc: "Mysterious or incomplete element that generates curiosity.", zona: "Lower center zone" },
      { letra: "D", nombre: "Desire", desc: "Promise of concrete benefit. Text that answers what do I gain.", zona: "Upper or lower corner" },
      { letra: "A", nombre: "Action", desc: "Visual signal that invites the click: subtle arrow, play outline, gaze.", zona: "Elements directed to center" },
    ],
    t05tipTitulo: "Actionable tip",
    t05tip: "Before exporting your thumbnail, cover with your finger each of the 4 zones and ask: which layer is missing? If you cannot identify all 4, your thumbnail only has 1 or 2 layers and loses against those with all 4.",

    t06num: "06",
    t06categoria: "Professional design",
    t06titulo: "Typography: serif or sans-serif",
    t06subtitulo: "Write something and compare live.",
    t06parrafo1: "Typography is not just legibility. It is silent emotional language. The same text in Times New Roman vs Impact communicates radically different things.",
    t06parrafo2: "Professional channels strategically choose their typographic family according to the emotion they want to associate with their brand. It is not decoration, it is positioning.",
    t06inputLabel: "Write your text here",
    t06inputPlaceholder: "Ex: EPIC",
    t06serif: "Serif",
    t06serifDesc: "Elegant, traditional, with authority.",
    t06serifUsos: ["Finance", "Documentaries", "Education", "Luxury"],
    t06sans: "Sans-serif",
    t06sansDesc: "Modern, direct, energetic.",
    t06sansUsos: ["Gaming", "Tech", "Fitness", "Viral videos"],
    t06tipTitulo: "Actionable tip",
    t06tip: "Choose 1 typography for titles and 1 for secondary text. Use it in 100 percent of your thumbnails. Typographic consistency is what differentiates amateur from professional channels.",

    t07num: "07",
    t07categoria: "Professional design",
    t07titulo: "Composition: rule of thirds",
    t07subtitulo: "Move the power point and toggle the grid to see.",
    t07parrafo1: "If you divide your thumbnail into 9 quadrants (3x3), the 4 points where the lines intersect are the zones where the human eye naturally goes first.",
    t07parrafo2: "Amateur thumbnails put everything in the center. Professional ones place the main element at one of the 4 power points to generate visual tension and movement.",
    t07toggleGrid: "Show thirds grid",
    t07puntoLabel: "Choose a power point",
    t07puntos: ["Upper left", "Upper right", "Lower left", "Lower right", "Centered (amateur)"],
    t07tipTitulo: "Actionable tip",
    t07tip: "Place the face or key element in the left or right third (not centered). Leave the opposite third for text or negative space. This creates the visual balance used by all big channels.",

    t08num: "08",
    t08categoria: "Advanced strategy",
    t08titulo: "A/B testing that works",
    t08subtitulo: "Click each variant to see its hypothesis.",
    t08parrafo1: "Since 2024 YouTube allows native A/B testing of up to 3 thumbnails. The algorithm distributes impressions among the options, measures retention and automatically picks the winner.",
    t08parrafo2: "But most people use it wrong. Making 3 nearly identical versions teaches nothing. The test works when each variant tests a different hypothesis.",
    t08abTitulo: "Click each variant",
    t08variantes: [
      { label: "Version A", titulo: "Control version", desc: "Your usual style.", hipotesis: "We start from your baseline to measure against. Not expected to win, it is the reference.", ctr: 4.2, retencion: 38, veredicto: "Baseline", color: "#8B8FA8" },
      { label: "Version B", titulo: "Emotion change", desc: "Same structure, different facial expression.", hipotesis: "Changing the main face emotion (neutral to surprise, for example) generates more clicks without affecting retention.", ctr: 6.8, retencion: 42, veredicto: "WINNER +62% CTR", color: "#06D6A0" },
      { label: "Version C", titulo: "Promise change", desc: "Different content angle.", hipotesis: "Changing the angle (educational to entertainment, for example) attracts another type of viewer with different retention.", ctr: 5.1, retencion: 31, veredicto: "More clicks, worse retention", color: "#FFD60A" },
    ],
    t08tipTitulo: "Actionable tip",
    t08tip: "Never test 3 color or typography variants. Those differences are too small for the algorithm to detect with significant data. Test radical differences in emotion, angle or promise.",

    proximamenteTag: "Continued",
    proximamenteTitulo: "The remaining 4 techniques + Studio bonus",
    proximamenteDesc: "This guide is completed in parts. The first 8 techniques are ready. The following will be published soon:",
    proximamenteItems: [
      "09. Visual channel consistency",
      "10. Shorts vs long videos",
      "11. Optimized prompts for ThumbsLatam",
      "12. Pre-publication 7-point checklist",
      "Studio bonus: Competitive analysis, editorial calendar, prompt library",
    ],
  },
};

function SimuladorCtr({ t }: { t: typeof translations.es }) {
  const [ctr, setCtr] = useState(5);
  const [retencion, setRetencion] = useState(40);
  const [impresiones, setImpresiones] = useState(10000);
  const clicks = Math.round(impresiones * (ctr / 100));
  const duracionMedia = 6;
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

function Trafico3FuentesInteractivo({ t }: { t: typeof translations.es }) {
  const [activa, setActiva] = useState(0);

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {t.t02fuentes.map((f, i) => (
          <button key={i} onClick={() => setActiva(i)} style={{
            background: activa === i ? f.color + "20" : "rgba(255,255,255,0.03)",
            border: "1px solid " + (activa === i ? f.color : "rgba(255,255,255,0.1)"),
            borderRadius: "14px", padding: "1rem", cursor: "pointer",
            transition: "all 0.3s ease", textAlign: "left",
            boxShadow: activa === i ? "0 0 30px " + f.color + "30" : "none"
          }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>{f.icono}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: activa === i ? f.color : "#fff", fontFamily: "'Syne', sans-serif" }}>{f.titulo}</div>
          </button>
        ))}
      </div>

      <div style={{ background: t.t02fuentes[activa].color + "10", border: "1px solid " + t.t02fuentes[activa].color + "40", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", transition: "all 0.3s ease" }}>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: "1.5rem" }}>{t.t02fuentes[activa].desc}</p>

        <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, " + t.t02fuentes[activa].color + "40 0%, " + t.t02fuentes[activa].color + "10 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", border: "2px solid " + t.t02fuentes[activa].color + "60" }}>
          <div style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: 900, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em", textShadow: "2px 2px 8px rgba(0,0,0,0.5)", padding: "1rem", textAlign: "center" }}>
            {t.t02fuentes[activa].ejemploVisual}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
          {t.t02fuentes[activa].ejemplos.map((e, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.7rem 1rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", borderLeft: "2px solid " + t.t02fuentes[activa].color }}>
              ✓ {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
              <div style={{ flex: 1, background: "linear-gradient(180deg, #06D6A0 0%, #04A578 100%)", height: (honestoData[i] / max * 100) + "%", borderRadius: "4px 4px 0 0", transition: "height 0.5s", minHeight: "10px" }}></div>
              <div style={{ flex: 1, background: "linear-gradient(180deg, #FF4D4D 0%, #CC0000 100%)", height: (clickbaitData[i] / max * 100) + "%", borderRadius: "4px 4px 0 0", transition: "height 0.5s", minHeight: "10px" }}></div>
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
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginTop: "1.5rem", fontStyle: "italic" }}>{t.t03simResLabel}</p>
    </div>
  );
}

function SelectorColor({ t }: { t: typeof translations.es }) {
  const [nichoActivo, setNichoActivo] = useState(0);
  const nicho = t.t04nichos[nichoActivo];

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "rgba(255,255,255,0.7)" }}>{t.t04nichoTitulo}</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {t.t04nichos.map((n, i) => (
          <button key={i} onClick={() => setNichoActivo(i)} style={{ padding: "0.6rem 1.2rem", background: nichoActivo === i ? "#FF4D00" : "rgba(255,255,255,0.05)", color: nichoActivo === i ? "#fff" : "rgba(255,255,255,0.7)", border: "1px solid " + (nichoActivo === i ? "#FF4D00" : "rgba(255,255,255,0.1)"), borderRadius: "999px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
            {n.nombre}
          </button>
        ))}
      </div>
      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {nicho.colores.map((color, i) => (
            <div key={i} style={{ width: "80px", height: "80px", background: color, borderRadius: "12px", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "8px", boxShadow: "0 8px 24px " + color + "40" }}>
              <span style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>{color}</span>
            </div>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", fontStyle: "italic" }}>{nicho.desc}</p>
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

function VisualAIDAInteractivo({ t }: { t: typeof translations.es }) {
  const [activa, setActiva] = useState<number | null>(null);
  const colores = ["#FF4D00", "#FFD60A", "#06D6A0", "#7F77DD"];
  const zonas = [
    { top: "15%", left: "50%", translate: "translateX(-50%)" },
    { top: "60%", left: "50%", translate: "translateX(-50%)" },
    { top: "10%", right: "8%", translate: "" },
    { bottom: "12%", left: "12%", translate: "" }
  ];

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", fontFamily: "'Syne', sans-serif", textAlign: "center" }}>{t.t05aidaTitulo}</h3>

      <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto 2rem", aspectRatio: "16/9", background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)", borderRadius: "16px", border: "1px solid rgba(255,77,0,0.3)", overflow: "hidden" }}>
        {t.t05aida.map((capa, i) => {
          const pos = zonas[i];
          const esActiva = activa === i;
          const esFondo = activa !== null && activa !== i;
          return (
            <div key={i} style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              right: pos.right,
              bottom: pos.bottom,
              transform: pos.translate,
              background: esFondo ? colores[i] + "30" : colores[i] + (esActiva ? "" : "90"),
              color: i === 1 ? "#000" : "#fff",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: esActiva ? "1rem" : "0.85rem",
              fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              border: "2px solid " + colores[i],
              transition: "all 0.3s ease",
              boxShadow: esActiva ? "0 0 30px " + colores[i] + "80" : "none",
              opacity: esFondo ? 0.4 : 1,
              zIndex: esActiva ? 10 : 1
            }}>{capa.letra} · {capa.nombre}</div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {t.t05aida.map((capa, i) => {
          const esActiva = activa === i;
          return (
            <button key={i}
              onMouseEnter={() => setActiva(i)}
              onMouseLeave={() => setActiva(null)}
              onClick={() => setActiva(esActiva ? null : i)}
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid " + colores[i] + (esActiva ? "" : "40"),
                borderRadius: "12px", padding: "1.25rem",
                position: "relative", overflow: "hidden",
                cursor: "pointer", textAlign: "left",
                transition: "all 0.2s ease",
                transform: esActiva ? "translateY(-4px)" : "translateY(0)",
                boxShadow: esActiva ? "0 8px 30px " + colores[i] + "40" : "none"
              }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: "3px", width: "100%", background: colores[i] }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: colores[i], color: i === 1 ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Syne', sans-serif" }}>{capa.letra}</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", fontFamily: "'Syne', sans-serif", color: colores[i] }}>{capa.nombre}</div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5, marginBottom: "0.5rem" }}>{capa.desc}</p>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>📍 {capa.zona}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TipografiaInteractiva({ t }: { t: typeof translations.es }) {
  const [texto, setTexto] = useState("");
  const placeholder = t.t06inputPlaceholder;
  const textoMostrar = texto || placeholder;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem", display: "block" }}>{t.t06inputLabel}</label>
        <input type="text" value={texto} onChange={(e) => setTexto(e.target.value.toUpperCase().slice(0, 20))} placeholder={placeholder} style={{
          width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,77,0,0.3)", borderRadius: "10px", color: "#fff",
          fontSize: "1rem", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box"
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,214,10,0.3)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#FFD60A" }}></div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFD60A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{t.t06serif}</div>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.02em", color: "#fff", minHeight: "3rem", wordBreak: "break-word" }}>{textoMostrar}</div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>{t.t06serifDesc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {t.t06serifUsos.map((uso, i) => (
              <span key={i} style={{ background: "rgba(255,214,10,0.1)", border: "1px solid rgba(255,214,10,0.3)", borderRadius: "999px", padding: "0.3rem 0.7rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>{uso}</span>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.3)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#FF4D00" }}></div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{t.t06sans}</div>
          <div style={{ fontFamily: "'Syne', 'Arial Black', sans-serif", fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)", fontWeight: 900, marginBottom: "1rem", letterSpacing: "-0.03em", color: "#fff", minHeight: "3rem", wordBreak: "break-word" }}>{textoMostrar}</div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>{t.t06sansDesc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {t.t06sansUsos.map((uso, i) => (
              <span key={i} style={{ background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.3)", borderRadius: "999px", padding: "0.3rem 0.7rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>{uso}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposicionInteractiva({ t }: { t: typeof translations.es }) {
  const [mostrarGrid, setMostrarGrid] = useState(true);
  const [puntoActivo, setPuntoActivo] = useState(0);

  const posiciones = [
    { top: "33.33%", left: "33.33%" },
    { top: "33.33%", left: "66.66%" },
    { top: "66.66%", left: "33.33%" },
    { top: "66.66%", left: "66.66%" },
    { top: "50%", left: "50%" }
  ];

  const esAmateur = puntoActivo === 4;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>
            <input type="checkbox" checked={mostrarGrid} onChange={(e) => setMostrarGrid(e.target.checked)} style={{ width: "20px", height: "20px", accentColor: "#FF4D00", cursor: "pointer" }} />
            {t.t07toggleGrid}
          </label>
        </div>

        <div style={{ aspectRatio: "16/9", background: esAmateur ? "linear-gradient(135deg, #2a1a3e 0%, #1a0a2e 100%)" : "linear-gradient(135deg, #1a3e2a 0%, #0a2e1a 100%)", borderRadius: "16px", border: "1px solid " + (esAmateur ? "rgba(255,77,77,0.4)" : "rgba(6,214,160,0.4)"), position: "relative", overflow: "hidden", marginBottom: "1.5rem", transition: "all 0.5s ease" }}>
          {mostrarGrid && (
            <>
              <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.3)" }}></div>
              <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.3)" }}></div>
              <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.3)" }}></div>
              <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.3)" }}></div>
            </>
          )}

          <div style={{
            position: "absolute",
            top: posiciones[puntoActivo].top,
            left: posiciones[puntoActivo].left,
            transform: "translate(-50%, -50%)",
            width: "60px", height: "60px",
            background: esAmateur ? "rgba(255,77,77,0.4)" : "rgba(6,214,160,0.4)",
            border: "3px solid " + (esAmateur ? "#FF4D4D" : "#06D6A0"),
            borderRadius: "50%",
            transition: "all 0.5s ease",
            boxShadow: "0 0 30px " + (esAmateur ? "#FF4D4D60" : "#06D6A060")
          }}></div>

          <div style={{
            position: "absolute",
            top: posiciones[puntoActivo].top,
            left: posiciones[puntoActivo].left,
            transform: "translate(-50%, -50%)",
            width: "12px", height: "12px",
            background: esAmateur ? "#FF4D4D" : "#06D6A0",
            borderRadius: "50%",
            transition: "all 0.5s ease"
          }}></div>
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem" }}>{t.t07puntoLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
          {t.t07puntos.map((p, i) => (
            <button key={i} onClick={() => setPuntoActivo(i)} style={{
              padding: "0.6rem", fontSize: "0.8rem",
              background: puntoActivo === i ? (i === 4 ? "#FF4D4D" : "#06D6A0") : "rgba(255,255,255,0.05)",
              color: puntoActivo === i ? "#fff" : "rgba(255,255,255,0.7)",
              border: "1px solid " + (puntoActivo === i ? (i === 4 ? "#FF4D4D" : "#06D6A0") : "rgba(255,255,255,0.1)"),
              borderRadius: "8px", cursor: "pointer", fontWeight: 600,
              transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif"
            }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ABTestInteractivo({ t }: { t: typeof translations.es }) {
  const [expandida, setExpandida] = useState<number | null>(1);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", fontFamily: "'Syne', sans-serif", textAlign: "center" }}>{t.t08abTitulo}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {t.t08variantes.map((v, i) => {
          const esExpandida = expandida === i;
          const esGanadora = i === 1;
          return (
            <button key={i} onClick={() => setExpandida(esExpandida ? null : i)} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid " + (esGanadora ? "#06D6A0" : (esExpandida ? v.color : "rgba(255,255,255,0.1)")),
              borderRadius: "16px", padding: "1.25rem", position: "relative", overflow: "hidden",
              boxShadow: esGanadora ? "0 0 30px rgba(6,214,160,0.25)" : (esExpandida ? "0 0 20px " + v.color + "30" : "none"),
              cursor: "pointer", textAlign: "left",
              transition: "all 0.3s ease",
              transform: esExpandida ? "translateY(-4px)" : "translateY(0)"
            }}>
              {esGanadora && (
                <div style={{ position: "absolute", top: "-1px", right: "-1px", background: "#06D6A0", color: "#000", fontSize: "0.65rem", fontWeight: 900, padding: "4px 10px", borderRadius: "0 16px 0 8px", letterSpacing: "0.05em" }}>★ {v.veredicto}</div>
              )}
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: v.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{v.label}</div>
              <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, " + (esGanadora ? "#06D6A040" : v.color + "40") + " 0%, " + (esGanadora ? "#06D6A020" : v.color + "20") + " 100%)", borderRadius: "8px", marginBottom: "0.75rem", position: "relative", border: "1px solid " + (esGanadora ? "rgba(6,214,160,0.3)" : v.color + "30") }}>
                <div style={{ position: "absolute", bottom: "8px", right: "10px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px" }}>{v.ctr}% CTR</div>
                <div style={{ position: "absolute", bottom: "8px", left: "10px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px" }}>{v.retencion}% RET</div>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem", color: esGanadora ? "#06D6A0" : "#fff" }}>{v.titulo}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.4, marginBottom: esExpandida ? "1rem" : 0 }}>{v.desc}</div>
              {esExpandida && (
                <div style={{ background: "rgba(0,0,0,0.4)", borderLeft: "2px solid " + v.color, padding: "0.75rem 1rem", borderRadius: "0 8px 8px 0", marginTop: "0.75rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                  {v.hipotesis}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaywallSection({ t }: { t: typeof translations.es }) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1.5rem", textTransform: "uppercase" }}>🔒 {t.paywallTag}</div>
        <h1 style={{ fontSize: "clamp(1.6rem, 4.5vw, 3.2rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-0.02em", wordBreak: "break-word" }}>{t.paywallTitle}</h1>
        <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: "700px", margin: "0 auto" }}>{t.paywallDesc}</p>
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.12) 0%, rgba(255,214,10,0.03) 100%)", border: "1px solid rgba(255,77,0,0.25)", borderRadius: "24px", padding: "clamp(2rem, 4vw, 3rem)", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", marginBottom: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.paywallIncluye}</div>
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
        <a href="/#pricing" style={{ padding: "1rem 2rem", background: "#FF4D00", color: "#fff", borderRadius: "999px", fontSize: "1rem", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 30px rgba(255,77,0,0.3)", transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,77,0,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,77,0,0.3)"; }}>{t.paywallBtnPro}</a>
        <a href="/#pricing" style={{ padding: "1rem 2rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "999px", fontSize: "1rem", fontWeight: 700, textDecoration: "none", transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FF4D00"; e.currentTarget.style.borderColor = "#FF4D00"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}>{t.paywallBtnStudio}</a>
      </div>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
        {t.paywallOrLogin} <a href="/registro" style={{ color: "#FF4D00", textDecoration: "none" }}>{t.paywallLogin}</a>
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
        <div style={{ fontSize: "clamp(4rem, 10vw, 7rem)", fontWeight: 900, color: color, lineHeight: 0.8, letterSpacing: "-0.05em", fontFamily: "'Syne', sans-serif", textShadow: "0 0 80px " + color + "40", flexShrink: 0 }}>{numero}</div>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{categoria}</div>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.5rem", wordBreak: "break-word" }}>{titulo}</h2>
          <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)", color: color, fontStyle: "italic", fontWeight: 500 }}>{subtitulo}</p>
        </div>
      </div>
      <div style={{ maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        {parrafos.map((p, i) => (
          <p key={i} style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "1.25rem" }}>{p}</p>
        ))}
      </div>
      {children}
      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid " + color + "30", borderLeft: "3px solid " + color, padding: "1.25rem 1.5rem", borderRadius: "0 12px 12px 0", marginTop: "2rem", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>★ {tipTitulo}</div>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>{tip}</p>
      </div>
      {nota && (
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "1rem", fontStyle: "italic", textAlign: "center", maxWidth: "700px", marginLeft: "auto", marginRight: "auto" }}>{nota}</div>
      )}
    </section>
  );
}

function ContenidoPro({ t, plan }: { t: typeof translations.es; plan: Plan }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem clamp(1rem, 4vw, 3rem)" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(6,214,160,0.15)", border: "1px solid rgba(6,214,160,0.5)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, color: "#06D6A0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          ✓ {plan === "studio" ? t.planBadgeStudio : t.planBadgePro}
        </div>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>{t.badgePro}</div>
        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 4rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1, letterSpacing: "-0.03em", marginBottom: "1.5rem", wordBreak: "break-word" }}>
          {t.heroTitle1}<br /><span style={{ color: "#FF4D00" }}>{t.heroTitle2}</span>
        </h1>
        <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "rgba(255,255,255,0.7)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.5 }}>{t.heroDesc}</p>
      </div>
      <div style={{ maxWidth: "800px", margin: "0 auto 5rem", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)", color: "rgba(255,255,255,0.95)", lineHeight: 1.5, fontWeight: 300, marginBottom: "1rem", fontFamily: "'Syne', sans-serif" }}>{t.introParrafo1}</p>
        <p style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "2rem" }}>{t.introParrafo2}</p>
        <div style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.25)", borderRadius: "16px", padding: "1.5rem 2rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>
          <span style={{ color: "#06D6A0", fontWeight: 700, marginRight: "0.5rem" }}>★</span>{t.introCaja}
        </div>
      </div>

      <TecnicaSection numero={t.t01num} categoria={t.t01categoria} titulo={t.t01titulo} subtitulo={t.t01subtitulo} parrafos={[t.t01parrafo1, t.t01parrafo2]} tipTitulo={t.t01tipTitulo} tip={t.t01tip} color="#FF4D00"><SimuladorCtr t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t02num} categoria={t.t02categoria} titulo={t.t02titulo} subtitulo={t.t02subtitulo} parrafos={[t.t02parrafo1, t.t02parrafo2]} tipTitulo={t.t02tipTitulo} tip={t.t02tip} color="#FFD60A"><Trafico3FuentesInteractivo t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t03num} categoria={t.t03categoria} titulo={t.t03titulo} subtitulo={t.t03subtitulo} parrafos={[t.t03parrafo1, t.t03parrafo2]} tipTitulo={t.t03tipTitulo} tip={t.t03tip} nota={t.t03nota} color="#06D6A0"><SimuladorClickbait t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t04num} categoria={t.t04categoria} titulo={t.t04titulo} subtitulo={t.t04subtitulo} parrafos={[t.t04parrafo1, t.t04parrafo2]} tipTitulo={t.t04tipTitulo} tip={t.t04tip} color="#FF4D00"><SelectorColor t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t05num} categoria={t.t05categoria} titulo={t.t05titulo} subtitulo={t.t05subtitulo} parrafos={[t.t05parrafo1, t.t05parrafo2]} tipTitulo={t.t05tipTitulo} tip={t.t05tip} color="#FFD60A"><VisualAIDAInteractivo t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t06num} categoria={t.t06categoria} titulo={t.t06titulo} subtitulo={t.t06subtitulo} parrafos={[t.t06parrafo1, t.t06parrafo2]} tipTitulo={t.t06tipTitulo} tip={t.t06tip} color="#06D6A0"><TipografiaInteractiva t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t07num} categoria={t.t07categoria} titulo={t.t07titulo} subtitulo={t.t07subtitulo} parrafos={[t.t07parrafo1, t.t07parrafo2]} tipTitulo={t.t07tipTitulo} tip={t.t07tip} color="#FF4D00"><ComposicionInteractiva t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t08num} categoria={t.t08categoria} titulo={t.t08titulo} subtitulo={t.t08subtitulo} parrafos={[t.t08parrafo1, t.t08parrafo2]} tipTitulo={t.t08tipTitulo} tip={t.t08tip} color="#FFD60A"><ABTestInteractivo t={t} /></TecnicaSection>

      <div style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.08) 0%, rgba(255,214,10,0.02) 100%)", border: "1px dashed rgba(255,77,0,0.3)", borderRadius: "24px", padding: "clamp(2rem, 4vw, 3.5rem)", textAlign: "center", marginTop: "4rem", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>{t.proximamenteTag}</div>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: "1rem" }}>{t.proximamenteTitulo}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem", fontSize: "0.95rem" }}>{t.proximamenteDesc}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.5rem", maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
          {t.proximamenteItems.map((item, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", borderLeft: "2px solid rgba(255,77,0,0.4)" }}>{item}</div>
          ))}
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
        if (data.loggedIn) setPlan(data.plan || "gratis");
        else setPlan("gratis");
        setVerificando(false);
      })
      .catch(() => { setPlan("gratis"); setVerificando(false); });
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
        .simSlider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; outline: none; cursor: pointer; }
        .simSlider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; background: #FF4D00; border-radius: 50%; cursor: pointer; box-shadow: 0 0 0 4px rgba(255,77,0,0.2), 0 4px 12px rgba(255,77,0,0.3); transition: all 0.2s; }
        .simSlider::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(255,77,0,0.3), 0 4px 16px rgba(255,77,0,0.5); }
        .simSlider::-moz-range-thumb { width: 22px; height: 22px; background: #FF4D00; border-radius: 50%; cursor: pointer; border: none; box-shadow: 0 0 0 4px rgba(255,77,0,0.2), 0 4px 12px rgba(255,77,0,0.3); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
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
              <a href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{t.volverDashboard}</a>
            </div>
          </header>
          {!esPro ? <PaywallSection t={t} /> : <ContenidoPro t={t} plan={plan} />}
        </div>
      </div>
    </>
  );
}
