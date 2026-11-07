"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import DatasetUploader from "../components/DatasetUploader.js";
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
import {
    Show,
    SignInButton,
    SignUpButton,
    SignOutButton,
    UserButton,
    useAuth,
} from "@clerk/nextjs";

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
                <Image src="/model-forge-image.png" alt="ModelForge" width={220} height={40} className="rounded-xl flex items-center justify-center" />
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
        setActiveDatasetId(data.dataset_id);
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
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/datasets/${datasetId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Unable to load saved dataset.");
            }
            setDataset(data);
            setActiveDatasetId(data.dataset_id);
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
            const formData = new FormData();
            formData.append("dataset_id", activeDatasetId);
            formData.append("target_column", targetColumn);
            formData.append("task_type", taskType);
            formData.append("test_size", testSize);
            const token = await getToken();
            if (!token) {
                throw new Error(
                    "Authentication required. Please sign in again.",
                );
            }
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/models/train`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.detail || "Model training failed. Please try again.",
                );
            }
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

    async function fetchSavedDatasets() {
        setIsLoadingDatasets(true);
        setDatasetsError("");
        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/datasets`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to load saved datasets.",
                );
            }
            setSavedDatasets(Array.isArray(data) ? data : data.datasets || []);
        } catch (error) {
            setDatasetsError(error.message);
        } finally {
            setIsLoadingDatasets(false);
        }
    }

    async function fetchExperiments() {
        setIsLoadingExperiments(true);
        setExperimentsError("");
        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/experiments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Unable to load experiments.");
            }
            setExperiments(data.experiments || []);
        } catch (error) {
            setExperimentsError(error.message);
        } finally {
            setIsLoadingExperiments(false);
        }
    }

    async function fetchExperimentDetails(experimentId) {
        setIsLoadingExperimentDetails(true);
        setExperimentDetailsError("");
        setSelectedExperiment(null);
        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/experiments/${experimentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to load experiment details.",
                );
            }
            setSelectedExperiment(data);
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
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/experiments/${experimentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Unable to delete experiment.");
            }
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
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/datasets/${datasetId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || "Unable to delete dataset.");
            }
            if (activeDatasetId === datasetId) {
                setDataset(null);
                setActiveDatasetId(null);
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

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            setSavedDatasets([]);
            setExperiments([]);
            return;
        }
        fetchSavedDatasets();
        fetchExperiments();
    }, [isLoaded, isSignedIn, getToken]);

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
        setSelectedExperimentIds([]);
        setIsComparisonActive(false);
    }, [activeDatasetId]);

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
                <header className="flex flex-wrap items-center justify-between gap-4">
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
                <section id="saved-datasets" className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">
                            Your Saved Datasets
                        </h2>
                        <p className="mt-1 text-sm text-(--muted)">
                            Datasets you&apos;ve uploaded previously.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-(--border) bg-white p-5">
                        {isLoadingDatasets ? (
                            <p className="text-sm text-(--muted)">
                                Loading your datasets...
                            </p>
                        ) : datasetsError ? (
                            <p role="alert" className="text-sm text-red-600">
                                {datasetsError}
                            </p>
                        ) : savedDatasets.length === 0 ? (
                            <p className="text-sm text-(--muted)">
                                No saved datasets yet. Upload a CSV file to get
                                started.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {savedDatasets.map((item) => (
                                    <div
                                        key={item.dataset_id}
                                        onClick={() =>
                                            handleLoadSavedDataset(
                                                item.dataset_id,
                                            )
                                        }
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-(--border) p-4 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50/50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            {loadingDatasetId ===
                                                item.dataset_id && (
                                                <p className="text-xs text-blue-600">
                                                    Loading dataset...
                                                </p>
                                            )}
                                            <p className="truncate text-sm font-semibold">
                                                {item.filename}
                                            </p>
                                            <p className="mt-1 text-xs text-(--muted)">
                                                {item.rows.toLocaleString()}{" "}
                                                rows
                                                {" · "}
                                                {item.columns} columns
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-xs text-(--muted)">
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleDateString("en-IN", {
                                                    timeZone: "Asia/Kolkata",
                                                    dateStyle: "medium",
                                                })}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleDeleteDataset(
                                                        item.dataset_id,
                                                    );
                                                }}
                                                disabled={
                                                    deletingDatasetId ===
                                                    item.dataset_id
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingDatasetId ===
                                                item.dataset_id
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
                                Train a baseline model and evaluate its
                                performance on unseen data.
                            </p>
                        </div>
                        <form onSubmit={handleTrainModel} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="target-column"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Target Column
                                </label>
                                <select
                                    id="target-column"
                                    value={targetColumn}
                                    onChange={(e) =>
                                        setTargetColumn(e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-(--border) bg-white p-3 text-sm"
                                >
                                    <option value="">
                                        Select target column
                                    </option>
                                    {Object.keys(
                                        dataset.column_types || {},
                                    ).map((column) => (
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
                                    <label
                                        htmlFor="task-type"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Machine Learning Task
                                    </label>
                                    <select
                                        id="task-type"
                                        value={taskType}
                                        onChange={(e) =>
                                            setTaskType(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-(--border) bg-white p-3 text-sm"
                                    >
                                        <option value="classification">
                                            Classification
                                        </option>
                                        <option value="regression">
                                            Regression
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="test-size"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Test Data Split
                                    </label>
                                    <select
                                        id="test-size"
                                        value={testSize}
                                        onChange={(e) =>
                                            setTestSize(e.target.value)
                                        }
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
                                <p
                                    role="alert"
                                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                                >
                                    {trainingError}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={isTraining || !targetColumn}
                                className="rounded-lg bg-(--forest) px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isTraining
                                    ? "Training Model..."
                                    : "Train Baseline Model"}
                            </button>
                        </form>
                    </section>
                )}
                {trainingResult && (
                    <section className="mt-6 rounded-2xl border border-(--border) bg-white p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Training Results
                            </h2>
                            <p className="mt-2 text-sm text-(--muted)">
                                {trainingResult.model} ·{" "}
                                {trainingResult.task_type}
                            </p>
                        </div>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                {
                                    label: "Training Rows",
                                    value: trainingResult.train_rows,
                                },
                                {
                                    label: "Testing Rows",
                                    value: trainingResult.test_rows,
                                },
                                {
                                    label: "Features Used",
                                    value: trainingResult.feature_count,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl bg-background p-4"
                                >
                                    <p className="text-sm text-(--muted)">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold">
                                        {Number(item.value).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <h3 className="mb-4 font-semibold">
                            Evaluation Metrics
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Object.entries(trainingResult.metrics || {}).map(
                                ([metric, value]) => (
                                    <div
                                        key={metric}
                                        className="rounded-xl border border-(--border) p-4"
                                    >
                                        <p className="text-sm capitalize text-(--muted)">
                                            {metric.replaceAll("_", " ")}
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold">
                                            {value == null
                                                ? "—"
                                                : Number(value).toLocaleString(
                                                      undefined,
                                                      {
                                                          maximumFractionDigits: 4,
                                                      },
                                                  )}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </section>
                )}
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
                <footer className="pb-4 pt-10 text-center text-xs text-(--muted)">
                    ModelForge · Build thoughtfully. Evaluate reliably.
                </footer>
                {selectedExperiment && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setSelectedExperiment(null)}
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
                                    onClick={() => setSelectedExperiment(null)}
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
                        onClick={closeFilterModal}
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
                                    onClick={closeFilterModal}
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
                                    onClick={resetExperimentFilters}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Reset
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeFilterModal}
                                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={applyExperimentFilters}
                                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:flex-none"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
