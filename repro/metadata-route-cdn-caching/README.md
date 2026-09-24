# Metadata route CDN caching repro

Two copies of the same minimal App Router app, one for Next.js and one for vinext on Cloudflare Workers. They show that a dynamic `opengraph-image` returning its own long-lived public `Cache-Control` is never admitted to the Workers edge cache on vinext, while a plain route handler with the same header is.

Each folder is a standalone project with its own `pnpm-workspace.yaml` and lockfile. It is not part of the vinext workspace.

## Routes

Both apps have the same routes:

- `/event/[city]/[eventId]/opengraph-image` returns an `ImageResponse` with `Cache-Control: public, immutable, no-transform, max-age=31536000`.
- `/control/[id]` is a plain route handler that returns the same `Cache-Control`.
- `/event/[city]/[eventId]` is a page that shows the image.

Both routes also send `X-Rendered-At` and print the render time into the body. If that timestamp stays the same across requests, the response came from a cache. If it changes on every request, the route was rendered again.

## vinext on Workers

```sh
cd vinext
pnpm install
pnpm run deploy
```

This uses `vinext@1.0.0-beta.12` with `cdnAdapter()` from `@vinext/cloudflare@1.0.0-beta.10`.

To deploy with the fix, uncomment the `patchedDependencies` lines in `vinext/pnpm-workspace.yaml`, run `pnpm install`, and deploy again. The patch applies the upstream fix to the published `vinext@1.0.0-beta.12` build.

## Next.js

```sh
cd nextjs
pnpm install
pnpm build
```

Deploy it to any Next.js host. On Vercel, set the project's Root Directory to `repro/metadata-route-cdn-caching/nextjs`.

## Checking

Request each route twice and compare the headers:

```sh
curl -sI https://<host>/event/london/42/opengraph-image | grep -iE 'cache-control|x-rendered-at|cf-cache-status|x-vercel-cache'
curl -sI https://<host>/control/42 | grep -iE 'cache-control|x-rendered-at|cf-cache-status|x-vercel-cache'
```

Headers observed locally (`next start`, and `wrangler dev` for vinext):

| Route             | Next.js                                             | vinext beta.12                        | vinext beta.12 + patch                |
| ----------------- | --------------------------------------------------- | ------------------------------------- | ------------------------------------- |
| `opengraph-image` | `public, immutable, no-transform, max-age=31536000` | `no-store, must-revalidate`           | `private, max-age=0, must-revalidate` |
| `/control/42`     | `public, immutable, no-transform, max-age=31536000` | `private, max-age=0, must-revalidate` | `private, max-age=0, must-revalidate` |

On vinext, `private, max-age=0, must-revalidate` is what clients receive when a response is edge-cached. The edge keeps the route's own policy. `no-store, must-revalidate` means the response was refused admission. Local `wrangler dev` does not serve Workers Cache hits, so it only shows the headers. Whether `X-Rendered-At` stays stable has to be checked on a deployed Worker. I haven't confirmed whether Workers Cache serves hits on a `*.workers.dev` URL. If the control route's timestamp changes on every request there too, try a custom domain.
