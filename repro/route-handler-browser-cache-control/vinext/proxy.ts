import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}

export const config = { matcher: ["/api/proxy"] };
