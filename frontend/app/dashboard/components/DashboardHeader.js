import {
    Show,
    SignInButton,
    SignOutButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";

export default function DashboardHeader() {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <p className="text-sm text-(--muted)">Workspace / Overview</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Good to see you.
                </h1>
                <p className="mt-2 text-sm text-(--muted)">
                    Get your data ready for machine learning.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Show when="signed-out">
                    <SignInButton mode="modal">
                        <button
                            type="button"
                            className="rounded-xl border border-(--border) bg-white px-4 py-2 text-sm font-medium text-(--primary) transition hover:bg-background"
                        >
                            Sign In
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button
                            type="button"
                            className="rounded-xl bg-(--forest) px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Sign Up
                        </button>
                    </SignUpButton>
                </Show>
                <Show when="signed-in">
                    <span className="rounded-full border border-(--border) bg-white px-4 py-2 text-xs font-medium text-(--primary)">
                        Workspace ready
                    </span>
                    <SignOutButton>
                        <button
                            type="button"
                            className="rounded-xl border border-(--border) bg-white px-4 py-2 text-sm font-medium text-(--primary) transition hover:bg-background"
                        >
                            Log Out
                        </button>
                    </SignOutButton>
                    <UserButton />
                </Show>
            </div>
        </header>
    );
}
