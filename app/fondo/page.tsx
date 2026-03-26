"use client";
import { useState } from "react";

export default function Fondo() {
  const [descripcion, setDescripcion] = useState("");
  const [estilo, setEstilo] = useState("gaming");
  const [formato, setFormato] = useState("youtube");
  const [texto, setTexto] = useState("");
  const [posTexto, setPosTexto] = useState("bottom");
  const [imagen, setImagen] = useState("");
  const [cargando, setCargando] = useState(false);

  async function generarFondo() {
    setCargando(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, estilo, emocion: "epico" }),
    });
    const data = await res.json();
    setImagen(data.imageUrl);
    setCargando(false);
  }

  const posiciones: Record<string, object> = {
    top: { top: "16px", left: "50%", transform: "translateX(-50%)", textAlign: "center" as const },
    bottom: { bottom: "16px", left: "50%", transform: "translateX(-50%)", textAlign: "center" as const },
    center: { top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" as const },
    left: { top: "50%", left: "16px", transform: "translateY(-50%)", textAlign: "left" as const },
    right: { top: "50%", right: "16px", transform: "translateY(-50%)", textAlign: "right" as const },
  };

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"40px 24px",maxWidth:"700px",margin:"0 auto"}}>
      <a href="/dashboard" style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none",display:"block",marginBottom:"24px"}}>← Volver al dashboard</a>
      <h1 style={{fontSize:"2rem",marginBottom:"8px"}}>Genera tu fondo</h1>
      <p style={{color:"#8B8FA8",marginBottom:"32px"}}>La IA crea el fondo — luego añades tu foto encima</p>

      <div style={{marginBottom:"20px"}}>
        <label style={{display:"block",marginBottom:"8px"}}>De que es tu video?</label>
        <input type="text" placeholder="Batalla epica en Minecraft al amanecer" value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}/>
      </div>

      <div style={{marginBottom:"20px"}}>
        <label style={{display:"block",marginBottom:"8px"}}>Estilo</label>
        <select value={estilo} onChange={(e)=>setEstilo(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}>
          <option value="gaming">Gaming</option>
          <option value="vlog">Vlog</option>
          <option value="tutorial">Tutorial</option>
          <option value="reaccion">Reaccion</option>
          <option value="stream">Stream Highlights</option>
          <option value="entretenimiento">Entretenimiento</option>
          <option value="comedia">Comedia</option>
          <option value="deportes">Deportes</option>
        </select>
      </div>

      <div style={{marginBottom:"20px"}}>
        <label style={{display:"block",marginBottom:"8px"}}>Formato</label>
        <select value={formato} onChange={(e)=>setFormato(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}>
          <option value="youtube">YouTube (1280x720)</option>
          <option value="instagram">Instagram (1080x1080)</option>
          <option value="instagram_story">Instagram Story (1080x1920)</option>
          <option value="tiktok">TikTok (1080x1920)</option>
          <option value="twitter">Twitter (1200x675)</option>
        </select>
      </div>

      <div style={{marginBottom:"20px",padding:"20px",borderRadius:"12px",background:"#111827",border:"1px solid #3A3D52"}}>
        <label style={{display:"block",marginBottom:"8px",fontWeight:"600"}}>Texto opcional</label>
        <input type="text" placeholder="Ej: BATALLA FINAL (max 40 caracteres)" maxLength={40} value={texto} onChange={(e)=>setTexto(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",marginBottom:"12px"}}/>
        {texto && (
          <div>
            <label style={{display:"block",marginBottom:"8px",fontSize:"0.85rem"}}>Posicion del texto</label>
            <select value={posTexto} onChange={(e)=>setPosTexto(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white"}}>
              <option value="top">Arriba</option>
              <option value="center">Centro</option>
              <option value="bottom">Abajo</option>
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
            </select>
          </div>
        )}
      </div>

      <div style={{marginBottom:"32px",padding:"16px",borderRadius:"10px",background:"rgba(6,214,160,0.08)",border:"1px solid rgba(6,214,160,0.2)"}}>
        <p style={{color:"#06D6A0",fontSize:"0.85rem",margin:0}}>
          Descarga el fondo y en Photoshop o Canva añade tu foto. Asi controlas la iluminacion perfecta.
        </p>
      </div>

      <button onClick={generarFondo} disabled={cargando||!descripcion} style={{width:"100%",padding:"14px",borderRadius:"10px",background:descripcion?"#FF4D00":"#3A3D52",border:"none",color:"white",fontSize:"1rem",fontWeight:"700",marginBottom:"32px",cursor:descripcion?"pointer":"not-allowed"}}>
        {cargando?"Generando fondo... 20 segundos":"Generar fondo epico →"}
      </button>

      {imagen&&(
        <div>
          <div style={{position:"relative",borderRadius:"12px",overflow:"hidden",marginBottom:"12px"}}>
            <img src={imagen} alt="Fondo generado" style={{width:"100%",display:"block"}}/>
            {texto && (
              <div style={{position:"absolute",...posiciones[posTexto],padding:"8px 16px",background:"rgba(0,0,0,0.6)",borderRadius:"6px",maxWidth:"80%"}}>
                <p style={{color:"white",fontWeight:"800",fontSize:"clamp(1rem,3vw,1.8rem)",margin:0,textShadow:"2px 2px 8px rgba(0,0,0,0.8)",letterSpacing:"-0.02em"}}>{texto}</p>
              </div>
            )}
          </div>
          <a href={imagen} target="_blank" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:"8px",background:"#06D6A0",color:"#060810",fontWeight:"700",textDecoration:"none",marginBottom:"12px"}}>
            Descargar fondo
          </a>
          <a href="/generador" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"white",textDecoration:"none",fontSize:"0.9rem"}}>
            O generar con mi cara →
          </a>
        </div>
      )}
    </main>
  );
}