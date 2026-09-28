export const dynamic = "force-static";

export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "force-static", renderedAt },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
