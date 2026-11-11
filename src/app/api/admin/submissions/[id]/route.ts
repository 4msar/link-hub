import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
    approveSubmission,
    deleteSubmission,
    rejectSubmission,
} from "@/lib/api";
import { requireAdminPin } from "@/lib/admin";
import { CACHE_TAGS } from "@/lib/constant";

type Params = RouteContext<"/api/admin/submissions/[id]">;

const parseId = async (params: Params["params"]) => {
    const id = Number((await params).id);
    return Number.isInteger(id) && id > 0 ? id : null;
};

export async function POST(request: NextRequest, { params }: Params) {
    const unauthorized = requireAdminPin(request);
    if (unauthorized) return unauthorized;

    const id = await parseId(params);
    if (!id) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: {
        action?: string;
        title?: string;
        link?: string;
        target?: string;
    } = {};
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        if (body.action === "approve") {
            const target = body.target === "company" ? "company" : "link";
            const result = await approveSubmission(id, {
                title: body.title?.trim() || undefined,
                link: body.link?.trim() || undefined,
                target,
            });
            if (result.ok) {
                revalidatePath("/api/links");
                revalidateTag(CACHE_TAGS.links, "max");
                if (target === "company") {
                    revalidatePath("/companies");
                    revalidateTag("companies", "max");
                }
            }
            return NextResponse.json(result.data, { status: result.status });
        }

        if (body.action === "reject") {
            const result = await rejectSubmission(id);
            return NextResponse.json(result.data, { status: result.status });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch {
        return NextResponse.json(
            { error: "Failed to update submission" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const unauthorized = requireAdminPin(request);
    if (unauthorized) return unauthorized;

    const id = await parseId(params);
    if (!id) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const result = await deleteSubmission(id);
        return NextResponse.json(result.data, { status: result.status });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete submission" },
            { status: 500 },
        );
    }
}
