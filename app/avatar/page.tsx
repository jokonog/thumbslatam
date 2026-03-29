"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import Cropper from "react-easy-crop";

async function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function Avatar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [fotosGuardadas, setFotosGuardadas] = useState<string[]>([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [fotoParaCropear, setFotoParaCropear] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [fotosProcessadas, setFotosProcessadas] = useState<string[]>([]);
  const [fotoActualIndex, setFotoActualIndex] = useState(0);
  const [fotosOriginales, setFotosOriginales] = useState<string[]>([]);

  useEffect(() => {
    async function cargarUsuario() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/registro"; return; }
      setUserId(data.user.id);
      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("avatar_url, avatar_fotos")
        .eq("id", data.user.id)
        .single();
      if (usuarioData) {
        setFotosGuardadas(usuarioData.avatar_fotos || []);
        setFotoSeleccionada(usuarioData.avatar_url || null);
      }
    }
    cargarUsuario();
  }, []);

  function seleccionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const MAX_SIZE = 5 * 1024 * 1024;
    const archivosValidos = Array.from(e.target.files || []).filter(f => {
      if (f.size > MAX_SIZE) {
        setMensaje(`"${f.name}" pesa mas de 5MB.`);
        return false;
      }
      return true;
    });
    if (!archivosValidos.length) return;
    const files = archivosValidos.slice(0, 5);
    const urls = files.map(f => URL.createObjectURL(f));
    setFotosOriginales(urls);
    setFotosProcessadas([]);
    setFotoActualIndex(0);
    setFotoParaCropear(urls[0]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMensaje("");
  }

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function confirmarCrop() {
    if (!fotoParaCropear || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(fotoParaCropear, croppedAreaPixels);
    const nuevasFotos = [...fotosProcessadas, cropped];
    setFotosProcessadas(nuevasFotos);

    const siguienteIndex = fotoActualIndex + 1;
    if (siguienteIndex < fotosOriginales.length) {
      setFotoActualIndex(siguienteIndex);
      setFotoParaCropear(fotosOriginales[siguienteIndex]);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      setFotoParaCropear(null);
    }
  }

  async function guardarAvatar() {
    if (!fotosProcessadas.length || !userId) return;
    setCargando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fotosBase64: fotosProcessadas }),
      });
      const data = await res.json();
      if (data.avatarUrl) {
        setFotosGuardadas(data.todasLasFotos || []);
        setFotoSeleccionada(data.avatarUrl);
        setMensaje(`${fotosProcessadas.length} foto${fotosProcessadas.length > 1 ? "s" : ""} guardada${fotosProcessadas.length > 1 ? "s" : ""} correctamente`);
        setFotosProcessadas([]);
        setFotosOriginales([]);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setMensaje("Error: " + (data.error || "Intenta de nuevo"));
      }
    } catch (err: any) {
      setMensaje("Error: " + err.message);
    }
    setCargando(false);
  }

  async function cambiarFotoPrincipal(url: string) {
    if (!userId) return;
    setFotoSeleccionada(url);
    await fetch("/api/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, avatarUrl: url }),
    });
    setMensaje("Foto principal actualizada.");
  }

  async function borrarFoto(url: string) {
    if (!userId) return;
    const nuevasFotos = fotosGuardadas.filter(f => f !== url);
    const nuevoPrincipal = fotoSeleccionada === url ? (nuevasFotos[0] || null) : fotoSeleccionada;
    setFotosGuardadas(nuevasFotos);
    setFotoSeleccionada(nuevoPrincipal);
    await fetch("/api/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, avatarUrl: nuevoPrincipal, avatar_fotos: nuevasFotos }),
    });
    setMensaje("Foto eliminada.");
  }

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"32px 24px",maxWidth:"600px",margin:"0 auto"}}>

      <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"32px"}}>
        <a href="/dashboard" onClick={(e)=>{e.preventDefault();window.location.href="/dashboard";}} style={{color:"#8B8FA8",fontSize:"0.85rem",textDecoration:"none"}}>← Dashboard</a>
        <h1 style={{fontSize:"1.5rem",fontWeight:"800",letterSpacing:"-0.03em",margin:0}}>
          Mi <span style={{color:"#FF4D00"}}>Avatar</span>
        </h1>
      </div>

      {/* Fotos guardadas */}
      {fotosGuardadas.length > 0 && (
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:0}}>Mis fotos guardadas</h2>
            <span style={{fontSize:"0.78rem",color:"#8B8FA8"}}>{fotosGuardadas.length} de 5</span>
          </div>
          <p style={{fontSize:"0.78rem",color:"#8B8FA8",margin:"0 0 12px"}}>Toca una foto para usarla como principal</p>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {fotosGuardadas.map((url, i) => (
              <div key={i} style={{position:"relative"}}>
                <img onClick={() => cambiarFotoPrincipal(url)} src={url} alt={`foto ${i+1}`} style={{width:"80px",height:"80px",borderRadius:"10px",objectFit:"cover",border:fotoSeleccionada===url?"3px solid #FF4D00":"2px solid #3A3D52",cursor:"pointer"}}/>
                {fotoSeleccionada === url && (
                  <div style={{position:"absolute",top:"4px",right:"4px",background:"#FF4D00",borderRadius:"50%",width:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"white"}}>✓</div>
                )}
                <button onClick={(e)=>{e.stopPropagation();borrarFoto(url);}} style={{position:"absolute",bottom:"4px",right:"4px",background:"rgba(239,68,68,0.9)",border:"none",borderRadius:"50%",width:"20px",height:"20px",cursor:"pointer",color:"white",fontSize:"11px",padding:0}}>x</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cropper */}
      {fotoParaCropear && (
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,77,0,0.4)",marginBottom:"24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:0}}>Ajusta tu cara</h2>
            <span style={{fontSize:"0.78rem",color:"#8B8FA8"}}>Foto {fotoActualIndex + 1} de {fotosOriginales.length}</span>
          </div>
          <p style={{fontSize:"0.78rem",color:"#8B8FA8",margin:"0 0 12px"}}>Mueve y haz zoom para centrar tu cara</p>

          <div style={{position:"relative",width:"100%",height:"300px",borderRadius:"10px",overflow:"hidden",marginBottom:"16px"}}>
            <Cropper
              image={fotoParaCropear}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
            <span style={{fontSize:"0.78rem",color:"#8B8FA8",whiteSpace:"nowrap"}}>Zoom:</span>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{flex:1}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <button
              onClick={() => { setFotoParaCropear(null); setFotosOriginales([]); setFotosProcessadas([]); if (inputRef.current) inputRef.current.value = ""; }}
              style={{padding:"10px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarCrop}
              style={{padding:"10px",borderRadius:"8px",background:"#FF4D00",border:"none",color:"white",fontWeight:"700",cursor:"pointer",fontSize:"0.85rem"}}
            >
              {fotoActualIndex + 1 < fotosOriginales.length ? `Siguiente foto →` : "Confirmar recorte"}
            </button>
          </div>
        </div>
      )}

      {/* Preview fotos procesadas listas para guardar */}
      {fotosProcessadas.length > 0 && !fotoParaCropear && (
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(6,214,160,0.3)",marginBottom:"24px"}}>
          <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:"0 0 12px"}}>Listas para guardar</h2>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
            {fotosProcessadas.map((url, i) => (
              <div key={i} style={{position:"relative"}}>
                <img src={url} alt={`foto ${i+1}`} style={{width:"80px",height:"80px",borderRadius:"50%",objectFit:"cover",border:i===0?"2px solid #FF4D00":"2px solid #3A3D52"}}/>
                {i === 0 && <div style={{position:"absolute",bottom:"2px",left:"50%",transform:"translateX(-50%)",background:"#FF4D00",color:"white",fontSize:"9px",padding:"1px 6px",borderRadius:"999px",whiteSpace:"nowrap"}}>Principal</div>}
              </div>
            ))}
          </div>

          {mensaje && (
            <div style={{padding:"10px 14px",borderRadius:"8px",background:mensaje.includes("Error")?"rgba(239,68,68,0.1)":"rgba(6,214,160,0.1)",border:`1px solid ${mensaje.includes("Error")?"rgba(239,68,68,0.3)":"rgba(6,214,160,0.3)"}`,color:mensaje.includes("Error")?"#ef4444":"#06D6A0",fontSize:"0.85rem",marginBottom:"12px"}}>
              {mensaje}
            </div>
          )}

          <button onClick={guardarAvatar} disabled={cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:cargando?"#3A3D52":"#FF4D00",border:"none",color:"white",fontWeight:"700",fontSize:"0.95rem",cursor:cargando?"not-allowed":"pointer"}}>
            {cargando ? "Guardando..." : `Guardar ${fotosProcessadas.length} foto${fotosProcessadas.length>1?"s":""} →`}
          </button>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:"0 0 12px"}}>Como tomar buenas fotos</h2>
        <div style={{fontSize:"0.85rem",color:"#06D6A0",marginBottom:"6px"}}>✓ Foto frontal mirando a la camara</div>
        <div style={{fontSize:"0.85rem",color:"#06D6A0",marginBottom:"6px"}}>✓ Fondo claro y liso</div>
        <div style={{fontSize:"0.85rem",color:"#06D6A0",marginBottom:"6px"}}>✓ Buena iluminacion</div>
        <div style={{fontSize:"0.85rem",color:"#ef4444",marginBottom:"6px"}}>✗ Sin lentes de sol ni gorras</div>
        <div style={{fontSize:"0.85rem",color:"#ef4444"}}>✗ Sin fotos grupales</div>
      </div>

      {/* Subir fotos */}
      {!fotoParaCropear && (
        <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
          <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:"0 0 4px"}}>
            {fotosGuardadas.length > 0 ? "Actualizar fotos" : "Sube hasta 5 fotos tuyas"}
          </h2>
          <p style={{fontSize:"0.8rem",color:"#8B8FA8",margin:"0 0 16px"}}>
            Selfies o fotos profesionales — max 5MB por foto
          </p>

          <input ref={inputRef} type="file" accept="image/*" multiple onChange={seleccionarFotos} style={{display:"none"}}/>

          <div
            onClick={() => inputRef.current?.click()}
            style={{padding:"28px 20px",borderRadius:"10px",border:"2px dashed #3A3D52",textAlign:"center",cursor:"pointer",marginBottom:"16px"}}
            onMouseEnter={e => (e.currentTarget.style.borderColor="#FF4D00")}
            onMouseLeave={e => (e.currentTarget.style.borderColor="#3A3D52")}
          >
            <div style={{fontSize:"2.5rem",marginBottom:"8px"}}>📷</div>
            <div style={{fontSize:"0.9rem",color:"white",fontWeight:"600",marginBottom:"4px"}}>
              {fotosGuardadas.length > 0 ? "Seleccionar nuevas fotos" : "Seleccionar fotos"}
            </div>
            <div style={{fontSize:"0.78rem",color:"#8B8FA8"}}>Hasta 5 fotos — selfies o fotos profesionales</div>
          </div>

          {mensaje && !fotosProcessadas.length && (
            <div style={{padding:"10px 14px",borderRadius:"8px",background:mensaje.includes("Error")||mensaje.includes("pesa")?"rgba(239,68,68,0.1)":"rgba(6,214,160,0.1)",border:`1px solid ${mensaje.includes("Error")||mensaje.includes("pesa")?"rgba(239,68,68,0.3)":"rgba(6,214,160,0.3)"}`,color:mensaje.includes("Error")||mensaje.includes("pesa")?"#ef4444":"#06D6A0",fontSize:"0.85rem"}}>
              {mensaje}
            </div>
          )}
        </div>
      )}

    </main>
  );
}
