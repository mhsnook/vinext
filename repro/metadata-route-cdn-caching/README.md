# Metadata route CDN caching repro

Two copies of the same minimal App Router app, one for Next.js and one for vinext on Cloudflare Workers. On vinext, a dynamic `opengraph-image` that returns its own long-lived public `Cache-Control` is never admitted to the Workers edge cache. A plain route handler with the same header is.

- vinext 1.0.0-beta.12 on Workers: https://og-image-repro.msnook-xyz.workers.dev
- Next.js 16.3.6 on Vercel: https://og-image-repro-sandy.vercel.app

Each folder is a standalone project with its own `pnpm-workspace.yaml` and lockfile. It is not part of the vinext workspace.

## Routes

Both apps have the same routes:

- `/event/[city]/[eventId]/opengraph-image` returns an `ImageResponse` with `Cache-Control: public, immutable, no-transform, max-age=31536000`.
- `/control/[id]` is a plain route handler that returns the same `Cache-Control`.
- `/event/[city]/[eventId]` is a page that shows the image.

Both routes also send `X-Rendered-At` and print the render time into the body. If that timestamp stays the same across requests, the response came from a cache.

## Result

Request each route a few times:

```sh
curl -sI https://<host>/event/london/42/opengraph-image | grep -iE 'cache-control|x-rendered-at|cf-cache-status|x-vercel-cache'
curl -sI https://<host>/control/42 | grep -iE 'cache-control|x-rendered-at|cf-cache-status|x-vercel-cache'
```

| Route                              | vinext on Workers                                                                                                      | Next.js on Vercel                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `/event/london/42/opengraph-image` | `cf-cache-status: BYPASS` every time, `cache-control: no-store, must-revalidate`, new `x-rendered-at` on every request | `x-vercel-cache: MISS`, then `HIT` with the same `x-rendered-at` |
| `/control/42`                      | `cf-cache-status: MISS`, then `HIT` with the same `x-rendered-at`                                                      | `x-vercel-cache: MISS`, then `HIT` with the same `x-rendered-at` |

## Deploying

vinext, using `vinext@1.0.0-beta.12` with `cdnAdapter()` from `@vinext/cloudflare@1.0.0-beta.10`:

```sh
cd vinext
pnpm install
pnpm run deploy
```

Next.js: deploy the `nextjs` folder to any Next.js host. On Vercel, set the project's Root Directory to `repro/metadata-route-cdn-caching/nextjs`.
