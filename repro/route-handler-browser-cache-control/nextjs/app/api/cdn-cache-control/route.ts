export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "cdn-cache-control", renderedAt },
    {
      headers: {
        "Cache-Control": "max-age=10",
        "CDN-Cache-Control": "max-age=3600",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
