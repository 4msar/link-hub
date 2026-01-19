import { type NextRequest } from "next/server";

// Cache this route for 60 seconds
export const revalidate = 86400;

export async function GET(request: NextRequest) {
    return new Response(JSON.stringify({ message: "Hello, World!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
