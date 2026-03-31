"use client";
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

type Codigo = {
  id: string;
  codigo: string;
  creditos: number;
  creador_nombre: string;
  usado: boolean;
  usado_at: string | null;
};

export default function AdminPage() {
  const [step, setStep] = useState<"login" | "totp" | "panel">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [codigos, setCodigos] = useState<Codigo[]>([]);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [creditosNuevo, setCreditosNuevo] = useState(50);
  const [codigoGenerado, setCodigoGenerado] = useState("");
  const [creando, setCreando] = useState(false);
  const [stats, setStats] = useState<any>(null);

  async function login() {
    setCargando(true);
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok) {
      setStep("totp");
    } else {
      setError(data.error);
    }
    setCargando(false);
  }

  async function verificarTotp() {
    setCargando(true);
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, totp }),
    });
    const data = await res.json();
    if (data.ok) {
      setStep("panel");
      cargarCodigos();
      cargarStats();
    } else {
      setError(data.error);
    }
    setCargando(false);
  }

  async function cargarStats() {
    const res = await fetch("/api/admin-stats");
    const data = await res.json();
    setStats(data);
  }

  async function cargarCodigos() {
    const res = await fetch("/api/admin-codigos");
    const data = await res.json();
    setCodigos(data.codigos || []);
  }

  async function crearCodigo() {
    if (!nombreNuevo.trim()) return;
    setCreando(true);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const rand = (n: number) => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const codigo = `THUMBS-${nombreNuevo.toUpperCase()}-${rand(4)}-${rand(4)}`;
    const res = await fetch("/api/admin-codigos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, creditos: creditosNuevo, creador_nombre: nombreNuevo }),
    });
    const data = await res.json();
    if (data.ok) {
      setCodigoGenerado(codigo);
      setNombreNuevo("");
      cargarCodigos();
    }
    setCreando(false);
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: "8px",
    background: "#060810", border: "1px solid #3A3D52",
    color: "white", fontSize: "0.9rem", marginBottom: "12px",
    boxSizing: "border-box" as const,
  };

  const btnStyle = {
    width: "100%", padding: "13px", borderRadius: "10px",
    background: "#FF4D00", border: "none", color: "white",
    fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
  };

  if (step === "login") return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{marginBottom:"24px"}}><Logo height={32} /></div>
        <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"24px"}}>Panel de administracion</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        {error && <p style={{color:"#ef4444",fontSize:"0.85rem",marginBottom:"12px"}}>{error}</p>}
        <button onClick={login} disabled={cargando} style={btnStyle}>{cargando ? "..." : "Entrar"}</button>
      </div>
    </main>
  );

  if (step === "totp") return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#111827",borderRadius:"16px",padding:"40px 32px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{marginBottom:"24px"}}><Logo height={32} /></div>
        <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"8px"}}>Verificacion 2FA</h2>
        <p style={{color:"#8B8FA8",fontSize:"0.85rem",marginBottom:"24px"}}>Abre Google Authenticator e ingresa el codigo de 6 digitos.</p>
        <input type="text" placeholder="000000" value={totp} onChange={e => setTotp(e.target.value)} style={{...inputStyle, textAlign:"center", fontSize:"1.5rem", letterSpacing:"0.3em"}} maxLength={6} />
        {error && <p style={{color:"#ef4444",fontSize:"0.85rem",marginBottom:"12px"}}>{error}</p>}
        <button onClick={verificarTotp} disabled={cargando} style={btnStyle}>{cargando ? "..." : "Verificar"}</button>
      </div>
    </main>
  );

  return (
    <main style={{minHeight:"100vh",background:"#060810",color:"white",padding:"32px 24px",maxWidth:"900px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"}}>
        <Logo height={32} />
        <span style={{fontSize:"0.8rem",color:"#8B8FA8",background:"#111827",padding:"6px 12px",borderRadius:"8px",border:"1px solid #3A3D52"}}>Admin Panel</span>
      </div>

      {/* Estadisticas */}
      {stats && (
        <div style={{marginBottom:"24px"}}>
          <h3 style={{fontSize:"0.95rem",fontWeight:700,marginBottom:"16px",color:"#8B8FA8",textTransform:"uppercase",letterSpacing:"0.05em",fontSize:"0.75rem"}}>Estadisticas generales</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",gap:"12px",marginBottom:"16px"}}>
            {[
              { label: "Usuarios totales", value: stats.totalUsuarios, color: "white" },
              { label: "Nuevos esta semana", value: stats.usuariosSemanales, color: "#06D6A0" },
              { label: "Miniaturas totales", value: stats.totalMiniaturas, color: "white" },
              { label: "Minis esta semana", value: stats.miniaturasSemanales, color: "#06D6A0" },
              { label: "Codigos canjeados", value: `${stats.codigosCanjeados}/${stats.totalCodigos}`, color: "#FF4D00" },
            ].map((s, i) => (
              <div key={i} style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:"1.4rem",fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{color:"#8B8FA8",fontSize:"0.72rem",marginTop:"4px"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#111827",borderRadius:"12px",padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:"0.75rem",color:"#8B8FA8",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Usuarios por plan</div>
            <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
              {[
                { plan: "Gratis", count: stats.planes.gratis, color: "#8B8FA8" },
                { plan: "Pro", count: stats.planes.pro, color: "#FF4D00" },
                { plan: "Studio", count: stats.planes.studio, color: "#06D6A0" },
              ].map((p, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:p.color}}></div>
                  <span style={{fontSize:"0.85rem",color:"white",fontWeight:600}}>{p.count}</span>
                  <span style={{fontSize:"0.82rem",color:"#8B8FA8"}}>{p.plan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Crear codigo */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <h3 style={{fontSize:"0.95rem",fontWeight:700,marginBottom:"16px"}}>Crear codigo de regalo</h3>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
          <input
            placeholder="Nombre del creador (ej: P3P3)"
            value={nombreNuevo}
            onChange={e => setNombreNuevo(e.target.value)}
            style={{flex:1,minWidth:"180px",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem"}}
          />
          <input
            type="number"
            value={creditosNuevo}
            onChange={e => setCreditosNuevo(Number(e.target.value))}
            style={{width:"80px",padding:"10px 14px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem"}}
          />
          <button onClick={crearCodigo} disabled={creando} style={{background:"#FF4D00",border:"none",borderRadius:"8px",padding:"10px 20px",color:"white",fontWeight:700,fontSize:"0.85rem",cursor:"pointer"}}>
            {creando ? "..." : "Generar"}
          </button>
        </div>
        {codigoGenerado && (
          <div style={{marginTop:"12px",background:"rgba(6,214,160,0.08)",border:"1px solid rgba(6,214,160,0.25)",borderRadius:"8px",padding:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"monospace",fontSize:"1rem",color:"#06D6A0"}}>{codigoGenerado}</span>
            <button onClick={() => navigator.clipboard.writeText(codigoGenerado)} style={{background:"none",border:"1px solid #06D6A0",borderRadius:"6px",padding:"4px 10px",color:"#06D6A0",fontSize:"0.75rem",cursor:"pointer"}}>
              Copiar
            </button>
          </div>
        )}
      </div>

      {/* Lista de codigos */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{fontSize:"0.95rem",fontWeight:700}}>Codigos generados ({codigos.length})</h3>
          <button onClick={cargarCodigos} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"4px 10px",color:"#8B8FA8",fontSize:"0.75rem",cursor:"pointer"}}>
            Actualizar
          </button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.82rem"}}>
            <thead>
              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Codigo</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Creador</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Creditos</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Estado</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Canjeado</th>
              </tr>
            </thead>
            <tbody>
              {codigos.map(c => (
                <tr key={c.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <td style={{padding:"8px",fontFamily:"monospace",color:"white"}}>{c.codigo}</td>
                  <td style={{padding:"8px",color:"#8B8FA8"}}>{c.creador_nombre}</td>
                  <td style={{padding:"8px",color:"#FF4D00"}}>{c.creditos}</td>
                  <td style={{padding:"8px"}}>
                    <span style={{background:c.usado?"rgba(239,68,68,0.1)":"rgba(6,214,160,0.1)",color:c.usado?"#ef4444":"#06D6A0",padding:"2px 8px",borderRadius:"4px",fontSize:"0.75rem"}}>
                      {c.usado ? "Canjeado" : "Disponible"}
                    </span>
                  </td>
                  <td style={{padding:"8px",color:"#8B8FA8",fontSize:"0.75rem"}}>
                    {c.usado_at ? new Date(c.usado_at).toLocaleDateString("es-ES") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codigos.length === 0 && <p style={{color:"#8B8FA8",textAlign:"center",padding:"20px"}}>No hay codigos aun</p>}
        </div>
      </div>
    </main>
  );
}
