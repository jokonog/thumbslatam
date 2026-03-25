"use client";
import{useState}from"react";
export default function Generador(){
const[descripcion,setDescripcion]=useState("");
const[estilo,setEstilo]=useState("gaming");
const[emocion,setEmocion]=useState("emocionado");
const[formato,setFormato]=useState("youtube");
const[imagen,setImagen]=useState("");
const[fotos,setFotos]=useState([]);
const[fotosBase64,setFotosBase64]=useState([]);
const[cargando,setCargando]=useState(false);
function procesarFotos(e){
const files=Array.from(e.target.files).slice(0,5);
const urls=files.map(f=>URL.createObjectURL(f));
setFotos(urls);
const promises=files.map(f=>new Promise(res=>{
const r=new FileReader();
r.onload=()=>res(r.result);
r.readAsDataURL(f);
}));
Promise.all(promises).then(results=>setFotosBase64(results));
}
async function generarMiniatura(){
setCargando(true);
const res=await fetch("/api/generate-avatar",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({descripcion,estilo,emocion,formato,fotosBase64}),
});
const data=await res.json();
setImagen(data.imageUrl);
setCargando(false);
}
return(
<main style={{minHeight:"100vh",background:"#060810",color:"white",fontFamily:"sans-serif",padding:"40px 24px",maxWidth:"700px",margin:"0 auto"}}>
<h1 style={{fontSize:"2rem",marginBottom:"8px"}}>Genera tu miniatura</h1>
<p style={{color:"#8B8FA8",marginBottom:"32px"}}>Sube 5 fotos tuyas y la IA aprende tu cara</p>
<div style={{marginBottom:"20px"}}>
<label style={{display:"block",marginBottom:"8px"}}>De que es tu video?</label>
<input type="text" placeholder="Gane mi primera partida de Fortnite" value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}/>
</div>
<div style={{marginBottom:"20px"}}>
<label style={{display:"block",marginBottom:"8px"}}>Estilo</label>
<select value={estilo} onChange={(e)=>setEstilo(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}>
<option value="gaming">Gaming</option>
<option value="vlog">Vlog</option>
<option value="tutorial">Tutorial</option>
<option value="reaccion">Reaccion</option>
<option value="stream">Stream Highlights</option>
</select>
</div>
<div style={{marginBottom:"20px"}}>
<label style={{display:"block",marginBottom:"8px"}}>Emocion principal</label>
<select value={emocion} onChange={(e)=>setEmocion(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}>
<option value="emocionado">Emocionado</option>
<option value="sorprendido">Sorprendido</option>
<option value="epico">Epico</option>
<option value="gracioso">Gracioso</option>
<option value="misterioso">Misterioso</option>
</select>
</div>
<div style={{marginBottom:"20px"}}>
<label style={{display:"block",marginBottom:"8px"}}>Formato de salida</label>
<select value={formato} onChange={(e)=>setFormato(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:"8px",background:"#111827",border:"1px solid #3A3D52",color:"white"}}>
<option value="youtube">YouTube (1280x720)</option>
<option value="instagram">Instagram Post (1080x1080)</option>
<option value="instagram_story">Instagram Story (1080x1920)</option>
<option value="tiktok">TikTok (1080x1920)</option>
<option value="twitter">Twitter (1200x675)</option>
</select>
</div>
<div style={{marginBottom:"32px",padding:"20px",borderRadius:"12px",background:"#111827",border:"2px dashed #3A3D52"}}>
<label style={{display:"block",marginBottom:"8px",fontWeight:"600"}}>Tus 5 fotos</label>
<p style={{color:"#8B8FA8",fontSize:"0.85rem",marginBottom:"4px"}}>Frente, perfil izquierdo, perfil derecho, sonriendo, serio</p>
<p style={{color:"#FF4D00",fontSize:"0.8rem",marginBottom:"12px"}}>Mas fotos = mejor parecido</p>
<input type="file" accept="image/*" multiple onChange={procesarFotos} style={{color:"#8B8FA8"}}/>
<div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"12px"}}>
{fotos.map((f,i)=>(
<img key={i} src={f} alt={`foto ${i+1}`} style={{width:"70px",height:"70px",borderRadius:"8px",objectFit:"cover",border:"2px solid #FF4D00"}}/>
))}
</div>
{fotos.length>0&&<p style={{color:"#06D6A0",fontSize:"0.8rem",marginTop:"8px"}}>{fotos.length} foto{fotos.length>1?"s":""} seleccionada{fotos.length>1?"s":""}</p>}
</div>
<button onClick={generarMiniatura} disabled={cargando||!descripcion||fotosBase64.length===0} style={{width:"100%",padding:"14px",borderRadius:"10px",background:(descripcion&&fotosBase64.length>0)?"#FF4D00":"#3A3D52",border:"none",color:"white",fontSize:"1rem",fontWeight:"700",marginBottom:"32px"}}>
{cargando?"Aprendiendo tu cara... 60 segundos":"Generar miniatura con mi cara"}
</button>
{imagen&&(
<div>
<img src={imagen} alt="Miniatura" style={{width:"100%",borderRadius:"12px",marginBottom:"12px"}}/>
<a href={imagen} target="_blank" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:"8px",background:"#06D6A0",color:"#060810",fontWeight:"700",textDecoration:"none"}}>Descargar miniatura</a>
</div>
)}
</main>
);
}