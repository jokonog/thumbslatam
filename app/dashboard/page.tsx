"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [creditos, setCreditos] = useState<number | null>(null);
  const [plan, setPlan] = useState("gratis");
  const [miniaturas, setMiniaturas] = useState(0);

  useEffect(() => {
    async function cargarDatos() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        window.location.href = "/registro";
        return;
      }

      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("creditos, plan")
        .eq("id", authData.user.id)
        .single();

      if (usuarioData) {
        setCreditos(usuarioData.creditos);
        setPlan(usuarioData.plan);
      }

      const { count } = await supabase
        .from("miniatura")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", authData.user.id);

      setMiniaturas(count || 0);
    }
    cargarDatos();
  }, []);

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"40px 24px",maxWidth:"900px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"40px"}}>
        <h1 style={{fontSize:"1.8rem",fontWeight:"800",letterSpacing:"-0.03em"}}>
          Thumbs<span style={{color:"#FF4D00"}}>Latam</span>
        </h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")}
          style={{padding:"8px 16px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}
        >
          Cerrar sesión
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"40px"}}>
        <div style={{background:"#111827",borderRadius:"12px",padding:"24px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"2rem",fontWeight:"800",color:"#FF4D00"}}>
            {creditos === null ? "..." : creditos}
          </div>
          <div style={{color:"#8B8FA8",fontSize:"0.85rem",marginTop:"4px"}}>Créditos disponibles</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"24px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"2rem",fontWeight:"800"}}>{miniaturas}</div>
          <div style={{color:"#8B8FA8",fontSize:"0.85rem",marginTop:"4px"}}>Miniaturas creadas</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"24px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"1rem",fontWeight:"700",color:"#06D6A0",textTransform:"capitalize"}}>
            {plan}
          </div>
          <div style={{color:"#8B8FA8",fontSize:"0.85rem",marginTop:"4px"}}>Plan actual</div>
        </div>
      </div>

      {creditos !== null && creditos < 5 && (
        <div style={{background:"rgba(255,77,0,0.1)",border:"1px solid rgba(255,77,0,0.3)",borderRadius:"10px",padding:"14px 18px",marginBottom:"24px",fontSize:"0.85rem",color:"#FF4D00"}}>
          ⚠️ Te quedan {creditos} crédito{creditos !== 1 ? "s" : ""} — cada generación cuesta 3 créditos.{" "}
          <strong>Mejora tu plan para seguir creando.</strong>
        </div>
      )}

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
        <p style={{color:"#8B8FA8"}}>
          {miniaturas === 0 ? "Aun no has generado miniaturas" : `${miniaturas} miniatura${miniaturas !== 1 ? "s" : ""} generada${miniaturas !== 1 ? "s" : ""}`}
        </p>
        <a href="/editor" style={{display:"inline-block",marginTop:"16px",padding:"10px 20px",borderRadius:"8px",background:"#FF4D00",color:"white",textDecoration:"none",fontWeight:"600",fontSize:"0.9rem"}}>
          Crear mi primera miniatura
        </a>
      </div>
    </main>
  );
}
