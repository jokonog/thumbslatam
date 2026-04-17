"use client";
import Logo from "@/components/Logo";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const t = {
  es: {
    subtitle: "Crea tu cuenta o inicia sesion",
    email: "Email",
    password: "Contrasena",
    register: "Crear cuenta",
    login: "Iniciar sesion",
    loading: "Cargando...",
    forgot: "Olvidaste tu contrasena?",
    confirm: "Revisa tu email para confirmar tu cuenta",
  },
  en: {
    subtitle: "Create your account or sign in",
    email: "Email",
    password: "Password",
    register: "Create account",
    login: "Sign in",
    loading: "Loading...",
    forgot: "Forgot your password?",
    confirm: "Check your email to confirm your account",
  }
};

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [lang, setLang] = useState<"es"|"en">("es");

  useEffect(() => {
    const saved = localStorage.getItem("tl_lang");
    if (saved === "en") setLang("en");
  }, []);

  const txt = t[lang];

  async function registrar() {
    setCargando(true);
    const { error: errReg } = await supabase.auth.signUp({ email, password });
    if (errReg) {
      const msg1 = errReg.message.toLowerCase();
      if (msg1.includes("rate limit") || msg1.includes("load failed")) {
        setMensaje("Has solicitado demasiados emails. Espera 60 minutos. / Too many requests. Wait 60 minutes.");
      } else if (msg1.includes("already registered") || msg1.includes("already exists")) {
        setMensaje("Este email ya tiene cuenta. Intenta iniciar sesión. / Email already registered. Try signing in.");
      } else {
        setMensaje("Error: " + errReg.message);
      }
    } else { setMensaje(txt.confirm); }
    setCargando(false);
  }

  async function iniciarSesion() {
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    const msg2 = error.message.toLowerCase();
    if (msg2.includes("invalid login") || msg2.includes("invalid credentials") || msg2.includes("wrong password")) {
      setMensaje("Email o contraseña incorrectos. Por favor verifica tus datos. / Incorrect email or password.");
    } else if (msg2.includes("email not confirmed")) {
      setMensaje("Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada. / Please confirm your email before signing in.");
    } else if (msg2.includes("too many requests") || msg2.includes("rate limit") || msg2.includes("load failed")) {
      setMensaje("Demasiados intentos. Por favor espera unos minutos antes de intentarlo de nuevo. / Too many attempts. Please wait a few minutes.");
    } else {
      setMensaje("Error: " + error.message);
    }
  }
    else { window.location.replace("/dashboard"); }
    setCargando(false);
  }

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
          <Logo height={36} href="/" />
          <div style={{display:"flex",gap:0,border:"1px solid rgba(255,255,255,0.2)",borderRadius:"6px",overflow:"hidden"}}>
            <button onClick={() => { setLang("es"); localStorage.setItem("tl_lang","es"); }} style={{background:lang==="es"?"#FF4D00":"transparent",border:"none",color:lang==="es"?"white":"#8B8FA8",fontSize:"0.8rem",padding:"5px 10px",cursor:"pointer",fontWeight:600}}>ES</button>
            <span style={{width:"1px",background:"rgba(255,255,255,0.2)",display:"inline-block"}}></span>
            <button onClick={() => { setLang("en"); localStorage.setItem("tl_lang","en"); }} style={{background:lang==="en"?"#FF4D00":"transparent",border:"none",color:lang==="en"?"white":"#8B8FA8",fontSize:"0.8rem",padding:"5px 10px",cursor:"pointer",fontWeight:600}}>EN</button>
          </div>
        </div>
        <p style={{color:"#8B8FA8",marginBottom:"32px",fontSize:"0.9rem"}}>{txt.subtitle}</p>
        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"8px",fontSize:"0.85rem"}}>{txt.email}</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="tu@email.com" style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem"}}/>
        </div>
        <div style={{marginBottom:"24px"}}>
          <label style={{display:"block",marginBottom:"8px",fontSize:"0.85rem"}}>{txt.password}</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.9rem"}}/>
        </div>
        {mensaje && <p style={{marginBottom:"16px",fontSize:"0.85rem",color:mensaje.includes("Error")?"#ef4444":"#06D6A0"}}>{mensaje}</p>}
        <button onClick={registrar} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"#FF4D00",border:"none",color:"white",fontSize:"0.95rem",fontWeight:"700",marginBottom:"12px",cursor:"pointer"}}>
          {cargando ? txt.loading : txt.register}
        </button>
        <button onClick={iniciarSesion} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"transparent",border:"1px solid #3A3D52",color:"white",fontSize:"0.95rem",fontWeight:"500",cursor:"pointer"}}>
          {txt.login}
        </button>
        <p style={{textAlign:"center",marginTop:"16px",fontSize:"0.82rem"}}>
          <a href="/forgot-password" style={{color:"#8B8FA8",textDecoration:"none"}} onMouseEnter={e=>(e.currentTarget.style.color="#FF4D00")} onMouseLeave={e=>(e.currentTarget.style.color="#8B8FA8")}>
            {txt.forgot}
          </a>
        </p>
      </div>
    </main>
  );
}
