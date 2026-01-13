"use client";

import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { MessageCircle } from "lucide-react";

interface LinkCommentsProps {
    linkId: string | number;
}

export const LinkComments = ({ linkId }: LinkCommentsProps) => {
    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="w-5 h-5" />
                        Leave a Comment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CommentForm linkId={linkId} />
                </CardContent>
            </Card>

            {/* Comments List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <Separator className="mb-6" />
                <CommentsList linkId={linkId} />
            </div>
        </div>
    );
};
