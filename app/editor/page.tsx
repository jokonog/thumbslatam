"use client";
import Logo from "@/components/Logo";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  const [fontFamily, setFontFamily] = useState("Impact, Arial Black, sans-serif");
  const [efectoTexto, setEfectoTexto] = useState("sombra");
  const [efectos, setEfectos] = useState<string[]>(["sombra"]);
  const [colorTexto2, setColorTexto2] = useState("#FF4D00");
  const [usarDegradado, setUsarDegradado] = useState(false);
  const [degradadoDireccion, setDegradadoDireccion] = useState<'horizontal'|'vertical'|'diagonal'>('horizontal');
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [seccionTexto, setSeccionTexto] = useState(true);
  const [seccionAjustes, setSeccionAjustes] = useState(true);
  const [brillo, setBrillo] = useState(100);
  const [contraste, setContraste] = useState(100);
  const [saturacion, setSaturacion] = useState(100);

  // ─── Créditos ───────────────────────────────────────────────────────────────
  const [creditos, setCreditos] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorCreditos, setErrorCreditos] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imagenPreCargada, setImagenPreCargada] = useState<string | null>(null);

  const COSTO_GENERAR = 3;
  const COSTO_CARA = 5;
  const [modo, setModo] = useState("fondo");

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
      // Leer params de URL
      const params = new URLSearchParams(window.location.search);
      const modoParam = params.get("modo");
      const temaParam = params.get("tema");
      const escenaParam = params.get("escena");
      const plataformaParam = params.get("plataforma");
      const imageUrlParam = params.get("imageUrl");
      if (modoParam) setModo(modoParam);
      if (temaParam) setTema(temaParam);
      if (escenaParam) setEscena(escenaParam);
      if (plataformaParam) setPlataforma(plataformaParam);
      if (imageUrlParam) setImagenPreCargada(imageUrlParam);
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

  // ─── Cargar imagen pre-generada desde URL ──────────────────────────────────
  useEffect(() => {
    if (!imagenPreCargada || !fabricRef.current?.canvas || !isMounted) return;
    async function cargarImagenPreGenerada() {
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(imagenPreCargada!, { crossOrigin: "anonymous" });
      aplicarImagenAlCanvas(img, p, false);
      setFondoGenerado(true);
      setFondoOrientacion(esVertical ? "vertical" : "horizontal");
    }
    cargarImagenPreGenerada();
  }, [imagenPreCargada, isMounted, fabricRef.current?.canvas]);

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
    const costoCorrecto = modo === "cara" ? COSTO_CARA : COSTO_GENERAR;
    if (creditos < costoCorrecto) {
      setErrorCreditos(`Necesitas ${costoCorrecto} créditos para generar. Te quedan ${creditos}. Mejora tu plan.`);
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

    const endpoint = modo === "cara" ? "/api/generate-with-face" : "/api/generate";
    const body = modo === "cara"
      ? { userId, descripcion, estilo, orientacion }
      : { descripcion, estilo, emocion: "epico", orientacion };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    clearInterval(interval);
    setProgreso(100);

    // Descontar créditos en Supabase
    if (userId) {
      const costoCorrecto = modo === "cara" ? COSTO_CARA : COSTO_GENERAR;
      const nuevosCreditos = creditos - costoCorrecto;
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

    import("fabric").then(({ FabricText, Shadow, Gradient }) => {
      // Combinar efectos seleccionados
      let shadowColor = "rgba(0,0,0,0)";
      let shadowBlur = 0;
      let shadowOffsetX = 0;
      let shadowOffsetY = 0;
      let strokeColor = "transparent";
      let strokeW = 0;

      if (efectos.includes("sombra")) {
        shadowColor = "rgba(0,0,0,0.95)";
        shadowBlur = 15;
        shadowOffsetX = 4;
        shadowOffsetY = 4;
      }
      if (efectos.includes("glow")) {
        shadowColor = colorTexto;
        shadowBlur = Math.max(shadowBlur, 25);
        shadowOffsetX = 0;
        shadowOffsetY = 0;
      }
      if (efectos.includes("neon")) {
        shadowColor = colorTexto2;
        shadowBlur = Math.max(shadowBlur, 35);
      }
      if (efectos.includes("stroke")) {
        strokeColor = "#000000";
        strokeW = Math.max(2, Math.floor(fontSize * 0.07));
      }
      if (efectos.includes("fuego")) {
        shadowColor = "#FF6B00";
        shadowBlur = 30;
        strokeColor = "#FF2200";
        strokeW = Math.max(2, Math.floor(fontSize * 0.05));
      }
      if (efectos.includes("hielo")) {
        shadowColor = "#00CFFF";
        shadowBlur = 25;
        strokeColor = "#0099CC";
        strokeW = Math.max(2, Math.floor(fontSize * 0.05));
      }

      const t = new FabricText(texto.toUpperCase(), {
        left: Math.floor(canvas.width! / 2),
        top: 60,
        fontSize: fontSize,
        fill: colorTexto,
        fontWeight: "bold",
        fontFamily: fontFamily,
        originX: "center",
        shadow: new Shadow({ color: shadowColor, blur: shadowBlur, offsetX: shadowOffsetX, offsetY: shadowOffsetY }),
        stroke: strokeColor,
        strokeWidth: strokeW,
      });

      // Aplicar degradado si esta activado
      if (usarDegradado) {
        const w = t.width || 200;
        const h = t.height || 80;
        const coords = degradadoDireccion === 'vertical'
          ? { x1: 0, y1: 0, x2: 0, y2: h }
          : degradadoDireccion === 'diagonal'
          ? { x1: 0, y1: 0, x2: w, y2: h }
          : { x1: 0, y1: 0, x2: w, y2: 0 };
        const grad = new Gradient({
          type: "linear", coords,
          colorStops: [
            { offset: 0, color: colorTexto },
            { offset: 1, color: colorTexto2 },
          ],
        });
        t.set("fill", grad);
      }

      canvas.add(t);
      canvas.setActiveObject(t);
      canvas.renderAll();
    });
  }

  function toggleEfecto(ef: string) {
    setEfectos(prev => prev.includes(ef) ? prev.filter(e => e !== ef) : [...prev, ef]);
  }

  function aplicarAjustesImagen() {
    if (!fabricRef.current?.canvas) return;
    const { canvas } = fabricRef.current;
    const el = canvas.getElement();
    if (!el) return;
    // Aplicar filtros CSS al canvas container
    const container = el.parentElement;
    if (container) {
      container.style.filter = `brightness(${brillo}%) contrast(${contraste}%) saturate(${saturacion}%)`;
    }
  }

  // ─── Agregar imagen al canvas ──────────────────────────────────────────────
  function agregarImagenCanvas() {
    if (!fabricRef.current) return;
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert("Maximo 2MB por imagen"); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        import("fabric").then(({ FabricImage }) => {
          FabricImage.fromURL(url).then((img) => {
            const { canvas } = fabricRef.current!;
            const maxW = canvas.width! * 0.4;
            if (img.width! > maxW) img.scaleToWidth(maxW);
            img.set({ left: 100, top: 100 });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        });
      };
      reader.readAsDataURL(file);
    };
    inp.click();
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
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <Logo height={28} href="/" />
          <span style={{fontSize:"1.5rem",fontWeight:800,letterSpacing:"-0.02em",color:"white",fontFamily:"var(--font-syne)"}}>Editor</span>
        </div>
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
        <div style={{display:"flex",flexDirection:"column",gap:"10px",overflowY:"auto",maxHeight:"calc(100vh - 60px)",paddingRight:"4px"}}>

          {/* Plataforma + Volver */}
          <div style={{background:"linear-gradient(135deg,#0d1220 0%,#111827 100%)",borderRadius:"14px",padding:"14px",border:"1px solid rgba(255,77,0,0.35)",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"10px"}}>
              <span style={{fontSize:"0.7rem",color:"#FF4D00",fontWeight:"800",letterSpacing:"0.1em",textTransform:"uppercase"}}>Plataforma</span>
            </div>
            <select value={plataforma} onChange={(e) => cambiarPlataforma(e.target.value)}
              style={{width:"100%",padding:"8px 10px",borderRadius:"8px",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,77,0,0.4)",color:"white",fontSize:"0.82rem",cursor:"pointer"}}>
              <option value="youtube">▶ YouTube — 1280×720</option>
              <option value="instagram">◻ Instagram Post — 1080×1080</option>
              <option value="instagram_story">◻ Instagram Story — 1080×1920</option>
              <option value="tiktok">♪ TikTok — 1080×1920</option>
              <option value="twitter">✕ Twitter — 1200×675</option>
            </select>
            {orientacionIncompatible && (
              <p style={{color:"#FFD166",fontSize:"0.72rem",margin:"8px 0 0",lineHeight:"1.4"}}>
                ⚠️ Fondo {fondoEsVertical ? "vertical" : "horizontal"} — genera de nuevo en formato {esVertical ? "vertical" : "horizontal"}.
              </p>
            )}
            <a href="/dashboard" style={{display:"block",textAlign:"center",padding:"8px",borderRadius:"8px",background:"transparent",border:"1px solid rgba(255,255,255,0.08)",color:"#8B8FA8",fontSize:"0.78rem",textDecoration:"none",fontWeight:"600",marginTop:"10px"}}>
              ← Nueva miniatura
            </a>
          </div>

          {/* Texto */}
          <div style={{background:"linear-gradient(135deg,#0d1220 0%,#111827 100%)",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.06)",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
            <button onClick={() => setSeccionTexto(v => !v)}
              style={{width:"100%",padding:"14px 16px",background:"transparent",border:"none",color:"white",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.78rem",fontWeight:"800",letterSpacing:"0.08em",textTransform:"uppercase",color:"#FF4D00"}}>✏️ Texto</span>
              <span style={{color:"#8B8FA8",fontSize:"0.8rem"}}>{seccionTexto ? "▲" : "▼"}</span>
            </button>
            {seccionTexto && <div style={{padding:"0 14px 14px"}}>
            <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
              <div style={{flex:1,background:"rgba(255,77,0,0.08)",border:"1px solid rgba(255,77,0,0.3)",borderRadius:"8px",padding:"8px",textAlign:"center",cursor:"pointer"}} onClick={() => {}}>
                <div style={{fontSize:"1rem",marginBottom:"2px"}}>T</div>
                <div style={{fontSize:"0.65rem",color:"#8B8FA8"}}>Texto</div>
              </div>
              <div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid #3A3D52",borderRadius:"8px",padding:"8px",textAlign:"center",cursor:"pointer"}} onClick={agregarImagenCanvas}>
                <div style={{fontSize:"1rem",marginBottom:"2px"}}>🖼</div>
                <div style={{fontSize:"0.65rem",color:"#8B8FA8"}}>Imagen</div>
              </div>
            </div>
            <input
              type="text"
              placeholder="Tu titulo aqui..."
              maxLength={50}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px",boxSizing:"border-box"}}
            />
            {/* FUENTES DROPDOWN */}
            <div style={{marginBottom:"10px",position:"relative"}}>
              <label style={{fontSize:"0.72rem",color:"#8B8FA8",display:"block",marginBottom:"5px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Fuente</label>
              <button onClick={() => setFontDropdownOpen(v => !v)}
                style={{width:"100%",padding:"9px 12px",borderRadius:"9px",background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.12)",color:"white",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:fontFamily,fontSize:"1rem",fontWeight:"bold"}}>
                <span>{fontFamily.split(",")[0].replace(/'/g,"")}</span>
                <span style={{fontSize:"0.7rem",color:"#8B8FA8"}}>{fontDropdownOpen ? "▲" : "▼"}</span>
              </button>
              {fontDropdownOpen && (
                <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:200,
                  background:"linear-gradient(180deg,#0a0f1e 0%,#0d1525 100%)",
                  border:"1px solid rgba(255,77,0,0.25)",borderRadius:"12px",
                  overflow:"hidden",maxHeight:"320px",overflowY:"auto",
                  boxShadow:"0 16px 48px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,77,0,0.1)",
                  marginTop:"6px"}}>
                  {/* Header del dropdown */}
                  <div style={{padding:"10px 14px 6px",background:"rgba(255,77,0,0.06)",borderBottom:"1px solid rgba(255,77,0,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"0.62rem",color:"#FF4D00",fontWeight:"800",letterSpacing:"0.12em",textTransform:"uppercase"}}>Selecciona una fuente</span>
                    <button onClick={() => setFontDropdownOpen(false)} style={{background:"none",border:"none",color:"#8B8FA8",cursor:"pointer",fontSize:"0.8rem",padding:"0"}}>✕</button>
                  </div>
                  {[
                    {name:"Impact", family:"Impact, Arial Black, sans-serif", google:null, cat:"🎮 Gaming"},
                    {name:"Bebas Neue", family:"'Bebas Neue', sans-serif", google:"Bebas+Neue", cat:"🎮 Gaming"},
                    {name:"Bangers", family:"'Bangers', sans-serif", google:"Bangers", cat:"🎮 Gaming"},
                    {name:"Black Ops One", family:"'Black Ops One', sans-serif", google:"Black+Ops+One", cat:"🎮 Gaming"},
                    {name:"Russo One", family:"'Russo One', sans-serif", google:"Russo+One", cat:"🎮 Gaming"},
                    {name:"Oswald Bold", family:"'Oswald', sans-serif", google:"Oswald:wght@700", cat:"🎮 Gaming"},
                    {name:"Faster One", family:"'Faster One', sans-serif", google:"Faster+One", cat:"🎮 Gaming"},
                    {name:"Creepster", family:"'Creepster', sans-serif", google:"Creepster", cat:"💀 Terror"},
                    {name:"Nosifer", family:"'Nosifer', sans-serif", google:"Nosifer", cat:"💀 Terror"},
                    {name:"Butcherman", family:"'Butcherman', sans-serif", google:"Butcherman", cat:"💀 Terror"},
                    {name:"Arial", family:"Arial, sans-serif", google:null, cat:"✏️ Clasica"},
                    {name:"Arial Black", family:"Arial Black, sans-serif", google:null, cat:"✏️ Clasica"},
                    {name:"Times New Roman", family:"Times New Roman, serif", google:null, cat:"✏️ Clasica"},
                    {name:"Georgia", family:"Georgia, serif", google:null, cat:"✏️ Clasica"},
                    {name:"Verdana", family:"Verdana, sans-serif", google:null, cat:"✏️ Clasica"},
                    {name:"Courier New", family:"Courier New, monospace", google:null, cat:"✏️ Clasica"},
                  ].map(({name, family, google, cat}, idx, arr) => {
                    if (google && typeof document !== "undefined") {
                      const id = `gfont-${google}`;
                      if (!document.getElementById(id)) {
                        const link = document.createElement("link");
                        link.id = id; link.rel = "stylesheet";
                        link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`;
                        document.head.appendChild(link);
                      }
                    }
                    const prevCat = idx > 0 ? arr[idx-1].cat : null;
                    const isSelected = fontFamily === family;
                    return (
                      <div key={name}>
                        {cat !== prevCat && (
                          <div style={{padding:"8px 14px 4px",fontSize:"0.58rem",color:"#FF4D00",fontWeight:"800",
                            letterSpacing:"0.12em",textTransform:"uppercase",
                            background:"rgba(255,77,0,0.04)",
                            borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            borderBottom:"1px solid rgba(255,77,0,0.08)"}}>
                            {cat}
                          </div>
                        )}
                        <button onClick={() => { setFontFamily(family); setFontDropdownOpen(false); }}
                          style={{width:"100%",padding:"0",background:isSelected?"rgba(255,77,0,0.08)":"transparent",
                            border:"none",cursor:"pointer",textAlign:"left",
                            borderLeft:isSelected?"3px solid #FF4D00":"3px solid transparent",
                            transition:"background 0.15s"}}>
                          <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:"2px"}}>
                            <span style={{fontFamily:family,fontSize:"1.2rem",fontWeight:"bold",color:isSelected?"#FF4D00":"white",lineHeight:1.2}}>
                              {name}
                            </span>
                            <span style={{fontFamily:family,fontSize:"0.72rem",color:"#8B8FA8",lineHeight:1}}>
                              NUEVO KILLER
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* EFECTOS COMBINABLES */}
            <div style={{marginBottom:"10px"}}>
              <label style={{fontSize:"0.78rem",color:"#8B8FA8",display:"block",marginBottom:"6px"}}>Efectos (combinables):</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px"}}>
                {[["sombra","🌑 Sombra"],["stroke","✏️ Borde"],["glow","✨ Glow"],["neon","⚡ Neon"],["fuego","🔥 Fuego"],["hielo","❄️ Hielo"]].map(([val,label]) => (
                  <button key={val} onClick={() => toggleEfecto(val)}
                    style={{padding:"5px 3px",borderRadius:"6px",textAlign:"center",
                      border:`1px solid ${efectos.includes(val)?"#FF4D00":"#3A3D52"}`,
                      background:efectos.includes(val)?"rgba(255,77,0,0.15)":"transparent",
                      color:efectos.includes(val)?"#FF4D00":"#8B8FA8",
                      cursor:"pointer",fontSize:"0.65rem",fontWeight:"600"}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* DEGRADADO */}
            <div style={{marginBottom:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                <input type="checkbox" checked={usarDegradado} onChange={e => setUsarDegradado(e.target.checked)} style={{cursor:"pointer"}}/>
                <label style={{fontSize:"0.78rem",color:"#8B8FA8",cursor:"pointer"}} onClick={() => setUsarDegradado(v => !v)}>Degradado de color</label>
              </div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                  <label style={{fontSize:"0.72rem",color:"#8B8FA8"}}>Color 1:</label>
                  <input type="color" value={colorTexto} onChange={(e) => setColorTexto(e.target.value)} style={{width:"32px",height:"28px",borderRadius:"6px",border:"none",cursor:"pointer"}}/>
                </div>
                {usarDegradado && (<>
                  <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                    <label style={{fontSize:"0.72rem",color:"#8B8FA8"}}>Color 2:</label>
                    <input type="color" value={colorTexto2} onChange={(e) => setColorTexto2(e.target.value)} style={{width:"32px",height:"28px",borderRadius:"6px",border:"none",cursor:"pointer"}}/>
                  </div>
                </>)}
              </div>
              {usarDegradado && (
                <div style={{display:"flex",gap:"4px",marginTop:"6px"}}>
                  {([["horizontal","→ H"],["vertical","↓ V"],["diagonal","↘ D"]] as const).map(([dir,label]) => (
                    <button key={dir} onClick={() => setDegradadoDireccion(dir)}
                      style={{flex:1,padding:"5px",borderRadius:"6px",fontSize:"0.7rem",fontWeight:"600",cursor:"pointer",
                        border:`1px solid ${degradadoDireccion===dir?"#FF4D00":"#3A3D52"}`,
                        background:degradadoDireccion===dir?"rgba(255,77,0,0.15)":"transparent",
                        color:degradadoDireccion===dir?"#FF4D00":"#8B8FA8"}}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
              <label style={{fontSize:"0.78rem",color:"#8B8FA8",whiteSpace:"nowrap"}}>Tamaño:</label>
              <input type="range" min="20" max="200" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={{flex:1}}/>
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
            </div>}
          </div>

          {/* Ajustes imagen */}
          <div style={{background:"linear-gradient(135deg,#0d1220 0%,#111827 100%)",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.06)",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
            <button onClick={() => setSeccionAjustes(v => !v)}
              style={{width:"100%",padding:"14px 16px",background:"transparent",border:"none",color:"white",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.78rem",fontWeight:"800",letterSpacing:"0.08em",textTransform:"uppercase",color:"#FF4D00"}}>🎨 Ajustes de imagen</span>
              <span style={{color:"#8B8FA8",fontSize:"0.8rem"}}>{seccionAjustes ? "▲" : "▼"}</span>
            </button>
            {seccionAjustes && <div style={{padding:"0 14px 14px"}}>
            <h3 style={{margin:"0 0 10px",fontSize:"0.85rem",fontWeight:"700",display:"none"}}>5. Ajustes de imagen</h3>
            {[
              {label:"☀️ Brillo", val:brillo, set:setBrillo},
              {label:"◑ Contraste", val:contraste, set:setContraste},
              {label:"🎨 Saturacion", val:saturacion, set:setSaturacion},
            ].map(({label, val, set}) => (
              <div key={label} style={{display:"flex",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
                <label style={{fontSize:"0.72rem",color:"#8B8FA8",whiteSpace:"nowrap",width:"90px"}}>{label}</label>
                <input type="range" min="50" max="200" value={val}
                  onChange={(e) => { set(Number(e.target.value)); aplicarAjustesImagen(); }}
                  style={{flex:1}}/>
                <span style={{fontSize:"0.7rem",color:"#8B8FA8",width:"35px"}}>{val}%</span>
              </div>
            ))}
            <button onClick={() => { setBrillo(100); setContraste(100); setSaturacion(100); aplicarAjustesImagen(); }}
              style={{width:"100%",padding:"7px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.75rem"}}>
              Resetear ajustes
            </button>
            </div>}
          </div>
          <div style={{background:"rgba(6,214,160,0.06)",borderRadius:"10px",padding:"10px 12px",border:"1px solid rgba(6,214,160,0.15)",display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{fontSize:"1rem"}}>💡</span>
            <p style={{color:"#06D6A0",fontSize:"0.72rem",margin:0,lineHeight:"1.5"}}>Arrastra el texto para moverlo. Esquinas para cambiar tamaño. Ctrl+Z para deshacer.</p>
          </div>
        </div>

        {/* ── Panel canvas ── */}
        <div
          ref={panelRef}
          style={{background:"#0a0f1e",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)",minWidth:0,width:"100%",position:"sticky",top:"24px"}}
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
