import { cookies } from "next/headers";
import { readFileSync } from "fs";
import { join } from "path";

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("thumbslatam-auth");
  const loggedIn = !!(authCookie && authCookie.value.length > 10);

  const html = readFileSync(join(process.cwd(), "public/thumbslatam.html"), "utf-8");
  
  const script = `<script>window.__LOGGED_IN__ = ${loggedIn};</script>`;
  const finalHtml = html.replace("</head>", `${script}</head>`);

  return (
    <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
  );
}
