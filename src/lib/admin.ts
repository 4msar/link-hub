import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PIN } from "./constant";

/**
 * Returns an error response when the request does not carry a valid admin PIN
 * in the `x-admin-pin` header, or null when it does.
 */
export const requireAdminPin = (request: NextRequest): NextResponse | null => {
    if (!ADMIN_PIN) {
        return NextResponse.json(
            { error: "Admin PIN not configured" },
            { status: 500 },
        );
    }

    if (request.headers.get("x-admin-pin") !== ADMIN_PIN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
};
