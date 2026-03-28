"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [creditos, setCreditos] = useState(10);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/registro";
      else setUser(data.user);
    });
  }, []);

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"40px 24px",maxWidth:"900px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"40px"}}>
        <h1 style={{fontSize:"1.8rem",fontWeight:"800",letterSpacing:"-0.03em"}}>Thumbs<span style={{color:"#FF4D00"}}>Latam</span></h1>
        <button onClick={()=>supabase.auth.signOut().then(()=>window.location.href="/")} style={{padding:"8px 16px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}>
          Cerrar sesión
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"40px"}}>
        <div style={{background:"#111827",borderRadius:"12px",padding:"24px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"2rem",fontWeight:"800",color:"#FF4D00"}}>{creditos}</div>
          <div style={{color:"#8B8FA8",fontSize:"0.85rem",marginTop:"4px"}}>Créditos disponibles</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"24px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"2rem",fontWeight:"800"}}>0</div>
          <div style={{color:"#8B8FA8",fontSize:"0.85rem",marginTop:"4px"}}>Miniaturas creadas</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"24px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"1rem",fontWeight:"700",color:"#06D6A0"}}>Gratis</div>
          <div style={{color:"#8B8FA8",fontSize:"0.85rem",marginTop:"4px"}}>Plan actual</div>
        </div>
      </div>

      <div style={{display:"flex",gap:"12px",marginBottom:"40px",flexWrap:"wrap"}}>
        <a href="/editor" style={{padding:"13px 24px",borderRadius:"10px",background:"#FF4D00",color:"white",textDecoration:"none",fontWeight:"700",fontSize:"0.95rem"}}>
          Editor de miniaturas →
        </a>
        <a href="/fondo" style={{padding:"13px 24px",borderRadius:"10px",background:"transparent",border:"1px solid #FF4D00",color:"#FF4D00",textDecoration:"none",fontWeight:"600",fontSize:"0.95rem"}}>
          Solo fondo IA
        </a>
        <a href="#" style={{padding:"13px 24px",borderRadius:"10px",background:"transparent",border:"1px solid #3A3D52",color:"white",textDecoration:"none",fontSize:"0.95rem"}}>
          Mejorar plan
        </a>
      </div>

      <h2 style={{fontSize:"1.1rem",fontWeight:"700",marginBottom:"16px"}}>Mis miniaturas</h2>
      <div style={{background:"#111827",borderRadius:"12px",padding:"40px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
        <p style={{color:"#8B8FA8"}}>Aún no has generado miniaturas</p>
        <a href="/generador" style={{display:"inline-block",marginTop:"16px",padding:"10px 20px",borderRadius:"8px",background:"#FF4D00",color:"white",textDecoration:"none",fontWeight:"600",fontSize:"0.9rem"}}>
          Crear mi primera miniatura
        </a>
      </div>
    </main>
  );
}