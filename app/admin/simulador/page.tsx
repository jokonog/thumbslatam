"use client";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SimuladorPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const [usuariosPro, setUsuariosPro] = useState(10);
  const [usuariosStudio, setUsuariosStudio] = useState(3);
  const [gastoMarketing, setGastoMarketing] = useState(75);

  const [costoVercel] = useState(22.50);
  const [costoReplicate] = useState(12);
  const [costoDominio] = useState(1.25);
  const [costoOtrosSaas] = useState(35);
  const [costoSupabase] = useState(0);
  const [costoResend] = useState(0);
  const [costoCloudinary] = useState(0);

  useEffect(() => {
    fetch("/api/admin-check")
      .then(r => r.json())
      .then(data => {
        if (data.autorizado) setAutorizado(true);
        setVerificando(false);
      })
      .catch(() => setVerificando(false));
  }, []);

  const precioPro = 10;
  const precioStudio = 25;
  const feeGumroadPro = precioPro * 0.10 + 0.50;
  const feeGumroadStudio = precioStudio * 0.10 + 0.50;

  const ingresoBrutoPro = usuariosPro * precioPro;
  const ingresoBrutoStudio = usuariosStudio * precioStudio;
  const ingresoBrutoTotal = ingresoBrutoPro + ingresoBrutoStudio;

  const totalFeesGumroad = (usuariosPro * feeGumroadPro) + (usuariosStudio * feeGumroadStudio);
  const ingresoNeto = ingresoBrutoTotal - totalFeesGumroad;

  const costosFijos = costoVercel + costoReplicate + costoDominio + costoOtrosSaas + costoSupabase + costoResend + costoCloudinary;
  const costosTotales = costosFijos + gastoMarketing;

  const gananciaMensual = ingresoNeto - costosTotales;
  const gananciaAnual = gananciaMensual * 12;
  const ingresoAnual = ingresoNeto * 12;

  const proPorUsuarioNeto = precioPro - feeGumroadPro;
  const studioPorUsuarioNeto = precioStudio - feeGumroadStudio;
  const proEquivalentes = Math.ceil(costosTotales / proPorUsuarioNeto);
  const studioEquivalentes = Math.ceil(costosTotales / studioPorUsuarioNeto);

  const estadoColor = gananciaMensual > 0 ? "#06D6A0" : gananciaMensual === 0 ? "#FFD60A" : "#FF4D4D";
  const estadoTexto = gananciaMensual > 0 ? "Rentable" : gananciaMensual === 0 ? "Punto de equilibrio" : "En perdida";
  const estadoEmoji = gananciaMensual > 0 ? "✓" : gananciaMensual === 0 ? "=" : "!";

  if (verificando) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E27", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        Verificando acceso...
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E27", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Acceso denegado</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>Necesitas autenticarte en el panel admin primero.</p>
        <Link href="/admin" style={{ padding: "0.75rem 1.5rem", background: "#FF4D00", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
          Ir al panel admin
        </Link>
      </div>
    );
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body { margin: 0; background: #0A0E27; }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #FF4D00;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(255,77,0,0.2), 0 4px 12px rgba(255,77,0,0.3);
          transition: all 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 0 6px rgba(255,77,0,0.3), 0 4px 16px rgba(255,77,0,0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #FF4D00;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(255,77,0,0.2), 0 4px 12px rgba(255,77,0,0.3);
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0A0E27 0%, #050816 100%)", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "2rem clamp(1rem, 4vw, 3rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <Logo />
            <Link href="/admin" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500 }}>
              ← Volver al panel
            </Link>
          </header>

          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FF4D00", letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>
              Panel privado · Solo admin
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1, marginBottom: "1rem" }}>
              Simulador de <span style={{ color: "#FF4D00" }}>punto de equilibrio</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", maxWidth: "700px", lineHeight: 1.6 }}>
              Ajusta los sliders y descubre cuantos suscriptores necesitas para que ThumbsLatam sea rentable. Todos los numeros son reales, basados en costos actuales del negocio.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: "2rem" }}>Variables del negocio</h2>

            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                  Usuarios Plan Pro <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>· $10/mes c/u</span>
                </label>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>{usuariosPro}</span>
              </div>
              <input type="range" min="0" max="500" step="1" value={usuariosPro} onChange={(e) => setUsuariosPro(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                <span>0</span><span>250</span><span>500</span>
              </div>
            </div>

            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                  Usuarios Plan Studio <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>· $25/mes c/u</span>
                </label>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>{usuariosStudio}</span>
              </div>
              <input type="range" min="0" max="200" step="1" value={usuariosStudio} onChange={(e) => setUsuariosStudio(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                <span>0</span><span>100</span><span>200</span>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                  Gasto en marketing/ads
                </label>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>${gastoMarketing}</span>
              </div>
              <input type="range" min="0" max="1000" step="25" value={gastoMarketing} onChange={(e) => setGastoMarketing(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                <span>$0</span><span>$500</span><span>$1000</span>
              </div>
            </div>
          </div>

          <div style={{
            background: gananciaMensual >= 0 ? "linear-gradient(135deg, rgba(6,214,160,0.15) 0%, rgba(6,214,160,0.03) 100%)" : "linear-gradient(135deg, rgba(255,77,77,0.15) 0%, rgba(255,77,77,0.03) 100%)",
            border: "1px solid " + estadoColor + "40",
            borderRadius: "20px",
            padding: "clamp(1.5rem, 3vw, 2.5rem)",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: estadoColor + "20", border: "2px solid " + estadoColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: estadoColor, fontFamily: "'Syne', sans-serif" }}>
                {estadoEmoji}
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Estado actual</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: estadoColor, fontFamily: "'Syne', sans-serif" }}>{estadoTexto}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ganancia mensual</div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: estadoColor, fontFamily: "'Syne', sans-serif" }}>
                  {gananciaMensual >= 0 ? "+" : ""}${gananciaMensual.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Proyeccion anual</div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: estadoColor, fontFamily: "'Syne', sans-serif" }}>
                  {gananciaAnual >= 0 ? "+" : ""}${gananciaAnual.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Ingresos
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>Bruto total</span>
                  <span style={{ fontWeight: 600 }}>${ingresoBrutoTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>Fees Gumroad</span>
                  <span style={{ fontWeight: 600, color: "#FF4D4D" }}>-${totalFeesGumroad.toFixed(2)}</span>
                </div>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.25rem 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 600 }}>Neto mensual</span>
                  <span style={{ fontWeight: 700, color: "#06D6A0", fontSize: "1.1rem" }}>${ingresoNeto.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Costos fijos mensuales
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Vercel Pro</span>
                  <span>${costoVercel.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Replicate</span>
                  <span>${costoReplicate.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Otros SaaS</span>
                  <span>${costoOtrosSaas.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Dominio</span>
                  <span>${costoDominio.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Supabase / Resend / Cloudinary</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>$0</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Marketing</span>
                  <span>${gastoMarketing.toFixed(2)}</span>
                </div>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.25rem 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>Total</span>
                  <span style={{ fontWeight: 700, color: "#FF4D4D", fontSize: "1.05rem" }}>${costosTotales.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.1) 0%, rgba(255,214,10,0.03) 100%)", border: "1px solid rgba(255,77,0,0.25)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>
              Punto de equilibrio
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Para cubrir costos actuales de ${costosTotales.toFixed(2)}/mes necesitas:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  Solo con Pro
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#FF4D00", lineHeight: 1 }}>
                  {proEquivalentes}
                </div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>
                  usuarios Pro ($8.50 neto c/u)
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  Solo con Studio
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#FFD60A", lineHeight: 1 }}>
                  {studioEquivalentes}
                </div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>
                  usuarios Studio ($22 neto c/u)
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "clamp(1.5rem, 3vw, 2.5rem)" }}>
            <h2 style={{ fontSize: "1.3rem", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: "1.5rem" }}>
              Desglose por usuario
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.25rem", borderLeft: "3px solid #FF4D00" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>Plan Pro ($10/mes)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Precio</span><span>$10.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Gumroad (10% + $0.50)</span><span style={{ color: "#FF4D4D" }}>-$1.50</span>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.15rem 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#06D6A0" }}>
                    <span>Neto</span><span>$8.50</span>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.25rem", borderLeft: "3px solid #FFD60A" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>Plan Studio ($25/mes)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Precio</span><span>$25.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Gumroad (10% + $0.50)</span><span style={{ color: "#FF4D4D" }}>-$3.00</span>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.15rem 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#06D6A0" }}>
                    <span>Neto</span><span>$22.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
            Simulador interno ThumbsLatam · Datos basados en costos reales · No compartir
          </div>

        </div>
      </div>
    </>
  );
}
