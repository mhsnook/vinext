import { ImageResponse } from "next/og";

export const alt = "Event card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ city: string; eventId: string }>;
}) {
  const { city, eventId } = await params;
  const renderedAt = new Date().toISOString();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#A0BBAA",
        fontSize: 56,
      }}
    >
      <div style={{ display: "flex" }}>
        Event {eventId} in {city}
      </div>
      <div style={{ display: "flex", fontSize: 32, marginTop: 24 }}>rendered at {renderedAt}</div>
    </div>,
    {
      ...size,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
        "X-Rendered-At": renderedAt,
      },
    },
  );
}
