import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/bot-blocked") {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";
    if (userAgent.includes("gptbot")) return new NextResponse(null, { status: 403 });
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}

export const config = { matcher: ["/api/proxy", "/api/bot-blocked"] };
