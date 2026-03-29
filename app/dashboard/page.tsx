"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [creditos, setCreditos] = useState<number | null>(null);
  const [plan, setPlan] = useState("gratis");
  const [miniaturas, setMiniaturas] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [plataforma, setPlataforma] = useState("youtube");
  const [modo, setModo] = useState<"fondo" | "cara">("fondo");
  const [tema, setTema] = useState("");
  const [escena, setEscena] = useState("");
  const [generando, setGenerando] = useState(false);
  const [errorGen, setErrorGen] = useState("");

  const plataformas = [
    { id: "youtube", label: "YouTube 16:9" },
    { id: "instagram", label: "Instagram 1:1" },
    { id: "instagram_story", label: "Story 9:16" },
    { id: "tiktok", label: "TikTok 9:16" },
    { id: "twitter", label: "Twitter 16:9" },
  ];

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

  useEffect(() => {
    cargarDatos();
    const handlePageShow = (e: PageTransitionEvent) => { cargarDatos(); };
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", cargarDatos);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", cargarDatos);
    };
  }, []);

  async function irAGenerar() {
    if (!tema || creditos === null) return;
    setErrorGen("");
    setGenerando(true);

    try {
      const esVertical = plataforma === "instagram_story" || plataforma === "tiktok";
      const orientacion = esVertical ? "vertical 9:16 portrait" : "horizontal 16:9 landscape";
      const descripcion = escena ? `${tema}. Escena: ${escena}` : tema;
      let imageUrl = "";

      if (modo === "cara") {
        const res = await fetch("/api/generate-with-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, descripcion, estilo: "gaming", orientacion }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        imageUrl = data.imageUrl;
        const nuevos = creditos - 5;
        await supabase.from("usuarios").update({ creditos: nuevos }).eq("id", userId);
        setCreditos(nuevos);
      } else {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descripcion, estilo: "gaming", emocion: "epico", orientacion }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        imageUrl = data.imageUrl;
        const nuevos = creditos - 3;
        await supabase.from("usuarios").update({ creditos: nuevos }).eq("id", userId);
        setCreditos(nuevos);
        if (userId) await supabase.from("miniatura").insert({ usuario_id: userId, imagen_url: imageUrl });
      }

      const params = new URLSearchParams({ plataforma, imageUrl });
      window.location.href = `/editor?${params.toString()}`;

    } catch (err: any) {
      setErrorGen("Error generando: " + err.message);
      setGenerando(false);
    }
  }

  const sinCreditos = creditos !== null && creditos < 3;
  const sinCreditosCara = creditos !== null && creditos < 5;
  const tieneAvatar = !!avatarUrl;

  // Pantalla de carga
  if (generando) return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <style>{`@keyframes loadbar { 0%{width:5%} 50%{width:85%} 100%{width:5%} }`}</style>
      <div style={{textAlign:"center",maxWidth:"420px",width:"100%"}}>
        <div style={{fontSize:"3rem",marginBottom:"24px"}}>🎨</div>
        <h2 style={{fontSize:"1.3rem",fontWeight:"800",marginBottom:"8px",letterSpacing:"-0.03em"}}>
          Generando tu miniatura...
        </h2>
        <p style={{color:"#8B8FA8",fontSize:"0.85rem",marginBottom:"32px",lineHeight:"1.5"}}>
          {modo === "cara"
            ? "Estamos generando la escena y ajustando tu cara — puede tardar hasta 2 minutos"
            : "Esto tarda unos 30 segundos, no cierres esta pantalla"}
        </p>
        <div style={{background:"#111827",borderRadius:"999px",height:"8px",overflow:"hidden",marginBottom:"16px"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#FF4D00,#ff7a00)",borderRadius:"999px",animation:"loadbar 2s ease-in-out infinite"}}/>
        </div>
        <p style={{color:"#3A3D52",fontSize:"0.75rem"}}>No cierres esta pantalla</p>
      </div>
    </main>
  );

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"32px 24px",maxWidth:"900px",margin:"0 auto"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"}}>
        <h1 style={{fontSize:"1.8rem",fontWeight:"800",letterSpacing:"-0.03em",margin:0}}>
          Thumbs<span style={{color:"#FF4D00"}}>Latam</span>
        </h1>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")} style={{padding:"8px 16px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}>
          Cerrar sesión
        </button>
      </div>

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

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"24px"}}>
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

        {creditos !== null && creditos < 6 ? (
          <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.25)",borderRadius:"12px",padding:"16px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:"0.82rem",color:"#FF4D00",marginBottom:"8px"}}>
              Te quedan {creditos} creditos — fondo cuesta 3, con tu cara cuesta 5.
            </div>
            <a href="#" style={{fontSize:"0.78rem",color:"#FF4D00",fontWeight:"700",textDecoration:"none"}}>Mejorar plan →</a>
          </div>
        ) : (
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"4px"}}>Costo por generacion</div>
            <div style={{fontSize:"0.82rem",color:"white"}}>Solo fondo IA — <span style={{color:"#FF4D00"}}>3 creditos</span></div>
            <div style={{fontSize:"0.82rem",color:"white",marginTop:"2px"}}>Con mi cara — <span style={{color:"#FF4D00"}}>5 creditos</span></div>
          </div>
        )}
      </div>

      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h2 style={{fontSize:"1rem",fontWeight:"700",margin:"0 0 20px"}}>Crear miniatura</h2>

        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>1. Elige la plataforma</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}} suppressHydrationWarning>
            {plataformas.map((p) => (
              <button key={p.id} onClick={() => setPlataforma(p.id)} suppressHydrationWarning style={{padding:"7px 14px",borderRadius:"999px",border:"none",fontSize:"0.78rem",cursor:"pointer",background:plataforma===p.id?"#FF4D00":"#1f2937",color:plataforma===p.id?"white":"#8B8FA8",fontWeight:plataforma===p.id?"700":"400"}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>2. Como quieres generarla?</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <button onClick={() => setModo("fondo")} disabled={sinCreditos} suppressHydrationWarning style={{padding:"14px",borderRadius:"10px",border:modo==="fondo"?"2px solid #FF4D00":"1px solid #3A3D52",background:modo==="fondo"?"rgba(255,77,0,0.08)":"transparent",color:"white",cursor:sinCreditos?"not-allowed":"pointer",textAlign:"left",opacity:sinCreditos?0.5:1}}>
              <div style={{fontSize:"0.88rem",fontWeight:"700",marginBottom:"4px"}}>Solo fondo IA</div>
              <div style={{fontSize:"0.75rem",color:"#8B8FA8",marginBottom:"8px"}}>Genera el fondo y edita con texto en el editor</div>
              <div style={{fontSize:"0.72rem",color:"#FF4D00"}}>3 creditos</div>
            </button>
            <button onClick={() => tieneAvatar && !sinCreditosCara && setModo("cara")} suppressHydrationWarning style={{padding:"14px",borderRadius:"10px",border:modo==="cara"?"2px solid #FF4D00":"1px solid #3A3D52",background:modo==="cara"?"rgba(255,77,0,0.08)":"transparent",color:"white",cursor:!tieneAvatar||sinCreditosCara?"not-allowed":"pointer",textAlign:"left",opacity:!tieneAvatar||sinCreditosCara?0.5:1}}>
              <div style={{fontSize:"0.88rem",fontWeight:"700",marginBottom:"4px"}}>Con mi cara</div>
              <div style={{fontSize:"0.75rem",color:"#8B8FA8",marginBottom:"8px"}}>Apareces tu en la miniatura generada con IA</div>
              <div suppressHydrationWarning style={{fontSize:"0.72rem",color:!tieneAvatar?"#3A3D52":"#FF4D00"}}>
                {!tieneAvatar ? "Requiere avatar — sube tus fotos primero" : "5 creditos"}
              </div>
            </button>
          </div>
        </div>

        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>3. Describe tu miniatura</div>
          <input type="text" placeholder="De que es tu video? Ej: Minecraft survival en el nether" value={tema} onChange={(e)=>setTema(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",marginBottom:"8px",boxSizing:"border-box"}}/>
          <input type="text" placeholder="Escena (opcional): explosion de lava, personaje corriendo..." value={escena} onChange={(e)=>setEscena(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",boxSizing:"border-box"}}/>
        </div>

        {errorGen && (
          <div style={{padding:"10px 14px",borderRadius:"8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:"0.82rem",marginBottom:"10px"}}>
            {errorGen}
          </div>
        )}

        <button onClick={irAGenerar} disabled={!tema||sinCreditos} suppressHydrationWarning style={{width:"100%",padding:"13px",borderRadius:"10px",background:!tema||sinCreditos?"#3A3D52":"#FF4D00",border:"none",color:"white",fontWeight:"700",fontSize:"0.95rem",cursor:!tema||sinCreditos?"not-allowed":"pointer"}}>
          {sinCreditos ? "Sin creditos — Mejora tu plan" : "Generar miniatura →"}
        </button>
      </div>

      <h2 style={{fontSize:"1rem",fontWeight:"700",marginBottom:"12px"}}>Mis miniaturas</h2>
      <div style={{background:"#111827",borderRadius:"12px",padding:"32px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
        <p style={{color:"#8B8FA8",margin:"0 0 12px"}}>
          {miniaturas===0?"Aun no has generado miniaturas":`${miniaturas} miniatura${miniaturas!==1?"s":""} generada${miniaturas!==1?"s":""}`}
        </p>
      </div>
    </main>
  );
}
