"use client";
import { useState } from "react";

export default function Fondo() {
  const [descripcion, setDescripcion] = useState("");
  const [estilo, setEstilo] = useState("gaming");
  const [formato, setFormato] = useState("youtube");
  const [imagen, setImagen] = useState("");
  const [cargando, setCargando] = useState(false);
const [progreso, setProgreso] = useState(0);

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

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"40px 24px",maxWidth:"700px",margin:"0 auto"}}>
      <a href="/dashboard" style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none",display:"block",marginBottom:"24px"}}>← Volver al dashboard</a>
      <h1 style={{fontSize:"2rem",marginBottom:"8px"}}>Genera tu fondo</h1>
      <p style={{color:"#8B8FA8",marginBottom:"32px"}}>La IA crea el fondo perfecto para tu miniatura</p>

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

      <div style={{marginBottom:"32px"}}>
        <label style={{display:"block",marginBottom:"8px"}}>Formato</label>
        <select value={formato} onChange={(e)=>setFormato(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}>
          <option value="youtube">YouTube (1280x720)</option>
          <option value="instagram">Instagram (1080x1080)</option>
          <option value="instagram_story">Instagram Story (1080x1920)</option>
          <option value="tiktok">TikTok (1080x1920)</option>
          <option value="twitter">Twitter (1200x675)</option>
        </select>
      </div>

      <button onClick={generarFondo} disabled={cargando||!descripcion} style={{width:"100%",padding:"14px",borderRadius:"10px",background:descripcion?"#FF4D00":"#3A3D52",border:"none",color:"white",fontSize:"1rem",fontWeight:"700",marginBottom:"32px",cursor:descripcion?"pointer":"not-allowed"}}>
        {cargando?"Generando fondo... 20 segundos":"Generar fondo →"}
      </button>

      {imagen&&(
        <div>
          <img src={imagen} alt="Fondo generado" style={{width:"100%",borderRadius:"12px",marginBottom:"12px"}}/>
          <a href={imagen} target="_blank" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:"8px",background:"#06D6A0",color:"#060810",fontWeight:"700",textDecoration:"none",marginBottom:"12px"}}>
            Descargar fondo
          </a>
          <a href="/generador" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"white",textDecoration:"none",fontSize:"0.9rem"}}>
            Generar con mi cara →
          </a>
        </div>
      )}
    </main>
  );
}