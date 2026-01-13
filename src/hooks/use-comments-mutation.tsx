import { useMutation, useQueryClient } from "@tanstack/react-query";

export const submitComment = async (
    linkId: string | number,
    name: string,
    comment: string
) => {
    try {
        const response = await fetch("/api/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                linkId,
                name: name.trim() || "Anonymous",
                comment: comment.trim(),
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to post comment");
        }
    } catch (error) {
        throw new Error(error?.message || "Failed to post comment");
    }
};

export const useCommentsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            linkId,
            name,
            comment,
        }: {
            linkId: string | number;
            name: string;
            comment: string;
        }) => submitComment(linkId, name, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments"],
            });
        },
    });
};
