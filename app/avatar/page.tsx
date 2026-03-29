"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Avatar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [avatarActual, setAvatarActual] = useState<string | null>(null);
  const [fotosGuardadas, setFotosGuardadas] = useState<string[]>([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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
        setAvatarActual(usuarioData.avatar_url || null);
        setFotosGuardadas(usuarioData.avatar_fotos || []);
        setFotoSeleccionada(usuarioData.avatar_url || null);
      }
    }
    cargarUsuario();
  }, []);

  function seleccionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setFotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function guardarAvatar() {
    if (!fotos.length || !userId) return;
    setCargando(true);
    setMensaje("");

    try {
      const toBase64 = (file: File): Promise<string> =>
        new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(file);
        });

      const fotosBase64 = await Promise.all(fotos.map(toBase64));

      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fotosBase64 }),
      });

      const data = await res.json();
      if (data.avatarUrl) {
        setAvatarActual(data.avatarUrl);
        setFotosGuardadas(data.todasLasFotos || []);
        setFotoSeleccionada(data.avatarUrl);
        setMensaje(`¡${fotos.length} foto${fotos.length > 1 ? "s" : ""} guardada${fotos.length > 1 ? "s" : ""} correctamente!`);
        setFotos([]);
        setPreviews([]);
      } else {
        setMensaje("Error al guardar. Intenta de nuevo.");
      }
    } catch {
      setMensaje("Error al guardar. Intenta de nuevo.");
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
    setAvatarActual(url);
    setMensaje("Foto principal actualizada.");
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
          <p style={{fontSize:"0.78rem",color:"#8B8FA8",margin:"0 0 12px"}}>Toca una foto para usarla como principal en tus generaciones</p>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {fotosGuardadas.map((url, i) => (
              <div key={i} onClick={() => cambiarFotoPrincipal(url)} style={{position:"relative",cursor:"pointer"}}>
                <img src={url} alt={`foto ${i+1}`} style={{width:"80px",height:"80px",borderRadius:"10px",objectFit:"cover",border:fotoSeleccionada===url?"3px solid #FF4D00":"2px solid #3A3D52"}}/>
                {fotoSeleccionada === url && (
                  <div style={{position:"absolute",top:"4px",right:"4px",background:"#FF4D00",borderRadius:"50%",width:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px"}}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:"0 0 12px"}}>¿Cómo tomar buenas fotos?</h2>
        {[
          { texto: "Foto frontal mirando a la cámara", ok: true },
          { texto: "Fondo claro y liso", ok: true },
          { texto: "Buena iluminación", ok: true },
          { texto: "Sin lentes de sol ni gorras", ok: false },
          { texto: "Sin fotos grupales", ok: false },
        ].map((tip, i) => (
          <div key={i} style={{fontSize:"0.85rem",color:tip.ok?"#06D6A0":"#ef4444",marginBottom:"6px"}}>
            {tip.ok ? "✅" : "❌"} {tip.texto}
          </div>
        ))}
      </div>

      {/* Subir fotos */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h2 style={{fontSize:"0.95rem",fontWeight:"700",margin:"0 0 4px"}}>
          {fotosGuardadas.length > 0 ? "Agregar o reemplazar fotos" : "Sube hasta 5 fotos tuyas"}
        </h2>
        <p style={{fontSize:"0.8rem",color:"#8B8FA8",margin:"0 0 16px"}}>
          Selfies o fotos profesionales — la primera foto será tu foto principal
        </p>

        <label style={{display:"block",padding:"20px",borderRadius:"10px",border:"2px dashed #3A3D52",textAlign:"center",cursor:"pointer",marginBottom:"16px"}}>
          <input type="file" accept="image/*" multiple onChange={seleccionarFotos} style={{display:"none"}}/>
          <div style={{fontSize:"2rem",marginBottom:"8px"}}>📷</div>
          <div style={{fontSize:"0.85rem",color:"#8B8FA8"}}>Toca para seleccionar fotos</div>
          <div style={{fontSize:"0.75rem",color:"#3A3D52",marginTop:"4px"}}>Máximo 5 fotos</div>
        </label>

        {previews.length > 0 && (
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px"}}>
            {previews.map((url, i) => (
              <div key={i} style={{position:"relative"}}>
                <img src={url} alt={`nueva foto ${i+1}`} style={{width:"80px",height:"80px",borderRadius:"10px",objectFit:"cover",border:i===0?"2px solid #FF4D00":"2px solid #3A3D52"}}/>
                {i === 0 && (
                  <div style={{position:"absolute",bottom:"4px",left:"50%",transform:"translateX(-50%)",background:"#FF4D00",color:"white",fontSize:"9px",padding:"1px 6px",borderRadius:"999px",whiteSpace:"nowrap"}}>Principal</div>
                )}
              </div>
            ))}
          </div>
        )}

        {mensaje && (
          <div style={{padding:"10px 14px",borderRadius:"8px",background:mensaje.includes("Error")?"rgba(239,68,68,0.1)":"rgba(6,214,160,0.1)",border:`1px solid ${mensaje.includes("Error")?"rgba(239,68,68,0.3)":"rgba(6,214,160,0.3)"}`,color:mensaje.includes("Error")?"#ef4444":"#06D6A0",fontSize:"0.85rem",marginBottom:"12px"}}>
            {mensaje}
          </div>
        )}

        <button onClick={guardarAvatar} disabled={!fotos.length||cargando} style={{width:"100%",padding:"13px",borderRadius:"10px",background:fotos.length&&!cargando?"#FF4D00":"#3A3D52",border:"none",color:"white",fontWeight:"700",fontSize:"0.95rem",cursor:fotos.length&&!cargando?"pointer":"not-allowed"}}>
          {cargando?"Guardando fotos...":"Guardar fotos →"}
        </button>
      </div>

    </main>
  );
}
