"use client";
import { useEffect, useRef, useState } from "react";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
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
  const [escalaVista, setEscalaVista] = useState(0.7);
  const [isMounted, setIsMounted] = useState(false);

  const plataformas: Record<string, {w:number, h:number}> = {
    youtube: {w:1280, h:720},
    instagram: {w:1080, h:1080},
    instagram_story: {w:1080, h:1920},
    tiktok: {w:1080, h:1920},
    twitter: {w:1200, h:675},
  };

  const p = plataformas[plataforma];
  const esVertical = plataforma === "instagram_story" || plataforma === "tiktok";
  const fondoEsVertical = fondoOrientacion === "vertical";
  const orientacionIncompatible = fondoGenerado && esVertical !== fondoEsVertical;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    function calcularEscala() {
      const disponible = window.innerWidth - 340;
      const disponibleH = window.innerHeight - 200;
      const scaleW = disponible / p.w;
      const scaleH = disponibleH / p.h;
      setEscalaVista(Math.min(1, scaleW, scaleH));
    }
    calcularEscala();
    window.addEventListener("resize", calcularEscala);
    return () => window.removeEventListener("resize", calcularEscala);
  }, [plataforma, isMounted]);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current?.canvas || !isMounted) return;
    let mounted = true;
    async function initFabric() {
      const { Canvas, FabricText, FabricImage } = await import("fabric");
      if (!mounted || !canvasRef.current) return;
      const canvas = new Canvas(canvasRef.current, {
        width: p.w,
        height: p.h,
        backgroundColor: "#111827",
      });
      if (mounted) fabricRef.current = { canvas, FabricText, FabricImage };
    }
    initFabric();
    return () => { mounted = false; };
  }, [isMounted]);

  async function cambiarPlataforma(val: string) {
    setPlataforma(val);
    if (!fabricRef.current?.canvas) return;
    const { canvas, FabricImage } = fabricRef.current;
    const np = plataformas[val];
    canvas.setDimensions({ width: np.w, height: np.h });
    if (canvas.backgroundImage) {
      const img = canvas.backgroundImage as any;
      const imgW = img.width! * img.scaleX!;
      const imgH = img.height! * img.scaleY!;
      const newValVertical = val === "instagram_story" || val === "tiktok";
      const fondoEsV = fondoOrientacion === "vertical";
      if (!fondoEsV && newValVertical) {
        const scale = np.h / img.height!;
        img.set({ scaleX: scale, scaleY: scale, left: 0, top: 0, selectable: true, evented: true });
        canvas.add(img);
        canvas.backgroundImage = undefined;
        canvas.setActiveObject(img);
        img.set({ hasControls: false });
      } else {
        const scaleX = np.w / img.width!;
        const scaleY = np.h / img.height!;
        img.set({ scaleX, scaleY, left: 0, top: 0, selectable: false, evented: false });
        canvas.backgroundImage = img;
        if (canvas.contains(img)) canvas.remove(img);
      }
      canvas.renderAll();
    }
  }

  async function generarFondo() {
    if (!tema) return;
    setCargando(true);
    setProgreso(0);
    setFondoGenerado(false);
    const interval = setInterval(() => {
      setProgreso(prev => prev >= 90 ? 90 : prev + 5);
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
    const { canvas, FabricImage } = fabricRef.current;
    const np = plataformas[plataforma];
    const img = await FabricImage.fromURL(data.imageUrl, { crossOrigin: "anonymous" });
    const scaleX = np.w / img.width!;
    const scaleY = np.h / img.height!;
    img.set({ scaleX, scaleY, left: 0, top: 0, originX: "left", originY: "top" });
    canvas.backgroundImage = img;
    canvas.requestRenderAll();
    setCargando(false);
    setProgreso(0);
    setFondoGenerado(true);
    setFondoOrientacion(esVertical ? "vertical" : "horizontal");
  }

  function agregarTexto() {
    if (!texto || !fabricRef.current) return;
    const { canvas, FabricText } = fabricRef.current;
    const t = new FabricText(texto, {
      left: 100,
      top: 300,
      fontSize: fontSize,
      fill: colorTexto,
      fontWeight: "bold",
      fontFamily: "Impact, Arial Black, sans-serif",
      shadow: "3px 3px 10px rgba(0,0,0,0.9)",
      stroke: "rgba(0,0,0,0.5)",
      strokeWidth: 2,
    });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
  }

  function eliminarSeleccion() {
    const { canvas } = fabricRef.current;
    const obj = canvas.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.renderAll(); }
  }

  function descargar() {
    const { canvas } = fabricRef.current;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
    const link = document.createElement("a");
    link.download = "miniatura-thumbslatam.png";
    link.href = dataUrl;
    link.click();
  }

  async function subirFondo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const { canvas, FabricImage } = fabricRef.current;
    const np = plataformas[plataforma];
    const img = await FabricImage.fromURL(url);
    const scaleX = np.w / img.width!;
    const scaleY = np.h / img.height!;
    img.set({ scaleX, scaleY, left: 0, top: 0, originX: "left", originY: "top" });
    canvas.backgroundImage = img;
    canvas.renderAll();
    setFondoGenerado(true);
    setFondoOrientacion(np.h > np.w ? "vertical" : "horizontal");
  }

  const canvasW = isMounted ? Math.round(p.w * escalaVista) : Math.round(p.w * 0.7);
  const canvasH = isMounted ? Math.round(p.h * escalaVista) : Math.round(p.h * 0.7);

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"24px"}}>

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <a href="/dashboard" style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none"}}>← Dashboard</a>
        <h1 style={{fontSize:"1.5rem",fontWeight:"800",letterSpacing:"-0.03em"}}>Thumbs<span style={{color:"#FF4D00"}}>Latam</span> Editor</h1>
        <button onClick={descargar} style={{padding:"10px 20px",borderRadius:"8px",background:"#06D6A0",border:"none",color:"#060810",fontWeight:"700",cursor:"pointer"}}>
          Descargar miniatura
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:"16px",alignItems:"start"}}>

        {/* PANEL IZQUIERDO */}
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>

          {/* 1. Plataforma */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,77,0,0.4)"}}>
            <h3 style={{marginBottom:"10px",fontSize:"0.85rem",fontWeight:"700",color:"#FF4D00"}}>1. Plataforma</h3>
            <select value={plataforma} onChange={(e)=>cambiarPlataforma(e.target.value)} style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #FF4D00",color:"white",fontSize:"0.85rem"}}>
              <option value="youtube">YouTube — 1280×720</option>
              <option value="instagram">Instagram Post — 1080×1080</option>
              <option value="instagram_story">Instagram Story — 1080×1920</option>
              <option value="tiktok">TikTok — 1080×1920</option>
              <option value="twitter">Twitter — 1200×675</option>
            </select>
            {orientacionIncompatible && (
              <p style={{color:"#FFD166",fontSize:"0.75rem",marginTop:"8px",lineHeight:"1.4"}}>
                ⚠️ El fondo generado es {fondoEsVertical?"vertical":"horizontal"}. Para mejores resultados genera de nuevo en formato {esVertical?"vertical":"horizontal"}.
              </p>
            )}
          </div>

          {/* 2. Generar fondo */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <h3 style={{marginBottom:"10px",fontSize:"0.85rem",fontWeight:"700"}}>2. Fondo con IA</h3>
            <input type="text" placeholder="¿De que es tu video? Ej: Minecraft" value={tema} onChange={(e)=>setTema(e.target.value)} style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px"}}/>
            <input type="text" placeholder="Describe la escena (opcional)..." value={escena} onChange={(e)=>setEscena(e.target.value)} style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px"}}/>
            <select value={estilo} onChange={(e)=>setEstilo(e.target.value)} style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px"}}>
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
            <button onClick={generarFondo} disabled={cargando||!tema} style={{width:"100%",padding:"10px",borderRadius:"8px",background:tema&&!cargando?"#FF4D00":"#3A3D52",border:"none",color:"white",fontWeight:"700",cursor:tema?"pointer":"not-allowed",fontSize:"0.85rem"}}>
              {cargando ? (
  <div style={{width:"100%"}}>
    <div style={{fontSize:"0.8rem",marginBottom:"6px",textAlign:"center"}}>Generando tu fondo...</div>
    <div style={{background:"rgba(255,255,255,0.15)",borderRadius:"999px",height:"6px",overflow:"hidden"}}>
      <div style={{background:"white",height:"100%",width:`${progreso}%`,borderRadius:"999px",transition:"width 0.5s ease"}}/>
    </div>
  </div>
) : "Generar fondo →"}
            </button>
          </div>

          {/* 3. Subir fondo */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <h3 style={{marginBottom:"10px",fontSize:"0.85rem",fontWeight:"700"}}>3. O sube tu fondo</h3>
            <input type="file" accept="image/*" onChange={subirFondo} style={{color:"#8B8FA8",fontSize:"0.8rem",width:"100%"}}/>
          </div>

          {/* 4. Texto */}
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <h3 style={{marginBottom:"10px",fontSize:"0.85rem",fontWeight:"700"}}>4. Agregar texto</h3>
            <input type="text" placeholder="Tu titulo aqui..." maxLength={40} value={texto} onChange={(e)=>setTexto(e.target.value)} style={{width:"100%",padding:"9px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem",marginBottom:"8px"}}/>
            <div style={{display:"flex",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
              <label style={{fontSize:"0.78rem",color:"#8B8FA8",whiteSpace:"nowrap"}}>Tamaño:</label>
              <input type="range" min="20" max="150" value={fontSize} onChange={(e)=>setFontSize(Number(e.target.value))} style={{flex:1}}/>
              <span style={{fontSize:"0.78rem",color:"#8B8FA8",whiteSpace:"nowrap"}}>{fontSize}px</span>
            </div>
            <div style={{display:"flex",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
              <label style={{fontSize:"0.78rem",color:"#8B8FA8"}}>Color:</label>
              <input type="color" value={colorTexto} onChange={(e)=>setColorTexto(e.target.value)} style={{width:"36px",height:"30px",borderRadius:"6px",border:"none",cursor:"pointer"}}/>
              <span style={{fontSize:"0.78rem",color:"#8B8FA8"}}>{colorTexto}</span>
            </div>
            <button onClick={agregarTexto} disabled={!texto} style={{width:"100%",padding:"9px",borderRadius:"8px",background:texto?"#FF4D00":"#3A3D52",border:"none",color:"white",fontWeight:"700",cursor:texto?"pointer":"not-allowed",fontSize:"0.82rem",marginBottom:"6px"}}>
              Agregar al canvas
            </button>
            <button onClick={eliminarSeleccion} style={{width:"100%",padding:"8px",borderRadius:"8px",background:"transparent",border:"1px solid #ef4444",color:"#ef4444",cursor:"pointer",fontSize:"0.78rem"}}>
              Eliminar seleccionado
            </button>
          </div>

          <div style={{background:"rgba(6,214,160,0.08)",borderRadius:"10px",padding:"12px",border:"1px solid rgba(6,214,160,0.2)"}}>
            <p style={{color:"#06D6A0",fontSize:"0.78rem",margin:0}}>Arrastra el texto para moverlo. Esquinas para cambiar tamaño.</p>
          </div>

        </div>

        {/* CANVAS AREA */}
        <div style={{background:"#0a0f1e",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)",flex:1,minWidth:0}}>
          <p style={{color:"#3A3D52",fontSize:"0.75rem",marginBottom:"8px",textAlign:"center"}}>
            {plataforma === "youtube" ? "YouTube 1280×720" : plataforma === "instagram" ? "Instagram 1080×1080" : plataforma === "instagram_story" ? "Instagram Story 1080×1920" : plataforma === "tiktok" ? "TikTok 1080×1920" : "Twitter 1200×675"}
          </p> 
          <div style={{width:`${canvasW}px`,height:`${canvasH}px`,position:"relative",overflow:"hidden",borderRadius:"8px"}}>
            <div style={{position:"absolute",top:0,left:0,width:`${p.w}px`,height:`${p.h}px`,transform:`scale(${escalaVista})`,transformOrigin:"top left"}}>
              <canvas ref={canvasRef}/>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}