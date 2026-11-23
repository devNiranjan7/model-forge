"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ExperimentWorkspace({ comparisonRef, state, actions }) {
    const {
        filteredExperiments, sortedExperiments, experiments, activeDatasetId,
        isLoadingExperiments, experimentsError, isLoadingExperimentDetails,
        experimentDetailsError, deletingExperimentId, selectedExperimentIds,
        activeExperimentFilterCount, isComparisonActive, selectedExperiments,
        availableComparisonMetrics, selectedComparisonMetric, primaryMetric,
        comparisonChartData, bestExperiments, bestMetricValue,
    } = state;
    const {
        openFilterModal, resetAppliedExperimentFilters, toggleExperimentSelection,
        fetchExperimentDetails, handleDeleteExperiment, setSelectedExperimentIds,
        setIsComparisonActive, setSelectedComparisonMetric, isBetterMetric,
        getMetricDirection, getMetricImprovement,
    } = actions;

    return (
            <section className="mt-8 grid grid-cols-1 gap-6">
                <article
                        id="experiments"
                        className="rounded-2xl border border-(--border) bg-white p-6"
                    >
                        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="w-full min-w-0">
                                <p className="text-sm font-medium text-blue-600">
                                    MODEL HISTORY
                                </p>
                                <h2 className="mt-1 text-xl font-semibold">
                                    Experiment tracking
                                </h2>
                            </div>
                            <div className="flex w-full min-w-0 flex-wrap items-center gap-4 sm:justify-end">
                                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                    {filteredExperiments.length} experiments
                                </span>
                                <button
                                    type="button"
                                    onClick={openFilterModal}
                                    className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4 7h16M7 12h10m-7 5h4" />
                                    </svg>
                                    Filter & Sort
                                    {activeExperimentFilterCount > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700">
                                            {activeExperimentFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Track your previous training runs and compare their
                            results.
                        </p>
                        {isLoadingExperiments ? (
                            <p className="mt-6 text-sm text-gray-500">
                                Loading experiments...
                            </p>
                        ) : experimentsError ? (
                            <p className="mt-6 text-sm text-red-500">
                                {experimentsError}
                            </p>
                        ) : filteredExperiments.length === 0 ? (
                            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                                <p className="font-medium text-gray-700">
                                    {activeDatasetId
                                        ? experiments.some(
                                              (experiment) =>
                                                  experiment.dataset_id ===
                                                  activeDatasetId,
                                          )
                                            ? "No matching experiments"
                                            : "No experiments for this dataset"
                                        : "Select a dataset to view its experiments"}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {activeDatasetId
                                        ? experiments.some(
                                              (experiment) =>
                                                  experiment.dataset_id ===
                                                  activeDatasetId,
                                          )
                                            ? "Try changing your filters or resetting them to see more experiments."
                                            : "Train a model using this dataset to create an experiment."
                                        : "Choose a saved dataset to explore its training history."}
                                </p>
                                {activeDatasetId &&
                                    experiments.some(
                                        (experiment) =>
                                            experiment.dataset_id ===
                                            activeDatasetId,
                                    ) && (
                                        <button
                                            type="button"
                                            onClick={
                                                resetAppliedExperimentFilters
                                            }
                                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                            </div>
                        ) : (
                            <div className="mt-6 max-h-128 space-y-3 overflow-y-auto pr-2">
                                {sortedExperiments.map((experiment) => (
                                    <div
                                        key={experiment.experiment_id}
                                        className="rounded-xl border border-gray-200 p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedExperimentIds.includes(
                                                            experiment.experiment_id,
                                                        )}
                                                        onChange={() =>
                                                            toggleExperimentSelection(
                                                                experiment,
                                                            )
                                                        }
                                                        className="h-4 w-4 cursor-pointer accent-blue-600"
                                                    />
                                                    <h3 className="font-semibold text-gray-900">
                                                        {experiment.model}
                                                    </h3>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {
                                                        experiment.dataset_filename
                                                    }
                                                </p>
                                            </div>
                                            <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                {experiment.task_type}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {Object.entries(
                                                experiment.metrics,
                                            ).map(([metric, value]) => (
                                                <div
                                                    key={metric}
                                                    className="rounded-lg bg-gray-50 p-3"
                                                >
                                                    <p className="text-xs uppercase text-gray-500">
                                                        {metric.replaceAll(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </p>
                                                    <p className="mt-1 font-semibold text-gray-900">
                                                        {Number(value).toFixed(
                                                            4,
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-3 text-xs text-gray-400">
                                            {new Date(
                                                experiment.created_at,
                                            ).toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <button
                                                onClick={() =>
                                                    fetchExperimentDetails(
                                                        experiment.experiment_id,
                                                    )
                                                }
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                View Details →
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteExperiment(
                                                        experiment.experiment_id,
                                                    )
                                                }
                                                disabled={
                                                    deletingExperimentId ===
                                                    experiment.experiment_id
                                                }
                                                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingExperimentId ===
                                                experiment.experiment_id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {filteredExperiments.length > 0 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {selectedExperimentIds.length} of 4 selected
                                </p>
                                <button
                                    disabled={selectedExperimentIds.length < 2}
                                    onClick={() => {
                                        setIsComparisonActive(true);
                                        comparisonRef.current?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                    }}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Compare Selected →
                                </button>
                            </div>
                        )}
                        {isLoadingExperimentDetails && (
                            <div className="mt-6 rounded-xl border border-gray-200 p-5">
                                <p className="text-sm text-gray-500">
                                    Loading experiment details...
                                </p>
                            </div>
                        )}
                        {experimentDetailsError && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-600">
                                    {experimentDetailsError}
                                </p>
                            </div>
                        )}
                    </article>
                <article
                        ref={comparisonRef}
                        id="comparison"
                        className="rounded-2xl border border-(--border) bg-white p-4 sm:p-6 min-w-0"
                    >
                        {isComparisonActive &&
                            selectedExperiments.length >= 2 && (
                                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🏆</span>
                                        <h3 className="font-semibold text-green-800">
                                            Best Performing Model
                                        </h3>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <label
                                            htmlFor="comparison-metric"
                                            className="text-sm text-green-700"
                                        >
                                            Evaluate using:
                                        </label>
                                        <select
                                            id="comparison-metric"
                                            value={selectedComparisonMetric}
                                            onChange={(event) =>
                                                setSelectedComparisonMetric(
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-green-800 outline-none focus:ring-2 focus:ring-green-400"
                                        >
                                            <option value="auto">
                                                Default metric
                                            </option>
                                            {availableComparisonMetrics.map(
                                                (metric) => (
                                                    <option
                                                        key={metric}
                                                        value={metric}
                                                    >
                                                        {metric
                                                            .replaceAll(
                                                                "_",
                                                                " ",
                                                            )
                                                            .toUpperCase()}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                    <p className="mt-2 text-xs text-green-700">
                                        {getMetricDirection(primaryMetric)}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {bestExperiments.map((experiment) => (
                                            <span
                                                key={experiment.experiment_id}
                                                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-green-800"
                                            >
                                                {experiment.model}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-green-800">
                                        Score:{" "}
                                        {Number(bestMetricValue).toFixed(4)}
                                    </p>
                                </div>
                            )}
                        {isComparisonActive &&
                        selectedExperiments.length >= 2 ? (
                            <>
                                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {primaryMetric
                                            .replaceAll("_", " ")
                                            .toUpperCase()}{" "}
                                        Comparison
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Comparing {selectedExperiments.length}{" "}
                                        selected experiments
                                    </p>
                                    <div className="mt-5 h-64 w-full min-w-0 sm:h-80">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={comparisonChartData}
                                                margin={{
                                                    top: 10,
                                                    right: 20,
                                                    left: 10,
                                                    bottom: 10,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="model"
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="score"
                                                    name={primaryMetric.toUpperCase()}
                                                    fill="#2563eb"
                                                    radius={[6, 6, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="mt-6 overflow-x-auto">
                                    <table className="w-full min-w-150 border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="sticky left-0 z-10 bg-white p-3 text-sm font-semibold text-gray-600">
                                                    Metric
                                                </th>
                                                {selectedExperiments.map(
                                                    (experiment) => (
                                                        <th
                                                            key={
                                                                experiment.experiment_id
                                                            }
                                                            className="p-3 text-sm font-semibold text-gray-900"
                                                        >
                                                            {experiment.model}
                                                        </th>
                                                    ),
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(
                                                selectedExperiments[0]
                                                    .metrics || {},
                                            ).map((metric) => {
                                                const values =
                                                    selectedExperiments
                                                        .map((experiment) =>
                                                            Number(
                                                                experiment
                                                                    .metrics?.[
                                                                    metric
                                                                ],
                                                            ),
                                                        )
                                                        .filter(
                                                            Number.isFinite,
                                                        );
                                                const bestValue = values.reduce(
                                                    (best, value) =>
                                                        isBetterMetric(
                                                            metric,
                                                            value,
                                                            best,
                                                        )
                                                            ? value
                                                            : best,
                                                );
                                                return (
                                                    <tr
                                                        key={metric}
                                                        className="border-b border-gray-100"
                                                    >
                                                        <td className="sticky left-0 z-10 bg-white p-3 text-sm font-medium text-gray-700 w-30 sm:w-auto">
                                                            <div>
                                                                <p className="font-semibold">
                                                                    {metric
                                                                        .replaceAll(
                                                                            "_",
                                                                            " ",
                                                                        )
                                                                        .toUpperCase()}
                                                                </p>
                                                                <p className="mt-1 text-xs font-normal text-gray-500">
                                                                    {getMetricDirection(
                                                                        metric,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        {selectedExperiments.map(
                                                            (experiment) => {
                                                                const value =
                                                                    experiment
                                                                        .metrics?.[
                                                                        metric
                                                                    ];
                                                                const isBest =
                                                                    value !=
                                                                        null &&
                                                                    Number(
                                                                        value,
                                                                    ) ===
                                                                        bestValue;
                                                                const baselineValue =
                                                                    Number(
                                                                        selectedExperiments[0]
                                                                            .metrics?.[
                                                                            metric
                                                                        ],
                                                                    );
                                                                const isBaseline =
                                                                    experiment.experiment_id ===
                                                                    selectedExperiments[0]
                                                                        .experiment_id;
                                                                const improvement =
                                                                    isBaseline
                                                                        ? 0
                                                                        : getMetricImprovement(
                                                                              metric,
                                                                              Number(
                                                                                  value,
                                                                              ),
                                                                              baselineValue,
                                                                          );
                                                                return (
                                                                    <td
                                                                        key={
                                                                            experiment.experiment_id
                                                                        }
                                                                        className={`p-3 text-sm ${
                                                                            isBest
                                                                                ? "font-bold text-green-700 bg-green-50"
                                                                                : "text-gray-900"
                                                                        }`}
                                                                    >
                                                                        {value ==
                                                                        null
                                                                            ? "—"
                                                                            : Number(
                                                                                  value,
                                                                              ).toFixed(
                                                                                  4,
                                                                              )}
                                                                        {isBest &&
                                                                            " ★"}
                                                                        {isBaseline && (
                                                                            <span className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                                                Baseline
                                                                            </span>
                                                                        )}
                                                                        {!isBaseline &&
                                                                            value !=
                                                                                null &&
                                                                            improvement !==
                                                                                null && (
                                                                                <span
                                                                                    className={`ml-2 inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                                                                                        improvement >
                                                                                        0
                                                                                            ? "bg-green-100 text-green-700"
                                                                                            : improvement <
                                                                                                0
                                                                                              ? "bg-red-100 text-red-700"
                                                                                              : "bg-gray-100 text-gray-600"
                                                                                    }`}
                                                                                >
                                                                                    {" "}
                                                                                    {improvement >
                                                                                    0
                                                                                        ? "+"
                                                                                        : ""}
                                                                                    {improvement.toFixed(
                                                                                        2,
                                                                                    )}

                                                                                    %
                                                                                </span>
                                                                            )}
                                                                    </td>
                                                                );
                                                            },
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                                <p className="font-medium text-gray-700">
                                    No experiments selected for comparison
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Select at least 2 experiments above and
                                    click Compare Selected.
                                </p>
                            </div>
                        )}
                    </article>
                </section>
    );
}
