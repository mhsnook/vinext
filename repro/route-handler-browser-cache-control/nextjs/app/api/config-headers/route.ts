export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "config-headers", renderedAt },
    {
      headers: {
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
