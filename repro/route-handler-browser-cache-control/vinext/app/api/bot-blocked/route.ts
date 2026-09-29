export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "bot-blocked", renderedAt },
    {
      headers: {
        "Cache-Control": "max-age=10",
        "Cloudflare-CDN-Cache-Control": "max-age=3600",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
