export default function SavedDatasets({
    datasets,
    isLoading,
    error,
    loadingDatasetId,
    deletingDatasetId,
    onLoad,
    onDelete,
}) {
    return (
        <section id="saved-datasets" className="mt-8">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Your Saved Datasets</h2>
                <p className="mt-1 text-sm text-(--muted)">
                    Datasets you&apos;ve uploaded previously.
                </p>
            </div>
            <div className="rounded-2xl border border-(--border) bg-white p-5">
                {isLoading ? (
                    <p className="text-sm text-(--muted)">Loading your datasets...</p>
                ) : error ? (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                ) : datasets.length === 0 ? (
                    <p className="text-sm text-(--muted)">
                        No saved datasets yet. Upload a CSV file to get started.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {datasets.map((item) => (
                            <div
                                key={item.dataset_id}
                                onClick={() => onLoad(item.dataset_id)}
                                className="flex cursor-pointer flex-wrap items-center justify-between gap-4 rounded-xl border border-(--border) p-4 transition hover:border-blue-400 hover:bg-blue-50/50"
                            >
                                <div className="min-w-0 flex-1">
                                    {loadingDatasetId === item.dataset_id && (
                                        <p className="text-xs text-blue-600">
                                            Loading dataset...
                                        </p>
                                    )}
                                    <p className="truncate text-sm font-semibold">
                                        {item.filename}
                                    </p>
                                    <p className="mt-1 text-xs text-(--muted)">
                                        {item.rows.toLocaleString()} rows · {item.columns} columns
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-(--muted)">
                                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            dateStyle: "medium",
                                        })}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onDelete(item.dataset_id);
                                        }}
                                        disabled={deletingDatasetId === item.dataset_id}
                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingDatasetId === item.dataset_id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
