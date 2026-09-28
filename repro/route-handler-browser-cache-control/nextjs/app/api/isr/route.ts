export const revalidate = 300;

export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "isr", renderedAt },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
