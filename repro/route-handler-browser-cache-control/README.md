# Route handler browser Cache-Control repro

Two copies of the same minimal App Router app, one for Next.js and one for vinext on Cloudflare Workers with `workersCacheCdnAdapter()`. Each route handler sets a browser cache policy. On Next.js the browser receives it. On vinext, every response admitted to Workers Cache reaches the browser as `Cache-Control: private, max-age=0, must-revalidate`, while the edge keeps the route's policy. The only route that keeps its browser policy is the one that opts out of Workers Cache with `dynamic = "force-dynamic"`.

- vinext 1.0.0 and `@vinext/cloudflare` 1.0.0, scaffolded with `create-vinext-app@1.0.0 --cdn-cache workers-cache`, then trimmed
- Next.js 16.3.6

Each folder is a standalone project with its own `pnpm-workspace.yaml` and lockfile. It is not part of the vinext workspace.

## Routes

Both apps have the same routes. Each returns JSON and an `X-Rendered-At` header with its render time, so on a deployment a repeated timestamp means the response came from the edge.

| Route                    | What it sets                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `/api/data`              | `Cache-Control: max-age=10` and `Cloudflare-CDN-Cache-Control: max-age=3600`                       |
| `/api/isr`               | `revalidate = 300` and `Cache-Control: public, max-age=300, stale-while-revalidate=86400`          |
| `/api/cache-control`     | `Cache-Control: public, max-age=300, stale-while-revalidate=86400`                                 |
| `/api/cdn-cache-control` | `Cache-Control: max-age=10` and `CDN-Cache-Control: max-age=3600`                                  |
| `/api/force-static`      | `dynamic = "force-static"` and `Cache-Control: public, max-age=300`                                |
| `/api/config-headers`    | nothing; a `next.config` `headers()` rule sets `Cache-Control: public, max-age=300`                |
| `/api/proxy`             | nothing; `proxy.ts` sets `Cache-Control: public, max-age=300`                                      |
| `/api/force-dynamic`     | `dynamic = "force-dynamic"` and `Cache-Control: public, max-age=300, stale-while-revalidate=86400` |
| `/api/private`           | `Cache-Control: private, max-age=300`                                                              |

`/api/data` follows the pattern in Vercel's [Cache-Control headers](https://vercel.com/docs/caching/cache-control-headers#example-usage) docs, with Cloudflare's CDN-scoped header in place of Vercel's. Workers Cache consumes `Cloudflare-CDN-Cache-Control` and strips it from the response, and passes `Cache-Control` through to clients ([Workers Cache configuration](https://developers.cloudflare.com/workers/cache/configuration/)).

## Result

```sh
for r in data isr cache-control cdn-cache-control force-static config-headers proxy force-dynamic private; do
  printf '%-18s ' $r; curl -sI http://localhost:3000/api/$r | grep -i '^cache-control'
done
```

| Route                    | vinext: browser `Cache-Control`                     | vinext: Workers Cache policy                        | Next.js (`next start`): browser `Cache-Control`     |
| ------------------------ | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `/api/data`              | `private, max-age=0, must-revalidate`               | `public, max-age=3600`                              | `max-age=10`                                        |
| `/api/isr`               | `private, max-age=0, must-revalidate`               | `public, max-age=300, stale-while-revalidate=86400` | `public, max-age=300, stale-while-revalidate=86400` |
| `/api/cache-control`     | `private, max-age=0, must-revalidate`               | `public, max-age=300, stale-while-revalidate=86400` | `public, max-age=300, stale-while-revalidate=86400` |
| `/api/cdn-cache-control` | `private, max-age=0, must-revalidate`               | `public, max-age=3600`                              | `max-age=10`                                        |
| `/api/force-static`      | `private, max-age=0, must-revalidate`               | `public, max-age=300`                               | `public, max-age=300`                               |
| `/api/config-headers`    | `private, max-age=0, must-revalidate`               | `public, max-age=300`                               | `public, max-age=300`                               |
| `/api/proxy`             | `private, max-age=0, must-revalidate`               | `public, max-age=300`                               | `public, max-age=300`                               |
| `/api/force-dynamic`     | `public, max-age=300, stale-while-revalidate=86400` | not stored                                          | `public, max-age=300, stale-while-revalidate=86400` |
| `/api/private`           | `no-store, must-revalidate`                         | not stored                                          | `private, max-age=300`                              |

The vinext columns come from `vite preview`, which runs the built Worker in workerd. There is no edge cache locally, but the header rewriting happens inside the Worker, so the browser-facing header is the same as on a deployment. The Workers Cache column was read by temporarily adding a header in `finalizeGatewayResponse` that echoes `Cloudflare-CDN-Cache-Control` before the gateway deletes it.

On Vercel, the CDN also removes `s-maxage` and `stale-while-revalidate` before the response reaches the client, so the browser would see `public, max-age=300` for `/api/isr`.

## Where it happens

1. The adapter's `buildResponseHeaders` puts the route's policy in `Cloudflare-CDN-Cache-Control` and sets the inner `Cache-Control` to `public, max-age=0, must-revalidate` (`BROWSER_REVALIDATE` in `packages/cloudflare/src/cache/cdn-adapter.runtime.ts`). Core deletes the route's `Cache-Control` before calling it (`applyCdnResponseHeaders` in `packages/vinext/src/server/cache-control.ts`).
2. `finalizeGatewayResponse` in `packages/cloudflare/src/cache/cdn-adapter.worker.ts` rewrites every response that came through the shared response stage to `private, max-age=0, must-revalidate`.

## Running

vinext:

```sh
cd vinext
pnpm install
pnpm build
pnpm start   # http://localhost:3000
```

Next.js:

```sh
cd nextjs
pnpm install
pnpm build
pnpm start   # http://localhost:3000
```

To deploy the vinext copy, run `pnpm run deploy` from `vinext`. To deploy the Next.js copy to Vercel, set the project's Root Directory to `repro/route-handler-browser-cache-control/nextjs`.
