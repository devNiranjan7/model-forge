"use client";

export default function DashboardModals({
    selectedExperiment, isFilterModalOpen, onCloseExperiment, onCloseFilter,
    draftFilters, onDraftFiltersChange, available, onResetDraft, onApply,
}) {
    const { draftModelFilter, draftTargetFilter, draftTaskFilter, draftExperimentSort } = draftFilters;
    const { setDraftModelFilter, setDraftTargetFilter, setDraftTaskFilter, setDraftExperimentSort } = onDraftFiltersChange;
    const { availableExperimentModels, availableExperimentTargets } = available;
    return (<>
                {selectedExperiment && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={onCloseExperiment}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="experiment-modal-title"
                            onClick={(event) => event.stopPropagation()}
                            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                        Experiment details
                                    </p>
                                    <h2
                                        id="experiment-modal-title"
                                        className="mt-1 text-xl font-semibold text-gray-900"
                                    >
                                        {selectedExperiment.model}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={onCloseExperiment}
                                    className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-100"
                                >
                                    Close ✕
                                </button>
                            </div>
                            <div className="mt-6">
                                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                                    Training configuration
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {[
                                        [
                                            "Dataset",
                                            selectedExperiment.dataset_filename,
                                        ],
                                        [
                                            "Task type",
                                            selectedExperiment.task_type,
                                        ],
                                        [
                                            "Target column",
                                            selectedExperiment.target_column,
                                        ],
                                        [
                                            "Test split",
                                            `${selectedExperiment.test_size * 100}%`,
                                        ],
                                        [
                                            "Random state",
                                            selectedExperiment.random_state,
                                        ],
                                        [
                                            "Training rows",
                                            selectedExperiment.train_rows,
                                        ],
                                        [
                                            "Testing rows",
                                            selectedExperiment.test_rows,
                                        ],
                                        [
                                            "Feature count",
                                            selectedExperiment.feature_count,
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="rounded-xl bg-gray-50 p-4"
                                        >
                                            <p className="text-xs text-gray-500">
                                                {label}
                                            </p>
                                            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                                                {value ?? "—"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                                    Evaluation metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {Object.entries(
                                        selectedExperiment.metrics || {},
                                    ).map(([metric, value]) => (
                                        <div
                                            key={metric}
                                            className="rounded-xl border border-gray-200 p-4"
                                        >
                                            <p className="text-xs uppercase text-gray-500">
                                                {metric.replaceAll("_", " ")}
                                            </p>
                                            <p className="mt-2 text-lg font-semibold text-gray-900">
                                                {value == null
                                                    ? "—"
                                                    : Number(value).toFixed(4)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {isFilterModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
                        onClick={onCloseFilter}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="filter-modal-title"
                            onClick={(event) => event.stopPropagation()}
                            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
                        >
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <h2
                                    id="filter-modal-title"
                                    className="text-lg font-semibold text-gray-900"
                                >
                                    Filter & Sort
                                </h2>
                                <button
                                    type="button"
                                    onClick={onCloseFilter}
                                    aria-label="Close filter modal"
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="experiment-model-filter"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Model
                                    </label>
                                    <select
                                        id="experiment-model-filter"
                                        value={draftModelFilter}
                                        onChange={(e) =>
                                            setDraftModelFilter(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="all">All Models</option>
                                        {availableExperimentModels.map(
                                            (model) => (
                                                <option
                                                    key={model}
                                                    value={model}
                                                >
                                                    {model}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="experiment-target-filter"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Target Column
                                    </label>
                                    <select
                                        id="experiment-target-filter"
                                        value={draftTargetFilter}
                                        onChange={(e) =>
                                            setDraftTargetFilter(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="all">
                                            All Target Columns
                                        </option>
                                        {availableExperimentTargets.map(
                                            (target) => (
                                                <option
                                                    key={target}
                                                    value={target}
                                                >
                                                    {target}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="experiment-task-filter"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Task Type
                                    </label>
                                    <select
                                        id="experiment-task-filter"
                                        value={draftTaskFilter}
                                        onChange={(e) =>
                                            setDraftTaskFilter(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="all">All Tasks</option>
                                        <option value="regression">
                                            Regression
                                        </option>
                                        <option value="classification">
                                            Classification
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="experiment-sort-filter"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Sort By
                                    </label>
                                    <select
                                        id="experiment-sort-filter"
                                        value={draftExperimentSort}
                                        onChange={(e) =>
                                            setDraftExperimentSort(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                        <option value="best">
                                            Best Performance
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                                <button
                                    type="button"
                                    onClick={onResetDraft}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Reset
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onCloseFilter}
                                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onApply}
                                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:flex-none"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

    </>);
}
