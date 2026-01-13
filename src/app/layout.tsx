import { Providers } from "@/components/Providers";
import "@/app/globals.css";

export const metadata = {
    title: "Bookmarked Links",
    description: "All of my bookmarked links in one place.",
    authors: [{ name: "Saiful Alam" }],
    openGraph: {
        title: "Bookmarked Links",
        description: "All of my bookmarked links in one place.",
        type: "website",
        images: ["/logo.png"],
    },
    twitter: {
        card: "summary_large_image",
        site: "@4msar",
        images: ["/logo.png"],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
