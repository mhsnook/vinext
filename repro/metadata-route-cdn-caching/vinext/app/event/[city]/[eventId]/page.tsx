export default async function EventPage({
  params,
}: {
  params: Promise<{ city: string; eventId: string }>;
}) {
  const { city, eventId } = await params;
  return (
    <main>
      <h1>
        Event {eventId} in {city}
      </h1>
      <img src={`/event/${city}/${eventId}/opengraph-image`} width={600} height={315} alt="" />
    </main>
  );
}
