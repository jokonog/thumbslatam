"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CARITAS = ["😞", "😕", "😐", "😊", "🤩"];

function FeedbackForm() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || "";
  const emailParam = searchParams.get("email") || "";

  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [p3, setP3] = useState(0);
  const [p4, setP4] = useState("");
  const [p5, setP5] = useState(0);
  const [carita, setCarita] = useState(0);
  const [sugerencias, setSugerencias] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function enviar() {
    if (!p1 || !p2 || !p3 || !p4 || !p5 || !carita) return setError("Por favor responde todas las preguntas.");
    setError("");
    setEnviando(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: userId, email: emailParam, pregunta1: p1, pregunta2: p2, pregunta3: p3, pregunta4: p4, pregunta5: p5, caritas: carita, sugerencias }),
    });
    const data = await res.json();
    if (data.ok) setEnviado(true);
    else setError("Hubo un error al enviar. Intenta de nuevo.");
    setEnviando(false);
  }

  const escala = (val: number, set: (v: number) => void) => (
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => set(n)} style={{width:"40px",height:"40px",borderRadius:"8px",border:`1px solid ${val===n?"#FF4D00":"#3A3D52"}`,background:val===n?"rgba(255,77,0,0.15)":"transparent",color:val===n?"#FF4D00":"#8B8FA8",fontWeight:700,fontSize:"0.9rem",cursor:"pointer"}}>
          {n}
        </button>
      ))}
      <span style={{color:"#3A3D52",fontSize:"0.75rem",alignSelf:"center"}}>1 = Muy malo · 5 = Excelente</span>
    </div>
  );

  if (enviado) return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"500px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
        <img src="/logo.png" alt="ThumbsLatam" style={{height:"32px",marginBottom:"24px",display:"block",margin:"0 auto 24px"}}/>
        <div style={{fontSize:"3rem",marginBottom:"16px"}}>🙌</div>
        <h2 style={{fontSize:"1.2rem",fontWeight:700,marginBottom:"12px"}}>Gracias por tu opinion</h2>
        <p style={{color:"#8B8FA8",fontSize:"0.9rem",lineHeight:1.6,marginBottom:"24px"}}>Tus comentarios nos ayudan a mejorar ThumbsLatam para toda la comunidad.</p>
        <a href="/dashboard" style={{display:"inline-block",padding:"12px 28px",background:"#FF4D00",color:"white",borderRadius:"8px",fontWeight:700,textDecoration:"none",fontSize:"0.9rem"}}>Volver al dashboard →</a>
      </div>
    </main>
  );

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:"560px",margin:"0 auto"}}>
        <img src="/logo.png" alt="ThumbsLatam" style={{height:"32px",marginBottom:"32px",display:"block"}}/>
        <h1 style={{fontSize:"1.4rem",fontWeight:800,marginBottom:"8px"}}>Tu opinion nos importa 💬</h1>
        <p style={{color:"#8B8FA8",fontSize:"0.9rem",lineHeight:1.6,marginBottom:"32px"}}>Toma 2 minutos y ayudanos a mejorar ThumbsLatam para ti y toda la comunidad.</p>

        <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"12px",fontSize:"0.9rem"}}>1. ¿Que tan facil fue crear tu primera miniatura?</p>
            {escala(p1, setP1)}
          </div>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"12px",fontSize:"0.9rem"}}>2. ¿El resultado de la IA cumplio tus expectativas?</p>
            {escala(p2, setP2)}
          </div>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"12px",fontSize:"0.9rem"}}>3. ¿Recomendarias ThumbsLatam a otro creador?</p>
            {escala(p3, setP3)}
          </div>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"12px",fontSize:"0.9rem"}}>4. ¿Cual funcion usas mas?</p>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {["Solo fondo IA","Con mi cara","Las dos igual"].map(op => (
                <button key={op} onClick={() => setP4(op)} style={{padding:"8px 16px",borderRadius:"8px",border:`1px solid ${p4===op?"#FF4D00":"#3A3D52"}`,background:p4===op?"rgba(255,77,0,0.15)":"transparent",color:p4===op?"#FF4D00":"#8B8FA8",fontSize:"0.85rem",cursor:"pointer",fontWeight:p4===op?700:400}}>
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"12px",fontSize:"0.9rem"}}>5. ¿Los creditos de tu plan son suficientes?</p>
            {escala(p5, setP5)}
          </div>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"4px",fontSize:"0.9rem"}}>¿Como te sientes con ThumbsLatam en general?</p>
            <p style={{color:"#8B8FA8",fontSize:"0.8rem",marginBottom:"16px"}}>Elige la carita que mejor te representa</p>
            <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
              {CARITAS.map((c, i) => (
                <button key={i} onClick={() => setCarita(i+1)} style={{fontSize:"2rem",background:"none",border:`2px solid ${carita===i+1?"#FF4D00":"transparent"}`,borderRadius:"12px",padding:"8px",cursor:"pointer",transition:"border 0.15s"}}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontWeight:600,marginBottom:"4px",fontSize:"0.9rem"}}>Tus comentarios son importantes para nosotros</p>
            <p style={{color:"#8B8FA8",fontSize:"0.8rem",marginBottom:"12px"}}>Sugerencias, ideas o lo que quieras decirnos</p>
            <textarea value={sugerencias} onChange={e => setSugerencias(e.target.value)} placeholder="Escribe aqui..." rows={4} style={{width:"100%",padding:"12px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.88rem",resize:"vertical",boxSizing:"border-box"}}/>
          </div>

          {error && <p style={{color:"#ef4444",fontSize:"0.85rem"}}>{error}</p>}

          <button onClick={enviar} disabled={enviando} style={{width:"100%",padding:"14px",borderRadius:"10px",background:"#FF4D00",border:"none",color:"white",fontSize:"0.95rem",fontWeight:700,cursor:"pointer"}}>
            {enviando ? "Enviando..." : "Enviar mi opinion →"}
          </button>

          <p style={{color:"#3A3D52",fontSize:"0.75rem",textAlign:"center"}}>ThumbsLatam — Miniaturas para streamers latinos</p>
        </div>
      </div>
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense>
      <FeedbackForm />
    </Suspense>
  );
}
