"use client";

import { useState, useRef, useEffect } from "react";
import DatasetUploader from "./components/DatasetUploader.js";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const navigation = [
    { icon: "⌂", label: "Overview", active: true, href: "#overview" },
    { icon: "▤", label: "Dataset Inspector", href: "#inspector" },
    { icon: "◈", label: "Experiments", href: "#experiments" },
    { icon: "◇", label: "Model Comparison", href: "#comparison" },
];

function Sidebar() {
    return (
        <aside className="flex w-full shrink-0 flex-col border-b border-(--border) bg-white p-5 md:sticky md:top-0 md:h-screen md:w-64 md:self-start md:overflow-y-auto md:border-r md:border-b-0">
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
    const [selectedHistogram, setSelectedHistogram] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const analysisRef = useRef(null);
    const missingChartData = dataset
        ? Object.entries(dataset.missing_by_column)
              .filter(([, count]) => count > 0)
              .map(([column, count]) => ({
                  column,
                  missing: count,
              }))
        : [];

    const columnTypeData = dataset
        ? [
              { name: "Numeric", value: dataset.numeric_columns.length },
              {
                  name: "Non-numeric",
                  value: dataset.non_numeric_columns.length,
              },
          ]
        : [];

    const histogramColumns = dataset
        ? Object.keys(dataset.histograms || {}).filter(
              (column) => dataset.histograms[column].length > 0,
          )
        : [];

    const histogramData =
        dataset?.histograms?.[selectedHistogram]?.map((bin) => ({
            range: `${bin.bin_start.toFixed(1)}-${bin.bin_end.toFixed(1)}`,
            count: bin.count,
        })) || [];

    const categoricalColumns = dataset
        ? Object.keys(dataset.categorical_distributions || {}).filter(
              (column) => dataset.categorical_distributions[column].length > 0,
          )
        : [];

    const categoricalData =
        dataset?.categorical_distributions?.[selectedCategory] || [];

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

    function handleUploadSuccess(data) {
        setDataset(data);

        requestAnimationFrame(() => {
            analysisRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    }

    useEffect(() => {
        if (histogramColumns.length > 0) {
            setSelectedHistogram((current) =>
                histogramColumns.includes(current)
                    ? current
                    : histogramColumns[0],
            );
        } else {
            setSelectedHistogram("");
        }
    }, [dataset]);

    useEffect(() => {
        if (categoricalColumns.length > 0) {
            setSelectedCategory((current) =>
                categoricalColumns.includes(current)
                    ? current
                    : categoricalColumns[0],
            );
        } else {
            setSelectedCategory("");
        }
    }, [dataset]);

    return (
        <div className="min-h-screen md:h-screen md:overflow-hidden md:flex">
            <Sidebar />
            <main className="min-w-0 flex-1 md:overflow-y-auto px-5 py-7 sm:px-8 lg:px-10">
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
                        <DatasetUploader
                            onUploadSuccess={handleUploadSuccess}
                        />
                    </div>
                </section>
                {dataset && (
                    <section
                        ref={analysisRef}
                        className="mt-8 space-y-6 scroll-mt-6"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">
                                Dataset analysis
                            </h2>
                            <p className="mt-1 text-sm text-(--muted)">
                                {dataset.filename} ·{" "}
                                {dataset.memory_usage_bytes
                                    ? `${(dataset.memory_usage_bytes / 1024).toFixed(1)} KB in memory`
                                    : "Memory usage unavailable"}
                            </p>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-(--border) bg-white">
                            <div className="border-b border-(--border) p-5">
                                <h3 className="font-semibold">
                                    Column overview
                                </h3>
                                <p className="mt-1 text-sm text-(--muted)">
                                    Data types, unique values, and missing data
                                    for each column.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-background text-(--muted)">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">
                                                Column
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Data types
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Unique values
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Missing
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Missing %
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(
                                            dataset.column_types,
                                        ).map(([column, type]) => (
                                            <tr
                                                key={column}
                                                className="border-t border-(--border)"
                                            >
                                                <td className="whitespace-nowrap px-5 py-3 font-medium">
                                                    {column}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="rounded-md bg-background px-2 py-1">
                                                        {type}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {dataset
                                                        .unique_values_by_column?.[
                                                        column
                                                    ] ?? "-"}
                                                </td>
                                                <td className="px-5 py-3">
                                                    {dataset
                                                        .missing_by_column?.[
                                                        column
                                                    ] ?? 0}
                                                </td>
                                                <td className="px-5 py-3">
                                                    {(
                                                        dataset
                                                            .missing_percentage?.[
                                                            column
                                                        ] ?? 0
                                                    ).toFixed(2)}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl border border-(--border) bg-white p-5">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Missing Values by Column
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Number of empty values in each column
                                </p>
                                <div className="mt-5 h-72 w-full">
                                    {missingChartData.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={missingChartData}
                                                margin={{
                                                    top: 10,
                                                    right: 10,
                                                    left: 0,
                                                    bottom: 45,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="column"
                                                    angle={-35}
                                                    textAnchor="end"
                                                    interval={0}
                                                    tick={{ fontSize: 11 }}
                                                />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="missing"
                                                    name="Missing values"
                                                    fill="#0d9488"
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                            No missing values found.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-(--border) bg-white p-5">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Column Type Distribution
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Numeric vs non-numeric features
                                </p>
                                <div className="mt-5 h-72 w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={columnTypeData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={85}
                                                label={({ name, value }) =>
                                                    `${name}: ${value}`
                                                }
                                            >
                                                <Cell fill="#0d9488" />
                                                <Cell fill="#64748b" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-(--border) bg-white p-5">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Numeric Feature Distribution
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Explore how values are distributed across a
                                numeric column.
                            </p>
                            <div className="mt-5">
                                <label
                                    htmlFor="histogram-column"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Select numeric column
                                </label>
                                <select
                                    id="histogram-column"
                                    value={selectedHistogram}
                                    onChange={(e) =>
                                        setSelectedHistogram(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-(--border) bg-white px-3 py-2 text-sm outline-none sm:w-64"
                                >
                                    {histogramColumns.map((column) => (
                                        <option key={column} value={column}>
                                            {column}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-6 h-80 w-full">
                                {histogramColumns.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={histogramData}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: 0,
                                                bottom: 45,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="range"
                                                angle={-35}
                                                textAnchor="end"
                                                interval={0}
                                                tick={{ fontSize: 10 }}
                                            />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar
                                                dataKey="count"
                                                name="Values"
                                                fill="#0d9488"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                        No usable numeric columns are available.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-(--border) bg-white p-5">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Categorical Feature Distribution
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Explore the frequency of values in categorical
                                columns.
                            </p>
                            <div className="mt-5">
                                <label
                                    htmlFor="category-column"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Select categorical column
                                </label>
                                <select
                                    id="category-column"
                                    value={selectedCategory}
                                    onChange={(event) =>
                                        setSelectedCategory(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-(--border) bg-white px-3 py-2 text-sm outline-none sm:w-64"
                                >
                                    {categoricalColumns.map((column) => (
                                        <option key={column} value={column}>
                                            {column}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-6 h-80 w-full">
                                {categoricalData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={categoricalData}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: 0,
                                                bottom: 45,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="category"
                                                angle={-35}
                                                textAnchor="end"
                                                interval={0}
                                                tick={{ fontSize: 11 }}
                                            />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar
                                                dataKey="count"
                                                name="Count"
                                                fill="#64748b"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                        No categorical values available.
                                    </div>
                                )}
                            </div>
                        </div>
                        {dataset.numeric_stats &&
                            Object.keys(dataset.numeric_stats).length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-(--border) bg-white">
                                    <div className="border border-(--border) p-5">
                                        <h3 className="font-semibold">
                                            Numeric column statistics
                                        </h3>
                                        <p className="mt-1 text-sm text-(--muted)">
                                            Summary statistics to help you
                                            understand numeric features.
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-background text-(--muted)">
                                                <tr>
                                                    <th className="px-5 py-3 font-medium">
                                                        Column
                                                    </th>
                                                    <th className="px-5 py-3 font-medium">
                                                        Mean
                                                    </th>
                                                    <th className="px-5 py-3 font-medium">
                                                        Median
                                                    </th>
                                                    <th className="px-5 py-3 font-medium">
                                                        Minimum
                                                    </th>
                                                    <th className="px-5 py-3 font-medium">
                                                        Maximum
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(
                                                    dataset.numeric_stats,
                                                ).map(([column, stats]) => (
                                                    <tr
                                                        key={column}
                                                        className="border-t border-(--border)"
                                                    >
                                                        <td className="whitespace-nowrap px-5 py-3 font-medium">
                                                            {column}
                                                        </td>
                                                        {[
                                                            "mean",
                                                            "median",
                                                            "min",
                                                            "max",
                                                        ].map((key) => (
                                                            <td
                                                                key={key}
                                                                className="whitespace-nowrap px-5 py-3 tabular-nums"
                                                            >
                                                                {stats[key] ==
                                                                null
                                                                    ? "-"
                                                                    : Number(
                                                                          stats[
                                                                              key
                                                                          ],
                                                                      ).toLocaleString(
                                                                          undefined,
                                                                          {
                                                                              maximumFractionDigits: 2,
                                                                          },
                                                                      )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        {dataset.dataset_warnings?.length > 0 && (
                            <div className="rounded-2xl border border-(--rose)/50 bg-[#f6e7e5] p-5">
                                <h3 className="font-semibold text-(--forest)">
                                    Data-quality warnings
                                </h3>
                                <ul className="mt-3 space-y-3">
                                    {dataset.dataset_warnings.map((warning) => (
                                        <li
                                            key={warning}
                                            className="flex items-start gap-2 text-sm text-(--forest)"
                                        >
                                            <span aria-hidden="true">!</span>
                                            <span>{warning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
                <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <article
                        id="experiments"
                        className="rounded-2xl border border-(--border) bg-white p-6"
                    >
                        <span className="text-sm text-(--muted)">
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
