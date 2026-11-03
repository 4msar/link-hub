import { NextRequest, NextResponse } from "next/server";
import { getSubmissions } from "@/lib/api";
import { requireAdminPin } from "@/lib/admin";

export async function GET(request: NextRequest) {
    const unauthorized = requireAdminPin(request);
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") === "all" ? "all" : "pending";
    const page = Number(searchParams.get("page")) || 1;

    try {
        const result = await getSubmissions({ status, page });
        return NextResponse.json(result.data, { status: result.status });
    } catch {
        return NextResponse.json(
            { error: "Failed to load submissions" },
            { status: 500 },
        );
    }
}
