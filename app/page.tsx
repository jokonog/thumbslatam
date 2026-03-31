import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Supabase guarda la sesion en sb-[project-ref]-auth-token
  const loggedIn = allCookies.some(c => 
    (c.name.startsWith("sb-") && c.name.endsWith("-auth-token")) && 
    c.value.length > 10
  );

  if (loggedIn) {
    redirect("/dashboard");
  }

  return (
    <main>
      <iframe
        src="/thumbslatam.html"
        style={{width:'100%', height:'100vh', border:'none'}}
      />
    </main>
  );
}
