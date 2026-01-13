import { getLinkBySlug } from "@/lib/api";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const data = await getLinkBySlug(slug);

    return (
        <div>
            <div>My Post: {slug}</div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
