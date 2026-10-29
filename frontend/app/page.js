"use client";

import { useState } from "react";
import DatasetUploader from "./components/DatasetUploader.js";

const navigation = [
    { icon: "⌂", label: "Overview", active: true, href: "#overview" },
    { icon: "▤", label: "Dataset Inspector", href: "#inspector" },
    { icon: "◈", label: "Experiments", href: "#experiments" },
    { icon: "◇", label: "Model Comparison", href: "#comparison" },
];

function Sidebar() {
    return (
        <aside className="flex w-full shrink-0 flex-col border-b border-(--border) bg-white p-5 md:min-h-screen md:w-64 md:border-r md:border-b-0">
            <a href="#overview" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--forest) text-xl text-white">
                    M
                </span>
                <span>
                    <span className="block text-lg font-bold tracking-tight">
                        ModelForge
                    </span>
                    <span className="text-xs text-(--muted)">ML workspace</span>
                </span>
            </a>
            <p className="mb-3 mt-9 text-xs font-semibold uppercase tracking-widest text-(--muted)">
                Workspace
            </p>
            <nav
                aria-label="Main navigation"
                className="flex flex-wrap gap-2 md:flex-col"
            >
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
            <div className="mt-8 rounded-2xl bg-(--forest) p-4 to-white md:mt-auto">
                <span className="text-sm font-semibold text-white">
                    Your ML journey
                </span>
                <p className="mt-2 text-xs leading-5 text-white/70">
                    Inspect your data first. Build reliable models next.
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[15%] rounded-full bg-(--accent)"></div>
                </div>
                <p className="mt-2 text-xs text-white/70">Workspace setup</p>
            </div>
        </aside>
    );
}

function OverviewCard({ card }) {
    return (
        <article className="rounded-2xl border border-(--border) bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-(--muted)">{card.label}</p>
                <span
                    style={{ backgroundColor: card.color }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                    aria-hidden="true"
                >
                    {card.icon}
                </span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight">
                {card.value}
            </p>
            <p className="mt-2 text-xs text-(--muted)">{card.note}</p>
        </article>
    );
}

export default function Home() {
    const [dataset, setDataset] = useState(null);

    const overviewCards = [
        {
            label: "Total rows",
            value: dataset ? dataset.rows.toLocaleString() : "—",
            note: "Rows in your dataset",
            color: "#dff3e4",
            icon: "▤",
        },
        {
            label: "Features",
            value: dataset ? dataset.columns.toLocaleString() : "—",
            note: "Columns in your data",
            color: "#e8eaff",
            icon: "◫",
        },
        {
            label: "Missing values",
            value: dataset ? dataset.total_missing.toLocaleString() : "—",
            note: "Missing cells detected",
            color: "#f6e7e5",
            icon: "◇",
        },
        {
            label: "Duplicate rows",
            value: dataset ? dataset.duplicate_rows.toLocaleString() : "—",
            note: "Duplicate rows detected",
            color: "#eeeaf2",
            icon: "⧉",
        },
    ];

    return (
        <div className="min-h-screen md:flex">
            <Sidebar />
            <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
                <header className="flex flex-wrap items-center justify-center gap-4">
                    <div>
                        <p className="text-sm text-(--muted)">
                            Workspace / Overview
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Good to see you.
                        </h1>
                        <p className="mt-2 text-sm text-(--muted)">
                            Get your data ready for machine learning.
                        </p>
                    </div>
                    <span className="rounded-full border border-(--border) bg-white px-4 py-2 text-xs font-medium text-(--primary)">
                        ⏺ Workspace ready
                    </span>
                </header>
                <section id="overview" className="mt-9">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">
                            Dataset Overview
                        </h2>
                        <p className="mt-1 text-sm text-(--muted)">
                            Your dataset metrics will appear here after upload.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {overviewCards.map((card) => (
                            <OverviewCard key={card.label} card={card} />
                        ))}
                    </div>
                </section>
                <section id="inspector" className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">
                            Dataset Inspector
                        </h2>
                        <p className="mt-1 text-sm text-(--muted)">
                            Start with a CSV file to understand its quality and
                            structure.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-(--border) bg-white p-6 sm:p-8">
                        <DatasetUploader onUploadSuccess={setDataset}/>
                    </div>
                </section>
                <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <article
                        id="experiments"
                        className="rounded-2xl border border-(--border) bg-white p-6"
                    >
                        <span className="te-sm text-(--muted)">
                            Coming in a later phase
                        </span>
                        <h2 className="mt-3 text-lg font-semibold">
                            Experiment tracking
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-(--muted)">
                            Keep track of training runs, model settings, and
                            evaluation results in one workspace.
                        </p>
                    </article>
                    <article
                        id="comparison"
                        className="rounded-2xl border border-(--border) bg-white p-6"
                    >
                        <span className="text-sm text-(--muted)">
                            Coming in a later phase
                        </span>
                        <h2 className="mt-3 text-lg font-semibold">
                            Model comparison
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-(--muted)">
                            Compare model performance using appropriate
                            evaluation metrics once training is available.
                        </p>
                    </article>
                </section>
                <footer className="pb-4 pt-10 text-center text-xs text-(--muted)">
                    ModelForge · Build thoughtfully. Evaluate reliably.
                </footer>
            </main>
        </div>
    );
}
