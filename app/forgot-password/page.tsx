"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviarRecovery() {
    setError("");
    if (!email.trim()) return setError("Ingresa tu email.");
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.thumbslatam.com/reset-password",
    });
    if (error) setError(error.message);
    else setEnviado(true);
    setCargando(false);
  }

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <img src="/logo.png" alt="ThumbsLatam" style={{height:"32px",marginBottom:"24px"}}/>
        {enviado ? (
          <>
            <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"12px"}}>Revisa tu correo</h2>
            <p style={{color:"#8B8FA8",fontSize:"0.9rem",marginBottom:"24px",lineHeight:1.6}}>
              Te enviamos un link a <strong style={{color:"white"}}>{email}</strong> para restablecer tu contrasena.
            </p>
            <a href="/registro" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:"10px",background:"transparent",border:"1px solid #3A3D52",color:"white",fontSize:"0.95rem",fontWeight:500,textDecoration:"none"}}>
              Volver al login
            </a>
          </>
        ) : (
          <>
            <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"8px"}}>Olvidaste tu contrasena?</h2>
            <p style={{color:"#8B8FA8",fontSize:"0.85rem",marginBottom:"24px",lineHeight:1.6}}>
              Ingresa tu email y te enviaremos un link para crear una nueva contrasena.
            </p>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem",marginBottom:"12px",boxSizing:"border-box"}}
            />
            {error && <p style={{color:"#ef4444",fontSize:"0.85rem",marginBottom:"12px"}}>{error}</p>}
            <button onClick={enviarRecovery} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"#FF4D00",border:"none",color:"white",fontSize:"0.95rem",fontWeight:700,cursor:"pointer",marginBottom:"12px"}}>
              {cargando ? "..." : "Enviar link"}
            </button>
            <a href="/registro" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:"10px",background:"transparent",border:"1px solid #3A3D52",color:"white",fontSize:"0.95rem",fontWeight:500,textDecoration:"none"}}>
              Volver al login
            </a>
          </>
        )}
        <p style={{color:"#3A3D52",fontSize:"0.75rem",marginTop:"24px",textAlign:"center"}}>ThumbsLatam — Miniaturas para streamers latinos</p>
      </div>
    </main>
  );
}
