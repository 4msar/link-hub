import { getCategories } from "@/lib/api";

export const revalidate = 3600;

export async function GET() {
    try {
        const categories = await getCategories();
        return Response.json({ categories });
    } catch (error) {
        return Response.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
