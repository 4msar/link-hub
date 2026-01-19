import { ADMIN_PIN } from "@/lib/constant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { pin } = await request.json();
        const adminPin = ADMIN_PIN;

        if (!adminPin) {
            return NextResponse.json(
                { error: "Admin PIN not configured" },
                { status: 500 },
            );
        }

        if (pin === adminPin) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    } catch (error) {
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 },
        );
    }
}
