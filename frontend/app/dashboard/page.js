"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DatasetUploader from "../components/DatasetUploader.js";
import Sidebar from "./components/Sidebar.js";
import OverviewCard from "./components/OverviewCard.js";
import DashboardHeader from "./components/DashboardHeader.js";
import SavedDatasets from "./components/SavedDatasets.js";
import TrainingPanel from "./components/TrainingPanel.js";
import DatasetAnalysis from "./components/DatasetAnalysis.js";
import ExperimentWorkspace from "./components/ExperimentWorkspace.js";
import DashboardModals from "./components/DashboardModals.js";
import {
    deleteDataset,
    deleteExperiment,
    getDataset,
    getExperiment,
    listDatasets,
    listExperiments,
    trainModel,
} from "../../lib/api.js";
import {
    useAuth,
} from "@clerk/nextjs";


export default function Home() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [dataset, setDataset] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [trainingResult, setTrainingResult] = useState(null);
    const [selectedHistogram, setSelectedHistogram] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [taskType, setTaskType] = useState("classification");
    const [targetColumn, setTargetColumn] = useState("");
    const [testSize, setTestSize] = useState("0.2");
    const [isTraining, setIsTraining] = useState(false);
    const [trainingError, setTrainingError] = useState("");
    const [savedDatasets, setSavedDatasets] = useState([]);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
    const [datasetsError, setDatasetsError] = useState("");
    const [loadingDatasetId, setLoadingDatasetId] = useState(null);
    const [activeDatasetId, setActiveDatasetId] = useState(null);
    const [deletingDatasetId, setDeletingDatasetId] = useState(null);
    const [experiments, setExperiments] = useState([]);
    const [isLoadingExperiments, setIsLoadingExperiments] = useState(false);
    const [experimentsError, setExperimentsError] = useState("");
    const [selectedExperiment, setSelectedExperiment] = useState(null);
    const [isLoadingExperimentDetails, setIsLoadingExperimentDetails] =
        useState(false);
    const [experimentDetailsError, setExperimentDetailsError] = useState("");
    const [deletingExperimentId, setDeletingExperimentId] = useState(null);
    const [selectedExperimentIds, setSelectedExperimentIds] = useState([]);
    const [isComparisonActive, setIsComparisonActive] = useState(false);
    const [selectedComparisonMetric, setSelectedComparisonMetric] =
        useState("auto");
    const [experimentSort, setExperimentSort] = useState("newest");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [experimentModelFilter, setExperimentModelFilter] = useState("all");
    const [experimentTargetFilter, setExperimentTargetFilter] = useState("all");
    const [experimentTaskFilter, setExperimentTaskFilter] = useState("all");
    const [draftModelFilter, setDraftModelFilter] = useState("all");
    const [draftTargetFilter, setDraftTargetFilter] = useState("all");
    const [draftTaskFilter, setDraftTaskFilter] = useState("all");
    const [draftExperimentSort, setDraftExperimentSort] = useState("newest");

    const analysisRef = useRef(null);
    const comparisonRef = useRef(null);

    const filteredExperiments = activeDatasetId
        ? experiments.filter((experiment) => {
              const matchesDataset = experiment.dataset_id === activeDatasetId;
              const matchesModel =
                  experimentModelFilter === "all" ||
                  experiment.model === experimentModelFilter;
              const matchesTarget =
                  experimentTargetFilter === "all" ||
                  experiment.target_column === experimentTargetFilter;
              const matchesTask =
                  experimentTaskFilter === "all" ||
                  experiment.task_type === experimentTaskFilter;
              return (
                  matchesDataset && matchesModel && matchesTarget && matchesTask
              );
          })
        : [];

    const sortedExperiments = [...filteredExperiments].sort((a, b) => {
        if (experimentSort === "newest") {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        if (experimentSort === "oldest") {
            return new Date(a.created_at) - new Date(b.created_at);
        }
        if (experimentSort === "best") {
            const metric = a.task_type === "regression" ? "r2" : "f1_weighted";
            return (
                Number(b.metrics?.[metric] ?? -Infinity) -
                Number(a.metrics?.[metric] ?? -Infinity)
            );
        }
        return 0;
    });

    const selectedExperiments = experiments.filter(
        (experiment) =>
            experiment.dataset_id === activeDatasetId &&
            selectedExperimentIds.includes(experiment.experiment_id),
    );

    const availableExperimentModels = [
        ...new Set(
            filteredExperiments
                .map((experiment) => experiment.model)
                .filter(Boolean),
        ),
    ].sort();

    const availableExperimentTargets = [
        ...new Set(
            filteredExperiments
                .map((experiment) => experiment.target_column)
                .filter(Boolean),
        ),
    ].sort();

    const activeExperimentFilterCount = [
        experimentModelFilter !== "all",
        experimentTargetFilter !== "all",
        experimentTaskFilter !== "all",
    ].filter(Boolean).length;

    const availableComparisonMetrics = Object.keys(
        selectedExperiments[0]?.metrics || {},
    );

    const primaryMetric =
        selectedComparisonMetric === "auto"
            ? selectedExperiments[0]?.task_type === "regression"
                ? "r2"
                : "f1_weighted"
            : selectedComparisonMetric;

    const comparisonMetricValues = selectedExperiments
        .map((experiment) => Number(experiment.metrics?.[primaryMetric]))
        .filter(Number.isFinite);

    const bestMetricValue =
        selectedExperiments.length >= 2 && comparisonMetricValues.length > 0
            ? comparisonMetricValues.reduce((best, value) =>
                  isBetterMetric(primaryMetric, value, best) ? value : best,
              )
            : null;

    const bestExperiments = selectedExperiments.filter(
        (experiment) =>
            Number.isFinite(Number(experiment.metrics?.[primaryMetric])) &&
            Number(experiment.metrics?.[primaryMetric]) === bestMetricValue,
    );

    const comparisonChartData = selectedExperiments
        .map((experiment, index) => ({
            model: `${experiment.model} #${index + 1}`,
            score: Number(experiment.metrics?.[primaryMetric]),
        }))
        .filter((experiment) => Number.isFinite(experiment.score));

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
        dataset?.histograms?.[
            histogramColumns.includes(selectedHistogram)
                ? selectedHistogram
                : histogramColumns[0]
        ]?.map((bin) => ({
            range: `${bin.bin_start.toFixed(1)}-${bin.bin_end.toFixed(1)}`,
            count: bin.count,
        })) || [];

    const categoricalColumns = dataset
        ? Object.keys(dataset.categorical_distributions || {}).filter(
              (column) => dataset.categorical_distributions[column].length > 0,
          )
        : [];

    const categoricalData =
        dataset?.categorical_distributions?.[
            categoricalColumns.includes(selectedCategory)
                ? selectedCategory
                : categoricalColumns[0]
        ] || [];

    const effectiveSelectedHistogram =
        histogramColumns.includes(selectedHistogram)
            ? selectedHistogram
            : histogramColumns[0] || "";
    const effectiveSelectedCategory =
        categoricalColumns.includes(selectedCategory)
            ? selectedCategory
            : categoricalColumns[0] || "";

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
        setActiveDatasetId(data.dataset_id);
        setSelectedExperimentIds([]);
        setIsComparisonActive(false);
        setTrainingResult(null);
        setTrainingError("");
        setTargetColumn("");
        fetchSavedDatasets();
        analysisRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    async function handleLoadSavedDataset(datasetId) {
        setLoadingDatasetId(datasetId);
        setDatasetsError("");
        try {
            const data = await getDataset(getToken, datasetId);
            setDataset(data);
            setActiveDatasetId(data.dataset_id);
            setSelectedExperimentIds([]);
            setIsComparisonActive(false);
            setSelectedFile(null);
            setTrainingResult(null);
            setTrainingError("");
            setTargetColumn("");
            analysisRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        } catch (error) {
            setDatasetsError(error.message);
        } finally {
            setLoadingDatasetId(null);
        }
    }

    async function handleTrainModel(event) {
        event.preventDefault();
        if (!activeDatasetId || !targetColumn || isTraining) {
            return;
        }
        setIsTraining(true);
        setTrainingError("");
        setTrainingResult(null);
        try {
            const data = await trainModel(getToken, {
                dataset_id: activeDatasetId,
                target_column: targetColumn,
                task_type: taskType,
                test_size: testSize,
            });
            setTrainingResult(data);
            await fetchExperiments();
        } catch (error) {
            setTrainingError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while training the model.",
            );
        } finally {
            setIsTraining(false);
        }
    }

    const fetchSavedDatasets = useCallback(async () => {
        setIsLoadingDatasets(true);
        setDatasetsError("");
        try {
            setSavedDatasets(await listDatasets(getToken));
        } catch (error) {
            setDatasetsError(error.message);
        } finally {
            setIsLoadingDatasets(false);
        }
    }, [getToken]);

    const fetchExperiments = useCallback(async () => {
        setIsLoadingExperiments(true);
        setExperimentsError("");
        try {
            setExperiments(await listExperiments(getToken));
        } catch (error) {
            setExperimentsError(error.message);
        } finally {
            setIsLoadingExperiments(false);
        }
    }, [getToken]);

    async function fetchExperimentDetails(experimentId) {
        setIsLoadingExperimentDetails(true);
        setExperimentDetailsError("");
        setSelectedExperiment(null);
        try {
            setSelectedExperiment(await getExperiment(getToken, experimentId));
        } catch (error) {
            setExperimentDetailsError(error.message);
        } finally {
            setIsLoadingExperimentDetails(false);
        }
    }

    async function handleDeleteExperiment(experimentId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this experiment? This action cannot be undone.",
        );
        if (!confirmed) return;
        setDeletingExperimentId(experimentId);
        setExperimentsError("");
        try {
            await deleteExperiment(getToken, experimentId);
            setExperiments((prev) =>
                prev.filter(
                    (experiment) => experiment.experiment_id !== experimentId,
                ),
            );
            if (selectedExperiment?.experiment_id === experimentId) {
                setSelectedExperiment(null);
            }
            setSelectedExperimentIds((prev) =>
                prev.filter((id) => id !== experimentId),
            );
        } catch (error) {
            setExperimentsError(error.message);
        } finally {
            setDeletingExperimentId(null);
        }
    }

    async function handleDeleteDataset(datasetId) {
        setDeletingDatasetId(datasetId);
        setDatasetsError("");
        try {
            await deleteDataset(getToken, datasetId);
            if (activeDatasetId === datasetId) {
                setDataset(null);
                setActiveDatasetId(null);
                setSelectedExperimentIds([]);
                setIsComparisonActive(false);
                setSelectedFile(null);
                setTrainingResult(null);
                setTrainingError("");
                setTargetColumn("");
            }
            await fetchSavedDatasets();
        } catch (error) {
            setDatasetsError(error.message);
        } finally {
            setDeletingDatasetId(null);
        }
    }

    function toggleExperimentSelection(experiment) {
        setSelectedExperimentIds((prev) => {
            const isSelected = prev.includes(experiment.experiment_id);
            if (isSelected) {
                return prev.filter((id) => id !== experiment.experiment_id);
            }
            if (prev.length >= 4) {
                setExperimentsError(
                    "You can compare a maximum of 4 experiments.",
                );
                return prev;
            }
            if (
                prev.length > 0 &&
                experiments.find((item) => item.experiment_id === prev[0])
                    ?.task_type !== experiment.task_type
            ) {
                setExperimentsError(
                    "Please select experiments with the same task type.",
                );
                return prev;
            }
            setExperimentsError("");
            return [...prev, experiment.experiment_id];
        });
    }

    function isBetterMetric(metric, value, bestValue) {
        const lowerIsBetter = ["mae", "rmse", "mse", "log_loss"];
        return lowerIsBetter.includes(metric.toLowerCase())
            ? value < bestValue
            : value > bestValue;
    }

    function getMetricDirection(metric) {
        const lowerIsBetter = ["mae", "rmse", "mse", "log_loss"];
        return lowerIsBetter.includes(metric.toLowerCase())
            ? "↓ Lower is better"
            : "↑ Higher is better";
    }

    function getMetricImprovement(metric, currentValue, baselineValue) {
        if (
            !Number.isFinite(currentValue) ||
            !Number.isFinite(baselineValue) ||
            baselineValue === 0
        ) {
            return null;
        }
        const lowerIsBetter = ["mae", "rmse", "mse", "log_loss"];
        const improvement = lowerIsBetter.includes(metric.toLowerCase())
            ? baselineValue - currentValue
            : currentValue - baselineValue;
        return (improvement / Math.abs(baselineValue)) * 100;
    }

    function openFilterModal() {
        setDraftModelFilter(experimentModelFilter);
        setDraftTargetFilter(experimentTargetFilter);
        setDraftTaskFilter(experimentTaskFilter);
        setDraftExperimentSort(experimentSort);
        setIsFilterModalOpen(true);
    }

    function closeFilterModal() {
        setIsFilterModalOpen(false);
    }

    function applyExperimentFilters() {
        setExperimentModelFilter(draftModelFilter);
        setExperimentTargetFilter(draftTargetFilter);
        setExperimentTaskFilter(draftTaskFilter);
        setExperimentSort(draftExperimentSort);
        setIsFilterModalOpen(false);
    }

    function resetExperimentFilters() {
        setDraftModelFilter("all");
        setDraftTargetFilter("all");
        setDraftTaskFilter("all");
        setDraftExperimentSort("newest");
    }

    function resetAppliedExperimentFilters() {
        setExperimentModelFilter("all");
        setExperimentTargetFilter("all");
        setExperimentTaskFilter("all");
        setExperimentSort("newest");

        setDraftModelFilter("all");
        setDraftTargetFilter("all");
        setDraftTaskFilter("all");
        setDraftExperimentSort("newest");
    }

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            return;
        }
        fetchSavedDatasets();
        fetchExperiments();
    }, [
        isLoaded,
        isSignedIn,
        fetchSavedDatasets,
        fetchExperiments,
    ]);

    useEffect(() => {
        if (!selectedExperiment) return;
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setSelectedExperiment(null);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedExperiment]);

    useEffect(() => {
        if (!isFilterModalOpen) return;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsFilterModalOpen(false);
            }
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFilterModalOpen]);

    return (
        <div className="min-h-screen md:h-screen md:overflow-hidden md:flex">
            <Sidebar />
            <main className="min-w-0 flex-1 md:overflow-y-auto px-5 py-7 sm:px-8 lg:px-10">
                <DashboardHeader />
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
                            onFileSelected={(file) => {
                                setSelectedFile(file);
                                setTrainingResult(null);
                            }}
                        />
                    </div>
                </section>
                <SavedDatasets
                    datasets={savedDatasets}
                    isLoading={isLoadingDatasets}
                    error={datasetsError}
                    loadingDatasetId={loadingDatasetId}
                    deletingDatasetId={deletingDatasetId}
                    onLoad={handleLoadSavedDataset}
                    onDelete={handleDeleteDataset}
                />
                <DatasetAnalysis
                    analysisRef={analysisRef}
                    dataset={dataset}
                    missingChartData={missingChartData}
                    columnTypeData={columnTypeData}
                    histogramColumns={histogramColumns}
                    histogramData={histogramData}
                    selectedHistogram={effectiveSelectedHistogram}
                    onSelectedHistogramChange={setSelectedHistogram}
                    categoricalColumns={categoricalColumns}
                    categoricalData={categoricalData}
                    selectedCategory={effectiveSelectedCategory}
                    onSelectedCategoryChange={setSelectedCategory}
                />
                <TrainingPanel
                    dataset={dataset}
                    activeDatasetId={activeDatasetId}
                    targetColumn={targetColumn}
                    taskType={taskType}
                    testSize={testSize}
                    isTraining={isTraining}
                    trainingError={trainingError}
                    trainingResult={trainingResult}
                    onTargetColumnChange={setTargetColumn}
                    onTaskTypeChange={setTaskType}
                    onTestSizeChange={setTestSize}
                    onTrain={handleTrainModel}
                />
                <ExperimentWorkspace
                    comparisonRef={comparisonRef}
                    state={{
                        filteredExperiments, sortedExperiments, experiments, activeDatasetId,
                        isLoadingExperiments, experimentsError, isLoadingExperimentDetails,
                        experimentDetailsError, deletingExperimentId, selectedExperimentIds,
                        activeExperimentFilterCount, isComparisonActive, selectedExperiments,
                        availableComparisonMetrics, selectedComparisonMetric, primaryMetric,
                        comparisonChartData, bestExperiments, bestMetricValue,
                    }}
                    actions={{
                        openFilterModal, resetAppliedExperimentFilters,
                        toggleExperimentSelection, fetchExperimentDetails, handleDeleteExperiment,
                        setSelectedExperimentIds, setIsComparisonActive, setSelectedComparisonMetric,
                        isBetterMetric, getMetricDirection, getMetricImprovement,
                    }}
                />
                <footer className="pb-4 pt-10 text-center text-xs text-(--muted)">
                    ModelForge · Build thoughtfully. Evaluate reliably.
                </footer>
                <DashboardModals
                    selectedExperiment={selectedExperiment}
                    isFilterModalOpen={isFilterModalOpen}
                    onCloseExperiment={() => setSelectedExperiment(null)}
                    onCloseFilter={closeFilterModal}
                    draftFilters={{ draftModelFilter, draftTargetFilter, draftTaskFilter, draftExperimentSort }}
                    onDraftFiltersChange={{ setDraftModelFilter, setDraftTargetFilter, setDraftTaskFilter, setDraftExperimentSort }}
                    available={{ availableExperimentModels, availableExperimentTargets }}
                    onResetDraft={resetExperimentFilters}
                    onApply={applyExperimentFilters}
                />
            </main>
        </div>
    );
}
