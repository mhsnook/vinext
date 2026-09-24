const events = [
  ["london", "42"],
  ["berlin", "7"],
];

export default function Home() {
  return (
    <main>
      <h1>Metadata route CDN caching repro</h1>
      <p>
        Each event page has a dynamic <code>opengraph-image</code> that returns an{" "}
        <code>ImageResponse</code> with its own long-lived public <code>Cache-Control</code>. The
        control route handler returns the same header.
      </p>
      <ul>
        {events.map(([city, eventId]) => (
          <li key={eventId}>
            <a href={`/event/${city}/${eventId}`}>event page</a> ·{" "}
            <a href={`/event/${city}/${eventId}/opengraph-image`}>opengraph-image</a> ·{" "}
            <a href={`/control/${eventId}`}>control route handler</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
