export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "private", renderedAt },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
