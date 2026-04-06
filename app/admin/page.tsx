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
  const [emailInvitacion, setEmailInvitacion] = useState("");
  const [nombreInvitacion, setNombreInvitacion] = useState("");
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
  const [invitacionEnviada, setInvitacionEnviada] = useState(false);
  const [modalEnvio, setModalEnvio] = useState<{codigo:string,creador:string}|null>(null);
  const [emailModal, setEmailModal] = useState("");
  const [nombreModal, setNombreModal] = useState("");
  const [enviandoModal, setEnviandoModal] = useState(false);
  const [enviadoModal, setEnviadoModal] = useState(false);
  const [creando, setCreando] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any[]>([]);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [confirmarBorrarUser, setConfirmarBorrarUser] = useState<{id:string,email:string}|null>(null);
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editCreditos, setEditCreditos] = useState(0);
  const [editPlan, setEditPlan] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [visorUsuario, setVisorUsuario] = useState<{id:string,email:string}|null>(null);
  const [miniaturasUsuario, setMiniaturasUsuario] = useState<any[]>([]);
  const [cargandoMinis, setCargandoMinis] = useState(false);

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
      cargarUsuarios();
      verificarHealth();
    } else {
      setError(data.error);
    }
    setCargando(false);
  }

  async function cargarUsuarios(q = "") {
    const res = await fetch(`/api/admin-usuarios${q ? `?q=${q}` : ""}`);
    const data = await res.json();
    setUsuarios(data.usuarios || []);
  }

  async function borrarUsuario(id: string) {
    await fetch("/api/admin-usuarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setConfirmarBorrarUser(null);
  }

  async function guardarUsuario(userId: string) {
    setGuardando(true);
    await fetch("/api/admin-usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, creditos: editCreditos, plan: editPlan }),
    });
    setEditandoId(null);
    cargarUsuarios();
    setGuardando(false);
  }

  async function verificarHealth() {
    setCheckingHealth(true);
    const res = await fetch("/api/admin-health");
    const data = await res.json();
    setHealth(data.checks || []);
    setCheckingHealth(false);
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

  async function enviarEncuesta(email: string, nombre: string) {
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "encuesta", email, nombre }),
    });
    const data = await res.json();
    if (data.ok) alert(`Encuesta enviada a ${email}`);
    else alert("Error al enviar la encuesta");
  }

  async function cargarMiniaturasUsuario(userId: string) {
    setCargandoMinis(true);
    const res = await fetch(`/api/admin-miniaturas?userId=${userId}`);
    const data = await res.json();
    setMiniaturasUsuario(data.miniaturas || []);
    setCargandoMinis(false);
  }

  async function enviarDesdeModal() {
    if (!emailModal.trim() || !nombreModal.trim()) return;
    setEnviandoModal(true);
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "invitacion_codigo",
        email: emailModal,
        nombre: nombreModal,
        codigo: modalEnvio?.codigo,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setEnviadoModal(true);
      setEmailModal("");
      setNombreModal("");
    }
    setEnviandoModal(false);
  }

  async function enviarInvitacion() {
    if (!emailInvitacion.trim() || !nombreInvitacion.trim()) return;
    setEnviandoInvitacion(true);
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "invitacion_codigo",
        email: emailInvitacion,
        nombre: nombreInvitacion,
        codigo: codigoGenerado,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setInvitacionEnviada(true);
      setEmailInvitacion("");
      setNombreInvitacion("");
    }
    setEnviandoInvitacion(false);
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
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <span style={{fontSize:"0.8rem",color:"#8B8FA8",background:"#111827",padding:"6px 12px",borderRadius:"8px",border:"1px solid #3A3D52"}}>Admin Panel</span>
          <button onClick={() => { document.cookie = "admin-session=; maxAge=0; path=/"; setStep("login"); }} style={{fontSize:"0.8rem",color:"#8B8FA8",background:"none",border:"1px solid #3A3D52",padding:"6px 12px",borderRadius:"8px",cursor:"pointer"}}>Cerrar sesion</button>
        </div>
      </div>

      {/* Estadisticas */}
      {stats && (
        <div style={{marginBottom:"24px"}}>
          <h3 style={{fontWeight:700,marginBottom:"16px",color:"#8B8FA8",textTransform:"uppercase",letterSpacing:"0.05em",fontSize:"0.75rem"}}>Estadisticas generales</h3>
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
      

      {/* Usuarios */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
          <h3 style={{fontSize:"0.95rem",fontWeight:700}}>Usuarios ({usuarios.length})</h3>
          <div style={{display:"flex",gap:"8px"}}>
            <input
              placeholder="Buscar por email..."
              value={buscarUsuario}
              onChange={e => { setBuscarUsuario(e.target.value); cargarUsuarios(e.target.value); }}
              style={{padding:"6px 12px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.8rem",width:"200px"}}
            />
            <button onClick={() => cargarUsuarios(buscarUsuario)} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"4px 10px",color:"#8B8FA8",fontSize:"0.75rem",cursor:"pointer"}}>
              Actualizar
            </button>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.82rem"}}>
            <thead>
              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Email</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Plan</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Creditos</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Registro</th>
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}>Accion</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <td style={{padding:"8px",color:"white"}}>{u.email}</td>
                  <td style={{padding:"8px"}}>
                    {editandoId === u.id ? (
                      <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{background:"#060810",border:"1px solid #3A3D52",borderRadius:"6px",color:"white",padding:"4px",fontSize:"0.8rem"}}>
                        <option value="gratis">Gratis</option>
                        <option value="pro">Pro</option>
                        <option value="studio">Studio</option>
                      </select>
                    ) : (
                      <span style={{color: u.plan === "pro" ? "#FF4D00" : u.plan === "studio" ? "#06D6A0" : "#8B8FA8",textTransform:"capitalize"}}>{u.plan || "gratis"}</span>
                    )}
                  </td>
                  <td style={{padding:"8px"}}>
                    {editandoId === u.id ? (
                      <input type="number" value={editCreditos} onChange={e => setEditCreditos(Number(e.target.value))} style={{width:"70px",background:"#060810",border:"1px solid #3A3D52",borderRadius:"6px",color:"white",padding:"4px",fontSize:"0.8rem"}} />
                    ) : (
                      <span style={{color:"#FF4D00",fontWeight:600}}>{u.creditos}</span>
                    )}
                  </td>
                  <td style={{padding:"8px",color:"#8B8FA8",fontSize:"0.75rem"}}>
                    {new Date(u.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td style={{padding:"8px"}}>
                    {editandoId === u.id ? (
                      <div style={{display:"flex",gap:"6px"}}>
                        <button onClick={() => guardarUsuario(u.id)} disabled={guardando} style={{background:"#06D6A0",border:"none",borderRadius:"6px",padding:"4px 10px",color:"black",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>
                          {guardando ? "..." : "Guardar"}
                        </button>
                        <button onClick={() => setEditandoId(null)} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"4px 10px",color:"#8B8FA8",fontSize:"0.75rem",cursor:"pointer"}}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                        <button onClick={() => { setEditandoId(u.id); setEditCreditos(u.creditos); setEditPlan(u.plan || "gratis"); }} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"4px 8px",color:"#8B8FA8",fontSize:"0.75rem",cursor:"pointer"}}>
                          Editar
                        </button>
                        <button onClick={() => { setVisorUsuario({id:u.id,email:u.email}); cargarMiniaturasUsuario(u.id); }} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"4px 8px",color:"#8B8FA8",fontSize:"0.75rem",cursor:"pointer"}}>
                          Minis
                        </button>
                        <button onClick={() => enviarEncuesta(u.email, u.nombre || u.email.split("@")[0])} style={{background:"none",border:"1px solid #7F77DD",borderRadius:"6px",padding:"4px 8px",color:"#7F77DD",fontSize:"0.75rem",cursor:"pointer"}}>
                          Encuesta
                        </button>
                        <button onClick={() => setConfirmarBorrarUser({id: u.id, email: u.email})} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:"50%",width:"22px",height:"22px",color:"#ef4444",fontSize:"0.8rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0}}>
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && <p style={{color:"#8B8FA8",textAlign:"center",padding:"20px"}}>No hay usuarios</p>}
        </div>
      </div>
      
      {/* Health Check */}
      <div style={{background:"#111827",borderRadius:"12px",padding:"20px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{fontSize:"0.95rem",fontWeight:700}}>Estado de servicios</h3>
          <button onClick={verificarHealth} disabled={checkingHealth} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"4px 10px",color:"#8B8FA8",fontSize:"0.75rem",cursor:"pointer"}}>
            {checkingHealth ? "Verificando..." : "Verificar"}
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))",gap:"10px"}}>
          {health.map((h, i) => (
            <div key={i} style={{background:"#060810",borderRadius:"10px",padding:"12px 16px",border:`1px solid ${h.ok ? "rgba(6,214,160,0.2)" : "rgba(239,68,68,0.2)"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:h.ok?"#06D6A0":"#ef4444"}}></div>
                <span style={{fontSize:"0.85rem",fontWeight:600,color:"white"}}>{h.name}</span>
              </div>
              <div style={{fontSize:"0.72rem",color:h.ok?"#06D6A0":"#ef4444",marginTop:"4px"}}>
                {h.ok ? "Operacional" : "Error"}
              </div>
            </div>
          ))}
          {health.length === 0 && <p style={{color:"#8B8FA8",fontSize:"0.82rem"}}>Verificando...</p>}
        </div>
      </div>
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
          <div>
          <div style={{marginTop:"12px",background:"rgba(6,214,160,0.08)",border:"1px solid rgba(6,214,160,0.25)",borderRadius:"8px",padding:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"monospace",fontSize:"1rem",color:"#06D6A0"}}>{codigoGenerado}</span>
            <button onClick={() => navigator.clipboard.writeText(codigoGenerado)} style={{background:"none",border:"1px solid #06D6A0",borderRadius:"6px",padding:"4px 10px",color:"#06D6A0",fontSize:"0.75rem",cursor:"pointer"}}>
              Copiar
            </button>
          </div>
          <div style={{marginTop:"16px",borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:"16px"}}>
            <p style={{fontSize:"0.8rem",color:"#8B8FA8",marginBottom:"10px"}}>Enviar invitacion por email</p>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              <input
                placeholder="Nombre (ej: Yoly)"
                value={nombreInvitacion}
                onChange={e => { setNombreInvitacion(e.target.value); setInvitacionEnviada(false); }}
                style={{flex:1,minWidth:"140px",padding:"8px 12px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem"}}
              />
              <input
                placeholder="Email del creador"
                value={emailInvitacion}
                onChange={e => { setEmailInvitacion(e.target.value); setInvitacionEnviada(false); }}
                style={{flex:2,minWidth:"200px",padding:"8px 12px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.82rem"}}
              />
              <button onClick={enviarInvitacion} disabled={enviandoInvitacion || !emailInvitacion || !nombreInvitacion} style={{background:"#FF4D00",border:"none",borderRadius:"8px",padding:"8px 16px",color:"white",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",opacity:(!emailInvitacion||!nombreInvitacion)?0.5:1}}>
                {enviandoInvitacion ? "..." : "Enviar"}
              </button>
            </div>
            {invitacionEnviada && <p style={{color:"#06D6A0",fontSize:"0.8rem",marginTop:"8px"}}>Invitacion enviada correctamente</p>}
          </div>
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
                <th style={{textAlign:"left",padding:"8px",color:"#8B8FA8",fontWeight:500}}></th>
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
                  <td style={{padding:"8px"}}>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button onClick={() => navigator.clipboard.writeText(c.codigo)} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"3px 8px",color:"#8B8FA8",fontSize:"0.72rem",cursor:"pointer"}}>
                        Copiar
                      </button>
                      {!c.usado && (
                        <button onClick={() => { setModalEnvio({codigo:c.codigo,creador:c.creador_nombre}); setEnviadoModal(false); setEmailModal(""); setNombreModal(""); }} style={{background:"none",border:"1px solid #FF4D00",borderRadius:"6px",padding:"3px 8px",color:"#FF4D00",fontSize:"0.72rem",cursor:"pointer"}}>
                          Enviar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codigos.length === 0 && <p style={{color:"#8B8FA8",textAlign:"center",padding:"20px"}}>No hay codigos aun</p>}
        </div>
      </div>
      {modalEnvio && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#111827",borderRadius:"14px",padding:"28px 24px",maxWidth:"380px",width:"90%",border:"1px solid rgba(255,255,255,0.1)"}}>
            <h3 style={{margin:"0 0 4px",fontSize:"1rem",fontWeight:"700"}}>Enviar invitacion</h3>
            <p style={{color:"#8B8FA8",fontSize:"0.82rem",margin:"0 0 16px",fontFamily:"monospace"}}>{modalEnvio.codigo}</p>
            {enviadoModal ? (
              <>
                <p style={{color:"#06D6A0",fontSize:"0.88rem",marginBottom:"16px"}}>Invitacion enviada correctamente</p>
                <button onClick={() => setModalEnvio(null)} style={{width:"100%",padding:"10px",borderRadius:"8px",background:"#FF4D00",border:"none",color:"white",fontWeight:700,cursor:"pointer"}}>Cerrar</button>
              </>
            ) : (
              <>
                <input placeholder="Nombre del influencer" value={nombreModal} onChange={e => setNombreModal(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",marginBottom:"10px",boxSizing:"border-box"}}/>
                <input placeholder="Email del influencer" value={emailModal} onChange={e => setEmailModal(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:"8px",background:"#060810",border:"1px solid #3A3D52",color:"white",fontSize:"0.85rem",marginBottom:"16px",boxSizing:"border-box"}}/>
                <div style={{display:"flex",gap:"10px"}}>
                  <button onClick={() => setModalEnvio(null)} style={{flex:1,padding:"10px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontSize:"0.85rem"}}>Cancelar</button>
                  <button onClick={enviarDesdeModal} disabled={enviandoModal||!emailModal||!nombreModal} style={{flex:1,padding:"10px",borderRadius:"8px",background:"#FF4D00",border:"none",color:"white",fontWeight:700,cursor:"pointer",fontSize:"0.85rem",opacity:(!emailModal||!nombreModal)?0.5:1}}>
                    {enviandoModal ? "..." : "Enviar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {visorUsuario && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
          <div style={{background:"#111827",borderRadius:"14px",padding:"24px",maxWidth:"800px",width:"100%",border:"1px solid rgba(255,255,255,0.1)",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <div>
                <h3 style={{margin:"0 0 4px",fontSize:"1rem",fontWeight:"700"}}>Miniaturas generadas</h3>
                <p style={{color:"#8B8FA8",fontSize:"0.82rem",margin:0}}>{visorUsuario.email}</p>
              </div>
              <button onClick={() => { setVisorUsuario(null); setMiniaturasUsuario([]); }} style={{background:"none",border:"1px solid #3A3D52",borderRadius:"6px",padding:"6px 12px",color:"#8B8FA8",cursor:"pointer",fontSize:"0.82rem"}}>Cerrar</button>
            </div>
            {cargandoMinis ? (
              <p style={{color:"#8B8FA8",textAlign:"center",padding:"40px"}}>Cargando...</p>
            ) : miniaturasUsuario.length === 0 ? (
              <p style={{color:"#8B8FA8",textAlign:"center",padding:"40px"}}>Este usuario no ha generado miniaturas aun</p>
            ) : (
              <>
                <p style={{color:"#8B8FA8",fontSize:"0.8rem",marginBottom:"12px"}}>{miniaturasUsuario.length} miniaturas generadas</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"10px"}}>
                  {miniaturasUsuario.map((m:any, i:number) => (
                    <div key={i} style={{borderRadius:"8px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <img src={m.imagen_url} alt="miniatura" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",display:"block"}}/>
                      <div style={{padding:"6px 8px",background:"#0D1020"}}>
                        <p style={{color:"#8B8FA8",fontSize:"0.72rem",margin:0}}>{m.created_at ? new Date(m.created_at).toLocaleDateString("es-ES") : "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {confirmarBorrarUser !== null && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#111827",borderRadius:"14px",padding:"28px 24px",maxWidth:"340px",width:"90%",border:"1px solid rgba(255,255,255,0.1)",textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:"12px"}}>🗑️</div>
            <h3 style={{margin:"0 0 8px",fontSize:"1rem",fontWeight:"700"}}>Eliminar usuario</h3>
            <p style={{color:"#8B8FA8",fontSize:"0.85rem",margin:"0 0 6px",lineHeight:"1.5"}}>{confirmarBorrarUser.email}</p>
            <p style={{color:"#8B8FA8",fontSize:"0.82rem",margin:"0 0 20px",lineHeight:"1.5"}}>Esta accion no se puede deshacer.</p>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setConfirmarBorrarUser(null)}
                style={{flex:1,padding:"10px",borderRadius:"8px",background:"transparent",border:"1px solid #3A3D52",color:"#8B8FA8",cursor:"pointer",fontWeight:"600",fontSize:"0.85rem"}}>
                Cancelar
              </button>
              <button onClick={() => borrarUsuario(confirmarBorrarUser.id)}
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
