"use client";

import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export default function DatasetAnalysis({
    analysisRef, dataset, missingChartData, columnTypeData, histogramColumns,
    histogramData, selectedHistogram, onSelectedHistogramChange,
    categoricalColumns, categoricalData, selectedCategory,
    onSelectedCategoryChange,
}) {
    if (!dataset) return null;

    return (
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
                                        onSelectedHistogramChange(e.target.value)
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
                                        onSelectedCategoryChange(event.target.value)
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
    );
}
