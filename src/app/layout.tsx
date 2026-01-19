import { Providers } from "@/components/Providers";
import { Nunito } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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

const fontFamily = Nunito({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
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
