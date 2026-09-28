export const dynamic = "force-dynamic";

export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "force-dynamic", renderedAt },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
