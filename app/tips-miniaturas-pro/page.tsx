"use client";
import Logo from "@/components/Logo";
import { useState, useEffect, useRef } from "react";

type Plan = "gratis" | "pro" | "studio" | null;

const translations = {
  es: {
    verificando: "Verificando tu plan...",
    badgePro: "Guía avanzada Pro",
    heroTitle1: "TÉCNICAS",
    heroTitle2: "PROFESIONALES",
    heroDesc: "12 principios avanzados usados por canales con más de 100K suscriptores. Alineados con las políticas oficiales de YouTube y diseñados para resultados sostenibles a largo plazo.",
    volverDashboard: "Volver al dashboard",
    introParrafo1: "Esta guía no es sobre trucos ni clickbait.",
    introParrafo2: "Es sobre entender cómo piensa el algoritmo de YouTube en 2026 y diseñar miniaturas que generen clics honestos, retención alta y crecimiento compuesto.",
    introCaja: "Todo lo que leerás aquí está alineado con las políticas oficiales de YouTube y con nuestros términos de uso.",
    paywallTag: "Contenido exclusivo",
    paywallTitle: "Esta guía es solo para miembros Pro y Studio",
    paywallDesc: "12 técnicas avanzadas con simuladores interactivos, infografías y ejemplos. Todo respaldado por datos oficiales de YouTube y miles de canales LATAM.",
    paywallIncluye: "Lo que incluye:",
    paywallItems: [
      "12 técnicas profesionales con visuales interactivos",
      "Simuladores que demuestran los conceptos en vivo",
      "Framework AIDA aplicado paso a paso",
      "Psicología del color por nicho",
      "Análisis del algoritmo YouTube 2026",
      "Benchmarks de CTR por categoría LATAM",
      "Checklist pre-publicación de 7 puntos",
      "Prompts optimizados para ThumbsLatam",
      "+3 bonus exclusivos para miembros Studio",
    ],
    paywallBtnPro: "Suscribirme a Pro - $10/mes",
    paywallBtnStudio: "Suscribirme a Studio - $25/mes",
    paywallOrLogin: "¿Ya tienes plan Pro o Studio?",
    paywallLogin: "Inicia sesión",
    planBadgePro: "Plan Pro activo",
    planBadgeStudio: "Plan Studio activo",

    t01num: "01", t01categoria: "Fundamentos del algoritmo",
    t01titulo: "Cómo YouTube mide el éxito",
    t01subtitulo: "No es solo el CTR. Es retención + satisfacción.",
    t01parrafo1: "El algoritmo de YouTube evalúa dos señales en cada video: si lograste que hicieran clic (CTR) y si se quedaron viendo (retención).",
    t01parrafo2: "Un CTR del 10 por ciento con retención del 20 por ciento vale menos que un CTR del 5 por ciento con retención del 60 por ciento.",
    t01simTitulo: "Simula el impacto real",
    t01simCtr: "Tu CTR", t01simRet: "Tu retención", t01simImpr: "Impresiones mensuales",
    t01simResClicks: "Clicks generados", t01simResMin: "Minutos vistos totales", t01simResScore: "Score combinado",
    t01simResLabel: "El algoritmo premia retención sobre CTR.",
    t01tipTitulo: "Tip accionable",
    t01tip: "Revisa tus últimos 10 videos en YouTube Studio. Los que tienen retención mayor a 50 por ciento son tu plantilla.",

    t02num: "02", t02categoria: "Fundamentos del algoritmo",
    t02titulo: "Las 3 fuentes de tráfico",
    t02subtitulo: "Ve cómo se comporta cada contexto en vivo.",
    t02parrafo1: "Los espectadores encuentran tu video de 3 formas: Búsqueda, Sugeridos y Home. Cada contexto cambia completamente qué miniatura gana.",
    t02parrafo2: "Esta demostración te muestra exactamente cómo se ve la competencia visual en cada uno de los 3 contextos. Haz clic en cada tab.",
    t02tabBusqueda: "Búsqueda",
    t02tabSugeridos: "Sugeridos",
    t02tabHome: "Home",
    t02busquedaTitulo: "Resultado de búsqueda simulado",
    t02busquedaQuery: "tutorial photoshop",
    t02busquedaInsight: "Aquí el usuario YA SABE qué quiere. Las miniaturas que ganan son las que prometen la respuesta exacta: texto directo, resultado final visible, número concreto.",
    t02sugeridosTitulo: "Panel de sugeridos simulado",
    t02sugeridosInsight: "El usuario está viendo un video. Las miniaturas que ganan en sugeridos son las que mantienen coherencia visual pero ofrecen algo complementario.",
    t02homeTitulo: "Feed de inicio simulado",
    t02homeInsight: "El usuario no busca nada. Scrollea. Solo las miniaturas con CONTRASTE EXTREMO o emoción fuerte detienen el scroll.",
    t02tipTitulo: "Tip accionable",
    t02tip: "Revisa en YouTube Studio > Analytics > Fuentes de tráfico de dónde viene tu tráfico. Adapta tu estrategia visual a dónde te descubren más.",

    t03num: "03", t03categoria: "Fundamentos del algoritmo",
    t03titulo: "Por qué el clickbait te destruye",
    t03subtitulo: "YouTube mide cuántos se quedan, no cuántos llegan.",
    t03parrafo1: "Desde mediados de 2025, YouTube renombró su política a Inauthentic Content Policy. La plataforma evalúa el canal completo.",
    t03parrafo2: "Si tus miniaturas prometen algo que tus videos no entregan, el algoritmo detecta el patrón y reduce tu alcance permanentemente.",
    t03simTitulo: "Proyección a 90 días",
    t03simHonesta: "Canal honesto", t03simClick: "Canal clickbait",
    t03simMes1: "Mes 1", t03simMes2: "Mes 2", t03simMes3: "Mes 3",
    t03simResLabel: "El clickbait genera picos iniciales. Pero el algoritmo aprende y te penaliza.",
    t03tipTitulo: "Regla práctica",
    t03tip: "Antes de publicar, pregúntate: si alguien hace clic esperando esto, ¿estará satisfecho al minuto 2?",
    t03nota: "Nota: Los filtros de ThumbsLatam bloquean prompts que busquen miniaturas engañosas.",

    t04num: "04", t04categoria: "Diseño profesional",
    t04titulo: "Psicología del color por nicho",
    t04subtitulo: "Cada industria tiene su paleta ganadora.",
    t04parrafo1: "El color no es decoración. Es el primer filtro visual que tu cerebro usa para clasificar contenido en 50 milisegundos.",
    t04parrafo2: "Los canales ganadores por nicho convergen en paletas similares porque funcionan.",
    t04nichoTitulo: "Selecciona un nicho",
    t04nichos: [
      { nombre: "Gaming", desc: "Alta saturación, contraste brutal, acción", colores: ["#FF0040", "#00E5FF", "#FFD60A", "#000000"] },
      { nombre: "Beauty", desc: "Rosados, nudes, dorados. Limpieza visual", colores: ["#FFB6C1", "#F4C2C2", "#D4AF37", "#FFFFFF"] },
      { nombre: "Tech", desc: "Azules profundos, naranjas de acento", colores: ["#0A192F", "#FF4D00", "#64FFDA", "#CCD6F6"] },
      { nombre: "Finanzas", desc: "Verdes, azules serios, dorados de autoridad", colores: ["#0D4F3C", "#1E3A5F", "#D4AF37", "#F5F5F5"] },
      { nombre: "Lifestyle", desc: "Pasteles, tierra, luz natural", colores: ["#F4E4C1", "#C9A27E", "#8B7355", "#F9F6F1"] },
    ],
    t04tipTitulo: "Tip accionable",
    t04tip: "Mira los 10 canales más grandes de tu nicho. Toma nota de sus 3 colores más repetidos.",

    t05num: "05", t05categoria: "Diseño profesional",
    t05titulo: "Framework AIDA aplicado",
    t05subtitulo: "Construye una miniatura paso a paso, capa por capa.",
    t05parrafo1: "AIDA (Atención, Interés, Deseo, Acción) es un framework de 1898 que sigue funcionando porque se basa en cómo procesa información el cerebro humano.",
    t05parrafo2: "Observa cómo se transforma una miniatura vacía cuando agregas cada capa. Al final, verás la diferencia entre una miniatura sin AIDA y una con las 4 capas completas.",
    t05vacia: "Miniatura vacía",
    t05activas: "Capas activas",
    t05verTodas: "Activar las 4 capas",
    t05quitarTodas: "Reiniciar",
    t05layers: [
      { letra: "A", nombre: "Atención", desc: "Contraste extremo, rostro con emoción. Rompe el scroll." },
      { letra: "I", nombre: "Interés", desc: "Elemento misterioso que genera curiosidad." },
      { letra: "D", nombre: "Deseo", desc: "Promesa de beneficio concreto." },
      { letra: "A", nombre: "Acción", desc: "Flecha o señal visual que invita al clic." },
    ],
    t05tipTitulo: "Tip accionable",
    t05tip: "Antes de exportar una miniatura, verifica que tenga las 4 capas. Si falta alguna, tu miniatura pierde contra las que tienen las 4.",

    t06num: "06", t06categoria: "Diseño profesional",
    t06titulo: "Tipografía en contexto",
    t06subtitulo: "Escribe y ve cómo funciona en miniatura real.",
    t06parrafo1: "La tipografía no es decoración. Es lenguaje emocional silencioso que cambia según el contexto del nicho.",
    t06parrafo2: "Escribe tu texto y cambia el nicho. Verás que la misma palabra se lee diferente según el contexto visual.",
    t06inputLabel: "Escribe tu texto de miniatura",
    t06inputPlaceholder: "Ej: EL SECRETO",
    t06contextoLabel: "Cambia el nicho",
    t06contextos: [
      { nombre: "Finanzas", fondo: "linear-gradient(135deg, #0D4F3C 0%, #1E3A5F 100%)", acento: "#D4AF37", recomendada: "serif" },
      { nombre: "Gaming", fondo: "linear-gradient(135deg, #FF0040 0%, #000000 100%)", acento: "#FFD60A", recomendada: "sans" },
      { nombre: "Lifestyle", fondo: "linear-gradient(135deg, #F4E4C1 0%, #C9A27E 100%)", acento: "#8B7355", recomendada: "serif" },
      { nombre: "Tech", fondo: "linear-gradient(135deg, #0A192F 0%, #1a3a5a 100%)", acento: "#FF4D00", recomendada: "sans" },
    ],
    t06serif: "Serif (Georgia)",
    t06sans: "Sans-serif (Syne)",
    t06recomendadaSerif: "Serif es la recomendada para este nicho",
    t06recomendadaSans: "Sans-serif es la recomendada para este nicho",
    t06tipTitulo: "Tip accionable",
    t06tip: "Finanzas, educación y lujo funcionan mejor con serif. Gaming, tech y fitness funcionan mejor con sans-serif.",

    t07num: "07", t07categoria: "Composición visual",
    t07titulo: "Zona de mirada del espectador",
    t07subtitulo: "Mueve el rostro y ve hacia dónde va la atención.",
    t07parrafo1: "El cerebro humano procesa rostros antes que cualquier otro elemento. Cuando hay una cara en la miniatura, los ojos del espectador siguen la dirección de su mirada.",
    t07parrafo2: "Usa esto a tu favor: coloca el rostro mirando hacia el texto o elemento clave. El espectador lo leerá automáticamente, aunque no se dé cuenta.",
    t07instruccion: "Arrastra el rostro a los 4 puntos de la miniatura",
    t07posiciones: ["Superior izquierda", "Superior derecha", "Inferior izquierda", "Inferior derecha"],
    t07insight: "La flecha representa hacia dónde van los ojos del espectador.",
    t07tipTitulo: "Tip accionable",
    t07tip: "Siempre coloca el rostro mirando hacia el texto principal. Nunca mirando hacia afuera del encuadre: eso hace que la atención escape de tu miniatura.",

    t08num: "08", t08categoria: "Optimización y datos",
    t08titulo: "A/B Testing en vivo",
    t08subtitulo: "Ve cuál miniatura gana y por qué.",
    t08parrafo1: "El A/B testing real ocurre dentro de YouTube Studio: publicas dos miniaturas y la plataforma decide cuál tiene mejor CTR en 48 horas.",
    t08parrafo2: "Pero antes de publicar, puedes predecir el ganador aplicando los principios que ya aprendiste. Haz clic en cada miniatura y ve su puntuación.",
    t08instruccion: "Haz clic en cada miniatura para ver su análisis",
    t08ctrLabel: "CTR estimado",
    t08puntuacion: "Puntuación",
    t08ganadora: "GANADORA",
    t08perdedora: "PIERDE",
    t08miniaturas: [
      {
        id: "a",
        bg: "linear-gradient(135deg, #FF4D00 0%, #1a0a00 100%)",
        texto: "SECRETO",
        subtexto: "que nadie dice",
        acento: "#FFD60A",
        ctr: 8.4,
        puntuacion: 91,
        gana: true,
        razones: ["Contraste extremo fondo/texto", "Promesa de valor clara", "Texto legible en miniatura pequeña", "Color de acento crea jerarquía"],
      },
      {
        id: "b",
        bg: "linear-gradient(135deg, #2a2a3e 0%, #111122 100%)",
        texto: "Mi video sobre el tema",
        subtexto: "",
        acento: "#8B8FA8",
        ctr: 2.1,
        puntuacion: 28,
        gana: false,
        razones: ["Texto genérico sin promesa", "Bajo contraste, difícil de leer", "Sin jerarquía visual clara", "No genera curiosidad"],
      },
      {
        id: "c",
        bg: "linear-gradient(135deg, #0D4F3C 0%, #064028 100%)",
        texto: "3 PASOS",
        subtexto: "para duplicar tus views",
        acento: "#FFD60A",
        ctr: 6.7,
        puntuacion: 74,
        gana: false,
        razones: ["Número concreto genera confianza", "Promesa de resultado específico", "Buen contraste verde/amarillo", "Podría mejorar con rostro"],
      },
    ],
    t08tipTitulo: "Tip accionable",
    t08tip: "En YouTube Studio puedes activar el A/B testing oficial desde el editor de miniaturas. Prueba siempre 2 versiones: una segura y una arriesgada. La arriesgada gana más veces de lo que crees.",


    t09num: "09", t09categoria: "Estrategia de canal",
    t09titulo: "Consistencia visual",
    t09subtitulo: "Tu canal es una marca. Trátalo como tal.",
    t09parrafo1: "Un canal con identidad visual consistente genera confianza. El espectador reconoce tus miniaturas antes de leer el título, igual que reconoce una lata de Coca-Cola sin leer la etiqueta.",
    t09parrafo2: "Haz clic en los dos estados para ver la diferencia entre un canal con y sin consistencia visual.",
    t09labelCon: "Con consistencia",
    t09labelSin: "Sin consistencia",
    t09insight: "Los canales con identidad visual consistente tienen hasta 3x más tasa de retorno de audiencia.",
    t09tipTitulo: "Tip accionable",
    t09tip: "Define 3 reglas fijas para todas tus miniaturas: paleta de 2-3 colores, 1 tipografía principal, y posición fija del logo o marca personal.",

    t10num: "10", t10categoria: "Formatos y plataforma",
    t10titulo: "Shorts vs videos largos",
    t10subtitulo: "Mismo canal, estrategia visual diferente.",
    t10parrafo1: "YouTube Shorts y los videos largos compiten en contextos completamente distintos. Lo que funciona en uno puede destruirte en el otro.",
    t10parrafo2: "Selecciona el formato para ver las diferencias clave que debes aplicar en tu estrategia visual.",
    t10tabShorts: "Shorts",
    t10tabLargos: "Videos largos",
    t10shorts: {
      ratio: "9:16 vertical",
      ratioDesc: "Diseñado para móvil, pantalla completa",
      texto: "Texto grande, máximo 3 palabras",
      textoDesc: "Se lee en 0.5 segundos o no se lee",
      rostro: "Rostro central, emoción extrema",
      rostroDesc: "Ocupa 60-70% del encuadre",
      color: "Contraste brutal, saturación alta",
      colorDesc: "Compite en feed vertical de scroll rápido",
      logo: "Sin logo ni marca personal",
      logoDesc: "El encuadre no tiene espacio",
      insight: "En Shorts, la miniatura se ve 0.3 segundos. Emoción + contraste es todo lo que tienes.",
    },
    t10largos: {
      ratio: "16:9 horizontal",
      ratioDesc: "Desktop y mobile landscape",
      texto: "Texto complementario al título",
      textoDesc: "Puede ser más elaborado, 4-6 palabras",
      rostro: "Rostro en tercio izquierdo o derecho",
      rostroDesc: "Mirando hacia el texto clave",
      color: "Paleta de nicho, identidad consistente",
      colorDesc: "El espectador reconoce tu canal",
      logo: "Logo sutil en esquina inferior",
      logoDesc: "Refuerza la marca sin distraer",
      insight: "En videos largos, la miniatura + título se leen juntos. Diseña para que se complementen, no se repitan.",
    },
    t10tipTitulo: "Tip accionable",
    t10tip: "Si publicas Shorts y videos largos en el mismo canal, usa paletas de color distintas para diferenciarlos. Tus suscriptores aprenderán a identificar el formato antes de hacer clic.",

    t11num: "11", t11categoria: "Herramientas y flujo",
    t11titulo: "Prompts optimizados",
    t11subtitulo: "Copia y usa. Resultados en segundos.",
    t11parrafo1: "Un buen prompt para ThumbsLatam no describe la imagen que quieres. Describe el impacto que debe generar en el espectador.",
    t11parrafo2: "Selecciona tu nicho y copia el prompt optimizado. Está diseñado para extraer el máximo potencial del generador.",
    t11nichoLabel: "Selecciona tu nicho",
    t11copiar: "Copiar",
    t11copiado: "¡Copiado!",
    t11nichos: [
      {
        nombre: "Gaming",
        prompt: "Miniatura estilo gaming con rostro masculino expresión shock extremo, boca abierta, ojos muy abiertos, fondo negro con destellos rojos y amarillos, texto 'IMPOSIBLE' en tipografía agresiva sans-serif amarillo neón, contraste brutal, estilo MrBeast gaming, alta saturación",
      },
      {
        nombre: "Finanzas",
        prompt: "Miniatura profesional finanzas personales, hombre 30s traje oscuro expresión segura confiada, fondo degradado azul marino a verde oscuro, gráfico de barras ascendente en esquina, texto '10X' tipografía serif dorada, iluminación dramática lateral, aire de autoridad y éxito",
      },
      {
        nombre: "Lifestyle",
        prompt: "Miniatura lifestyle femenina, mujer sonrisa genuina cálida, fondo tonos tierra beige y terracota, luz natural golden hour, elementos minimalistas, texto elegante serif crema, composición limpia espaciosa, sensación de bienestar y autenticidad",
      },
      {
        nombre: "Tech",
        prompt: "Miniatura tecnología, persona señalando pantalla holográfica azul, fondo oscuro con elementos de código y circuitos, acento naranja en elemento clave, texto sans-serif blanco limpio, estética futurista pero accesible, sensación de descubrimiento y novedad",
      },
      {
        nombre: "Educación",
        prompt: "Miniatura educativa, persona expresión sorpresa positiva, fondo limpio con elementos visuales del tema (iconos, diagramas), paleta azul y blanco con acento amarillo, texto claro con número concreto, sensación de claridad y aprendizaje acelerado",
      },
    ],
    t11tipTitulo: "Tip accionable",
    t11tip: "Agrega siempre el contexto de tu video al final del prompt: 'para video sobre [tema específico]'. Eso mejora la relevancia del resultado un 40%.",

    t12num: "12", t12categoria: "Control de calidad",
    t12titulo: "Checklist pre-publicación",
    t12subtitulo: "7 puntos. Si falla uno, no publiques.",
    t12parrafo1: "Los canales que crecen consistentemente tienen un proceso, no solo talento. Este checklist de 7 puntos es el filtro final antes de publicar cualquier miniatura.",
    t12parrafo2: "Marca cada punto. Si no puedes marcar los 7, tu miniatura no está lista.",
    t12items: [
      { id: 1, texto: "El texto principal se lee en menos de 2 segundos", detalle: "Reduce a pantalla del 10% para simular cómo se ve en feed" },
      { id: 2, texto: "Hay contraste suficiente entre texto y fondo", detalle: "Ratio mínimo recomendado: 4.5:1 según estándares de accesibilidad" },
      { id: 3, texto: "El rostro o elemento principal ocupa al menos 40% del encuadre", detalle: "Los elementos pequeños no generan impacto emocional en miniaturas" },
      { id: 4, texto: "La miniatura y el título se complementan (no se repiten)", detalle: "Si dicen lo mismo, estás desperdiciando el doble de espacio de comunicación" },
      { id: 5, texto: "No hay elementos que distraigan del mensaje principal", detalle: "Regla: si lo quitas y no se pierde nada, quítalo" },
      { id: 6, texto: "La paleta es consistente con tu identidad de canal", detalle: "El espectador debe reconocerte antes de leer tu nombre" },
      { id: 7, texto: "La miniatura cumple lo que el video entrega", detalle: "Pregúntate: ¿alguien que haga clic quedará satisfecho al minuto 2?" },
    ],
    t12scoreLabels: ["Necesitas trabajo", "Casi lista", "Lista para publicar", "Miniatura perfecta"],
    t12reiniciar: "Reiniciar checklist",
    t12tipTitulo: "Tip accionable",
    t12tip: "Guarda este checklist como imagen y pégalo en tu escritorio. Úsalo en cada miniatura durante 30 días. Después de ese tiempo, lo tendrás automatizado en tu cabeza.",

    proximamenteTag: "Continuará",
    proximamenteTitulo: "Bonus exclusivos Studio",
    proximamenteDesc: "Contenido adicional disponible para miembros Studio:",
    proximamenteItems: [
      "Bonus 1: Análisis competitivo de miniaturas",
      "Bonus 2: Calendario editorial visual",
      "Bonus 3: Biblioteca de 50 prompts avanzados",
    ],
  },
  en: {
    verificando: "Verifying your plan...",
    badgePro: "Advanced Pro guide",
    heroTitle1: "PROFESSIONAL",
    heroTitle2: "TECHNIQUES",
    heroDesc: "12 advanced principles used by channels with 100K+ subscribers. Aligned with official YouTube policies.",
    volverDashboard: "Back to dashboard",
    introParrafo1: "This guide is not about tricks or clickbait.",
    introParrafo2: "It is about understanding how the YouTube algorithm thinks in 2026.",
    introCaja: "Everything you will read here is aligned with official YouTube policies and our terms of use.",
    paywallTag: "Exclusive content",
    paywallTitle: "This guide is only for Pro and Studio members",
    paywallDesc: "12 advanced techniques with interactive simulators.",
    paywallIncluye: "What it includes:",
    paywallItems: [
      "12 professional techniques with interactive visuals",
      "Simulators that demonstrate concepts live",
      "AIDA Framework step by step",
      "Color psychology by niche",
      "2026 YouTube algorithm analysis",
      "CTR benchmarks by LATAM category",
      "Pre-publication 7-point checklist",
      "Optimized prompts for ThumbsLatam",
      "+3 exclusive bonuses for Studio members",
    ],
    paywallBtnPro: "Subscribe to Pro - $10/month",
    paywallBtnStudio: "Subscribe to Studio - $25/month",
    paywallOrLogin: "Already have Pro or Studio?",
    paywallLogin: "Sign in",
    planBadgePro: "Pro plan active",
    planBadgeStudio: "Studio plan active",

    t01num: "01", t01categoria: "Algorithm fundamentals",
    t01titulo: "How YouTube measures success",
    t01subtitulo: "Not just CTR. Retention + satisfaction.",
    t01parrafo1: "YouTube evaluates two signals: if you got the click (CTR) and if they stayed (retention).",
    t01parrafo2: "A 10% CTR with 20% retention is worth less than 5% CTR with 60% retention.",
    t01simTitulo: "Simulate the real impact",
    t01simCtr: "Your CTR", t01simRet: "Your retention", t01simImpr: "Monthly impressions",
    t01simResClicks: "Clicks generated", t01simResMin: "Total minutes watched", t01simResScore: "Combined score",
    t01simResLabel: "The algorithm rewards retention over CTR.",
    t01tipTitulo: "Actionable tip",
    t01tip: "Review your last 10 videos in YouTube Studio. Those with retention above 50% are your template.",

    t02num: "02", t02categoria: "Algorithm fundamentals",
    t02titulo: "The 3 traffic sources",
    t02subtitulo: "See how each context behaves live.",
    t02parrafo1: "Viewers find your video in 3 ways: Search, Suggested and Home. Each context completely changes which thumbnail wins.",
    t02parrafo2: "This demo shows you exactly how visual competition looks in each of the 3 contexts. Click each tab.",
    t02tabBusqueda: "Search",
    t02tabSugeridos: "Suggested",
    t02tabHome: "Home",
    t02busquedaTitulo: "Simulated search results",
    t02busquedaQuery: "photoshop tutorial",
    t02busquedaInsight: "Here the user ALREADY knows what they want. Winning thumbnails promise the exact answer: direct text, visible final result, concrete number.",
    t02sugeridosTitulo: "Simulated suggested panel",
    t02sugeridosInsight: "The user is watching a video. Winning thumbnails in suggested maintain visual coherence but offer something complementary.",
    t02homeTitulo: "Simulated home feed",
    t02homeInsight: "The user is not searching. They scroll. Only thumbnails with EXTREME CONTRAST or strong emotion stop the scroll.",
    t02tipTitulo: "Actionable tip",
    t02tip: "Review in YouTube Studio > Analytics > Traffic sources where your traffic comes from. Adapt your visual strategy.",

    t03num: "03", t03categoria: "Algorithm fundamentals",
    t03titulo: "Why clickbait destroys you",
    t03subtitulo: "YouTube measures who stays, not who arrives.",
    t03parrafo1: "Since mid-2025, YouTube renamed its policy to Inauthentic Content Policy.",
    t03parrafo2: "If your thumbnails promise what videos do not deliver, the algorithm detects the pattern.",
    t03simTitulo: "90-day projection",
    t03simHonesta: "Honest channel", t03simClick: "Clickbait channel",
    t03simMes1: "Month 1", t03simMes2: "Month 2", t03simMes3: "Month 3",
    t03simResLabel: "Clickbait generates initial spikes. The algorithm learns and penalizes.",
    t03tipTitulo: "Practical rule",
    t03tip: "Before publishing ask: will a viewer clicking expecting this be satisfied at minute 2?",
    t03nota: "Note: ThumbsLatam filters block prompts seeking misleading thumbnails.",

    t04num: "04", t04categoria: "Professional design",
    t04titulo: "Color psychology by niche",
    t04subtitulo: "Each industry has its winning palette.",
    t04parrafo1: "Color is not decoration. It is the first visual filter your brain uses in 50 milliseconds.",
    t04parrafo2: "Winning channels by niche converge on similar palettes.",
    t04nichoTitulo: "Select a niche",
    t04nichos: [
      { nombre: "Gaming", desc: "High saturation, brutal contrast, action", colores: ["#FF0040", "#00E5FF", "#FFD60A", "#000000"] },
      { nombre: "Beauty", desc: "Pinks, nudes, golds. Visual cleanliness", colores: ["#FFB6C1", "#F4C2C2", "#D4AF37", "#FFFFFF"] },
      { nombre: "Tech", desc: "Deep blues, accent oranges", colores: ["#0A192F", "#FF4D00", "#64FFDA", "#CCD6F6"] },
      { nombre: "Finance", desc: "Greens, serious blues, authority golds", colores: ["#0D4F3C", "#1E3A5F", "#D4AF37", "#F5F5F5"] },
      { nombre: "Lifestyle", desc: "Pastels, earth tones, natural light", colores: ["#F4E4C1", "#C9A27E", "#8B7355", "#F9F6F1"] },
    ],
    t04tipTitulo: "Actionable tip",
    t04tip: "Look at the 10 biggest channels in your niche. Note their 3 most repeated colors.",

    t05num: "05", t05categoria: "Professional design",
    t05titulo: "AIDA Framework applied",
    t05subtitulo: "Build a thumbnail step by step, layer by layer.",
    t05parrafo1: "AIDA is an 1898 framework that still works because it is based on how the human brain processes information.",
    t05parrafo2: "Watch how an empty thumbnail transforms as you add each layer. See the difference between a thumbnail without AIDA and one with all 4 layers.",
    t05vacia: "Empty thumbnail",
    t05activas: "Active layers",
    t05verTodas: "Activate all 4 layers",
    t05quitarTodas: "Reset",
    t05layers: [
      { letra: "A", nombre: "Attention", desc: "Extreme contrast, emotional face. Breaks the scroll." },
      { letra: "I", nombre: "Interest", desc: "Mysterious element that generates curiosity." },
      { letra: "D", nombre: "Desire", desc: "Promise of concrete benefit." },
      { letra: "A", nombre: "Action", desc: "Arrow or visual signal that invites the click." },
    ],
    t05tipTitulo: "Actionable tip",
    t05tip: "Before exporting a thumbnail, verify it has all 4 layers. If any is missing, yours loses against those with all 4.",

    t06num: "06", t06categoria: "Professional design",
    t06titulo: "Typography in context",
    t06subtitulo: "Write and see how it works in real thumbnail.",
    t06parrafo1: "Typography is not decoration. It is silent emotional language that changes according to niche context.",
    t06parrafo2: "Write your text and change the niche. The same word reads differently depending on the visual context.",
    t06inputLabel: "Write your thumbnail text",
    t06inputPlaceholder: "Ex: THE SECRET",
    t06contextoLabel: "Change the niche",
    t06contextos: [
      { nombre: "Finance", fondo: "linear-gradient(135deg, #0D4F3C 0%, #1E3A5F 100%)", acento: "#D4AF37", recomendada: "serif" },
      { nombre: "Gaming", fondo: "linear-gradient(135deg, #FF0040 0%, #000000 100%)", acento: "#FFD60A", recomendada: "sans" },
      { nombre: "Lifestyle", fondo: "linear-gradient(135deg, #F4E4C1 0%, #C9A27E 100%)", acento: "#8B7355", recomendada: "serif" },
      { nombre: "Tech", fondo: "linear-gradient(135deg, #0A192F 0%, #1a3a5a 100%)", acento: "#FF4D00", recomendada: "sans" },
    ],
    t06serif: "Serif (Georgia)",
    t06sans: "Sans-serif (Syne)",
    t06recomendadaSerif: "Serif is recommended for this niche",
    t06recomendadaSans: "Sans-serif is recommended for this niche",
    t06tipTitulo: "Actionable tip",
    t06tip: "Finance, education and luxury work better with serif. Gaming, tech and fitness work better with sans-serif.",

    t07num: "07", t07categoria: "Visual composition",
    t07titulo: "Viewer gaze zone",
    t07subtitulo: "Move the face and see where attention goes.",
    t07parrafo1: "The human brain processes faces before any other element. When there is a face in the thumbnail, the viewer's eyes follow the direction of its gaze.",
    t07parrafo2: "Use this to your advantage: place the face looking toward the text or key element. The viewer will read it automatically, without even noticing.",
    t07instruccion: "Drag the face to the 4 positions in the thumbnail",
    t07posiciones: ["Top left", "Top right", "Bottom left", "Bottom right"],
    t07insight: "The arrow shows where the viewer's eyes go.",
    t07tipTitulo: "Actionable tip",
    t07tip: "Always place the face looking toward the main text. Never looking outward from the frame: that causes attention to escape your thumbnail.",

    t08num: "08", t08categoria: "Optimization & data",
    t08titulo: "Live A/B Testing",
    t08subtitulo: "See which thumbnail wins and why.",
    t08parrafo1: "Real A/B testing happens inside YouTube Studio: you publish two thumbnails and the platform decides which has better CTR in 48 hours.",
    t08parrafo2: "But before publishing, you can predict the winner by applying the principles you have already learned. Click each thumbnail to see its score.",
    t08instruccion: "Click each thumbnail to see its analysis",
    t08ctrLabel: "Estimated CTR",
    t08puntuacion: "Score",
    t08ganadora: "WINNER",
    t08perdedora: "LOSES",
    t08miniaturas: [
      {
        id: "a",
        bg: "linear-gradient(135deg, #FF4D00 0%, #1a0a00 100%)",
        texto: "SECRET",
        subtexto: "nobody tells you",
        acento: "#FFD60A",
        ctr: 8.4,
        puntuacion: 91,
        gana: true,
        razones: ["Extreme background/text contrast", "Clear value promise", "Readable text at small size", "Accent color creates hierarchy"],
      },
      {
        id: "b",
        bg: "linear-gradient(135deg, #2a2a3e 0%, #111122 100%)",
        texto: "My video about the topic",
        subtexto: "",
        acento: "#8B8FA8",
        ctr: 2.1,
        puntuacion: 28,
        gana: false,
        razones: ["Generic text without promise", "Low contrast, hard to read", "No clear visual hierarchy", "Does not generate curiosity"],
      },
      {
        id: "c",
        bg: "linear-gradient(135deg, #0D4F3C 0%, #064028 100%)",
        texto: "3 STEPS",
        subtexto: "to double your views",
        acento: "#FFD60A",
        ctr: 6.7,
        puntuacion: 74,
        gana: false,
        razones: ["Concrete number builds trust", "Specific result promise", "Good green/yellow contrast", "Could improve with a face"],
      },
    ],
    t08tipTitulo: "Actionable tip",
    t08tip: "In YouTube Studio you can activate official A/B testing from the thumbnail editor. Always test 2 versions: one safe and one risky. The risky one wins more often than you think.",


    t09num: "09", t09categoria: "Channel strategy",
    t09titulo: "Visual consistency",
    t09subtitulo: "Your channel is a brand. Treat it like one.",
    t09parrafo1: "A channel with consistent visual identity builds trust. Viewers recognize your thumbnails before reading the title, just like recognizing a Coca-Cola can without reading the label.",
    t09parrafo2: "Click both states to see the difference between a channel with and without visual consistency.",
    t09labelCon: "With consistency",
    t09labelSin: "Without consistency",
    t09insight: "Channels with consistent visual identity have up to 3x higher return audience rate.",
    t09tipTitulo: "Actionable tip",
    t09tip: "Define 3 fixed rules for all your thumbnails: 2-3 color palette, 1 main typeface, and fixed position for your logo or personal brand.",

    t10num: "10", t10categoria: "Formats & platform",
    t10titulo: "Shorts vs long videos",
    t10subtitulo: "Same channel, different visual strategy.",
    t10parrafo1: "YouTube Shorts and long videos compete in completely different contexts. What works in one can destroy you in the other.",
    t10parrafo2: "Select the format to see the key differences you need to apply in your visual strategy.",
    t10tabShorts: "Shorts",
    t10tabLargos: "Long videos",
    t10shorts: {
      ratio: "9:16 vertical",
      ratioDesc: "Built for mobile, full screen",
      texto: "Large text, 3 words maximum",
      textoDesc: "Read in 0.5 seconds or not read at all",
      rostro: "Central face, extreme emotion",
      rostroDesc: "Takes up 60-70% of the frame",
      color: "Brutal contrast, high saturation",
      colorDesc: "Competes in fast-scroll vertical feed",
      logo: "No logo or personal brand",
      logoDesc: "The frame has no space for it",
      insight: "In Shorts, the thumbnail is seen for 0.3 seconds. Emotion + contrast is all you have.",
    },
    t10largos: {
      ratio: "16:9 horizontal",
      ratioDesc: "Desktop and mobile landscape",
      texto: "Text that complements the title",
      textoDesc: "Can be more elaborate, 4-6 words",
      rostro: "Face in left or right third",
      rostroDesc: "Looking toward the key text",
      color: "Niche palette, consistent identity",
      colorDesc: "Viewers recognize your channel",
      logo: "Subtle logo in bottom corner",
      logoDesc: "Reinforces brand without distracting",
      insight: "In long videos, thumbnail + title are read together. Design them to complement, not repeat each other.",
    },
    t10tipTitulo: "Actionable tip",
    t10tip: "If you publish both Shorts and long videos on the same channel, use different color palettes to differentiate them. Your subscribers will learn to identify the format before clicking.",

    t11num: "11", t11categoria: "Tools & workflow",
    t11titulo: "Optimized prompts",
    t11subtitulo: "Copy and use. Results in seconds.",
    t11parrafo1: "A good ThumbsLatam prompt does not describe the image you want. It describes the impact it should generate on the viewer.",
    t11parrafo2: "Select your niche and copy the optimized prompt. It is designed to extract maximum potential from the generator.",
    t11nichoLabel: "Select your niche",
    t11copiar: "Copy",
    t11copiado: "Copied!",
    t11nichos: [
      {
        nombre: "Gaming",
        prompt: "Gaming thumbnail with male face extreme shock expression, open mouth, wide open eyes, black background with red and yellow flashes, text 'IMPOSSIBLE' in aggressive yellow neon sans-serif typography, brutal contrast, MrBeast gaming style, high saturation",
      },
      {
        nombre: "Finance",
        prompt: "Professional personal finance thumbnail, man 30s dark suit confident secure expression, navy to dark green gradient background, ascending bar chart in corner, text '10X' gold serif typography, dramatic side lighting, air of authority and success",
      },
      {
        nombre: "Lifestyle",
        prompt: "Feminine lifestyle thumbnail, woman genuine warm smile, earth tones beige and terracotta background, natural golden hour light, minimalist elements, elegant cream serif text, clean spacious composition, feeling of wellbeing and authenticity",
      },
      {
        nombre: "Tech",
        prompt: "Technology thumbnail, person pointing at blue holographic screen, dark background with code elements and circuits, orange accent on key element, clean white sans-serif text, futuristic but accessible aesthetic, feeling of discovery and novelty",
      },
      {
        nombre: "Education",
        prompt: "Educational thumbnail, person positive surprise expression, clean background with visual topic elements (icons, diagrams), blue and white palette with yellow accent, clear text with concrete number, feeling of clarity and accelerated learning",
      },
    ],
    t11tipTitulo: "Actionable tip",
    t11tip: "Always add your video context at the end of the prompt: 'for video about [specific topic]'. That improves result relevance by 40%.",

    t12num: "12", t12categoria: "Quality control",
    t12titulo: "Pre-publication checklist",
    t12subtitulo: "7 points. If one fails, don't publish.",
    t12parrafo1: "Channels that grow consistently have a process, not just talent. This 7-point checklist is the final filter before publishing any thumbnail.",
    t12parrafo2: "Check each point. If you cannot check all 7, your thumbnail is not ready.",
    t12items: [
      { id: 1, texto: "The main text reads in under 2 seconds", detalle: "Reduce to 10% screen size to simulate how it looks in feed" },
      { id: 2, texto: "There is enough contrast between text and background", detalle: "Minimum recommended ratio: 4.5:1 per accessibility standards" },
      { id: 3, texto: "The face or main element occupies at least 40% of the frame", detalle: "Small elements generate no emotional impact in thumbnails" },
      { id: 4, texto: "The thumbnail and title complement each other (not repeat)", detalle: "If they say the same thing, you are wasting double your communication space" },
      { id: 5, texto: "There are no elements distracting from the main message", detalle: "Rule: if you remove it and nothing is lost, remove it" },
      { id: 6, texto: "The palette is consistent with your channel identity", detalle: "Viewers should recognize you before reading your name" },
      { id: 7, texto: "The thumbnail delivers what the video delivers", detalle: "Ask yourself: will someone who clicks be satisfied at minute 2?" },
    ],
    t12scoreLabels: ["Needs work", "Almost ready", "Ready to publish", "Perfect thumbnail"],
    t12reiniciar: "Reset checklist",
    t12tipTitulo: "Actionable tip",
    t12tip: "Save this checklist as an image and pin it to your desktop. Use it on every thumbnail for 30 days. After that time, it will be automated in your head.",

    proximamenteTag: "To be continued",
    proximamenteTitulo: "Exclusive Studio bonuses",
    proximamenteDesc: "Additional content available for Studio members:",
    proximamenteItems: [
      "Bonus 1: Thumbnail competitive analysis",
      "Bonus 2: Visual editorial calendar",
      "Bonus 3: Library of 50 advanced prompts",
    ],
  },
};

function SimuladorCtr({ t }: { t: typeof translations.es }) {
  const [ctr, setCtr] = useState(5);
  const [retencion, setRetencion] = useState(40);
  const [impresiones, setImpresiones] = useState(10000);
  const clicks = Math.round(impresiones * (ctr / 100));
  const minutosVistos = Math.round(clicks * 6 * (retencion / 100));
  const scoreCombinado = Math.round((ctr * retencion) / 10);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Syne', sans-serif" }}>{t.t01simTitulo}</h3>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "2rem" }}>{t.t01simResLabel}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {[
          { label: t.t01simCtr, value: ctr + "%", min: 1, max: 20, step: 1, set: setCtr, raw: ctr },
          { label: t.t01simRet, value: retencion + "%", min: 10, max: 90, step: 1, set: setRetencion, raw: retencion },
          { label: t.t01simImpr, value: impresiones.toLocaleString(), min: 1000, max: 100000, step: 1000, set: setImpresiones, raw: impresiones },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem" }}>{s.label}</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>{s.value}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.raw} onChange={(e) => s.set(Number(e.target.value))} className="simSlider" />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
        {[
          { label: t.t01simResClicks, value: clicks.toLocaleString(), color: "#FF4D00" },
          { label: t.t01simResMin, value: minutosVistos.toLocaleString(), color: "#FFD60A" },
          { label: t.t01simResScore, value: scoreCombinado, color: "#06D6A0" },
        ].map((r, i) => (
          <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.25rem", borderLeft: "3px solid " + r.color }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>{r.label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: i === 2 ? r.color : "#fff" }}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function YouTubeSimulator({ t }: { t: typeof translations.es }) {
  const [tab, setTab] = useState<"busqueda" | "sugeridos" | "home">("busqueda");

  const MiniFake = ({ texto, bg, acento, ganadora, razon }: { texto: string; bg: string; acento: string; ganadora?: boolean; razon?: string }) => (
    <div style={{ position: "relative", aspectRatio: "16/9", background: bg, borderRadius: "8px", overflow: "hidden", border: ganadora ? "2px solid #06D6A0" : "1px solid rgba(255,255,255,0.1)", boxShadow: ganadora ? "0 0 20px rgba(6,214,160,0.4)" : "none" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}>
        <div style={{ fontSize: "clamp(0.7rem, 2vw, 1rem)", fontWeight: 900, color: acento, fontFamily: "'Syne', sans-serif", textAlign: "center", textShadow: "2px 2px 4px rgba(0,0,0,0.7)", letterSpacing: "-0.02em" }}>{texto}</div>
      </div>
      {ganadora && (
        <div style={{ position: "absolute", top: "4px", right: "4px", background: "#06D6A0", color: "#000", fontSize: "0.6rem", fontWeight: 900, padding: "2px 6px", borderRadius: "4px" }}>★ GANA</div>
      )}
      {razon && (
        <div style={{ position: "absolute", bottom: "4px", left: "4px", right: "4px", background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "0.6rem", fontWeight: 600, padding: "3px 6px", borderRadius: "4px", textAlign: "center" }}>{razon}</div>
      )}
    </div>
  );

  const tabs = [
    { id: "busqueda", label: t.t02tabBusqueda, icono: "🔍", color: "#FF4D00" },
    { id: "sugeridos", label: t.t02tabSugeridos, icono: "▶", color: "#FFD60A" },
    { id: "home", label: t.t02tabHome, icono: "🏠", color: "#06D6A0" },
  ];

  const colorActual = tabs.find(x => x.id === tab)?.color || "#FF4D00";
  const isES = t.t02tabBusqueda === "Búsqueda";

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id as any)} style={{
            background: tab === tb.id ? tb.color + "20" : "rgba(255,255,255,0.03)",
            border: "1px solid " + (tab === tb.id ? tb.color : "rgba(255,255,255,0.1)"),
            borderRadius: "12px", padding: "0.8rem", cursor: "pointer",
            color: tab === tb.id ? tb.color : "rgba(255,255,255,0.7)",
            fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem", transition: "all 0.2s",
            boxShadow: tab === tb.id ? "0 0 20px " + tb.color + "30" : "none"
          }}>
            <div style={{ fontSize: "1.3rem", marginBottom: "0.2rem" }}>{tb.icono}</div>
            {tb.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#0f0f10", borderRadius: "12px", border: "1px solid " + colorActual + "40", overflow: "hidden", boxShadow: "0 0 40px " + colorActual + "20" }}>
        <div style={{ background: "#1a1a1c", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56" }}></div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E" }}></div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F" }}></div>
          </div>
          <div style={{ flex: 1, background: "#0a0a0b", borderRadius: "6px", padding: "0.3rem 0.75rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginLeft: "0.5rem" }}>
            videos.com / {tab}
          </div>
        </div>

        {tab === "busqueda" && (
          <div style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", background: "#1a1a1c", borderRadius: "999px", padding: "0.5rem 1rem", border: "1px solid rgba(255,77,0,0.3)" }}>
              <span style={{ fontSize: "1rem" }}>🔍</span>
              <div style={{ flex: 1, fontSize: "0.95rem", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{t.t02busquedaQuery}</div>
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>{t.t02busquedaTitulo}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
              <MiniFake texto={isES ? "CÓMO EN 2 MIN" : "HOW IN 2 MIN"} bg="linear-gradient(135deg, #FF4D00 0%, #000000 100%)" acento="#fff" ganadora razon={isES ? "Texto directo + tiempo concreto" : "Direct text + concrete time"} />
              <MiniFake texto="PHOTOSHOP" bg="linear-gradient(135deg, #1a1a2e 0%, #0a0a1e 100%)" acento="#8B8FA8" razon={isES ? "Muy genérico" : "Too generic"} />
              <MiniFake texto={isES ? "TUTORIAL #1" : "TUTORIAL #1"} bg="linear-gradient(135deg, #3a1a5e 0%, #1a0a3e 100%)" acento="#CCC" razon={isES ? "No dice qué aprenderás" : "Does not say what you learn"} />
              <MiniFake texto={isES ? "PASO A PASO 2026" : "STEP BY STEP 2026"} bg="linear-gradient(135deg, #0D4F3C 0%, #064028 100%)" acento="#FFD60A" ganadora razon={isES ? "Promesa de estructura + año" : "Structure promise + year"} />
            </div>
            <div style={{ marginTop: "1.25rem", background: "rgba(255,77,0,0.08)", borderLeft: "3px solid #FF4D00", borderRadius: "0 8px 8px 0", padding: "0.85rem 1.1rem", fontSize: "0.88rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
              💡 {t.t02busquedaInsight}
            </div>
          </div>
        )}

        {tab === "sugeridos" && (
          <div style={{ padding: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>{isES ? "Viendo ahora" : "Watching now"}</div>
                <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #FFD60A 0%, #FF4D00 100%)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: "clamp(0.8rem, 2.2vw, 1.3rem)", fontWeight: 900, color: "#000", fontFamily: "'Syne', sans-serif", textShadow: "1px 1px 0 rgba(255,255,255,0.3)" }}>{isES ? "VIDEO ACTUAL" : "CURRENT VIDEO"}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>{t.t02sugeridosTitulo}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <MiniFake texto={isES ? "PARTE 2" : "PART 2"} bg="linear-gradient(135deg, #FFD60A 0%, #FF4D00 100%)" acento="#000" ganadora razon={isES ? "Misma paleta" : "Same palette"} />
                  <MiniFake texto={isES ? "AVANZADO" : "ADVANCED"} bg="linear-gradient(135deg, #FFD60A 0%, #FF4D00 100%)" acento="#000" ganadora razon={isES ? "Variación coherente" : "Coherent variation"} />
                  <MiniFake texto={isES ? "OTRO TEMA" : "OTHER TOPIC"} bg="linear-gradient(135deg, #1a1a3e 0%, #000 100%)" acento="#64FFDA" razon={isES ? "Paleta distinta" : "Different palette"} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: "1.25rem", background: "rgba(255,214,10,0.08)", borderLeft: "3px solid #FFD60A", borderRadius: "0 8px 8px 0", padding: "0.85rem 1.1rem", fontSize: "0.88rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
              💡 {t.t02sugeridosInsight}
            </div>
          </div>
        )}

        {tab === "home" && (
          <div style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>{t.t02homeTitulo}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.6rem" }}>
              <MiniFake texto={isES ? "SIN EMOCIÓN" : "NO EMOTION"} bg="linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)" acento="#8B8FA8" razon={isES ? "Pasa desapercibida" : "Goes unnoticed"} />
              <MiniFake texto="¡SHOCK!" bg="linear-gradient(135deg, #FF0040 0%, #000 100%)" acento="#FFD60A" ganadora razon={isES ? "Contraste brutal" : "Brutal contrast"} />
              <MiniFake texto={isES ? "video #47" : "video #47"} bg="linear-gradient(135deg, #1a3a2a 0%, #0a2a1a 100%)" acento="#8B8FA8" razon={isES ? "Aburrida" : "Boring"} />
              <MiniFake texto={isES ? "ÉPICO" : "EPIC"} bg="linear-gradient(135deg, #00E5FF 0%, #0050FF 100%)" acento="#FFD60A" ganadora razon={isES ? "Color inesperado" : "Unexpected color"} />
              <MiniFake texto={isES ? "contenido" : "content"} bg="linear-gradient(135deg, #333 0%, #111 100%)" acento="#666" razon={isES ? "Gris anodino" : "Bland gray"} />
              <MiniFake texto={isES ? "¡POR FIN!" : "FINALLY!"} bg="linear-gradient(135deg, #FF4D00 0%, #FFD60A 100%)" acento="#000" ganadora razon={isES ? "Emoción clara" : "Clear emotion"} />
            </div>
            <div style={{ marginTop: "1.25rem", background: "rgba(6,214,160,0.08)", borderLeft: "3px solid #06D6A0", borderRadius: "0 8px 8px 0", padding: "0.85rem 1.1rem", fontSize: "0.88rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
              💡 {t.t02homeInsight}
            </div>
          </div>
        )}
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

function AIDABuilder({ t }: { t: typeof translations.es }) {
  const [activas, setActivas] = useState<boolean[]>([false, false, false, false]);
  const colores = ["#FF4D00", "#FFD60A", "#06D6A0", "#7F77DD"];
  const isES = t.t05vacia === "Miniatura vacía";

  const toggle = (i: number) => {
    const n = [...activas];
    n[i] = !n[i];
    setActivas(n);
  };
  const activarTodas = () => setActivas([true, true, true, true]);
  const reiniciar = () => setActivas([false, false, false, false]);
  const totalActivas = activas.filter(Boolean).length;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto 1.5rem", aspectRatio: "16/9", background: activas[0] ? "linear-gradient(135deg, #FF4D00 0%, #000000 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #0a0a1a 100%)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", transition: "background 0.5s ease" }}>
        {activas[1] && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80px", height: "80px", borderRadius: "50%", border: "3px dashed #FFD60A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: 900, color: "#FFD60A", fontFamily: "'Syne', sans-serif", animation: "pulse 2s infinite" }}>?</div>
        )}
        {activas[2] && (
          <div style={{ position: "absolute", top: "10%", right: "5%", background: "#06D6A0", color: "#000", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 900, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em", boxShadow: "0 4px 12px rgba(6,214,160,0.4)" }}>{isES ? "+50% MÁS" : "+50% MORE"}</div>
        )}
        {activas[3] && (
          <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", fontSize: "2.5rem", color: "#fff", textShadow: "0 0 20px #7F77DD", animation: "bounce 1.5s infinite" }}>▶</div>
        )}
        {totalActivas === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", fontStyle: "italic" }}>{t.t05vacia}</div>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
        {t.t05activas}: <span style={{ color: totalActivas === 4 ? "#06D6A0" : "#FFD60A", fontWeight: 700, fontSize: "1.1rem" }}>{totalActivas}/4</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={activarTodas} style={{ padding: "0.6rem 1.2rem", background: "#FF4D00", color: "#fff", border: "none", borderRadius: "999px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
          {t.t05verTodas}
        </button>
        <button onClick={reiniciar} style={{ padding: "0.6rem 1.2rem", background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
          {t.t05quitarTodas}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        {t.t05layers.map((capa, i) => {
          const activa = activas[i];
          return (
            <button key={i} onClick={() => toggle(i)} style={{
              background: activa ? colores[i] + "20" : "rgba(0,0,0,0.3)",
              border: "1px solid " + (activa ? colores[i] : "rgba(255,255,255,0.1)"),
              borderRadius: "12px", padding: "1rem",
              position: "relative", overflow: "hidden",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.2s ease",
              boxShadow: activa ? "0 0 20px " + colores[i] + "40" : "none"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: "3px", width: "100%", background: colores[i], opacity: activa ? 1 : 0.3 }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: colores[i], color: i === 1 ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 900, fontFamily: "'Syne', sans-serif", opacity: activa ? 1 : 0.5 }}>{capa.letra}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", fontFamily: "'Syne', sans-serif", color: activa ? colores[i] : "rgba(255,255,255,0.7)" }}>{capa.nombre}</div>
              </div>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.4, margin: 0 }}>{capa.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TipografiaContexto({ t }: { t: typeof translations.es }) {
  const [texto, setTexto] = useState("");
  const [ctx, setCtx] = useState(0);
  const contexto = t.t06contextos[ctx];
  const textoMostrar = (texto || t.t06inputPlaceholder).toUpperCase();
  const recomendaSerif = contexto.recomendada === "serif";
  const isES = t.t06inputLabel === "Escribe tu texto de miniatura";

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem", display: "block" }}>{t.t06inputLabel}</label>
        <input type="text" value={texto} onChange={(e) => setTexto(e.target.value.slice(0, 20))} placeholder={t.t06inputPlaceholder} style={{
          width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,77,0,0.3)", borderRadius: "10px", color: "#fff",
          fontSize: "1rem", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box"
        }} />
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem", display: "block" }}>{t.t06contextoLabel}</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem" }}>
          {t.t06contextos.map((c, i) => (
            <button key={i} onClick={() => setCtx(i)} style={{
              padding: "0.6rem", background: ctx === i ? "#FF4D00" : "rgba(255,255,255,0.05)",
              color: ctx === i ? "#fff" : "rgba(255,255,255,0.7)",
              border: "1px solid " + (ctx === i ? "#FF4D00" : "rgba(255,255,255,0.1)"),
              borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>{c.nombre}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <div style={{ position: "relative" }}>
          {recomendaSerif && (
            <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#06D6A0", color: "#000", fontSize: "0.65rem", fontWeight: 900, padding: "3px 10px", borderRadius: "999px", zIndex: 2, letterSpacing: "0.05em" }}>{isES ? "★ RECOMENDADA" : "★ RECOMMENDED"}</div>
          )}
          <div style={{ aspectRatio: "16/9", background: contexto.fondo, borderRadius: "12px", border: recomendaSerif ? "2px solid #06D6A0" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", boxShadow: recomendaSerif ? "0 0 20px rgba(6,214,160,0.3)" : "none", transition: "all 0.3s ease" }}>
            <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.4rem, 4vw, 2.4rem)", fontWeight: 800, color: contexto.acento, letterSpacing: "-0.01em", textAlign: "center", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", wordBreak: "break-word", lineHeight: 1 }}>{textoMostrar}</div>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", textAlign: "center", fontWeight: 600 }}>{t.t06serif}</div>
          {recomendaSerif && (
            <div style={{ marginTop: "0.5rem", background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#06D6A0", textAlign: "center" }}>
              ✓ {t.t06recomendadaSerif}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          {!recomendaSerif && (
            <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#06D6A0", color: "#000", fontSize: "0.65rem", fontWeight: 900, padding: "3px 10px", borderRadius: "999px", zIndex: 2, letterSpacing: "0.05em" }}>{isES ? "★ RECOMENDADA" : "★ RECOMMENDED"}</div>
          )}
          <div style={{ aspectRatio: "16/9", background: contexto.fondo, borderRadius: "12px", border: !recomendaSerif ? "2px solid #06D6A0" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", boxShadow: !recomendaSerif ? "0 0 20px rgba(6,214,160,0.3)" : "none", transition: "all 0.3s ease" }}>
            <div style={{ fontFamily: "'Syne', 'Arial Black', sans-serif", fontSize: "clamp(1.4rem, 4vw, 2.4rem)", fontWeight: 900, color: contexto.acento, letterSpacing: "-0.03em", textAlign: "center", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", wordBreak: "break-word", lineHeight: 1 }}>{textoMostrar}</div>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", textAlign: "center", fontWeight: 600 }}>{t.t06sans}</div>
          {!recomendaSerif && (
            <div style={{ marginTop: "0.5rem", background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#06D6A0", textAlign: "center" }}>
              ✓ {t.t06recomendadaSans}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZonaMirada({ t }: { t: typeof translations.es }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [facePos, setFacePos] = useState({ x: 75, y: 25 }); // porcentaje
  const isDragging = useRef(false);
  const isES = t.t07instruccion.includes("Arrastra");

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const updatePos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 8, 92);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 8, 85);
    setFacePos({ x, y });
  };

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; e.preventDefault(); };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) updatePos(e.clientX, e.clientY); };
  const onMouseUp = () => { isDragging.current = false; };
  const onTouchStart = (e: React.TouchEvent) => { isDragging.current = true; };
  const onTouchMove = (e: React.TouchEvent) => { if (isDragging.current) { e.preventDefault(); updatePos(e.touches[0].clientX, e.touches[0].clientY); } };
  const onTouchEnd = () => { isDragging.current = false; };

  // Texto clave siempre en el cuadrante opuesto, pero clampeado al interior
  const textoX = clamp(facePos.x > 50 ? 22 : 78, 15, 82);
  const textoY = clamp(facePos.y > 50 ? 25 : 72, 12, 78);

  // Ángulo de la flecha desde la cara hacia el texto
  const dx = textoX - facePos.x;
  const dy = textoY - facePos.y;
  const arrowAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  const dist = Math.sqrt(dx * dx + dy * dy);

  return (
    <div style={{ marginTop: "2rem" }}>
      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.25rem", textAlign: "center" }}>
        {isES ? "Arrastra el rostro dentro de la miniatura" : "Drag the face inside the thumbnail"}
      </p>

      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative", maxWidth: "600px", margin: "0 auto",
          aspectRatio: "16/9",
          background: "linear-gradient(135deg, #1a1040 0%, #0a0a1e 100%)",
          borderRadius: "16px", border: "1px solid rgba(127,119,221,0.3)",
          overflow: "hidden", userSelect: "none",
          cursor: isDragging.current ? "grabbing" : "default",
        }}
      >
        {/* Grid de tercios */}
        {[33, 66].map(p => (
          <div key={p}>
            <div style={{ position: "absolute", left: p + "%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", top: p + "%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>
        ))}

        {/* Flecha SVG de cara → texto */}
        {dist > 5 && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#FFD60A" />
              </marker>
            </defs>
            <line
              x1={facePos.x + "%"} y1={facePos.y + "%"}
              x2={textoX + "%"} y2={textoY + "%"}
              stroke="#FFD60A" strokeWidth="2" strokeDasharray="5 3"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        )}

        {/* Texto clave */}
        <div style={{
          position: "absolute",
          left: textoX + "%", top: textoY + "%",
          transform: "translate(-50%, -50%)",
          background: "#FF4D00", color: "#fff",
          padding: "0.35rem 0.8rem", borderRadius: "6px",
          fontSize: "clamp(0.6rem, 1.8vw, 0.9rem)", fontWeight: 900,
          fontFamily: "'Syne', sans-serif",
          boxShadow: "0 0 20px rgba(255,77,0,0.5)",
          transition: "left 0.3s ease, top 0.3s ease",
          whiteSpace: "nowrap", pointerEvents: "none",
        }}>{isES ? "TEXTO CLAVE" : "KEY TEXT"}</div>

        {/* Rostro draggable */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            position: "absolute",
            left: facePos.x + "%", top: facePos.y + "%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            cursor: "grab",
            filter: "drop-shadow(0 0 12px rgba(127,119,221,0.7))",
            transition: isDragging.current ? "none" : "left 0.1s, top 0.1s",
            zIndex: 4, touchAction: "none",
          }}
        >😮</div>

        {/* Insight */}
        <div style={{
          position: "absolute", bottom: "8px", left: "8px", right: "8px",
          background: "rgba(0,0,0,0.75)", borderRadius: "6px",
          padding: "0.4rem 0.75rem", fontSize: "0.72rem",
          color: "rgba(255,255,255,0.8)", textAlign: "center",
          pointerEvents: "none",
        }}>💡 {t.t07insight}</div>
      </div>
    </div>
  );
}


function ABTesting({ t }: { t: typeof translations.es }) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  return (
    <div style={{ marginTop: "2rem" }}>
      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", textAlign: "center" }}>{t.t08instruccion}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {t.t08miniaturas.map((mini) => {
          const activa = seleccionada === mini.id;
          return (
            <div key={mini.id} onClick={() => setSeleccionada(activa ? null : mini.id)}
              style={{ cursor: "pointer", borderRadius: "16px", overflow: "hidden", border: activa ? (mini.gana ? "2px solid #06D6A0" : "2px solid #FF4D4D") : "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease", boxShadow: activa ? (mini.gana ? "0 0 30px rgba(6,214,160,0.3)" : "0 0 30px rgba(255,77,77,0.2)") : "none" }}>

              {/* Miniatura simulada */}
              <div style={{ position: "relative", aspectRatio: "16/9", background: mini.bg }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.75rem", gap: "0.25rem" }}>
                  <div style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: mini.acento, fontFamily: "'Syne', sans-serif", textAlign: "center", textShadow: "2px 2px 4px rgba(0,0,0,0.8)", lineHeight: 1 }}>{mini.texto}</div>
                  {mini.subtexto && <div style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.85rem)", fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif", textAlign: "center", opacity: 0.9 }}>{mini.subtexto}</div>}
                </div>
                {activa && (
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: mini.gana ? "#06D6A0" : "#FF4D4D", color: mini.gana ? "#000" : "#fff", fontSize: "0.6rem", fontWeight: 900, padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.05em" }}>
                    {mini.gana ? t.t08ganadora : t.t08perdedora}
                  </div>
                )}
              </div>

              {/* Panel de análisis */}
              {activa && (
                <div style={{ background: "rgba(0,0,0,0.5)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.t08ctrLabel}</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: mini.gana ? "#06D6A0" : "#FF4D4D" }}>{mini.ctr}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.t08puntuacion}</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: mini.gana ? "#06D6A0" : "#FF4D4D" }}>{mini.puntuacion}/100</div>
                    </div>
                  </div>
                  {/* Barra de puntuación animada */}
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", marginBottom: "1rem", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: mini.puntuacion + "%", background: mini.gana ? "linear-gradient(90deg, #06D6A0, #04A578)" : "linear-gradient(90deg, #FF4D4D, #CC0000)", borderRadius: "999px", animation: "barGrow 0.6s ease-out" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {mini.razones.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)" }}>
                        <span style={{ color: mini.gana ? "#06D6A0" : "#FF4D4D", flexShrink: 0, marginTop: "1px" }}>{mini.gana ? "✓" : "✗"}</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado inactivo */}
              {!activa && (
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem", textAlign: "center", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                  {t.t02tabBusqueda === "Búsqueda" ? "Haz clic para analizar" : "Click to analyze"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsistenciaVisual({ t }: { t: typeof translations.es }) {
  const [modo, setModo] = useState<"con" | "sin">("con");
  const isES = t.t09labelCon === "Con consistencia";

  const paleta = { bg: "#FF4D00", bg2: "#1a0a00", acento: "#FFD60A" };
  const miniaturasCon = [
    { texto: isES ? "SECRETO #1" : "SECRET #1", sub: isES ? "que nadie dice" : "nobody tells you" },
    { texto: isES ? "SECRETO #2" : "SECRET #2", sub: isES ? "del algoritmo" : "of the algorithm" },
    { texto: isES ? "SECRETO #3" : "SECRET #3", sub: isES ? "para crecer" : "to grow" },
    { texto: isES ? "SECRETO #4" : "SECRET #4", sub: isES ? "de los grandes" : "of the big ones" },
  ];
  const miniaturasSin = [
    { bg: "linear-gradient(135deg,#1a3a5e,#0a1a3e)", acento: "#64FFDA", texto: isES ? "Mi nuevo video" : "My new video", sub: "" },
    { bg: "linear-gradient(135deg,#3e1a1a,#1a0a0a)", acento: "#FF8888", texto: isES ? "TUTORIAL COMPLETO" : "FULL TUTORIAL", sub: "" },
    { bg: "linear-gradient(135deg,#1a3e1a,#0a1a0a)", acento: "#88FF88", texto: isES ? "Tips útiles" : "Useful tips", sub: "" },
    { bg: "linear-gradient(135deg,#3e3e1a,#1a1a0a)", acento: "#FFFF88", texto: isES ? "VIDEO #47" : "VIDEO #47", sub: "" },
  ];

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "1.5rem" }}>
        {(["con", "sin"] as const).map((m) => (
          <button key={m} onClick={() => setModo(m)} style={{
            padding: "0.65rem 1.5rem",
            background: modo === m ? (m === "con" ? "#06D6A0" : "#FF4D4D") : "rgba(255,255,255,0.05)",
            color: modo === m ? (m === "con" ? "#000" : "#fff") : "rgba(255,255,255,0.6)",
            border: "1px solid " + (modo === m ? (m === "con" ? "#06D6A0" : "#FF4D4D") : "rgba(255,255,255,0.1)"),
            borderRadius: "999px", cursor: "pointer", fontWeight: 700,
            fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}>{m === "con" ? t.t09labelCon : t.t09labelSin}</button>
        ))}
      </div>

      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "1.25rem", border: "1px solid " + (modo === "con" ? "rgba(6,214,160,0.3)" : "rgba(255,77,77,0.3)"), transition: "border 0.3s" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {(modo === "con" ? miniaturasCon : miniaturasSin).map((mini: any, i: number) => (
            <div key={i} style={{
              aspectRatio: "16/9",
              background: modo === "con" ? `linear-gradient(135deg, ${paleta.bg} 0%, ${paleta.bg2} 100%)` : mini.bg,
              borderRadius: "10px", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "0.5rem",
              border: "1px solid rgba(255,255,255,0.1)", position: "relative", overflow: "hidden",
            }}>
              {modo === "con" && <div style={{ position: "absolute", top: "6px", left: "6px", width: "20px", height: "20px", background: paleta.acento, borderRadius: "50%", opacity: 0.8 }} />}
              <div style={{ fontSize: "clamp(0.65rem, 2vw, 0.9rem)", fontWeight: 900, color: modo === "con" ? paleta.acento : mini.acento, fontFamily: "'Syne', sans-serif", textAlign: "center", textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}>{mini.texto}</div>
              {mini.sub && <div style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.65rem)", color: "#fff", opacity: 0.8, textAlign: "center", marginTop: "2px" }}>{mini.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem", background: modo === "con" ? "rgba(6,214,160,0.08)" : "rgba(255,77,77,0.08)", borderLeft: "3px solid " + (modo === "con" ? "#06D6A0" : "#FF4D4D"), borderRadius: "0 8px 8px 0", padding: "0.75rem 1rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
          {modo === "con" ? (isES ? "✓ Misma paleta, mismo estilo tipográfico, mismo elemento de marca. El espectador reconoce el canal instantáneamente." : "✓ Same palette, same typographic style, same brand element. Viewers recognize the channel instantly.") : (isES ? "✗ Cada miniatura parece de un canal diferente. El espectador no puede asociar los videos con una identidad." : "✗ Each thumbnail looks like a different channel. Viewers cannot associate the videos with an identity.")}
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginTop: "1rem", fontStyle: "italic" }}>💡 {t.t09insight}</p>
    </div>
  );
}

function ShortsVsLargos({ t }: { t: typeof translations.es }) {
  const [tab, setTab] = useState<"shorts" | "largos">("shorts");
  const data = tab === "shorts" ? t.t10shorts : t.t10largos;
  const color = tab === "shorts" ? "#FF4D00" : "#7F77DD";

  const filas = [
    { icono: "📐", label: data.ratio, desc: data.ratioDesc },
    { icono: "✍️", label: data.texto, desc: data.textoDesc },
    { icono: "😮", label: data.rostro, desc: data.rostroDesc },
    { icono: "🎨", label: data.color, desc: data.colorDesc },
    { icono: "🏷️", label: data.logo, desc: data.logoDesc },
  ];

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
        {(["shorts", "largos"] as const).map((f) => (
          <button key={f} onClick={() => setTab(f)} style={{
            padding: "0.75rem", background: tab === f ? (f === "shorts" ? "#FF4D00" : "#7F77DD") : "rgba(255,255,255,0.05)",
            color: tab === f ? "#fff" : "rgba(255,255,255,0.6)",
            border: "1px solid " + (tab === f ? (f === "shorts" ? "#FF4D00" : "#7F77DD") : "rgba(255,255,255,0.1)"),
            borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", textAlign: "center",
          }}>
            {f === "shorts" ? "⚡ " + t.t10tabShorts : "🎬 " + t.t10tabLargos}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Preview visual */}
        <div style={{ flexShrink: 0 }}>
          {tab === "shorts" ? (
            <div style={{ width: "100px", aspectRatio: "9/16", background: "linear-gradient(180deg, #FF0040 0%, #000 100%)", borderRadius: "10px", border: "2px solid #FF4D00", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,77,0,0.3)" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#FFD60A", fontFamily: "'Syne', sans-serif", textAlign: "center", padding: "0.5rem", lineHeight: 1.1 }}>¡YA!</div>
            </div>
          ) : (
            <div style={{ width: "160px", aspectRatio: "16/9", background: "linear-gradient(135deg, #0D4F3C 0%, #1E3A5F 100%)", borderRadius: "10px", border: "2px solid #7F77DD", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(127,119,221,0.3)" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 900, color: "#D4AF37", fontFamily: "'Syne', sans-serif", textAlign: "center", padding: "0.5rem", lineHeight: 1.2 }}>3 PASOS</div>
            </div>
          )}
        </div>

        {/* Tabla de diferencias */}
        <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filas.map((fila, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.65rem 0.9rem", border: "1px solid " + color + "20", borderLeft: "3px solid " + color }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "0.2rem" }}>{fila.icono} {fila.label}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{fila.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1.25rem", background: tab === "shorts" ? "rgba(255,77,0,0.08)" : "rgba(127,119,221,0.08)", borderLeft: "3px solid " + color, borderRadius: "0 8px 8px 0", padding: "0.85rem 1.1rem", fontSize: "0.88rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
        💡 {data.insight}
      </div>
    </div>
  );
}

function PromptsBiblioteca({ t }: { t: typeof translations.es }) {
  const [nichoActivo, setNichoActivo] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const nicho = t.t11nichos[nichoActivo];

  const copiar = () => {
    navigator.clipboard.writeText(nicho.prompt).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem", display: "block" }}>{t.t11nichoLabel}</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {t.t11nichos.map((n, i) => (
            <button key={i} onClick={() => { setNichoActivo(i); setCopiado(false); }} style={{
              padding: "0.5rem 1rem", background: nichoActivo === i ? "#FF4D00" : "rgba(255,255,255,0.05)",
              color: nichoActivo === i ? "#fff" : "rgba(255,255,255,0.7)",
              border: "1px solid " + (nichoActivo === i ? "#FF4D00" : "rgba(255,255,255,0.1)"),
              borderRadius: "999px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            }}>{n.nombre}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,77,0,0.2)", borderRadius: "16px", padding: "1.25rem", position: "relative" }}>
        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Prompt · {nicho.nombre}</div>
        <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.7, margin: "0 0 1rem", fontStyle: "italic" }}>{nicho.prompt}</p>
        <button onClick={copiar} style={{
          padding: "0.6rem 1.5rem", background: copiado ? "#06D6A0" : "#FF4D00",
          color: copiado ? "#000" : "#fff", border: "none", borderRadius: "999px",
          cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
          fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s",
        }}>{copiado ? "✓ " + t.t11copiado : t.t11copiar}</button>
      </div>
    </div>
  );
}

function ChecklistPublicacion({ t }: { t: typeof translations.es }) {
  const [checks, setChecks] = useState<boolean[]>(new Array(t.t12items.length).fill(false));
  const total = checks.filter(Boolean).length;
  const pct = Math.round((total / t.t12items.length) * 100);
  const scoreIdx = total <= 2 ? 0 : total <= 4 ? 1 : total <= 6 ? 2 : 3;
  const scoreColor = ["#FF4D4D", "#FFD60A", "#06D6A0", "#06D6A0"][scoreIdx];

  const toggle = (i: number) => {
    const n = [...checks];
    n[i] = !n[i];
    setChecks(n);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Score bar */}
      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem", border: "1px solid " + scoreColor + "30" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>{t.t12scoreLabels[scoreIdx]}</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: scoreColor }}>{total}/{t.t12items.length}</span>
        </div>
        <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)`, borderRadius: "999px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {t.t12items.map((item, i) => (
          <div key={i} onClick={() => toggle(i)} style={{
            background: checks[i] ? "rgba(6,214,160,0.08)" : "rgba(0,0,0,0.3)",
            border: "1px solid " + (checks[i] ? "rgba(6,214,160,0.4)" : "rgba(255,255,255,0.08)"),
            borderRadius: "12px", padding: "0.9rem 1rem", cursor: "pointer",
            transition: "all 0.2s", display: "flex", gap: "0.9rem", alignItems: "flex-start",
          }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
              background: checks[i] ? "#06D6A0" : "transparent",
              border: "2px solid " + (checks[i] ? "#06D6A0" : "rgba(255,255,255,0.3)"),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem", color: "#000", fontWeight: 900, transition: "all 0.2s",
            }}>{checks[i] ? "✓" : ""}</div>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: checks[i] ? "#06D6A0" : "#fff", marginBottom: "0.2rem", transition: "color 0.2s" }}>{item.texto}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{item.detalle}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <button onClick={() => setChecks(new Array(t.t12items.length).fill(false))} style={{
          padding: "0.5rem 1.2rem", background: "transparent", color: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px", cursor: "pointer",
          fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif",
        }}>{t.t12reiniciar}</button>
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

function TecnicaSection({ numero, categoria, titulo, subtitulo, parrafos, tipTitulo, tip, nota, color, children }: any) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ marginBottom: "6rem", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.8s, transform 0.8s" }}>
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div style={{ fontSize: "clamp(4rem, 10vw, 7rem)", fontWeight: 900, color: color, lineHeight: 0.8, letterSpacing: "-0.05em", fontFamily: "'Syne', sans-serif", textShadow: "0 0 80px " + color + "40", flexShrink: 0 }}>{numero}</div>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{categoria}</div>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.5rem", wordBreak: "break-word" }}>{titulo}</h2>
          <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)", color: color, fontStyle: "italic", fontWeight: 500 }}>{subtitulo}</p>
        </div>
      </div>
      <div style={{ maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        {parrafos.map((p: string, i: number) => (
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
      <TecnicaSection numero={t.t02num} categoria={t.t02categoria} titulo={t.t02titulo} subtitulo={t.t02subtitulo} parrafos={[t.t02parrafo1, t.t02parrafo2]} tipTitulo={t.t02tipTitulo} tip={t.t02tip} color="#FFD60A"><YouTubeSimulator t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t03num} categoria={t.t03categoria} titulo={t.t03titulo} subtitulo={t.t03subtitulo} parrafos={[t.t03parrafo1, t.t03parrafo2]} tipTitulo={t.t03tipTitulo} tip={t.t03tip} nota={t.t03nota} color="#06D6A0"><SimuladorClickbait t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t04num} categoria={t.t04categoria} titulo={t.t04titulo} subtitulo={t.t04subtitulo} parrafos={[t.t04parrafo1, t.t04parrafo2]} tipTitulo={t.t04tipTitulo} tip={t.t04tip} color="#FF4D00"><SelectorColor t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t05num} categoria={t.t05categoria} titulo={t.t05titulo} subtitulo={t.t05subtitulo} parrafos={[t.t05parrafo1, t.t05parrafo2]} tipTitulo={t.t05tipTitulo} tip={t.t05tip} color="#FFD60A"><AIDABuilder t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t06num} categoria={t.t06categoria} titulo={t.t06titulo} subtitulo={t.t06subtitulo} parrafos={[t.t06parrafo1, t.t06parrafo2]} tipTitulo={t.t06tipTitulo} tip={t.t06tip} color="#06D6A0"><TipografiaContexto t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t07num} categoria={t.t07categoria} titulo={t.t07titulo} subtitulo={t.t07subtitulo} parrafos={[t.t07parrafo1, t.t07parrafo2]} tipTitulo={t.t07tipTitulo} tip={t.t07tip} color="#7F77DD"><ZonaMirada t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t08num} categoria={t.t08categoria} titulo={t.t08titulo} subtitulo={t.t08subtitulo} parrafos={[t.t08parrafo1, t.t08parrafo2]} tipTitulo={t.t08tipTitulo} tip={t.t08tip} color="#FF4D00"><ABTesting t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t09num} categoria={t.t09categoria} titulo={t.t09titulo} subtitulo={t.t09subtitulo} parrafos={[t.t09parrafo1, t.t09parrafo2]} tipTitulo={t.t09tipTitulo} tip={t.t09tip} color="#FFD60A"><ConsistenciaVisual t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t10num} categoria={t.t10categoria} titulo={t.t10titulo} subtitulo={t.t10subtitulo} parrafos={[t.t10parrafo1, t.t10parrafo2]} tipTitulo={t.t10tipTitulo} tip={t.t10tip} color="#7F77DD"><ShortsVsLargos t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t11num} categoria={t.t11categoria} titulo={t.t11titulo} subtitulo={t.t11subtitulo} parrafos={[t.t11parrafo1, t.t11parrafo2]} tipTitulo={t.t11tipTitulo} tip={t.t11tip} color="#06D6A0"><PromptsBiblioteca t={t} /></TecnicaSection>
      <TecnicaSection numero={t.t12num} categoria={t.t12categoria} titulo={t.t12titulo} subtitulo={t.t12subtitulo} parrafos={[t.t12parrafo1, t.t12parrafo2]} tipTitulo={t.t12tipTitulo} tip={t.t12tip} color="#FF4D00"><ChecklistPublicacion t={t} /></TecnicaSection>

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

  const changeLang = (l: "es" | "en") => { setLang(l); localStorage.setItem("tl_lang", l); };
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
        @keyframes pulse { 0%, 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.7; transform: translate(-50%,-50%) scale(1.05); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes barGrow { from { width: 0; } }
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
