import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Solo aplicar rate limit a los endpoints de generación
  if (!request.nextUrl.pathname.startsWith("/api/generate")) {
    return NextResponse.next();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             "unknown";

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 10; // máximo 10 generaciones por minuto por IP

  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return NextResponse.next();
  }

  if (current.count >= maxRequests) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento antes de generar de nuevo." },
      { status: 429 }
    );
  }

  current.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/generate/:path*",
};
