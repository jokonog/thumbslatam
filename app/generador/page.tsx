"use client";
import { useState } from "react";

export default function Generador() {
  const [descripcion, setDescripcion] = useState("");
  const [estilo, setEstilo] = useState("gaming");
  const [emocion, setEmocion] = useState("emocionado");
  const [imagen, setImagen] = useState("");
  const [cargando, setCargando] = useState(false);

  async function generarMiniatura() {
    setCargando(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, estilo, emocion }),
    });
    const data = await res.json();
    setImagen(data.imageUrl);
    setCargando(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#060810",
      color: "white",
      fontFamily: "sans-serif",
      padding: "40px 24px",
      maxWidth: "600px",
      margin: "0 auto"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>
        Genera tu miniatura ✨
      </h1>
      <p style={{ color: "#8B8FA8", marginBottom: "32px" }}>
        Describe tu video y la IA crea tu miniatura en segundos
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>
          ¿De qué es tu video?
        </label>
        <input
          type="text"
          placeholder="Ej: Gané mi primera partida de Fortnite"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#111827",
            border: "1px solid #3A3D52",
            color: "white",
            fontSize: "0.95rem"
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>
          Estilo
        </label>
        <select
          value={estilo}
          onChange={(e) => setEstilo(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#111827",
            border: "1px solid #3A3D52",
            color: "white",
            fontSize: "0.95rem"
          }}
        >
          <option value="gaming">🎮 Gaming</option>
          <option value="vlog">📹 Vlog</option>
          <option value="tutorial">📚 Tutorial</option>
          <option value="reaccion">😱 Reacción</option>
          <option value="stream highlights">🎬 Stream Highlights</option>
        </select>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>
          Emoción principal
        </label>
        <select
          value={emocion}
          onChange={(e) => setEmocion(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#111827",
            border: "1px solid #3A3D52",
            color: "white",
            fontSize: "0.95rem"
          }}
        >
          <option value="emocionado">🤩 Emocionado</option>
          <option value="sorprendido">😱 Sorprendido</option>
          <option value="epico">⚡ Épico</option>
          <option value="gracioso">😂 Gracioso</option>
          <option value="misterioso">🔮 Misterioso</option>
        </select>
      </div>

      <button
        onClick={generarMiniatura}
        disabled={cargando || !descripcion}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          background: descripcion ? "#FF4D00" : "#3A3D52",
          border: "none",
          color: "white",
          fontSize: "1rem",
          fontWeight: "700",
          cursor: descripcion ? "pointer" : "not-allowed",
          marginBottom: "32px"
        }}
      >
        {cargando ? "Generando tu miniatura... ⏳" : "Generar miniatura →"}
      </button>

      {imagen && (
        <div>
          <img
            src={imagen}
            alt="Miniatura generada"
            style={{
              width: "100%",
              borderRadius: "12px",
              marginBottom: "16px"
            }}
          />
          
            href={imagen}
            download="miniatura.png"
            target="_blank"
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: "8px",
              background: "#06D6A0",
              color: "#060810",
              fontWeight: "700",
              textDecoration: "none"
            }}
          >
            ⬇️ Descargar miniatura
          </a>
        </div>
      )}
    </main>
  );
}