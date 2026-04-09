import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
import { readFileSync } from "fs";
import { join } from "path";

export default async function Home() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const loggedIn = allCookies.some(c => c.name.startsWith("sb-") && c.value.length > 10);

  const html = readFileSync(join(process.cwd(), "public/thumbslatam.html"), "utf-8");
  
  const script = `<script>window.__LOGGED_IN__ = ${loggedIn};</script>`;
  const finalHtml = html.replace("</head>", `${script}</head>`);

  return (
    <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
  );
}
