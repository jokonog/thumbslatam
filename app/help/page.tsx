"use client";
import { useState, useEffect } from "react";

const content = {
  es: {
    back: "← Dashboard",
    title: "Centro de ayuda",
    subtitle: "Todo lo que necesitas saber para crear miniaturas increibles.",
    tabs: [["pasos","Como funciona"],["modos","Modos de generacion"],["limitaciones","Limitaciones"],["tips","Tips pro"]],
    pasos: [
      { num:"1", titulo:"Elige tu plataforma", desc:"Selecciona el formato segun donde vas a publicar tu miniatura.", opciones:["YouTube 16:9","Instagram 1:1","Story 9:16","TikTok 9:16","Twitter 16:9"], tip:"Para YouTube siempre usa 16:9 — es el estandar.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/ep7dn9loipzbtrsin7lp.jpg" },
      { num:"2", titulo:"Agrega elementos (opcional)", desc:"Puedes subir fotos de personas o personajes que quieras incluir en la miniatura.", opciones:["Hasta 3 elementos","Posicion izquierda/centro/derecha","Usa tu avatar para Con mi cara"], tip:"No uses imagenes con copyright (RE, Marvel, Disney) — seran rechazadas.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/ksezs7sth3iq7zu74zzz.jpg" },
      { num:"3", titulo:"Describe la escena", desc:"Escribe un prompt corto y directo. Entre mas especifico, mejor resultado.", opciones:["Guerrero samurai en templo nevado","Ciudad futurista con neon","Explorador en isla tropical"], tip:"Prompts de 5-10 palabras funcionan mejor que descripciones largas.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/v0wdhx4ekwnlekbkuwzi.jpg" },
      { num:"4", titulo:"Elige la emocion", desc:"La emocion define el ambiente y la iluminacion de tu miniatura.", opciones:["Epico — dramatico e intenso","Misterioso — oscuro y enigmatico","Emocionado — energetico y vibrante"], tip:"Para gaming y streams, Epico y Misterioso son los mas efectivos.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/sc47fyiwkft1tkzbnfbg.jpg" },
    ],
    modos: [
      { titulo:"Solo fondo IA", creditos:"4 creditos", color:"#1D9E75", desc:"Genera 2 variaciones de fondo cinematografico. Puedes agregar hasta 3 elementos.", ideal:"Miniaturas de gaming, vlogs, contenido general", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/oz3asccfb1vc9hwak5yo.jpg" },
      { titulo:"Con mi cara", creditos:"5 creditos", color:"#FF4D00", desc:"Usa tu avatar para integrarte en la escena con IA. Genera 1 resultado con face swap y upscaling.", ideal:"Youtubers y streamers que quieren aparecer en sus miniaturas", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/rnzbfivhr9t00v37pog1.jpg" },
    ],
    limitaciones: [
      { icon:"⚠️", titulo:"Copyright", desc:"No uses imagenes de juegos, peliculas o series (RE, Marvel, GTA, etc.). Seran rechazadas automaticamente." },
      { icon:"👤", titulo:"Con mi cara = 1 personaje", desc:"El modo Con mi cara solo funciona con 1 personaje. Tu cara se aplica a todos los rostros detectados." },
      { icon:"🎮", titulo:"Nombres de personajes", desc:"No puedes pedir Jill Valentine o Kratos por nombre. Describe el personaje: guerrera con pistola y chaleco tactico." },
      { icon:"🖼️", titulo:"Imagen de referencia", desc:"La imagen de referencia inspira el estilo visual, no es una copia exacta. La IA crea algo original basado en ella." },
      { icon:"⏱️", titulo:"Tiempo de generacion", desc:"Solo fondo: ~30-40 segundos. Con mi cara: hasta 2 minutos. Ten paciencia." },
      { icon:"💾", titulo:"Guardar tu trabajo", desc:"En el editor usa Guardar miniatura para que quede en tu galeria. Descargar solo baja el archivo." },
    ],
    tips: [
      "Prompts en ingles dan mejores resultados con FLUX",
      "Usa avatares con buena iluminacion y fondo claro",
      "El editor te permite agregar texto con efectos y multiples lineas",
      "Puedes subir tu propio fondo en el editor",
      "La imagen de referencia funciona mejor con paisajes y escenas sin personas",
    ],
    tips_cta_title: "Tienes dudas?",
    tips_cta_desc: "Escribenos y te ayudamos.",
    tips_cta_btn: "soporte@thumbslatam.com",
    ideal_label: "Ideal para:",
  },
  en: {
    back: "← Dashboard",
    title: "Help Center",
    subtitle: "Everything you need to know to create amazing thumbnails.",
    tabs: [["pasos","How it works"],["modos","Generation modes"],["limitaciones","Limitations"],["tips","Pro tips"]],
    pasos: [
      { num:"1", titulo:"Choose your platform", desc:"Select the format based on where you will publish your thumbnail.", opciones:["YouTube 16:9","Instagram 1:1","Story 9:16","TikTok 9:16","Twitter 16:9"], tip:"For YouTube always use 16:9 — it is the standard.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/ep7dn9loipzbtrsin7lp.jpg" },
      { num:"2", titulo:"Add elements (optional)", desc:"You can upload photos of people or characters you want to include in the thumbnail.", opciones:["Up to 3 elements","Left/center/right position","Use your avatar for With my face"], tip:"Do not use images with copyright (RE, Marvel, Disney) — they will be rejected.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/ksezs7sth3iq7zu74zzz.jpg" },
      { num:"3", titulo:"Describe the scene", desc:"Write a short and direct prompt. The more specific, the better the result.", opciones:["Samurai warrior in snowy temple","Futuristic city with neon","Explorer on tropical island"], tip:"Prompts of 5-10 words work better than long descriptions.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/v0wdhx4ekwnlekbkuwzi.jpg" },
      { num:"4", titulo:"Choose the emotion", desc:"The emotion defines the atmosphere and lighting of your thumbnail.", opciones:["Epic — dramatic and intense","Mysterious — dark and enigmatic","Excited — energetic and vibrant"], tip:"For gaming and streams, Epic and Mysterious are the most effective.", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/sc47fyiwkft1tkzbnfbg.jpg" },
    ],
    modos: [
      { titulo:"AI background only", creditos:"4 credits", color:"#1D9E75", desc:"Generates 2 cinematic background variations. You can add up to 3 elements.", ideal:"Gaming thumbnails, vlogs, general content", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/oz3asccfb1vc9hwak5yo.jpg" },
      { titulo:"With my face", creditos:"5 credits", color:"#FF4D00", desc:"Uses your avatar to integrate you into the scene with AI. Generates 1 result with face swap and upscaling.", ideal:"YouTubers and streamers who want to appear in their thumbnails", imagen:"https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/rnzbfivhr9t00v37pog1.jpg" },
    ],
    limitaciones: [
      { icon:"⚠️", titulo:"Copyright", desc:"Do not use images from games, movies or series (RE, Marvel, GTA, etc.). They will be automatically rejected." },
      { icon:"👤", titulo:"With my face = 1 character", desc:"The With my face mode only works with 1 character. Your face is applied to all detected faces." },
      { icon:"🎮", titulo:"Character names", desc:"You cannot request Jill Valentine or Kratos by name. Describe the character: female warrior with gun and tactical vest." },
      { icon:"🖼️", titulo:"Reference image", desc:"The reference image inspires the visual style, it is not an exact copy. The AI creates something original based on it." },
      { icon:"⏱️", titulo:"Generation time", desc:"AI background only: ~30-40 seconds. With my face: up to 2 minutes. Be patient." },
      { icon:"💾", titulo:"Save your work", desc:"In the editor use Save thumbnail so it stays in your gallery. Download only saves the file locally." },
    ],
    tips: [
      "English prompts give better results with FLUX",
      "Use avatars with good lighting and clear background",
      "The editor lets you add text with effects and multiple lines",
      "You can upload your own background in the editor",
      "Reference images work best with landscapes and scenes without people",
    ],
    tips_cta_title: "Have questions?",
    tips_cta_desc: "Write to us and we will help you.",
    tips_cta_btn: "soporte@thumbslatam.com",
    ideal_label: "Ideal for:",
  }
};

export default function HelpPage() {
  const [lang, setLang] = useState<"es" | "en">("en");
  const [seccion, setSeccion] = useState("pasos");

  useEffect(() => {
    const saved = localStorage.getItem("tl_lang");
    if (saved === "es") setLang("es");
  }, []);

  const toggleLang = (l: "es" | "en") => {
    setLang(l);
    localStorage.setItem("tl_lang", l);
  };

  const t = content[lang];

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif"}}>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"32px"}}>
          <a href="/dashboard" style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none"}}>{t.back}</a>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <img src="/logo.png" alt="ThumbsLatam" style={{height:"28px"}}/>
            <div style={{display:"flex",gap:0,border:"1px solid rgba(255,255,255,0.2)",borderRadius:"6px",overflow:"hidden"}}>
              <button onClick={() => toggleLang("es")} style={{background:lang==="es"?"#FF4D00":"transparent",border:"none",color:lang==="es"?"white":"#8B8FA8",fontSize:"0.8rem",padding:"6px 12px",cursor:"pointer",fontWeight:600}}>ES</button>
              <span style={{width:"1px",background:"rgba(255,255,255,0.2)",display:"inline-block"}}></span>
              <button onClick={() => toggleLang("en")} style={{background:lang==="en"?"#FF4D00":"transparent",border:"none",color:lang==="en"?"white":"#8B8FA8",fontSize:"0.8rem",padding:"6px 12px",cursor:"pointer",fontWeight:600}}>EN</button>
            </div>
          </div>
        </div>

        <h1 style={{fontSize:"1.8rem",fontWeight:800,margin:"0 0 8px"}}>{t.title}</h1>
        <p style={{color:"#8B8FA8",marginBottom:"32px"}}>{t.subtitle}</p>

        <div style={{display:"flex",gap:"8px",marginBottom:"32px",flexWrap:"wrap"}}>
          {t.tabs.map(([id,label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{padding:"8px 16px",borderRadius:"20px",border:`1px solid ${seccion===id?"#FF4D00":"#3A3D52"}`,background:seccion===id?"rgba(255,77,0,0.15)":"transparent",color:seccion===id?"#FF4D00":"#8B8FA8",fontSize:"0.85rem",cursor:"pointer",fontWeight:seccion===id?700:400}}>
              {label}
            </button>
          ))}
        </div>

        {seccion === "pasos" && (
          <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
            {t.pasos.map((paso) => (
              <div key={paso.num} style={{background:"#111827",borderRadius:"14px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
                <img src={paso.imagen} alt={paso.titulo} style={{width:"100%",height:"160px",objectFit:"cover",display:"block"}}/>
                <div style={{padding:"20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
                    <span style={{background:"#FF4D00",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",fontWeight:700,flexShrink:0}}>{paso.num}</span>
                    <h3 style={{margin:0,fontSize:"1rem",fontWeight:700}}>{paso.titulo}</h3>
                  </div>
                  <p style={{color:"#8B8FA8",fontSize:"0.88rem",lineHeight:1.6,margin:"0 0 12px"}}>{paso.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
                    {paso.opciones.map((op,i) => (
                      <span key={i} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",padding:"3px 10px",fontSize:"0.78rem",color:"#8B8FA8"}}>{op}</span>
                    ))}
                  </div>
                  <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.2)",borderRadius:"8px",padding:"10px 14px",fontSize:"0.82rem",color:"#FF4D00"}}>
                    💡 {paso.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {seccion === "modos" && (
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            {t.modos.map((modo) => (
              <div key={modo.titulo} style={{background:"#111827",borderRadius:"14px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
                <img src={modo.imagen} alt={modo.titulo} style={{width:"100%",height:"180px",objectFit:"cover",display:"block"}}/>
                <div style={{padding:"20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
                    <h3 style={{margin:0,fontSize:"1rem",fontWeight:700}}>{modo.titulo}</h3>
                    <span style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${modo.color}`,borderRadius:"6px",padding:"3px 10px",fontSize:"0.78rem",color:modo.color,fontWeight:700}}>{modo.creditos}</span>
                  </div>
                  <p style={{color:"#8B8FA8",fontSize:"0.88rem",lineHeight:1.6,margin:"0 0 10px"}}>{modo.desc}</p>
                  <p style={{color:"#8B8FA8",fontSize:"0.82rem",margin:0}}>✓ {t.ideal_label} <span style={{color:"white"}}>{modo.ideal}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {seccion === "limitaciones" && (
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {t.limitaciones.map((l) => (
              <div key={l.titulo} style={{background:"#111827",borderRadius:"12px",padding:"18px 20px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:"14px",alignItems:"flex-start"}}>
                <span style={{fontSize:"1.4rem",flexShrink:0}}>{l.icon}</span>
                <div>
                  <h4 style={{margin:"0 0 6px",fontSize:"0.95rem",fontWeight:700}}>{l.titulo}</h4>
                  <p style={{color:"#8B8FA8",fontSize:"0.85rem",lineHeight:1.6,margin:0}}>{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {seccion === "tips" && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {t.tips.map((tip, i) => (
              <div key={i} style={{background:"#111827",borderRadius:"12px",padding:"16px 20px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:"12px",alignItems:"center"}}>
                <span style={{background:"#FF4D00",borderRadius:"50%",width:"24px",height:"24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.78rem",fontWeight:700,flexShrink:0}}>{i+1}</span>
                <p style={{color:"#8B8FA8",fontSize:"0.88rem",lineHeight:1.5,margin:0}}>{tip}</p>
              </div>
            ))}
            <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.2)",borderRadius:"12px",padding:"20px",marginTop:"8px",textAlign:"center"}}>
              <p style={{color:"#FF4D00",fontWeight:700,margin:"0 0 8px"}}>{t.tips_cta_title}</p>
              <p style={{color:"#8B8FA8",fontSize:"0.85rem",margin:"0 0 12px"}}>{t.tips_cta_desc}</p>
              <a href="mailto:soporte@thumbslatam.com" style={{display:"inline-block",padding:"8px 20px",background:"#FF4D00",color:"white",borderRadius:"8px",fontWeight:700,textDecoration:"none",fontSize:"0.85rem"}}>{t.tips_cta_btn}</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
