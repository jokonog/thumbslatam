import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("thumbslatam-auth");
  if (authCookie && authCookie.value.length > 10) {
    redirect("/dashboard");
  }
  return (
    <main>
      <iframe src="/thumbslatam.html" style={{width:"100%", height:"100vh", border:"none"}} />
    </main>
  );
}
