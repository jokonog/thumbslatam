"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [creditos, setCreditos] = useState<number | null>(null);
  const [plan, setPlan] = useState("gratis");
  const [miniaturas, setMiniaturas] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [plataforma, setPlataforma] = useState("youtube");
  const [modo, setModo] = useState<"fondo" | "cara">("fondo");
  const [tema, setTema] = useState("");
  const [escena, setEscena] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const plataformas = [
    { id: "youtube", label: "YouTube 16:9" },
    { id: "instagram", label: "Instagram 1:1" },
    { id: "instagram_story", label: "Story 9:16" },
    { id: "tiktok", label: "TikTok 9:16" },
    { id: "twitter", label: "Twitter 16:9" },
  ];

  useEffect(() => {
    async function cargarDatos() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { window.location.href = "/registro"; return; }
      setUserId(authData.user.id);

      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("creditos, plan, avatar_url")
        .eq("id", authData.user.id)
        .single();

      if (usuarioData) {
        setCreditos(usuarioData.creditos);
        setPlan(usuarioData.plan);
        setAvatarUrl(usuarioData.avatar_url || null);
      }

      const { count } = await supabase
        .from("miniatura")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", authData.user.id);

      setMiniaturas(count || 0);
    }
    cargarDatos();
  }, []);

  function irAGenerar() {
    if (!tema) return;
    const params = new URLSearchParams({ plataforma, modo, tema, escena });
    window.location.href = `/editor?${params.toString()}`;
  }

  const sinCreditos = creditos !== null && creditos < 3;
  const sinCreditosCara = creditos !== null && creditos < 5;
  const tieneAvatar = !!avatarUrl;

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"32px 24px",maxWidth:"900px",margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"}}>
        <h1 style={{fontSize:"1.8rem",fontWeight:"800",letterSpacing:"-0.03em",margin:0}}>
          Thumbs<span style={{color:"#FF4D00"}}>Latam</span>
        </h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")}
          style={{padding:"8px 16px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"}}>
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"2rem",fontWeight:"800",color:"#FF4D00"}}>{creditos === null ? "..." : creditos}</div>
          <div style={{color:"#8B8FA8",fontSize:"0.82rem",marginTop:"4px"}}>Créditos disponibles</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"2rem",fontWeight:"800"}}>{miniaturas}</div>
          <div style={{color:"#8B8FA8",fontSize:"0.82rem",marginTop:"4px"}}>Miniaturas creadas</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"1rem",fontWeight:"700",color:"#06D6A0",textTransform:"capitalize"}}>{plan}</div>
          <div style={{color:"#8B8FA8",fontSize:"0.82rem",marginTop:"4px"}}>Plan actual</div>
        </div>
      </div>

      {/* Avatar + alerta */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"24px"}}>

        {/* Avatar */}
        <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>Mi avatar</div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{width:"48px",height:"48px",borderRadius:"50%",objectFit:"cover",border:"2px solid #FF4D00"}}/>
            ) : (
              <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"#1f2937",border:"2px dashed #3A3D52",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>👤</div>
            )}
            <div>
              <div style={{fontSize:"0.82rem",color:tieneAvatar?"white":"#8B8FA8",marginBottom:"4px"}}>
                {tieneAvatar ? "Avatar guardado" : "Sin avatar todavía"}
              </div>
              <a href="/avatar" style={{fontSize:"0.78rem",color:"#FF4D00",textDecoration:"none"}}>
                {tieneAvatar ? "Actualizar fotos →" : "Subir mis fotos →"}
              </a>
            </div>
          </div>
        </div>

        {/* Alerta créditos */}
        {creditos !== null && creditos < 6 ? (
          <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.25)",borderRadius:"12px",padding:"16px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:"0.82rem",color:"#FF4D00",marginBottom:"8px"}}>
              ⚠️ Te quedan {creditos} créditos — generar fondo cuesta 3, con tu cara cuesta 5.
            </div>
            <a href="#" style={{fontSize:"0.78rem",color:"#FF4D00",fontWeight:"700",textDecoration:"none"}}>Mejorar plan →</a>
          </div>
        ) : (
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"4px"}}>Costo por generación</div>
            <div style={{fontSize:"0.82rem",color:"white"}}>Solo fondo IA — <span style={{color:"#FF4D00"}}>3 créditos</span></div>
            <div style={{fontSize:"0.82rem",color:"white",marginTop:"2px"}}>Con mi cara — <span style={{color:"#FF4D00"}}>5 créditos</span></div>
          </div>
        )}
      </div>

      {/* Crear miniatura */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h2 style={{fontSize:"1rem",fontWeight:"700",margin:"0 0 20px"}}>Crear miniatura</h2>

        {/* Paso 1: Plataforma */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>1. Elige la plataforma</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {plataformas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlataforma(p.id)}
                style={{
                  padding:"7px 14px",
                  borderRadius:"999px",
                  border:"none",
                  fontSize:"0.78rem",
                  cursor:"pointer",
                  background: plataforma === p.id ? "#FF4D00" : "#1f2937",
                  color: plataforma === p.id ? "white" : "#8B8FA8",
                  fontWeight: plataforma === p.id ? "700" : "400",
                  transition:"all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paso 2: Modo */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>2. ¿Cómo quieres generarla?</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <button
              onClick={() => setModo("fondo")}
              disabled={sinCreditos}
              style={{
                padding:"14px",
                borderRadius:"10px",
                border: modo === "fondo" ? "2px solid #FF4D00" : "1px solid #3A3D52",
                background: modo === "fondo" ? "rgba(255,77,0,0.08)" : "transparent",
                color:"white",
                cursor: sinCreditos ? "not-allowed" : "pointer",
                textAlign:"left",
                opacity: sinCreditos ? 0.5 : 1,
              }}
            >
              <div style={{fontSize:"0.88rem",fontWeight:"700",marginBottom:"4px"}}>Solo fondo IA</div>
              <div style={{fontSize:"0.75rem",color:"#8B8FA8",marginBottom:"8px"}}>Genera el fondo y edita con texto en el editor</div>
              <div style={{fontSize:"0.72rem",color:"#FF4D00"}}>3 créditos</div>
            </button>

            <button
              onClick={() => tieneAvatar && !sinCreditosCara && setModo("cara")}
              style={{
                padding:"14px",
                borderRadius:"10px",
                border: modo === "cara" ? "2px solid #FF4D00" : "1px solid #3A3D52",
                background: modo === "cara" ? "rgba(255,77,0,0.08)" : "transparent",
                color:"white",
                cursor: !tieneAvatar || sinCreditosCara ? "not-allowed" : "pointer",
                textAlign:"left",
                opacity: !tieneAvatar || sinCreditosCara ? 0.5 : 1,
                position:"relative",
              }}
            >
              <div style={{fontSize:"0.88rem",fontWeight:"700",marginBottom:"4px"}}>Con mi cara ⭐</div>
              <div style={{fontSize:"0.75rem",color:"#8B8FA8",marginBottom:"8px"}}>Apareces tú en la miniatura generada con IA</div>
              <div style={{fontSize:"0.72rem",color: !tieneAvatar ? "#3A3D52" : "#FF4D00"}}>
                {!tieneAvatar ? "Requiere avatar — sube tus fotos primero" : "5 créditos"}
              </div>
            </button>
          </div>
        </div>

        {/* Paso 3: Descripción */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>3. Describe tu miniatura</div>
          <input
            type="text"
            placeholder="¿De que es tu video? Ej: Minecraft survival en el nether"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            style={{width:"100%",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",marginBottom:"8px",boxSizing:"border-box"}}
          />
          <input
            type="text"
            placeholder="Escena (opcional): explosión de lava, personaje corriendo..."
            value={escena}
            onChange={(e) => setEscena(e.target.value)}
            style={{width:"100%",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",boxSizing:"border-box"}}
          />
        </div>

        <button
          onClick={irAGenerar}
          disabled={!tema || sinCreditos}
          style={{
            width:"100%",
            padding:"13px",
            borderRadius:"10px",
            background: !tema || sinCreditos ? "#3A3D52" : "#FF4D00",
            border:"none",
            color:"white",
            fontWeight:"700",
            fontSize:"0.95rem",
            cursor: !tema || sinCreditos ? "not-allowed" : "pointer",
          }}
        >
          {sinCreditos ? "Sin créditos — Mejora tu plan" : "Generar miniatura →"}
        </button>
      </div>

      {/* Mis miniaturas */}
      <h2 style={{fontSize:"1rem",fontWeight:"700",marginBottom:"12px"}}>Mis miniaturas</h2>
      <div style={{background:"#111827",borderRadius:"12px",padding:"32px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
        <p style={{color:"#8B8FA8",margin:"0 0 12px"}}>
          {miniaturas === 0 ? "Aun no has generado miniaturas" : `${miniaturas} miniatura${miniaturas !== 1 ? "s" : ""} generada${miniaturas !== 1 ? "s" : ""}`}
        </p>
      </div>
    </main>
  );
}
