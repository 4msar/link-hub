import { Comment } from "@/types/link";
import { MessageCircle } from "lucide-react";

interface CommentItemProps {
    comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
    return (
        <div className="flex gap-3 p-4 rounded-lg border border-border bg-card">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground break-words whitespace-pre-line">
                    {comment.value}
                </p>
                {comment.name && (
                    <p className="text-xs text-muted-foreground mt-1">
                        — {comment.name}
                    </p>
                )}
            </div>
        </div>
    );
};
