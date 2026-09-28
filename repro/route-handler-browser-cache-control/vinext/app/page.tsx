const routes = [
  ["data", "Cache-Control for the browser, Cloudflare-CDN-Cache-Control for the edge"],
  ["isr", "revalidate = 300 and its own Cache-Control"],
  ["cache-control", "Cache-Control only"],
  ["cdn-cache-control", "Cache-Control for the browser, CDN-Cache-Control for the edge"],
  ["force-static", 'dynamic = "force-static" and its own Cache-Control'],
  ["config-headers", "Cache-Control from a next.config headers() rule"],
  ["proxy", "Cache-Control set by proxy.ts"],
  ["force-dynamic", 'dynamic = "force-dynamic" and its own Cache-Control'],
  ["private", "Cache-Control: private, max-age=300"],
];

export default function Home() {
  return (
    <main>
      <h1>Route handler browser Cache-Control repro</h1>
      <p>
        Each route handler sets a browser cache policy. Compare the <code>Cache-Control</code> the
        browser receives with the one the route set.
      </p>
      <ul>
        {routes.map(([name, description]) => (
          <li key={name}>
            <a href={`/api/${name}`}>
              <code>/api/{name}</code>
            </a>{" "}
            — {description}
          </li>
        ))}
      </ul>
    </main>
  );
}
