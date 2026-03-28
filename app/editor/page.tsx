"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<any>(null);
  const historialRef = useRef<string[]>([]);
  const [texto, setTexto] = useState("");
  const [fontSize, setFontSize] = useState(60);
  const [colorTexto, setColorTexto] = useState("#ffffff");
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [tema, setTema] = useState("");
  const [escena, setEscena] = useState("");
  const [estilo, setEstilo] = useState("gaming");
  const [plataforma, setPlataforma] = useState("youtube");
  const [fondoGenerado, setFondoGenerado] = useState(false);
  const [fondoOrientacion, setFondoOrientacion] = useState("horizontal");
  const [escalaVista, setEscalaVista] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [puedeArrastrar, setPuedeArrastrar] = useState(false);

  // ─── Créditos ───────────────────────────────────────────────────────────────
  const [creditos, setCreditos] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorCreditos, setErrorCreditos] = useState("");

  const COSTO_GENERAR = 3;

  const plataformas: Record<string, { w: number; h: number }> = {
    youtube: { w: 1280, h: 720 },
    instagram: { w: 1080, h: 1080 },
    instagram_story: { w: 1080, h: 1920 },
    tiktok: { w: 1080, h: 1920 },
    twitter: { w: 1200, h: 675 },
  };

  const p = plataformas[plataforma];
  const esVertical = plataforma === "instagram_story" || plataforma === "tiktok";
  const fondoEsVertical = fondoOrientacion === "vertical";
  const orientacionIncompatible = fondoGenerado && esVertical !== fondoEsVertical;

  // ─── Cargar usuario y créditos al montar ────────────────────────────────────
  useEffect(() => {
    async function cargarUsuario() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/registro";
        return;
      }
      setUserId(data.user.id);

      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("creditos")
        .eq("id", data.user.id)
        .single();

      if (usuarioData) setCreditos(usuarioData.creditos);
    }
    cargarUsuario();
  }, []);

  // ─── Calcular escala para que el canvas quepa en pantalla ───────────────────
  useEffect(() => {
    function calcularEscala() {
      if (!panelRef.current) return;
      const disponibleW = panelRef.current.clientWidth - 64;
      const disponibleH = window.innerHeight - 220;
      const escala = Math.min(1, disponibleW / p.w, disponibleH / p.h);
      setEscalaVista(Math.max(0.2, escala));
    }

    const timeout = setTimeout(() => {
      calcularEscala();
      setIsMounted(true);
    }, 0);

    window.addEventListener("resize", calcularEscala);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", calcularEscala);
    };
  }, [p.w, p.h]);

  // ─── Inicializar Fabric.js ──────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current?.canvas || !isMounted) return;
    let mounted = true;

    async function initFabric() {
      const { Canvas } = await import("fabric");
      if (!mounted || !canvasRef.current) return;

      const canvas = new Canvas(canvasRef.current, {
        width: p.w,
        height: p.h,
        backgroundColor: "#111827",
      });

      const guardarEstado = () =>
        historialRef.current.push(JSON.stringify(canvas.toJSON()));

      canvas.on("object:added", guardarEstado);
      canvas.on("object:modified", guardarEstado);
      canvas.on("object:removed", guardarEstado);

      if (mounted) fabricRef.current = { canvas };
    }

    initFabric();
    return () => { mounted = false; };
  }, [isMounted]);

  // ─── Atajos de teclado ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Aplicar imagen al canvas con crop inteligente ──────────────────────────
  function aplicarImagenAlCanvas(img: any, np: { w: number; h: number }, allowCrop: boolean) {
    const { canvas } = fabricRef.current;

    canvas.getObjects().filter((o: any) => o.type === "image").forEach((o: any) => canvas.remove(o));
    canvas.backgroundImage = undefined;

    const naturalW = img.getElement?.()?.naturalWidth || img.width || np.w;
    const naturalH = img.getElement?.()?.naturalHeight || img.height || np.h;
    const npEsVertical = np.h > np.w;

    let scaleFit: number;
    if (npEsVertical) {
      scaleFit = np.h / naturalH;
      if (naturalW * scaleFit < np.w) scaleFit = Math.max(np.w / naturalW, np.h / naturalH);
    } else {
      scaleFit = Math.max(np.w / naturalW, np.h / naturalH);
    }

    const scaledW = Math.round(naturalW * scaleFit);
    const scaledH = Math.round(naturalH * scaleFit);
    const sobranteX = scaledW - np.w;
    const sobranteY = scaledH - np.h;

    const puedeSlideX = allowCrop && (npEsVertical ? sobranteX >= 0 : sobranteX > 10);
    const puedeSlideY = allowCrop && !npEsVertical && sobranteY > 10;
    const necesitaCrop = puedeSlideX || puedeSlideY;

    img.set({
      scaleX: scaleFit,
      scaleY: scaleFit,
      left: -(sobranteX / 2),
      top: -(sobranteY / 2),
      originX: "left",
      originY: "top",
      selectable: necesitaCrop,
      evented: necesitaCrop,
      hasControls: false,
      hasBorders: necesitaCrop,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      lockMovementX: !puedeSlideX,
      lockMovementY: !puedeSlideY,
    });

    if (necesitaCrop) {
      canvas.add(img);
      canvas.setActiveObject(img);
    } else {
      canvas.backgroundImage = img;
    }

    setPuedeArrastrar(necesitaCrop);
    canvas.renderAll();
  }

  // ─── Cambiar plataforma ─────────────────────────────────────────────────────
  async function cambiarPlataforma(val: string) {
    setPlataforma(val);
    if (!fabricRef.current?.canvas) return;

    const { canvas } = fabricRef.current;
    const np = plataformas[val];
    canvas.setDimensions({ width: np.w, height: np.h });

    let img = canvas.backgroundImage as any;
    if (!img) img = canvas.getObjects().find((o: any) => o.type === "image");
    if (!img) { canvas.renderAll(); return; }

    aplicarImagenAlCanvas(img, np, true);
  }

  // ─── Generar fondo con IA (descuenta créditos) ──────────────────────────────
  async function generarFondo() {
    if (!tema) return;
    setErrorCreditos("");

    // Verificar créditos suficientes
    if (creditos === null) return;
    if (creditos < COSTO_GENERAR) {
      setErrorCreditos(`Necesitas ${COSTO_GENERAR} créditos para generar. Te quedan ${creditos}. Mejora tu plan.`);
      return;
    }

    setCargando(true);
    setProgreso(0);
    setFondoGenerado(false);
    setPuedeArrastrar(false);

    if (fabricRef.current?.canvas) {
      const { canvas } = fabricRef.current;
      canvas.getObjects().forEach((obj: any) => canvas.remove(obj));
      canvas.backgroundImage = undefined;
      canvas.renderAll();
    }

    const interval = setInterval(() => {
      setProgreso((prev) => (prev >= 90 ? 90 : prev + 5));
    }, 1000);

    const descripcion = escena ? `${tema}. Escena: ${escena}` : tema;
    const orientacion = esVertical ? "vertical 9:16 portrait" : "horizontal 16:9 landscape";

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, estilo, emocion: "epico", orientacion }),
    });

    const data = await res.json();
    clearInterval(interval);
    setProgreso(100);

    // Descontar créditos en Supabase
    if (userId) {
      const nuevosCreditos = creditos - COSTO_GENERAR;
      await supabase
        .from("usuarios")
        .update({ creditos: nuevosCreditos })
        .eq("id", userId);
      setCreditos(nuevosCreditos);

      // Guardar miniatura en tabla miniatura
      await supabase.from("miniatura").insert({
        usuario_id: userId,
        imagen_url: data.imageUrl,
      });
    }

    const { FabricImage } = await import("fabric");
    const img = await FabricImage.fromURL(data.imageUrl, { crossOrigin: "anonymous" });

    aplicarImagenAlCanvas(img, p, false);
    setCargando(false);
    setProgreso(0);
    setFondoGenerado(true);
    setFondoOrientacion(esVertical ? "vertical" : "horizontal");
  }

  // ─── Agregar texto ──────────────────────────────────────────────────────────
  function agregarTexto() {
    if (!texto || !fabricRef.current) return;
    const { canvas } = fabricRef.current;

    import("fabric").then(({ FabricText }) => {
      const t = new FabricText(texto, {
        left: 100,
        top: 300,
        fontSize: fontSize,
        fill: colorTexto,
        fontWeight: "bold",
        fontFamily: "Impact, Arial Black, sans-serif",
        shadow: new (require("fabric").Shadow)({ color: "rgba(0,0,0,0.9)", blur: 10, offsetX: 3, offsetY: 3 }),
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: 2,
      });
      canvas.add(t);
      canvas.setActiveObject(t);
      canvas.renderAll();
    });
  }

  // ─── Eliminar objeto seleccionado ───────────────────────────────────────────
  function eliminarSeleccion() {
    if (!fabricRef.current?.canvas) return;
    const { canvas } = fabricRef.current;
    const obj = canvas.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.renderAll(); }
  }

  // ─── Centrar imagen ─────────────────────────────────────────────────────────
  function centrarImagen() {
    if (!fabricRef.current?.canvas) return;
    const { canvas } = fabricRef.current;
    const img = canvas.getObjects().find((o: any) => o.type === "image") as any;
    if (!img) return;

    const naturalW = img.getElement?.()?.naturalWidth || img.width;
    const naturalH = img.getElement?.()?.naturalHeight || img.height;
    const npEsVertical = p.h > p.w;

    let scaleFit: number;
    if (npEsVertical) {
      scaleFit = p.h / naturalH;
      if (naturalW * scaleFit < p.w) scaleFit = Math.max(p.w / naturalW, p.h / naturalH);
    } else {
      scaleFit = Math.max(p.w / naturalW, p.h / naturalH);
    }

    const scaledW = naturalW * scaleFit;
    const scaledH = naturalH * scaleFit;

    img.set({
      left: -(scaledW - p.w) / 2,
      top: -(scaledH - p.h) / 2,
    });
    canvas.renderAll();
  }

  // ─── Deshacer ───────────────────────────────────────────────────────────────
  async function undo() {
    if (!fabricRef.current?.canvas) return;
    const { canvas } = fabricRef.current;
    if (historialRef.current.length === 0) return;

    historialRef.current.pop();

    if (historialRef.current.length === 0) {
      canvas.getObjects().forEach((obj: any) => canvas.remove(obj));
      canvas.backgroundImage = undefined;
      canvas.renderAll();
      return;
    }

    const estado = JSON.parse(historialRef.current[historialRef.current.length - 1]);
    canvas.getObjects().forEach((obj: any) => canvas.remove(obj));
    await canvas.loadFromJSON(estado);
    canvas.renderAll();
  }

  // ─── Descargar ──────────────────────────────────────────────────────────────
  function descargar() {
    if (!fabricRef.current?.canvas) return;
    const { canvas } = fabricRef.current;
    const link = document.createElement("a");
    link.download = "miniatura-thumbslatam.png";
    link.href = canvas.toDataURL({ format: "png", multiplier: 1 });
    link.click();
  }

  // ─── Subir fondo propio ─────────────────────────────────────────────────────
  async function subirFondo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current?.canvas) return;

    const url = URL.createObjectURL(file);
    const { FabricImage } = await import("fabric");
    const img = await FabricImage.fromURL(url);

    aplicarImagenAlCanvas(img, p, true);
    setFondoGenerado(true);
    setFondoOrientacion(p.h > p.w ? "vertical" : "horizontal");
  }

  // ─── Dimensiones del contenedor visual ──────────────────────────────────────
  const canvasW = isMounted ? Math.round(p.w * escalaVista) : 640;
  const canvasH = isMounted ? Math.round(p.h * escalaVista) : 360;

  const nombrePlataforma: Record<string, string> = {
    youtube: "YouTube 1280×720",
    instagram: "Instagram Post 1080×1080",
    instagram_story: "Instagram Story 1080×1920",
    tiktok: "TikTok 1080×1920",
    twitter: "X (Twitter) 1200×675",
  };

  const sinCreditos = creditos !== null && creditos < COSTO_GENERAR;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"24px",boxSizing:"border-box"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <a href="/dashboard" style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none"}}>
          ← Dashboard
        </a>
        <h1 style={{fontSize:"1.5rem",fontWeight:"800",letterSpacing:"-0.03em",margin:0}}>
          Thumbs<span style={{color:"#FF4D00"}}>Latam</span> Editor
        </h1>
        {/* Créditos + Descargar */}
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{
            background:"#111827",
            border:`1px solid ${sinCreditos ? "rgba(255,77,0,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius:"8px",
            padding:"6px 14px",
            fontSize:"0.82rem",
            color: sinCreditos ? "#FF4D00" : "#8B8FA8",
          }}>
            {creditos === null ? "..." : `${creditos} créditos`}
          </div>
          <button
            onClick={descargar}
            style={{padding:"10px 20px",borderRadius:"8px",background:"#06D6A0",border:"none",color:"#060810",fontWeight:"700",cursor:"pointer",fontSize:"0.9rem"}}
          >
            Descargar miniatura
          </button>
        </div>
      </div>

      {/* Layout principal */}
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:"16px",alignItems:"start"}}>

        {/* ── Sidebar ── */}
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>

          {/* 1. Plataforma */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,77,0,0.4)"}}>
            <h3 style={{margin:"0 0 10px",fontSize:"0.85rem",fontWeight:"700",color:"#FF4D00"}}>1. Plataforma</h3>
            <select
              value={plataforma}
              onChange={(e) => cambiarPlataforma(e.target.value)}
              style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #FF4D00",color:"white",fontSize:"0.85rem"}}
            >
              <option value="youtube">YouTube — 1280×720</option>
              <option value="instagram">Instagram Post — 1080×1080</option>
              <option value="instagram_story">Instagram Story — 1080×1920</option>
              <option value="tiktok">TikTok — 1080×1920</option>
              <option value="twitter">X (Twitter) — 1200×675</option>
            </select>
            {orientacionIncompatible && (
              <p style={{color:"#FFD166",fontSize:"0.75rem",margin:"8px 0 0",lineHeight:"1.4"}}>
                ⚠️ Fondo {fondoEsVertical ? "vertical" : "horizontal"} — genera de nuevo en formato {esVertical ? "vertical" : "horizontal"} para mejor resultado.
              </p>
            )}
          </div>

          {/* 2. Fondo con IA */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <h3 style={{margin:0,fontSize:"0.85rem",fontWeight:"700"}}>2. Fondo con IA</h3>
              <span style={{fontSize:"0.72rem",color:"#3A3D52",background:"#060810",padding:"2px 8px",borderRadius:"999px"}}>
                {COSTO_GENERAR} créditos
              </span>
            </div>
            <input
              type="text"
              placeholder="¿De que es tu video? Ej: Minecraft"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px",boxSizing:"border-box"}}
            />
            <input
              type="text"
              placeholder="Describe la escena (opcional)..."
              value={escena}
              onChange={(e) => setEscena(e.target.value)}
              style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px",boxSizing:"border-box"}}
            />
            <select
              value={estilo}
              onChange={(e) => setEstilo(e.target.value)}
              style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px"}}
            >
              <option value="gaming">Gaming</option>
              <option value="vlog">Vlog</option>
              <option value="tutorial">Tutorial</option>
              <option value="reaccion">Reaccion</option>
              <option value="stream">Stream Highlights</option>
              <option value="entretenimiento">Entretenimiento</option>
              <option value="comedia">Comedia</option>
              <option value="deportes">Deportes</option>
              <option value="terror">Terror</option>
              <option value="musica">Musica</option>
            </select>

            {/* Alerta sin créditos */}
            {errorCreditos && (
              <div style={{background:"rgba(255,77,0,0.1)",border:"1px solid rgba(255,77,0,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"8px",fontSize:"0.78rem",color:"#FF4D00",lineHeight:"1.4"}}>
                ⚠️ {errorCreditos}
                <a href="/dashboard" style={{display:"block",marginTop:"6px",color:"#FF4D00",fontWeight:"700",textDecoration:"underline"}}>
                  Mejorar plan →
                </a>
              </div>
            )}

            <button
              onClick={generarFondo}
              disabled={cargando || !tema || sinCreditos}
              style={{
                width:"100%",padding:"10px",borderRadius:"8px",
                background: sinCreditos ? "#3A3D52" : (tema && !cargando ? "#FF4D00" : "#3A3D52"),
                border:"none",color:"white",fontWeight:"700",
                cursor: sinCreditos || !tema || cargando ? "not-allowed" : "pointer",
                fontSize:"0.85rem",
              }}
            >
              {cargando ? (
                <div style={{width:"100%"}}>
                  <div style={{fontSize:"0.8rem",marginBottom:"6px",textAlign:"center"}}>Generando tu fondo...</div>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:"999px",height:"6px",overflow:"hidden"}}>
                    <div style={{background:"white",height:"100%",width:`${progreso}%`,borderRadius:"999px",transition:"width 0.5s ease"}}/>
                  </div>
                </div>
              ) : sinCreditos ? "Sin créditos — Mejora tu plan" : "Generar fondo →"}
            </button>
          </div>

          {/* 3. Subir fondo */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <h3 style={{margin:"0 0 10px",fontSize:"0.85rem",fontWeight:"700"}}>3. O sube tu fondo</h3>
            <input type="file" accept="image/*" onChange={subirFondo} style={{color:"#8B8FA8",fontSize:"0.8rem",width:"100%"}}/>
          </div>

          {/* 4. Texto */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <h3 style={{margin:"0 0 10px",fontSize:"0.85rem",fontWeight:"700"}}>4. Agregar texto</h3>
            <input
              type="text"
              placeholder="Tu titulo aqui..."
              maxLength={40}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px",boxSizing:"border-box"}}
            />
            <div style={{display:"flex",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
              <label style={{fontSize:"0.78rem",color:"#8B8FA8",whiteSpace:"nowrap"}}>Tamaño:</label>
              <input type="range" min="20" max="150" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={{flex:1}}/>
              <span style={{fontSize:"0.78rem",color:"#8B8FA8",whiteSpace:"nowrap"}}>{fontSize}px</span>
            </div>
            <div style={{display:"flex",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
              <label style={{fontSize:"0.78rem",color:"#8B8FA8"}}>Color:</label>
              <input type="color" value={colorTexto} onChange={(e) => setColorTexto(e.target.value)} style={{width:"36px",height:"30px",borderRadius:"6px",border:"none",cursor:"pointer"}}/>
              <span style={{fontSize:"0.78rem",color:"#8B8FA8"}}>{colorTexto}</span>
            </div>
            <button onClick={agregarTexto} disabled={!texto} style={{width:"100%",padding:"9px",borderRadius:"8px",background:texto?"#FF4D00":"#3A3D52",border:"none",color:"white",fontWeight:"700",cursor:texto?"pointer":"not-allowed",fontSize:"0.82rem",marginBottom:"6px"}}>
              Agregar al canvas
            </button>
            <button onClick={undo} style={{width:"100%",padding:"8px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.78rem",marginBottom:"6px"}}>
              ↩ Deshacer (Ctrl+Z)
            </button>
            <button onClick={eliminarSeleccion} style={{width:"100%",padding:"8px",borderRadius:"8px",background:"transparent",border:"1px solid #ef4444",color:"#ef4444",cursor:"pointer",fontSize:"0.78rem"}}>
              Eliminar seleccionado
            </button>
          </div>

          {/* Tip */}
          <div style={{background:"rgba(6,214,160,0.08)",borderRadius:"10px",padding:"12px",border:"1px solid rgba(6,214,160,0.2)"}}>
            <p style={{color:"#06D6A0",fontSize:"0.78rem",margin:0}}>Arrastra el texto para moverlo. Esquinas para cambiar tamaño.</p>
          </div>
        </div>

        {/* ── Panel canvas ── */}
        <div
          ref={panelRef}
          style={{background:"#0a0f1e",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)",minWidth:0,width:"100%"}}
        >
          <p style={{color:"#3A3D52",fontSize:"0.75rem",margin:"0 0 8px",textAlign:"center"}}>
            {nombrePlataforma[plataforma]}
          </p>

          {puedeArrastrar && (
            <div style={{textAlign:"center",marginBottom:"8px"}}>
              <p style={{color:"#06D6A0",fontSize:"0.75rem",margin:"0 0 6px"}}>
                {esVertical ? "Arrastra la imagen izquierda/derecha para elegir el encuadre →" : "Arrastra la imagen para elegir el encuadre →"}
              </p>
              <button
                onClick={centrarImagen}
                style={{padding:"5px 14px",borderRadius:"6px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.75rem"}}
              >
                ⊙ Centrar imagen
              </button>
            </div>
          )}

          <div style={{width:`${canvasW}px`,height:`${canvasH}px`,position:"relative",overflow:"hidden",borderRadius:"8px",margin:"0 auto"}}>
            <div style={{position:"absolute",top:0,left:0,width:`${p.w}px`,height:`${p.h}px`,transform:`scale(${escalaVista})`,transformOrigin:"top left"}}>
              <canvas ref={canvasRef}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
