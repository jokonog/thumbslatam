"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const [sessionLista, setSessionLista] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (!error) setSessionLista(true);
          else setError("Link invalido o expirado. Solicita uno nuevo.");
        });
      } else {
        setError("Link invalido o expirado. Solicita uno nuevo.");
      }
    }
  }, []);

  async function cambiarPassword() {
    setError("");
    if (!password || password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmar) return setError("Las contraseñas no coinciden.");
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setListo(true);
    setCargando(false);
  }

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <img src="/logo.png" alt="ThumbsLatam" style={{height:"32px",marginBottom:"24px"}}/>
        {listo ? (
          <>
            <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"12px"}}>Contraseña actualizada</h2>
            <p style={{color:"#8B8FA8",fontSize:"0.9rem",marginBottom:"24px",lineHeight:1.6}}>Tu contraseña fue cambiada exitosamente. Ya puedes entrar con tu nueva contraseña.</p>
            <a href="/registro" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:"10px",background:"#FF4D00",color:"white",fontSize:"0.95rem",fontWeight:700,textDecoration:"none"}}>
              Ir al login →
            </a>
          </>
        ) : (
          <>
            <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"8px"}}>Nueva contraseña</h2>
            <p style={{color:"#8B8FA8",fontSize:"0.85rem",marginBottom:"24px"}}>Elige una contraseña segura para tu cuenta.</p>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem",marginBottom:"12px",boxSizing:"border-box"}}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem",marginBottom:"12px",boxSizing:"border-box"}}
            />
            {error && <p style={{color:"#ef4444",fontSize:"0.85rem",marginBottom:"12px"}}>{error}</p>}
            <button onClick={cambiarPassword} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"#FF4D00",border:"none",color:"white",fontSize:"0.95rem",fontWeight:700,cursor:"pointer"}}>
              {cargando ? "..." : "Cambiar contraseña"}
            </button>
          </>
        )}
        <p style={{color:"#3A3D52",fontSize:"0.75rem",marginTop:"24px",textAlign:"center"}}>ThumbsLatam — Miniaturas para streamers latinos</p>
      </div>
    </main>
  );
}
