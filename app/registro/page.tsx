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
      const m = errReg.message.toLowerCase();
      if (m.includes("rate limit") || m.includes("load failed")) {
        setMensaje(lang === "es" ? "Has solicitado demasiados emails. Espera 60 minutos." : "Too many requests. Please wait 60 minutes.");
      } else if (m.includes("already registered") || m.includes("already exists")) {
        setMensaje(lang === "es" ? "Este email ya tiene cuenta. Inicia sesion." : "Email already registered. Try signing in.");
      } else {
        setMensaje("Error: " + errReg.message);
      }
    } else {
      setMensaje(txt.confirm);
    }
    setCargando(false);
  }
  async function iniciarSesion() {
    setCargando(true);
    const { error: errLogin } = await supabase.auth.signInWithPassword({ email, password });
    if (errLogin) {
      const m = errLogin.message.toLowerCase();
      if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("wrong password")) {
        setMensaje(lang === "es" ? "Email o contrasena incorrectos." : "Incorrect email or password.");
      } else if (m.includes("email not confirmed")) {
        setMensaje(lang === "es" ? "Debes confirmar tu email antes de iniciar sesion." : "Please confirm your email before signing in.");
      } else if (m.includes("too many") || m.includes("rate limit") || m.includes("load failed")) {
        setMensaje(lang === "es" ? "Demasiados intentos. Espera unos minutos." : "Too many attempts. Please wait a few minutes.");
      } else {
        setMensaje("Error: " + errLogin.message);
      }
    } else {
      window.location.replace("/dashboard");
    }
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
