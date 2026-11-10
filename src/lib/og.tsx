import { ImageResponse } from "next/og";
import { truncate } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgImageOptions = {
    /** Small label next to the logo, e.g. "pockets / signals". */
    section?: string;
    title: string;
    description?: string;
    /** Bottom-left line, e.g. a date or a hostname. */
    footer?: string;
};

const INK = "#171717";
const MUTED = "#737373";
const BORDER = "#e5e5e5";

/** Shared 1200x630 share card, styled after the site header. */
export const renderOgImage = ({
    section,
    title,
    description,
    footer,
}: OgImageOptions) => {
    const heading = truncate(title, 90);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "72px 80px",
                    backgroundColor: "#ffffff",
                    backgroundImage:
                        "radial-gradient(ellipse at top, #f0f0f0 0%, #ffffff 70%)",
                    color: INK,
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 84,
                            height: 84,
                            borderRadius: 26,
                            backgroundColor: INK,
                        }}
                    >
                        <svg
                            width="42"
                            height="42"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fafafa"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            marginLeft: 26,
                            fontSize: 34,
                            letterSpacing: 1,
                            color: MUTED,
                        }}
                    >
                        {section ? `pockets / ${section}` : "pockets"}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: heading.length > 48 ? 64 : 84,
                            lineHeight: 1.1,
                            letterSpacing: -2,
                        }}
                    >
                        {heading}
                    </div>
                    {description ? (
                        <div
                            style={{
                                display: "flex",
                                marginTop: 28,
                                fontSize: 32,
                                lineHeight: 1.35,
                                color: MUTED,
                            }}
                        >
                            {truncate(description, 130)}
                        </div>
                    ) : null}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 28,
                        borderTop: `2px solid ${BORDER}`,
                        fontSize: 28,
                        color: MUTED,
                    }}
                >
                    <div style={{ display: "flex" }}>
                        {footer ?? "Curated by Saiful Alam"}
                    </div>
                    <div style={{ display: "flex", color: INK }}>
                        pockets.msar.me
                    </div>
                </div>
            </div>
        ),
        OG_SIZE,
    );
};
