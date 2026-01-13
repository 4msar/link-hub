"use client";

import { useEffect, useState } from "react";
import { Comment } from "@/types/link";
import { CommentItem } from "./CommentItem";
import { MessageCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useComments } from "@/hooks/use-comments";

interface CommentsListProps {
    linkId: string | number;
    refreshTrigger?: number;
}

export const CommentsList = ({ linkId }: CommentsListProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const { data, isLoading, error } = useComments(linkId);

    useEffect(() => {
        if (data) {
            setComments(data.data);
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </div>
    );
};
