import { NextRequest, NextResponse } from "next/server";
import { createLink } from "@/lib/api";

export async function POST(request: NextRequest) {
    try {
        const { pin, name, slug, value, type } = await request.json();
        const adminPin = process.env.ADMIN_PIN;

        // Verify PIN
        if (!adminPin) {
            return NextResponse.json(
                { error: "Admin PIN not configured" },
                { status: 500 },
            );
        }

        if (pin !== adminPin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Validate required fields
        if (!name || !slug || !value || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Create the link
        const result = await createLink({ name, slug, value, type });

        // Revalidate the links cache
        await fetch(`${request.nextUrl.origin}/api/revalidate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return NextResponse.json(
            { success: true, data: result },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "Failed to create link" },
            { status: 500 },
        );
    }
}
