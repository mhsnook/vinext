export async function GET() {
  const renderedAt = new Date().toISOString();
  return Response.json(
    { route: "proxy", renderedAt },
    {
      headers: {
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
