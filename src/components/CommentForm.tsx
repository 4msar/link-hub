"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SendHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCommentsMutation } from "@/hooks/use-comments-mutation";
import { useSonner } from "sonner";

interface CommentFormProps {
    linkId: string | number;
}

export const CommentForm = ({ linkId }: CommentFormProps) => {
    const { mutate, isPending: isSubmitting } = useCommentsMutation();
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!comment.trim()) {
            toast({
                title: "Error",
                description: "Comment cannot be empty",
                variant: "destructive",
            });
            return;
        }

        mutate(
            { linkId, name: name.trim(), comment: comment.trim() },
            {
                onSuccess: () => {
                    setComment("");
                    setName("");
                    toast({
                        title: "Success",
                        description: "Your comment has been posted.",
                    });
                    //
                },
                onError: (error) => {
                    console.log("Error posting comment:", error);

                    toast({
                        title: "Error",
                        description: "Something went wrong. Please try again.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                    Name (optional)
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-medium">
                    Comment
                </Label>
                <Textarea
                    id="comment"
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className="resize-none bg-background"
                />
            </div>
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
            >
                {isSubmitting ? (
                    "Posting..."
                ) : (
                    <>
                        <SendHorizontal className="w-4 h-4" />
                        Post Comment
                    </>
                )}
            </Button>
        </form>
    );
};
