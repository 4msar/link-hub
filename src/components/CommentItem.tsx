import { Comment } from "@/types/link";
import { MessageCircle } from "lucide-react";

interface CommentItemProps {
    comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
    return (
        <div className="flex gap-3 p-4 rounded-lg border border-border bg-card">
            <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground wrap-break-word whitespace-pre-line">
                    {comment.value}
                </p>
                {comment.name && (
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            — {comment.name}
                        </p>
                        {comment.created_at && (
                            <p className="text-xs text-muted-foreground">
                                {new Date(
                                    comment.created_at,
                                ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
