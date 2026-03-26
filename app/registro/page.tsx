"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrar() {
    setCargando(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Revisa tu email para confirmar tu cuenta");
    }
    setCargando(false);
  }

  async function iniciarSesion() {
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      window.location.href = "/dashboard";
    }
    setCargando(false);
  }

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <h1 style={{fontSize:"1.8rem",fontWeight:"800",marginBottom:"8px",letterSpacing:"-0.03em"}}>ThumbsLatam</h1>
        <p style={{color:"#8B8FA8",marginBottom:"32px",fontSize:"0.9rem"}}>Crea tu cuenta o inicia sesión</p>
        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"8px",fontSize:"0.85rem"}}>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="tu@email.com" style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem"}}/>
        </div>
        <div style={{marginBottom:"24px"}}>
          <label style={{display:"block",marginBottom:"8px",fontSize:"0.85rem"}}>Contraseña</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem"}}/>
        </div>
        {mensaje && <p style={{marginBottom:"16px",fontSize:"0.85rem",color:mensaje.includes("Error")?"#ef4444":"#06D6A0"}}>{mensaje}</p>}
        <button onClick={registrar} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"#FF4D00",border:"none",color:"white",fontSize:"0.95rem",fontWeight:"700",marginBottom:"12px",cursor:"pointer"}}>
          {cargando?"Cargando...":"Crear cuenta"}
        </button>
        <button onClick={iniciarSesion} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"transparent",border:"1px solid #3A3D52",color:"white",fontSize:"0.95rem",fontWeight:"500",cursor:"pointer"}}>
          Iniciar sesión
        </button>
      </div>
    </main>
  );
}