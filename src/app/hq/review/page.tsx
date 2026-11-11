"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    ArrowLeft,
    Building2,
    Check,
    ExternalLink,
    Inbox,
    Loader2,
    Link2,
    LogOut,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import type { ApproveTarget } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { TransitionLink } from "@/components/TransitionLink";
import { AuthForm, AuthShell } from "@/components/AuthForm";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";
import type { Submission, SubmissionsResponse } from "@/types/link";

type Filter = "pending" | "all";

const FILTERS: { value: Filter; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "all", label: "Archived" },
];

const formatDate = (value: string) => {
    // D1 datetime('now') has no timezone marker; it is UTC
    const date = new Date(value.includes("T") ? value : `${value}Z`);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          });
};

const hostname = (link: string) => {
    try {
        return new URL(link).hostname.replace(/^www\./, "");
    } catch {
        return link;
    }
};

export default function ReviewPage() {
    const {
        pin,
        setPin,
        isAuthenticated,
        isVerifying,
        handlePinSubmit,
        logout,
    } = useAdminAuth();
    const [filter, setFilter] = useState<Filter>("pending");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<SubmissionsResponse | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [editing, setEditing] = useState<Submission | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editTarget, setEditTarget] = useState<ApproveTarget>("link");
    // quick-approve chooser: which submission is being approved, and where to
    const [chooseFor, setChooseFor] = useState<Submission | null>(null);
    const [chooseTarget, setChooseTarget] = useState<ApproveTarget>("link");
    const [editLink, setEditLink] = useState("");

    // Loading is derived: a request is in flight until its key has loaded
    const requestKey = `${filter}:${page}:${refreshCount}`;
    const isLoading = loadedKey !== requestKey;
    const reload = () => setRefreshCount((n) => n + 1);

    useEffect(() => {
        if (!isAuthenticated || !pin) return;

        let cancelled = false;
        fetch(`/api/admin/submissions?status=${filter}&page=${page}`, {
            headers: { "x-admin-pin": pin },
            cache: "no-store",
        })
            .then(async (response) => {
                const data = await response.json();
                if (cancelled) return;
                if (response.ok) {
                    setResult(data);
                } else {
                    toast.error(data.error || "Failed to load submissions");
                }
            })
            .catch(() => {
                if (!cancelled) toast.error("Failed to load submissions");
            })
            .finally(() => {
                if (!cancelled) setLoadedKey(requestKey);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, pin, filter, page, requestKey]);

    const runAction = async (
        submission: Submission,
        request: RequestInit,
        successMessage: string,
    ) => {
        setBusyId(submission.id);
        try {
            const response = await fetch(
                `/api/admin/submissions/${submission.id}`,
                {
                    ...request,
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-pin": pin,
                    },
                },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                toast.error(data.error || "Action failed");
                return false;
            }
            toast.success(successMessage);
            // Step back a page if this emptied the current one
            if (result && result.data.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                reload();
            }
            return true;
        } catch {
            toast.error("Action failed");
            return false;
        } finally {
            setBusyId(null);
        }
    };

    const approve = (
        submission: Submission,
        overrides: { title?: string; link?: string; target?: ApproveTarget } = {},
    ) =>
        runAction(
            submission,
            {
                method: "POST",
                body: JSON.stringify({ action: "approve", ...overrides }),
            },
            overrides.target === "company"
                ? "Approved and added to companies"
                : "Approved and added to links",
        );

    const confirmChoose = async () => {
        if (!chooseFor) return;
        const ok = await approve(chooseFor, { target: chooseTarget });
        if (ok) setChooseFor(null);
    };

    const reject = (submission: Submission) =>
        runAction(
            submission,
            { method: "POST", body: JSON.stringify({ action: "reject" }) },
            "Submission rejected",
        );

    const remove = (submission: Submission) =>
        runAction(submission, { method: "DELETE" }, "Submission deleted");

    const openEdit = (submission: Submission) => {
        setEditing(submission);
        setEditTitle(submission.title);
        setEditLink(submission.link);
        setEditTarget("link");
    };

    const handleEditApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        const ok = await approve(editing, {
            title: editTitle,
            link: editLink,
            target: editTarget,
        });
        if (ok) setEditing(null);
    };

    const changeFilter = (value: Filter) => {
        setFilter(value);
        setPage(1);
    };

    if (isVerifying && !isAuthenticated) {
        return (
            <AuthShell>
                <div className="flex flex-col items-center gap-4 py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Verifying credentials...
                    </p>
                </div>
            </AuthShell>
        );
    }

    if (!isAuthenticated) {
        return (
            <AuthForm
                pin={pin}
                setPin={setPin}
                isVerifying={isVerifying}
                handlePinSubmit={handlePinSubmit}
            />
        );
    }

    const submissions = result?.data ?? [];
    const meta = result?.meta;

    return (
        <div className="min-h-dvh bg-muted/40">
            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="mx-auto flex h-14 sm:h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                    <TransitionLink
                        href="/hq"
                        className="flex items-center gap-2.5 min-w-0"
                    >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                            <Inbox className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                        </span>
                        <span className="truncate font-bold tracking-tight sm:text-lg">
                            Review
                        </span>
                    </TransitionLink>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <TransitionLink href="/hq">
                                <ArrowLeft />
                                <span className="hidden sm:inline">
                                    Admin Panel
                                </span>
                            </TransitionLink>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            aria-label="Logout"
                        >
                            <LogOut />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Submissions
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Links suggested by visitors on /submit.
                        </p>
                    </div>

                    <div
                        role="radiogroup"
                        aria-label="Filter submissions"
                        className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:w-64"
                    >
                        {FILTERS.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={filter === value}
                                onClick={() => changeFilter(value)}
                                className={cn(
                                    "flex h-9 items-center justify-center rounded-md text-sm font-medium transition-all",
                                    filter === value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <section className="rounded-2xl border bg-card text-card-foreground shadow-sm">
                    {isLoading && !result ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <Empty className="py-16">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Inbox />
                                </EmptyMedia>
                                <EmptyTitle>
                                    {filter === "pending"
                                        ? "Nothing to review"
                                        : "No submissions yet"}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {filter === "pending"
                                        ? "New submissions will show up here."
                                        : "Rejected and pending submissions will show up here."}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <ul
                            className={cn(
                                "divide-y transition-opacity",
                                isLoading && "opacity-60",
                            )}
                        >
                            {submissions.map((submission) => {
                                const isBusy = busyId === submission.id;
                                const isPending =
                                    submission.status === "pending";

                                return (
                                    <li
                                        key={submission.id}
                                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h2 className="truncate font-medium">
                                                    {submission.title}
                                                </h2>
                                                {filter === "all" && (
                                                    <Badge
                                                        variant={
                                                            isPending
                                                                ? "secondary"
                                                                : "destructive"
                                                        }
                                                        className="shrink-0 capitalize"
                                                    >
                                                        {submission.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            <a
                                                href={submission.link}
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                                className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                                title={submission.link}
                                            >
                                                <span className="truncate">
                                                    {hostname(submission.link)}
                                                </span>
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                            </a>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Submitted{" "}
                                                {formatDate(
                                                    submission.created_at,
                                                )}
                                                {submission.reviewed_at &&
                                                    ` · Rejected ${formatDate(submission.reviewed_at)}`}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setChooseTarget("link");
                                                    setChooseFor(submission);
                                                }}
                                                disabled={isBusy}
                                            >
                                                {isBusy ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <Check />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    openEdit(submission)
                                                }
                                                disabled={isBusy}
                                                aria-label="Edit and approve"
                                                title="Edit and approve"
                                            >
                                                <Pencil />
                                            </Button>
                                            {isPending && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        reject(submission)
                                                    }
                                                    disabled={isBusy}
                                                >
                                                    <X />
                                                    Reject
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        disabled={isBusy}
                                                        aria-label="Delete"
                                                        title="Delete"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Delete submission?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            &ldquo;
                                                            {submission.title}
                                                            &rdquo; will be
                                                            removed permanently.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                remove(
                                                                    submission,
                                                                )
                                                            }
                                                            className="bg-destructive text-white hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {meta && meta.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {meta.from}–{meta.to} of {meta.total}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || isLoading}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= meta.last_page || isLoading}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
                    <form onSubmit={handleEditApprove} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>Edit and approve</DialogTitle>
                            <DialogDescription>
                                Adjust the details before adding this link to
                                the collection.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                maxLength={200}
                                required
                            />
                        </div>
                        <TargetPicker
                            value={editTarget}
                            onChange={setEditTarget}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="edit-link">Link</Label>
                            <Input
                                id="edit-link"
                                type="url"
                                value={editLink}
                                onChange={(e) => setEditLink(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={busyId === editing?.id}
                            >
                                {busyId === editing?.id ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Check />
                                )}
                                Approve
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={chooseFor !== null}
                onOpenChange={(open) => !open && setChooseFor(null)}
            >
                <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to where?</DialogTitle>
                        <DialogDescription>
                            Links appear on the home page. Companies appear on
                            the companies page.
                        </DialogDescription>
                    </DialogHeader>
                    <TargetPicker
                        value={chooseTarget}
                        onChange={setChooseTarget}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setChooseFor(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmChoose}
                            disabled={busyId === chooseFor?.id}
                        >
                            {busyId === chooseFor?.id ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Check />
                            )}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Link (default) or company; the approved submission is added to that list
function TargetPicker({
    value,
    onChange,
}: {
    value: ApproveTarget;
    onChange: (value: ApproveTarget) => void;
}) {
    const options: { value: ApproveTarget; label: string; icon: typeof Link2 }[] = [
        { value: "link", label: "Link", icon: Link2 },
        { value: "company", label: "Company", icon: Building2 },
    ];
    return (
        <div
            role="radiogroup"
            aria-label="Add to"
            className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
            {options.map(({ value: option, label, icon: Icon }) => (
                <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={value === option}
                    onClick={() => onChange(option)}
                    className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-all ${
                        value === option
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </button>
            ))}
        </div>
    );
}
