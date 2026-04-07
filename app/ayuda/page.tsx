"use client";
import { useState } from "react";

const pasos = [
  {
    num: "1",
    titulo: "Elige tu plataforma",
    desc: "Selecciona el formato según donde vas a publicar tu miniatura.",
    opciones: ["YouTube 16:9", "Instagram 1:1", "Story 9:16", "TikTok 9:16", "Twitter 16:9"],
    tip: "Para YouTube siempre usa 16:9 — es el estándar.",
    imagen: "https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/ep7dn9loipzbtrsin7lp.jpg"
  },
  {
    num: "2",
    titulo: "Agrega elementos (opcional)",
    desc: "Puedes subir fotos de personas o personajes que quieras incluir en la miniatura.",
    opciones: ["Hasta 3 elementos", "Posición izquierda/centro/derecha", "Usa tu avatar para 'Con mi cara'"],
    tip: "No uses imágenes con copyright (RE, Marvel, Disney) — serán rechazadas.",
    imagen: "https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/ksezs7sth3iq7zu74zzz.jpg"
  },
  {
    num: "3",
    titulo: "Describe la escena",
    desc: "Escribe un prompt corto y directo. Entre más específico, mejor resultado.",
    opciones: ["'Guerrero samurai en templo nevado'", "'Ciudad futurista con neon'", "'Explorador en isla tropical'"],
    tip: "Prompts de 5-10 palabras funcionan mejor que descripciones largas.",
    imagen: "https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/v0wdhx4ekwnlekbkuwzi.jpg"
  },
  {
    num: "4",
    titulo: "Elige la emoción",
    desc: "La emoción define el ambiente y la iluminación de tu miniatura.",
    opciones: ["Épico — dramático e intenso", "Misterioso — oscuro y enigmático", "Emocionado — energético y vibrante"],
    tip: "Para gaming y streams, 'Épico' y 'Misterioso' son los más efectivos.",
    imagen: "https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/sc47fyiwkft1tkzbnfbg.jpg"
  },
];

const modos = [
  {
    titulo: "Solo fondo IA",
    creditos: "4 créditos",
    color: "#1D9E75",
    desc: "Genera 2 variaciones de fondo cinematográfico. Puedes agregar hasta 3 elementos (fotos de personas).",
    ideal: "Miniaturas de gaming, vlogs, contenido general",
    imagen: "https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/oz3asccfb1vc9hwak5yo.jpg"
  },
  {
    titulo: "Con mi cara",
    creditos: "5 créditos",
    color: "#FF4D00",
    desc: "Usa tu avatar para integrarte en la escena con IA. Genera 1 resultado con face swap y upscaling.",
    ideal: "Youtubers y streamers que quieren aparecer en sus miniaturas",
    imagen: "https://res.cloudinary.com/dgzlajqex/image/upload/thumbslatam/fondos/rnzbfivhr9t00v37pog1.jpg"
  },
];

const limitaciones = [
  { icon: "⚠️", titulo: "Copyright", desc: "No uses imágenes de juegos, películas o series (RE, Marvel, GTA, etc.). Serán rechazadas automáticamente." },
  { icon: "👤", titulo: "Con mi cara = 1 personaje", desc: "El modo 'Con mi cara' solo funciona con 1 personaje. Tu cara se aplica a todos los rostros detectados." },
  { icon: "🎮", titulo: "Nombres de personajes", desc: "No puedes pedir 'Jill Valentine' o 'Kratos' por nombre. Describe el personaje: 'guerrera con pistola y chaleco táctico'." },
  { icon: "🖼️", titulo: "Imagen de referencia", desc: "La imagen de referencia inspira el estilo visual, no es una copia exacta. La IA crea algo original basado en ella." },
  { icon: "⏱️", titulo: "Tiempo de generación", desc: "Solo fondo: ~30-40 segundos. Con mi cara: hasta 2 minutos. Ten paciencia." },
  { icon: "💾", titulo: "Guardar tu trabajo", desc: "En el editor usa 'Guardar miniatura' para que quede en tu galería. 'Descargar' solo baja el archivo." },
];

const tips = [
  "Prompts en inglés dan mejores resultados con FLUX",
  "Usa avatares con buena iluminación y fondo claro",
  "El editor te permite agregar texto con efectos y múltiples líneas",
  "Puedes subir tu propio fondo en el editor",
  "La imagen de referencia funciona mejor con paisajes y escenas sin personas",
];

export default function Ayuda() {
  const [seccion, setSeccion] = useState("pasos");

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif"}}>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"32px"}}>
          <a href="/dashboard" style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none"}}>← Dashboard</a>
          <img src="/logo.png" alt="ThumbsLatam" style={{height:"28px"}}/>
        </div>

        <h1 style={{fontSize:"1.8rem",fontWeight:800,margin:"0 0 8px"}}>Centro de ayuda</h1>
        <p style={{color:"#8B8FA8",marginBottom:"32px"}}>Todo lo que necesitas saber para crear miniaturas increíbles.</p>

        {/* Tabs */}
        <div style={{display:"flex",gap:"8px",marginBottom:"32px",flexWrap:"wrap"}}>
          {[["pasos","Cómo funciona"],["modos","Modos de generación"],["limitaciones","Limitaciones"],["tips","Tips pro"]].map(([id,label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{padding:"8px 16px",borderRadius:"20px",border:`1px solid ${seccion===id?"#FF4D00":"#3A3D52"}`,background:seccion===id?"rgba(255,77,0,0.15)":"transparent",color:seccion===id?"#FF4D00":"#8B8FA8",fontSize:"0.85rem",cursor:"pointer",fontWeight:seccion===id?700:400}}>
              {label}
            </button>
          ))}
        </div>

        {/* Sección: Cómo funciona */}
        {seccion === "pasos" && (
          <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
            {pasos.map((paso) => (
              <div key={paso.num} style={{background:"#111827",borderRadius:"14px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
                <img src={paso.imagen} alt={paso.titulo} style={{width:"100%",height:"160px",objectFit:"cover",display:"block"}}/>
                <div style={{padding:"20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
                    <span style={{background:"#FF4D00",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",fontWeight:700,flexShrink:0}}>{paso.num}</span>
                    <h3 style={{margin:0,fontSize:"1rem",fontWeight:700}}>{paso.titulo}</h3>
                  </div>
                  <p style={{color:"#8B8FA8",fontSize:"0.88rem",lineHeight:1.6,margin:"0 0 12px"}}>{paso.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
                    {paso.opciones.map(op => (
                      <span key={op} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",padding:"3px 10px",fontSize:"0.78rem",color:"#8B8FA8"}}>{op}</span>
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

        {/* Sección: Modos */}
        {seccion === "modos" && (
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            {modos.map((modo) => (
              <div key={modo.titulo} style={{background:"#111827",borderRadius:"14px",overflow:"hidden",border:`1px solid rgba(255,255,255,0.07)`}}>
                <img src={modo.imagen} alt={modo.titulo} style={{width:"100%",height:"180px",objectFit:"cover",display:"block"}}/>
                <div style={{padding:"20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
                    <h3 style={{margin:0,fontSize:"1rem",fontWeight:700}}>{modo.titulo}</h3>
                    <span style={{background:`rgba(255,255,255,0.05)`,border:`1px solid ${modo.color}`,borderRadius:"6px",padding:"3px 10px",fontSize:"0.78rem",color:modo.color,fontWeight:700}}>{modo.creditos}</span>
                  </div>
                  <p style={{color:"#8B8FA8",fontSize:"0.88rem",lineHeight:1.6,margin:"0 0 10px"}}>{modo.desc}</p>
                  <p style={{color:"#8B8FA8",fontSize:"0.82rem",margin:0}}>✓ Ideal para: <span style={{color:"white"}}>{modo.ideal}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sección: Limitaciones */}
        {seccion === "limitaciones" && (
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {limitaciones.map((l) => (
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

        {/* Sección: Tips */}
        {seccion === "tips" && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {tips.map((tip, i) => (
              <div key={i} style={{background:"#111827",borderRadius:"12px",padding:"16px 20px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:"12px",alignItems:"center"}}>
                <span style={{background:"#FF4D00",borderRadius:"50%",width:"24px",height:"24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.78rem",fontWeight:700,flexShrink:0}}>{i+1}</span>
                <p style={{color:"#8B8FA8",fontSize:"0.88rem",lineHeight:1.5,margin:0}}>{tip}</p>
              </div>
            ))}
            <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.2)",borderRadius:"12px",padding:"20px",marginTop:"8px",textAlign:"center"}}>
              <p style={{color:"#FF4D00",fontWeight:700,margin:"0 0 8px"}}>¿Tienes dudas?</p>
              <p style={{color:"#8B8FA8",fontSize:"0.85rem",margin:"0 0 12px"}}>Escríbenos y te ayudamos.</p>
              <a href="mailto:soporte@thumbslatam.com" style={{display:"inline-block",padding:"8px 20px",background:"#FF4D00",color:"white",borderRadius:"8px",fontWeight:700,textDecoration:"none",fontSize:"0.85rem"}}>soporte@thumbslatam.com</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
