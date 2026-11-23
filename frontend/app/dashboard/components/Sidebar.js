"use client";

import Image from "next/image";

const navigation = [
    { icon: "⌂", label: "Overview", active: true, href: "#overview" },
    { icon: "▤", label: "Dataset Inspector", href: "#inspector" },
    { icon: "◈", label: "Experiments", href: "#experiments" },
    { icon: "◇", label: "Model Comparison", href: "#comparison" },
];

export default function Sidebar() {
    return (
        <aside className="flex w-full shrink-0 flex-col border-b border-(--border) bg-white p-5 md:sticky md:top-0 md:h-screen md:w-64 md:self-start md:overflow-y-auto md:border-r md:border-b-0">
            <a href="#overview" className="flex items-center gap-3">
                <Image
                    src="/model-forge-image.png"
                    alt="ModelForge"
                    width={220}
                    height={40}
                    className="rounded-xl"
                />
            </a>
            <p className="mb-3 mt-9 text-xs font-semibold uppercase tracking-widest text-(--muted)">
                Workspace
            </p>
            <nav aria-label="Main navigation" className="flex flex-wrap gap-2 md:flex-col">
                {navigation.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        aria-current={item.active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition ${item.active ? "bg-(--mint) text-(--forest)" : "text-(--primary) hover:bg-background"}`}
                    >
                        <span aria-hidden="true" className="text-lg">
                            {item.icon}
                        </span>
                        {item.label}
                    </a>
                ))}
            </nav>
            <div className="mt-8 rounded-2xl bg-(--forest) p-4 md:mt-auto">
                <span className="text-sm font-semibold text-white">Your ML journey</span>
                <p className="mt-2 text-xs leading-5 text-white/70">
                    Inspect your data first. Build reliable models next.
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[15%] rounded-full bg-(--accent)" />
                </div>
                <p className="mt-2 text-xs text-white/70">Workspace setup</p>
            </div>
        </aside>
    );
}
