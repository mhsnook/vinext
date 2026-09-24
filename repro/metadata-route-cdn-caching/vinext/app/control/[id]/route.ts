export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const renderedAt = new Date().toISOString();
  return new Response(`control ${id} rendered at ${renderedAt}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      "X-Rendered-At": renderedAt,
    },
  });
}
