"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { parsePreview, type LinkPreviewData } from "@/lib/link-preview";
import { SITE_URL } from "@/lib/site";

const CARD_WIDTH = 320;
const CARD_HEIGHT = 300; // rough, only used to decide whether the card fits below
const GAP = 8;
const EDGE = 16;
const HOVER_DELAY_MS = 300;

type Placement = { left: number; top?: number; bottom?: number; maxHeight: number };
type Active = { url: URL; placement: Placement; data?: LinkPreviewData | null };

const requests = new Map<string, Promise<LinkPreviewData | null>>();

async function load(url: URL): Promise<LinkPreviewData | null> {
    const internal = url.origin === window.location.origin;
    const response = internal
        ? await fetch(url.pathname + url.search, { headers: { accept: "text/html" } })
        : await fetch(`/api/preview?url=${encodeURIComponent(url.toString())}`);

    if (!response.ok) return null;
    if (!internal) return response.json();

    const data = parsePreview(await response.text(), url);
    return { ...data, image: ownImage(data.image) };
}

const SITE = new URL(SITE_URL);

// Internal pages declare absolute msar.me image URLs; load them from this origin so
// previews work in dev too. The site-wide portrait is dropped: it would be the same
// photo on every internal card.
function ownImage(image?: string) {
    if (!image) return undefined;
    const url = new URL(image);
    if (url.host !== SITE.host && url.host !== window.location.host) return image;
    if (url.pathname === "/images/me.jpg") return undefined;
    return url.pathname + url.search;
}

function preview(url: URL) {
    const key = url.origin + url.pathname + url.search;
    if (!requests.has(key)) {
        requests.set(
            key,
            load(url).catch(() => {
                requests.delete(key);
                return null;
            })
        );
    }
    return requests.get(key)!;
}

// Links worth previewing: real pages, not anchors, mail, downloads or image cards.
function previewable(link: HTMLAnchorElement) {
    if (link.closest("[data-no-preview]") || link.hasAttribute("download")) return null;
    if (link.querySelector("img, picture, svg:only-child")) return null;

    let url: URL;
    try {
        url = new URL(link.href, window.location.href);
    } catch {
        return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    const here = window.location;
    if (url.origin === here.origin && url.pathname === here.pathname) return null;
    if (url.origin === here.origin && url.pathname.startsWith("/api/")) return null;

    return url;
}

function place(rect: DOMRect, pointerX?: number): Placement {
    const anchorX = pointerX ?? rect.left;
    const left = Math.min(Math.max(anchorX - 24, EDGE), window.innerWidth - CARD_WIDTH - EDGE);

    const below = window.innerHeight - rect.bottom - GAP - EDGE;
    const above = rect.top - GAP - EDGE;

    // Below when it fits, otherwise whichever side has more room, capped to that room.
    return below >= CARD_HEIGHT || below >= above
        ? { left, top: rect.bottom + GAP, maxHeight: below }
        : { left, bottom: window.innerHeight - rect.top + GAP, maxHeight: above };
}

// The line box of a wrapped link that the pointer is on.
function rectAt(link: HTMLAnchorElement, y?: number) {
    const rects = Array.from(link.getClientRects());
    return (
        (y !== undefined && rects.find((r) => y >= r.top && y <= r.bottom)) || rects[0] || link.getBoundingClientRect()
    );
}

// Shows a small card about the page behind any link inside [data-link-previews]: its title,
// description and image. Mouse and keyboard focus only; touch devices skip it.
export function LinkPreviews() {
    const [active, setActive] = useState<Active | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const current = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        const hide = () => {
            clearTimeout(timer.current);
            current.current = null;
            setActive(null);
        };

        const show = (link: HTMLAnchorElement, pointer?: { x: number; y: number }) => {
            const url = previewable(link);
            if (!url) return;

            clearTimeout(timer.current);
            current.current = link;
            timer.current = setTimeout(() => {
                if (current.current !== link) return;
                const placement = place(rectAt(link, pointer?.y), pointer?.x);
                setActive({ url, placement });

                preview(url).then((data) => {
                    if (current.current !== link) return;
                    setActive((prev) => (prev?.url === url ? { ...prev, data } : prev));
                });
            }, HOVER_DELAY_MS);
        };

        const linkFrom = (target: EventTarget | null) =>
            target instanceof Element ? target.closest<HTMLAnchorElement>("[data-link-previews] a[href]") : null;

        const onPointerOver = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            const link = linkFrom(event.target);
            if (link && link !== current.current) {
                show(link, { x: event.clientX, y: event.clientY });
            }
        };

        const onPointerOut = (event: PointerEvent) => {
            const link = linkFrom(event.target);
            if (link && link === current.current && !link.contains(event.relatedTarget as Node)) {
                hide();
            }
        };

        const onFocusIn = (event: FocusEvent) => {
            const link = linkFrom(event.target);
            if (link?.matches(":focus-visible")) show(link);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") hide();
        };

        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("pointerout", onPointerOut);
        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", hide);
        document.addEventListener("pointerdown", hide);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", hide, { passive: true, capture: true });
        window.addEventListener("resize", hide);

        return () => {
            clearTimeout(timer.current);
            document.removeEventListener("pointerover", onPointerOver);
            document.removeEventListener("pointerout", onPointerOut);
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", hide);
            document.removeEventListener("pointerdown", hide);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", hide, { capture: true });
            window.removeEventListener("resize", hide);
        };
    }, []);

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {active && active.data !== null && (
                <motion.div
                    key={active.url.toString()}
                    aria-hidden
                    initial={{ opacity: 0, y: active.placement.top !== undefined ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    style={{ ...active.placement, width: CARD_WIDTH }}
                    className="pointer-events-none fixed z-50 flex flex-col overflow-hidden rounded-xl bg-popover text-left shadow-2xl shadow-black/20 ring-1 ring-border"
                >
                    <PreviewCard url={active.url} data={active.data} />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function PreviewCard({ url, data }: { url: URL; data?: LinkPreviewData }) {
    const [imageFailed, setImageFailed] = useState(false);
    const [iconFailed, setIconFailed] = useState(false);
    const internal = url.origin === window.location.origin;
    const image = data?.image;
    const host = url.host.replace(/^www\./, "");

    if (!data) {
        return (
            <div className="animate-pulse">
                <div className="aspect-1200/630 bg-muted" />
                <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <>
            {image && !imageFailed && (
                <img
                    src={image}
                    alt=""
                    // hotlink protection (Cloudflare's included) only blocks requests that carry a foreign Referer
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    // the image gives way first when the card is capped in a short viewport
                    className="aspect-1200/630 min-h-0 w-full shrink bg-muted object-cover object-top"
                />
            )}
            <div className="shrink-0 p-4">
                {data.title && <p className="line-clamp-2 text-sm font-semibold text-popover-foreground">{data.title}</p>}
                {data.description && (
                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{data.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {data.favicon && !iconFailed && (
                        <img
                            src={data.favicon}
                            alt=""
                            referrerPolicy="no-referrer"
                            width={14}
                            height={14}
                            onError={() => setIconFailed(true)}
                            className="h-3.5 w-3.5 rounded-sm"
                        />
                    )}
                    <span className="truncate">{data.siteName ? `${data.siteName} · ${host}` : host}</span>
                </div>
            </div>
        </>
    );
}
