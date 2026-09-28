export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "cache-control", renderedAt },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
