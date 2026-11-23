export default function TrainingPanel({
    dataset,
    activeDatasetId,
    targetColumn,
    taskType,
    testSize,
    isTraining,
    trainingError,
    trainingResult,
    onTargetColumnChange,
    onTaskTypeChange,
    onTestSizeChange,
    onTrain,
}) {
    return (
        <>
            {dataset && activeDatasetId && (
                <section
                    id="training"
                    className="mt-8 rounded-2xl border border-(--border) bg-white p-6 sm:p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">
                            Baseline Model Training
                        </h2>
                        <p className="mt-2 text-sm text-(--muted)">
                            Train a baseline model and evaluate its performance on unseen data.
                        </p>
                    </div>
                    <form onSubmit={onTrain} className="space-y-5">
                        <div>
                            <label htmlFor="target-column" className="mb-2 block text-sm font-medium">
                                Target Column
                            </label>
                            <select
                                id="target-column"
                                value={targetColumn}
                                onChange={(event) => onTargetColumnChange(event.target.value)}
                                required
                                className="w-full rounded-lg border border-(--border) bg-white p-3 text-sm"
                            >
                                <option value="">Select target column</option>
                                {Object.keys(dataset.column_types || {}).map((column) => (
                                    <option key={column} value={column}>
                                        {column}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-(--muted)">
                                Choose the column you want to predict.
                            </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="task-type" className="mb-2 block text-sm font-medium">
                                    Machine Learning Task
                                </label>
                                <select
                                    id="task-type"
                                    value={taskType}
                                    onChange={(event) => onTaskTypeChange(event.target.value)}
                                    className="w-full rounded-lg border border-(--border) bg-white p-3 text-sm"
                                >
                                    <option value="classification">Classification</option>
                                    <option value="regression">Regression</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="test-size" className="mb-2 block text-sm font-medium">
                                    Test Data Split
                                </label>
                                <select
                                    id="test-size"
                                    value={testSize}
                                    onChange={(event) => onTestSizeChange(event.target.value)}
                                    className="w-full rounded-lg border border-(--border) bg-white p-3 text-sm"
                                >
                                    <option value="0.1">10%</option>
                                    <option value="0.2">20%</option>
                                    <option value="0.3">30%</option>
                                    <option value="0.4">40%</option>
                                </select>
                            </div>
                        </div>
                        {trainingError && (
                            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {trainingError}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={isTraining || !targetColumn}
                            className="rounded-lg bg-(--forest) px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isTraining ? "Training Model..." : "Train Baseline Model"}
                        </button>
                    </form>
                </section>
            )}
            {trainingResult && (
                <section className="mt-6 rounded-2xl border border-(--border) bg-white p-6 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">Training Results</h2>
                        <p className="mt-2 text-sm text-(--muted)">
                            {trainingResult.model} · {trainingResult.task_type}
                        </p>
                    </div>
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            { label: "Training Rows", value: trainingResult.train_rows },
                            { label: "Testing Rows", value: trainingResult.test_rows },
                            { label: "Features Used", value: trainingResult.feature_count },
                        ].map((item) => (
                            <div key={item.label} className="rounded-xl bg-background p-4">
                                <p className="text-sm text-(--muted)">{item.label}</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {Number(item.value).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                    <h3 className="mb-4 font-semibold">Evaluation Metrics</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(trainingResult.metrics || {}).map(([metric, value]) => (
                            <div key={metric} className="rounded-xl border border-(--border) p-4">
                                <p className="text-sm capitalize text-(--muted)">
                                    {metric.replaceAll("_", " ")}
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {value == null
                                        ? "—"
                                        : Number(value).toLocaleString(undefined, {
                                              maximumFractionDigits: 4,
                                          })}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
