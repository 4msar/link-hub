import { Providers } from "@/components/Providers";
import { Nunito } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
    SITE_AUTHOR,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_TITLE,
    SITE_URL,
    TWITTER_HANDLE,
} from "@/lib/site";
import type { Metadata } from "next";

// Share images come from the opengraph-image.tsx files next to each route.
export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_TITLE,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [SITE_AUTHOR],
    creator: SITE_AUTHOR.name,
    publisher: SITE_AUTHOR.name,
    keywords: [
        "bookmarks",
        "saved links",
        "curated links",
        "reading list",
        "developer resources",
        "Saiful Alam",
        "pockets",
    ],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    openGraph: {
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        url: "/",
        siteName: SITE_NAME,
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: TWITTER_HANDLE,
        creator: TWITTER_HANDLE,
    },
};

const fontFamily = Nunito({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    fontFamily.className,
                    "bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground transition-colors",
                )}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
