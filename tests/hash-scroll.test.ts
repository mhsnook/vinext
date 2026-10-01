import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { scrollToHashTarget } from "../packages/vinext/src/shims/hash-scroll.js";

function stubDocument(elements: { id?: Record<string, Element>; name?: Record<string, Element> }) {
  const scrollTo = vi.fn();
  vi.stubGlobal("window", { scrollTo });
  vi.stubGlobal("document", {
    getElementById: (id: string) => elements.id?.[id] ?? null,
    getElementsByName: (name: string) => (elements.name?.[name] ? [elements.name[name]] : []),
  });
  return { scrollTo };
}

function stubElement() {
  return { scrollIntoView: vi.fn() } as unknown as Element & {
    scrollIntoView: ReturnType<typeof vi.fn>;
  };
}

describe("scrollToHashTarget", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("scrolls to the top for an empty fragment or #top", () => {
    const { scrollTo } = stubDocument({});

    scrollToHashTarget("#");
    scrollToHashTarget("#top");

    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls the element with a matching id, then a matching name, into view", () => {
    const byId = stubElement();
    const byName = stubElement();
    const { scrollTo } = stubDocument({ id: { café: byId }, name: { legacy: byName } });

    scrollToHashTarget("#caf%C3%A9");
    scrollToHashTarget("#legacy");

    expect(byId.scrollIntoView).toHaveBeenCalledOnce();
    expect(byName.scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  // Ported from Next.js: both routers leave the page where it is when the
  // fragment matches no element.
  // https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/layout-router.tsx
  // https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/router.ts
  it("does not scroll when the fragment matches no element", () => {
    const { scrollTo } = stubDocument({});

    scrollToHashTarget("#nothing-here");

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
