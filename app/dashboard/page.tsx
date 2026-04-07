"use client";
import Logo from "@/components/Logo";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

function BarraProgreso({ duracion }: { duracion: number }) {
  const [progreso, setProgreso] = useState(0);
  useEffect(() => {
    const inicio = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - inicio) / 1000;
      const pct = Math.min(95, (elapsed / duracion) * 100);
      setProgreso(pct);
      if (pct >= 95) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [duracion]);
  return (
    <div style={{height:"100%",background:"#FF4D00",borderRadius:"999px",width:`${progreso}%`,transition:"width 0.5s ease"}}/>
  );
}

export default function Dashboard() {
  const [creditos, setCreditos] = useState<number | null>(null);
  const [plan, setPlan] = useState("gratis");
  const [codigo, setCodigo] = useState("");
  const [fotoTemporal, setFotoTemporal] = useState<string | null>(null);
  const [fotoTemporalFile, setFotoTemporalFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [elementos, setElementos] = useState<{imagen: string | null, descripcion: string, usarAvatar: boolean, tipo: string}[]>([
    {imagen: null, descripcion: "", usarAvatar: false, tipo: "personaje"},
    {imagen: null, descripcion: "", usarAvatar: false, tipo: "personaje"},
    {imagen: null, descripcion: "", usarAvatar: false, tipo: "personaje"},
  ]);
  const [titulo, setTitulo] = useState("");
  const [tituloModo, setTituloModo] = useState<"ia" | "manual" | "ninguno">("ninguno");
  const [modalElementos, setModalElementos] = useState(false);
  const [codigoMsg, setCodigoMsg] = useState("");
  const [canjeando, setCanjeando] = useState(false);
  const [miniaturas, setMiniaturas] = useState(0);
  const [confirmarBorrar, setConfirmarBorrar] = useState<number|null>(null);
  const [listaMinis, setListaMinis] = useState<{id:number, imagen_url:string, created_at:string}[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [plataforma, setPlataforma] = useState("youtube");
  
  const [modo, setModo] = useState<"fondo" | "cara">("fondo");
  const [tema, setTema] = useState("");
  const [imagenReferencia, setImagenReferencia] = useState<string | null>(null);
  const [escena, setEscena] = useState("");
  const [emocion, setEmocion] = useState("epico");
  const [generando, setGenerando] = useState(false);
  const [errorGen, setErrorGen] = useState("");
  const [variaciones, setVariaciones] = useState<string[]>([]);
  const [varSeleccionada, setVarSeleccionada] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const plataformas = [
    { id: "youtube", label: "YouTube 16:9" },
    { id: "instagram", label: "Instagram 1:1" },
    { id: "instagram_story", label: "Story 9:16" },
    { id: "tiktok", label: "TikTok 9:16" },
    { id: "twitter", label: "Twitter 16:9" },
  ];

  async function cargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { window.location.href = "/registro"; return; }
    setUserId(session.user.id);
    const authData = { user: session.user };

    const { data: usuarioData } = await supabase
      .from("usuarios")
      .select("creditos, plan, avatar_url, email_creditos_bajos_enviado")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (usuarioData) {
      setCreditos(usuarioData.creditos);
      setPlan(usuarioData.plan);
      setAvatarUrl(usuarioData.avatar_url || null);
      // Email bienvenida solo si es la primera vez (creditos = 5 y 0 miniaturas)
      if (usuarioData.creditos === 5) {
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "bienvenida", email: authData.user.email }),
        }).catch(() => {});
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "nuevo_usuario_admin", email: authData.user.email }),
        }).catch(() => {});
      }
      // Email creditos bajos — solo una vez
      if (usuarioData.creditos > 0 && usuarioData.creditos < 5 && !usuarioData.email_creditos_bajos_enviado) {
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "creditos_bajos", email: authData.user.email }),
        }).catch(() => {});
        supabase.from("usuarios").update({ email_creditos_bajos_enviado: true }).eq("id", authData.user.id).then(() => {});
      }
    }

    const { data: miniData, count } = await supabase
      .from("miniatura")
      .select("*", { count: "exact" })
      .eq("usuario_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    const miniCount = count;
    setMiniaturas(count || 0);
    setListaMinis(miniData || []);
  }

  useEffect(() => {
    cargarDatos();
    return () => {
    };
  }, []);

  async function generarVariaciones() {
    if (!tema || creditos === null) return;

    // Subir imagenes de elementos a Cloudinary
    const elementosConUrl = await Promise.all(elementos.map(async (el) => {
      if (el.imagen && el.imagen.startsWith("data:")) {
        const res = await fetch("/api/upload-elemento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagen: el.imagen }),
        });
        const data = await res.json();
        return { ...el, imagen: data.url };
      }
      return el;
    }));
    setErrorGen("");
    setGenerando(true);
    setVariaciones([]);
    setVarSeleccionada(null);
    setConfirmando(false);

    try {
      const esVertical = plataforma === "instagram_story" || plataforma === "tiktok";
      const orientacion = esVertical ? "vertical 9:16 portrait" : "horizontal 16:9 landscape";
      const descripcion = escena ? `${tema}. Escena: ${escena}` : tema;
      const costo = modo === "cara" ? 5 : 4;

      if (modo === "cara") {
        const res = await fetch("/api/generate-with-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, descripcion, estilo: "gaming", emocion, orientacion, avatarOverride: fotoTemporal, posicionAvatar: elementos.findIndex((el: any) => el.usarAvatar) === 0 ? "left" : elementos.findIndex((el: any) => el.usarAvatar) === 1 ? "center" : "right", imagenReferencia }),
        });
        const data = await res.json();
        if (data.error) {
          if (data.codigo === "COPYRIGHT") {
            throw new Error("⚠️ La imagen fue rechazada. Si usaste una imagen de referencia con copyright, intenta sin ella o usa un prompt de texto.");
          }
          throw new Error(data.error);
        }
        // Cara solo genera 1 por el costo
        const nuevos = creditos - costo;
        await supabase.from("usuarios").update({ creditos: nuevos }).eq("id", userId);
        setCreditos(nuevos);
        if (userId) await supabase.from("miniatura").insert({ usuario_id: userId, imagen_url: data.imageUrl });
        const params = new URLSearchParams({ plataforma, imageUrl: data.imageUrl });
        window.location.href = `/editor?${params.toString()}`;
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion, estilo: "gaming", emocion, orientacion, elementos: elementosConUrl, titulo, tituloModo, imagenReferencia }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.codigo === "COPYRIGHT") {
          throw new Error("⚠️ La imagen fue rechazada por contener contenido con derechos de autor. Por favor usa una imagen propia o genera el fondo con IA.");
        }
        throw new Error(data.error);
      }

      // Descontar creditos al generar
      const nuevos = creditos - costo;
      await supabase.from("usuarios").update({ creditos: nuevos }).eq("id", userId);
      setCreditos(nuevos);

      if (data.variaciones && data.variaciones.length > 1) {
        setVariaciones(data.variaciones);
      } else {
        if (userId) await supabase.from("miniatura").insert({ usuario_id: userId, imagen_url: data.imageUrl });
        const params = new URLSearchParams({ plataforma, imageUrl: data.imageUrl });
        window.location.href = `/editor?${params.toString()}`;
      }
    } catch (err: any) {
      setErrorGen("Error generando: " + err.message);
    }
    setGenerando(false);
  }

  async function elegirVariacion() {
    if (!varSeleccionada) return;
    if (userId) await supabase.from("miniatura").insert({ usuario_id: userId, imagen_url: varSeleccionada });
    const params = new URLSearchParams({ plataforma, imageUrl: varSeleccionada });
    window.location.href = `/editor?${params.toString()}`;
  }

  async function regenerar() {
    if (creditos === null || creditos < 4) return;
    setVariaciones([]);
    setVarSeleccionada(null);
    setConfirmando(false);
    generarVariaciones();
  }

  function handleFotoTemporal(file: File) {
    if (!file.type.startsWith("image/")) return;
    setFotoTemporalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFotoTemporal(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function guardarFotoComoAvatar() {
    if (!fotoTemporalFile || !userId) return;
    const formData = new FormData();
    formData.append("file", fotoTemporalFile);
    formData.append("userId", userId);
    await fetch("/api/avatar", { method: "POST", body: formData });
    setAvatarUrl(fotoTemporal);
    // tieneAvatar se deriva de avatarUrl automaticamente
    setFotoTemporal(null);
    setFotoTemporalFile(null);
  }

  async function canjearCodigo() {
    if (!codigo.trim()) return;
    setCanjeando(true);
    setCodigoMsg("");
    try {
      const res = await fetch("/api/canjear-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, codigo }),
      });
      const data = await res.json();
      if (data.ok) {
        setCodigoMsg(`Canjeado — +${data.creditos} creditos. Total: ${data.nuevoTotal}`);
        setCreditos(data.nuevoTotal);
        setCodigo("");
        // Email confirmacion codigo canjeado
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "codigo_canjeado", email: (await supabase.auth.getUser()).data.user?.email }),
        }).catch(() => {});
      } else {
        setCodigoMsg(data.error || "Codigo no valido");
      }
    } catch {
      setCodigoMsg("Error al canjear");
    }
    setCanjeando(false);
  }

  async function descargarMini(url: string, index: number) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `miniatura-thumbslatam-${index + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  }

  const sinCreditos = creditos !== null && creditos < 4;
  const sinCreditosCara = creditos !== null && creditos < 5;
  const tieneAvatar = !!avatarUrl;
  const costo = modo === "cara" ? 5 : 4;

  // Pantalla de variaciones
  if (variaciones.length > 0) return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"var(--font-geist-sans)",padding:"32px 24px",maxWidth:"900px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
        <Logo height={28} />
        <button onClick={() => { setVariaciones([]); setVarSeleccionada(null); setConfirmando(false); }} style={{color:"#8B8FA8",fontSize:"0.85rem",background:"none",border:"1px solid #3A3D52",cursor:"pointer",padding:"8px 16px",borderRadius:"8px"}}>← Volver</button>
      </div>
      <h2 style={{fontSize:"1.1rem",fontWeight:"700",margin:"0 0 4px",letterSpacing:"-0.02em"}}>Elige tu miniatura</h2>
      <p style={{color:"#8B8FA8",fontSize:"0.82rem",margin:"0 0 24px"}}>
        Generamos 2 variaciones — elige la que mas te guste y edita el formato en el editor
      </p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
        {variaciones.map((url, i) => (
          <div key={i}
            onClick={() => { setVarSeleccionada(url); setConfirmando(false); }}
            style={{borderRadius:"12px",overflow:"hidden",border:`2px solid ${varSeleccionada===url?"#FF4D00":"#1f2937"}`,cursor:"pointer",transition:"border-color 0.2s",background:"#111827"}}
          >
            <div style={{position:"relative"}}>
              <img src={url} alt={`variacion ${i+1}`} style={{width:"100%",display:"block",aspectRatio:"16/9",objectFit:"cover"}}/>
              {varSeleccionada === url && (
                <div style={{position:"absolute",top:"8px",right:"8px",background:"#FF4D00",borderRadius:"50%",width:"24px",height:"24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:"white",fontWeight:"700"}}>✓</div>
              )}
              <div style={{position:"absolute",top:"8px",left:"8px",background:"rgba(0,0,0,0.6)",borderRadius:"999px",padding:"3px 10px",fontSize:"11px",color:"white",fontWeight:"600"}}>
                Variacion {i+1}
              </div>
            </div>
            <div style={{padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.78rem",color:"#8B8FA8"}}>{i===0?"Estilo epico":"Estilo cinematico"}</span>
              <span style={{fontSize:"0.78rem",color:varSeleccionada===url?"#FF4D00":"#8B8FA8",fontWeight:"700"}}>
                {varSeleccionada===url?"Seleccionada":"Elegir esta →"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {varSeleccionada && !confirmando && (
        <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.25)",borderRadius:"12px",padding:"14px 16px",marginBottom:"16px"}}>
          <p style={{fontSize:"0.82rem",color:"#FF4D00",margin:0}}>
            Lista — en el editor podras agregar texto y elegir el formato final (YouTube, Instagram, TikTok...)
          </p>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
        <button
          onClick={regenerar}
          disabled={creditos !== null && creditos < 4}
          style={{padding:"12px",borderRadius:"10px",background:"transparent",border:"1px solid #3A3D52",color:creditos !== null && creditos < 4?"#3A3D52":"#8B8FA8",cursor:creditos !== null && creditos < 4?"not-allowed":"pointer",fontSize:"0.85rem"}}
        >
          Regenerar (4 créditos)
        </button>
        <button
          onClick={elegirVariacion}
          disabled={!varSeleccionada}
          style={{padding:"12px",borderRadius:"10px",background:varSeleccionada?"#FF4D00":"#3A3D52",border:"none",color:"white",fontWeight:"700",fontSize:"0.85rem",cursor:varSeleccionada?"pointer":"not-allowed"}}
        >
          Editar esta →
        </button>
      </div>
    </main>
  );

  // Pantalla de carga
  if (generando) return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"var(--font-geist-sans)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{textAlign:"center",maxWidth:"420px",width:"100%"}}>
        <div style={{marginBottom:"20px",pointerEvents:"none",userSelect:"none",display:"flex",justifyContent:"center"}}>
          <Logo height={28} />
        </div>
        <div style={{fontSize:"3rem",marginBottom:"24px"}}>🎨</div>
        <h2 style={{fontSize:"1.3rem",fontWeight:"800",marginBottom:"8px",letterSpacing:"-0.03em"}}>
          Generando tu miniatura...
        </h2>
        <p style={{color:"#8B8FA8",fontSize:"0.85rem",marginBottom:"32px",lineHeight:"1.5"}}>
          {modo === "cara"
            ? "Estamos generando la escena y ajustando tu cara — puede tardar hasta 2 minutos"
            : "Generando 2 variaciones para que elijas — unos 30 segundos"}
        </p>
        <div style={{background:"#111827",borderRadius:"999px",height:"8px",overflow:"hidden",marginBottom:"16px"}}>
          <BarraProgreso duracion={modo === "cara" ? 120 : 40} />
        </div>
        <p style={{color:"#3A3D52",fontSize:"0.75rem"}}>No cierres esta pantalla</p>
      </div>
    </main>
  );

  async function abrirCheckout(plan: "pro" | "studio") {
    console.log("abrirCheckout llamado", plan);
    const isSandbox = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox";
    const priceId = isSandbox
      ? (plan === "pro" ? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_PRO : process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_STUDIO)
      : (plan === "pro" ? process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO : process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO);

    const { initializePaddle } = await import("@paddle/paddle-js");
    const paddle = await initializePaddle({
      environment: isSandbox ? "sandbox" : "production",
      token: isSandbox ? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN! : process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });
    const userEmail = (await supabase.auth.getUser()).data.user?.email;
    paddle?.Checkout.open({
      items: [{ priceId: priceId!, quantity: 1 }],
      customer: { email: userEmail! },
      customData: { userId, plan },
    });
  }

  async function borrarMini(id: number) {
    await supabase.from("miniatura").delete().eq("id", id);
    setListaMinis(prev => prev.filter((m: any) => m.id !== id));
    setMiniaturas(prev => prev - 1);
    setConfirmarBorrar(null);
  }

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"var(--font-geist-sans)",padding:"32px 24px",maxWidth:"900px",margin:"0 auto"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"}}>
        <Logo height={32} />
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <a href="/ayuda" style={{padding:"8px 16px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none"}}>¿Ayuda?</a>
          <button onClick={() => supabase.auth.signOut().then(() => { window.location.replace("/registro"); })} style={{padding:"8px 16px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}>
            Cerrar sesion
          </button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px",alignItems:"stretch"}}>
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:"2rem",fontWeight:"800",color:"#FF4D00"}}>{creditos === null ? "..." : creditos}</div>
          <div style={{color:"#8B8FA8",fontSize:"0.82rem",marginTop:"4px"}}>Creditos disponibles</div>
        </div>
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
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
                {tieneAvatar ? "Avatar guardado" : "Sin avatar todavia"}
              </div>
              <a href="/avatar" style={{fontSize:"0.78rem",color:"#FF4D00",textDecoration:"none"}}>
                {tieneAvatar ? "Actualizar fotos →" : "Subir mis fotos →"}
              </a>
            </div>
          </div>
        </div>

        {/* Campo canjear codigo */}
        <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"8px"}}>Tienes un codigo de regalo?</div>
          <div style={{display:"flex",gap:"8px"}}>
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="THUMBS-NOMBRE-2026"
              style={{flex:1,background:"#060810",border:"1px solid #3A3D52",borderRadius:"8px",padding:"8px 12px",color:"white",fontSize:"0.8rem"}}
            />
            <button
              onClick={canjearCodigo}
              disabled={canjeando}
              style={{background:"#FF4D00",border:"none",borderRadius:"8px",padding:"8px 14px",color:"white",fontSize:"0.8rem",fontWeight:"700",cursor:"pointer"}}
            >
              {canjeando ? "..." : "Canjear"}
            </button>
          </div>
          {codigoMsg && (
            <div style={{fontSize:"0.75rem",marginTop:"6px",color:codigoMsg.includes("Canjeado") ? "#06D6A0" : "#ef4444"}}>
              {codigoMsg}
            </div>
          )}
        </div>
        {creditos !== null && creditos < 6 ? (
          <div style={{background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.25)",borderRadius:"12px",padding:"16px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:"0.82rem",color:"#FF4D00",marginBottom:"8px"}}>
              Te quedan {creditos} creditos — fondo cuesta 4, con tu cara cuesta 5.
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={() => alert("Planes disponibles muy pronto. Mientras tanto disfruta tus creditos gratuitos.")} style={{flex:1,padding:"7px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",fontWeight:"700",fontSize:"0.75rem",cursor:"not-allowed"}}>
                Pro $10/mes — Próximamente
              </button>
              <button onClick={() => alert("Planes disponibles muy pronto. Mientras tanto disfruta tus creditos gratuitos.")} style={{flex:1,padding:"7px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",fontWeight:"700",fontSize:"0.75rem",cursor:"not-allowed"}}>
                Studio $25/mes — Próximamente
              </button>
            </div>
          </div>
        ) : (
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"4px"}} suppressHydrationWarning>Costo por generacion</div>
            <div style={{fontSize:"0.82rem",color:"white"}}>Solo fondo IA — <span style={{color:"#FF4D00"}}>4 créditos</span></div>
            <div style={{fontSize:"0.82rem",color:"white",marginTop:"2px"}}>Con mi cara — <span style={{color:"#FF4D00"}}>5 creditos</span></div>
          </div>
        )}
      </div>

      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h2 style={{fontSize:"1rem",fontWeight:"700",margin:"0 0 20px"}}>Crear miniatura</h2>

        {/* PASO 1: Plataforma */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>1. Plataforma</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}} suppressHydrationWarning>
            {plataformas.map((p) => (
              <button key={p.id} onClick={() => setPlataforma(p.id)} suppressHydrationWarning style={{padding:"7px 14px",borderRadius:"999px",border:"none",fontSize:"0.78rem",cursor:"pointer",background:plataforma===p.id?"#FF4D00":"#1f2937",color:plataforma===p.id?"white":"#8B8FA8",fontWeight:plataforma===p.id?"700":"400"}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>



        {/* PASO 2: Elementos */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>2. Elementos (opcional)</div>
          <button
            onClick={() => setModalElementos(true)}
            style={{width:"100%",padding:"12px",borderRadius:"10px",border:`1px solid ${elementos.some(e => e.imagen) ? "#FF4D00" : "#3A3D52"}`,background:"transparent",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}
          >
            <span style={{fontSize:"0.85rem"}}>
              {elementos.some(e => e.imagen) ? `${elementos.filter(e => e.imagen).length} elemento(s) configurado(s)` : "Distribuir elementos en la miniatura"}
            </span>
            <span style={{fontSize:"0.85rem",color:"#FF4D00"}}>+</span>
          </button>
          <div style={{fontSize:"0.72rem",color:"#8B8FA8",marginTop:"6px"}}>
            {elementos.some(e => e.usarAvatar) ? "Con mi cara — 5 creditos" : "Solo fondo IA — 4 creditos"}
          </div>
        </div>

        {/* Modal de distribucion */}
        {modalElementos && (
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
            <div style={{background:"#111827",borderRadius:"16px",padding:"24px",width:"100%",maxWidth:"560px",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                <h3 style={{margin:0,fontSize:"1rem",fontWeight:700}}>Distribuir elementos</h3>
                <button onClick={() => setModalElementos(false)} style={{background:"none",border:"none",color:"#8B8FA8",cursor:"pointer",fontSize:"1.2rem"}}>✕</button>
              </div>

              {/* Canvas visual de la miniatura */}
              <div style={{background:"#060810",borderRadius:"10px",padding:"12px",marginBottom:"16px",aspectRatio:"16/7",display:"flex",gap:"8px",position:"relative"}}>
                {["Izquierda","Centro","Derecha"].map((pos, i) => (
                  <div
                    key={i}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ if(f.size > 2*1024*1024){ alert("Maximo 2MB"); return; } const r=new FileReader(); r.onload=(ev)=>{ const arr=[...elementos]; arr[i]={...arr[i],imagen:ev.target?.result as string,usarAvatar:false}; setElementos(arr); }; r.readAsDataURL(f); }}}
                    style={{flex:1,border:`2px dashed ${elementos[i].imagen ? "#06D6A0" : "#3A3D52"}`,borderRadius:"8px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"6px",position:"relative",overflow:"hidden",cursor:"pointer",background:elementos[i].imagen?"transparent":"rgba(255,255,255,0.02)"}}
                    onClick={() => { if(!elementos[i].imagen){ const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=(e:any)=>{ const f=e.target.files[0]; if(f){ if(f.size > 2*1024*1024){ alert("Maximo 2MB"); return; } const r=new FileReader(); r.onload=(ev)=>{ const arr=[...elementos]; arr[i]={...arr[i],imagen:ev.target?.result as string,usarAvatar:false}; setElementos(arr); }; r.readAsDataURL(f); }}; inp.click(); }}}
                  >
                    {elementos[i].imagen ? (
                      <>
                        <img src={elementos[i].imagen!} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:"6px"}} alt="" />
                        <button onClick={e => { e.stopPropagation(); const arr=[...elementos]; arr[i]={...arr[i],imagen:null,usarAvatar:false}; setElementos(arr); }} style={{position:"absolute",top:"4px",right:"4px",background:"rgba(0,0,0,0.8)",border:"none",borderRadius:"50%",width:"22px",height:"22px",color:"white",cursor:"pointer",fontSize:"0.75rem",zIndex:2}}>✕</button>
                      </>
                    ) : (
                      <>
                        <div style={{fontSize:"1.4rem"}}>📎</div>
                        <div style={{fontSize:"0.65rem",color:"#8B8FA8",textAlign:"center"}}>{pos}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Opciones por slot */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
                {elementos.map((el, i) => (
                  <div key={i} style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                    {tieneAvatar && !el.imagen && (
                      <button onClick={() => { const arr=[...elementos]; arr[i]={...arr[i],imagen:avatarUrl!,usarAvatar:true}; setElementos(arr); setModo("cara"); }} style={{background:"rgba(255,77,0,0.08)",border:"1px solid #FF4D00",borderRadius:"6px",padding:"5px",color:"#FF4D00",fontSize:"0.65rem",cursor:"pointer",fontWeight:"600"}}>
                        Usar mi cara
                      </button>
                    )}
                    <input
                      placeholder="Describe... ej: un leon"
                      value={el.descripcion}
                      onChange={e => { const arr=[...elementos]; arr[i]={...arr[i],descripcion:e.target.value}; setElementos(arr); }}
                      style={{width:"100%",background:"#060810",border:"1px solid #3A3D52",borderRadius:"6px",color:"#8B8FA8",fontSize:"0.65rem",padding:"5px 8px",boxSizing:"border-box"}}
                    />
                  </div>
                ))}
              </div>

              <div style={{fontSize:"0.7rem",color:"#3A3D52",marginBottom:"16px"}}>Arrastra imagenes a cada zona o haz clic. Maximo 2MB por imagen.</div>

              <button
                onClick={() => setModalElementos(false)}
                style={{width:"100%",padding:"12px",borderRadius:"10px",background:"#FF4D00",border:"none",color:"white",fontWeight:700,fontSize:"0.9rem",cursor:"pointer"}}
              >
                Confirmar distribucion
              </button>
            </div>
          </div>
        )}


        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>3. Describe la escena</div>
          <input type="text" placeholder="De que es tu video? Ej: Minecraft survival en el nether" value={tema} onChange={(e)=>setTema(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",marginBottom:"8px",boxSizing:"border-box"}}/>
          <div style={{padding:"8px 12px",borderRadius:"8px",background:"rgba(255,255,255,0.03)",border:"1px solid #3A3D52",marginBottom:"8px"}}>
            <p style={{fontSize:"0.72rem",color:"#8B8FA8",margin:0,lineHeight:"1.5"}}>
              Prompts cortos y directos dan mejores resultados. Ej: "Ejecutivo caminando en ciudad moderna, iluminacion cinematografica". Evita terror extremo, violencia grafica o personajes reales.
            </p>
          </div>
          <input type="text" placeholder="Escena (opcional): explosion de lava, personaje corriendo..." value={escena} onChange={(e)=>setEscena(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",boxSizing:"border-box",marginBottom:"8px"}}/>
          <div style={{marginTop:"8px"}}>
            <div style={{fontSize:"0.75rem",color:"#8B8FA8",marginBottom:"6px"}}>Imagen de referencia (opcional)</div>
            {imagenReferencia ? (
              <div style={{position:"relative",display:"inline-block"}}>
                <img src={imagenReferencia} style={{height:"80px",borderRadius:"8px",objectFit:"cover",border:"1px solid #3A3D52"}}/>
                <button onClick={() => setImagenReferencia(null)} style={{position:"absolute",top:"-6px",right:"-6px",background:"#ef4444",border:"none",borderRadius:"50%",width:"18px",height:"18px",color:"white",fontSize:"0.7rem",cursor:"pointer",padding:0}}>✕</button>
              </div>
            ) : (
              <label style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 10px",borderRadius:"6px",background:"transparent",border:"1px dashed #FF4D00",cursor:"pointer",fontSize:"0.75rem",color:"#FF4D00"}}>
                <span>+ Subir imagen de referencia</span>
                <input type="file" accept="image/*" style={{display:"none"}} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setImagenReferencia(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }}/>
              </label>
            )}
          </div>
        </div>

        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"0.78rem",color:"#8B8FA8",marginBottom:"10px"}}>4. Emocion principal</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {[
              {id:"epico", label:"Epico"},
              {id:"emocionado", label:"Emocionado"},
              {id:"sorprendido", label:"Sorprendido"},
              {id:"gracioso", label:"Gracioso"},
              {id:"misterioso", label:"Misterioso"},
              {id:"serio", label:"Serio"},
            ].map((e) => (
              <button key={e.id} onClick={() => setEmocion(e.id)} suppressHydrationWarning style={{padding:"7px 14px",borderRadius:"999px",border:"none",fontSize:"0.78rem",cursor:"pointer",background:emocion===e.id?"#FF4D00":"#1f2937",color:emocion===e.id?"white":"#8B8FA8",fontWeight:emocion===e.id?"700":"400"}}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {errorGen && (
          <div style={{padding:"10px 14px",borderRadius:"8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:"0.82rem",marginBottom:"10px"}}>
            {errorGen}
          </div>
        )}

        <button onClick={generarVariaciones} suppressHydrationWarning style={{width:"100%",padding:"13px",borderRadius:"10px",background:!tema||sinCreditos?"#3A3D52":"#FF4D00",border:"none",color:"white",fontWeight:"700",fontSize:"0.95rem",cursor:!tema||sinCreditos?"not-allowed":"pointer",transition:"transform 0.1s",transform:"scale(1)",opacity:!tema||sinCreditos?0.6:1}} onMouseDown={e=>{ if(!tema||sinCreditos) return; e.currentTarget.style.transform="scale(0.97)"; }} onMouseUp={e=>(e.currentTarget.style.transform="scale(1)")}>
          {sinCreditos ? "Sin creditos — Mejora tu plan" : `Generar — se descontarán ${costo} creditos →`}
        </button>
      </div>

      <h2 style={{fontSize:"1rem",fontWeight:"700",marginBottom:"12px"}}>
        Mis miniaturas {miniaturas > 0 && <span style={{fontSize:"0.78rem",color:"#8B8FA8",fontWeight:"400"}}>({miniaturas} generada{miniaturas!==1?"s":""})</span>}
      </h2>
      {listaMinis.length === 0 ? (
        <div style={{background:"#111827",borderRadius:"12px",padding:"32px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
          <p style={{color:"#8B8FA8",margin:0}}>Aun no has generado miniaturas</p>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:"12px"}}>
          {listaMinis.map((mini, index) => (
            <div key={mini.id} style={{position:"relative",borderRadius:"10px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",background:"#111827",cursor:"pointer"}} onClick={() => window.open(mini.imagen_url, "_blank")}>
              <img src={mini.imagen_url} alt="miniatura" style={{width:"100%",display:"block",aspectRatio:"16/9",objectFit:"cover"}}/>
              <button onClick={e => { e.stopPropagation(); setConfirmarBorrar(mini.id); }}
                style={{position:"absolute",top:"6px",right:"6px",background:"rgba(239,68,68,0.9)",border:"none",borderRadius:"50%",width:"20px",height:"20px",cursor:"pointer",color:"white",fontSize:"11px",padding:0}}>
                x
              </button>
              <div style={{padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.72rem",color:"#8B8FA8"}}>
                  {new Date(mini.created_at).toLocaleDateString("es-ES", {day:"numeric",month:"short"})}
                </span>
                <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                  <button onClick={e => { e.stopPropagation(); const params = new URLSearchParams({ imageUrl: mini.imagen_url, plataforma: "youtube" }); window.location.href = `/editor?${params.toString()}`; }} style={{fontSize:"0.72rem",color:"#8B8FA8",background:"none",border:"none",cursor:"pointer",fontWeight:"600",padding:0}}>
                    Editor
                  </button>
                  <button onClick={e => { e.stopPropagation(); descargarMini(mini.imagen_url, index); }} style={{fontSize:"0.72rem",color:"#FF4D00",background:"none",border:"none",cursor:"pointer",fontWeight:"600",padding:0}}>
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal confirmar borrar */}
      {confirmarBorrar !== null && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#111827",borderRadius:"14px",padding:"28px 24px",maxWidth:"340px",width:"90%",border:"1px solid rgba(255,255,255,0.1)",textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:"12px"}}>🗑️</div>
            <h3 style={{margin:"0 0 8px",fontSize:"1rem",fontWeight:"700"}}>Eliminar miniatura</h3>
            <p style={{color:"#8B8FA8",fontSize:"0.85rem",margin:"0 0 20px",lineHeight:"1.5"}}>Una vez borrada no podras recuperarla.</p>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setConfirmarBorrar(null)}
                style={{flex:1,padding:"10px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontWeight:"600",fontSize:"0.85rem"}}>
                Cancelar
              </button>
              <button onClick={() => confirmarBorrar !== null && borrarMini(confirmarBorrar)}
                style={{flex:1,padding:"10px",borderRadius:"8px",background:"#ef4444",border:"none",color:"white",cursor:"pointer",fontWeight:"700",fontSize:"0.85rem"}}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
