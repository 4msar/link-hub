import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    // get url from request query parameters
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return new Response(
            JSON.stringify({ error: "Missing url parameter" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    try {
        const res = await fetch(url);
        const html = await res.text();

        // Simple metadata extraction (title and description)
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const descriptionMatch = html.match(
            /<meta name="description" content="(.*?)"/i,
        );

        const metadata = {
            title: titleMatch ? titleMatch[1] : null,
            description: descriptionMatch ? descriptionMatch[1] : null,
        };

        return new Response(JSON.stringify(metadata), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to fetch metadata" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
