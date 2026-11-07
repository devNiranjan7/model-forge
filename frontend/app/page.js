export const instant = false;

import Image from "next/image";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import CurrentYear from "./components/CurrentYear";
import {
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Check,
    Database,
    FileSpreadsheet,
    FlaskConical,
    GitCompareArrows,
    Layers3,
    Microscope,
    SlidersHorizontal,
    Sparkles,
    Target,
    Upload,
    Zap,
} from "lucide-react";

const features = [
    {
        icon: Database,
        number: "01",
        title: "Dataset exploration",
        description:
            "Upload CSV datasets, inspect their structure, understand column types, identify missing values, and explore data quality.",
    },
    {
        icon: SlidersHorizontal,
        number: "02",
        title: "Data preparation",
        description:
            "Prepare datasets for machine learning through preprocessing, feature engineering, encoding, scaling, and data transformation.",
    },
    {
        icon: FlaskConical,
        number: "03",
        title: "Model training",
        description:
            "Experiment with classification and regression algorithms, configure training runs, and explore different approaches.",
    },
    {
        icon: Target,
        number: "04",
        title: "Hyperparameter tuning",
        description:
            "Explore model configurations, optimize hyperparameters, and discover approaches that can improve performance.",
    },
    {
        icon: BarChart3,
        number: "05",
        title: "Model evaluation",
        description:
            "Understand model performance through evaluation metrics, visualizations, and meaningful performance comparisons.",
    },
    {
        icon: GitCompareArrows,
        number: "06",
        title: "Experiment tracking",
        description:
            "Keep training runs organized, revisit previous experiments, compare models, and track your experimentation progress.",
    },
];

const workflow = [
    {
        number: "01",
        title: "Upload your dataset",
        description:
            "Bring your CSV dataset into ModelForge and get started with your machine learning workflow.",
        icon: Upload,
    },
    {
        number: "02",
        title: "Explore and prepare",
        description:
            "Understand your data, inspect its quality, and prepare it for machine learning.",
        icon: Database,
    },
    {
        number: "03",
        title: "Train and experiment",
        description:
            "Choose algorithms, configure experiments, and explore different model approaches.",
        icon: FlaskConical,
    },
    {
        number: "04",
        title: "Evaluate and compare",
        description:
            "Analyze performance metrics, compare experiments, and understand your results.",
        icon: BarChart3,
    },
    {
        number: "05",
        title: "Track your progress",
        description:
            "Keep your experiments organized and use previous results to guide future experiments.",
        icon: GitCompareArrows,
    },
];

const benefits = [
    {
        icon: Layers3,
        title: "One organized workspace",
        description:
            "Bring datasets, training runs, and experiment results together in one place.",
    },
    {
        icon: Microscope,
        title: "Experiment with confidence",
        description:
            "Explore different algorithms and configurations to understand what works best.",
    },
    {
        icon: BarChart3,
        title: "Understand your results",
        description:
            "Go beyond predictions with meaningful evaluation metrics and visual comparisons.",
    },
    {
        icon: GitCompareArrows,
        title: "Keep track of progress",
        description:
            "Revisit previous experiments and compare your approaches over time.",
    },
];

function SectionLabel({ children }) {
    return (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            {children}
        </div>
    );
}

function PrimaryButton({ children, href = "/sign-up" }) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-green-800 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-900"
        >
            {children}
            <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
            />
        </Link>
    );
}

function ProductPreview() {
    return (
        <div className="relative mx-auto w-full max-w-145">
            <div className="absolute -inset-6 rounded-[40px] bg-green-200/40 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-green-950/10">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-900 text-white">
                            <BarChart3 size={17} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                ModelForge
                            </p>
                            <p className="text-[10px] text-gray-400">
                                ML Workspace
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-500">Workspace</span>
                    </div>
                </div>
                <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[145px_1fr]">
                    <div className="min-h-85 border-r border-gray-100 bg-gray-50/80 p-3 sm:p-4">
                        <p className="mb-4 text-[9px] font-bold tracking-widest text-gray-400 sm:text-[10px]">
                            WORKSPACE
                        </p>
                        {[
                            "Overview",
                            "Dataset Inspector",
                            "Experiments",
                            "Model Comparison",
                        ].map((item, index) => (
                            <div
                                key={item}
                                className={`mb-2 flex items-center gap-2 rounded-lg px-2 py-2.5 text-[9px] sm:gap-3 sm:px-3 sm:text-[11px] ${
                                    index === 0
                                        ? "bg-green-100 font-semibold text-green-900"
                                        : "text-gray-500"
                                }`}
                            >
                                {index === 0 && <BarChart3 size={13} />}
                                {index === 1 && <Database size={13} />}
                                {index === 2 && <FlaskConical size={13} />}
                                {index === 3 && <GitCompareArrows size={13} />}
                                <span>{item}</span>
                            </div>
                        ))}
                        <div className="mt-10 rounded-lg bg-green-950 p-3 text-white">
                            <Sparkles
                                size={15}
                                className="mb-2 text-green-300"
                            />
                            <p className="text-[10px] font-semibold">
                                Your ML journey
                            </p>
                            <p className="mt-1 text-[9px] leading-relaxed text-green-100/70">
                                Explore data. Train models. Compare results.
                            </p>
                        </div>
                    </div>
                    <div className="min-w-0 p-3 sm:p-5">
                        <div className="mb-5">
                            <p className="text-[10px] font-medium text-green-700">
                                YOUR WORKSPACE
                            </p>
                            <h3 className="mt-1 text-base font-bold text-gray-900 sm:text-xl">
                                Dashboard overview
                            </h3>
                            <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                                Your machine learning workspace at a glance.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {[
                                {
                                    label: "Datasets",
                                    value: "04",
                                    icon: Database,
                                },
                                {
                                    label: "Experiments",
                                    value: "12",
                                    icon: FlaskConical,
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-gray-100 p-3 sm:p-4"
                                >
                                    <stat.icon
                                        size={16}
                                        className="mb-3 text-green-700"
                                    />
                                    <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-gray-100 p-3 sm:p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-900">
                                        Model performance
                                    </p>
                                    <p className="mt-1 text-[9px] text-gray-400">
                                        Illustrative experiment comparison
                                    </p>
                                </div>
                                <span className="rounded-md bg-green-50 px-2 py-1 text-[9px] font-medium text-green-800">
                                    Regression
                                </span>
                            </div>
                            <div className="flex h-24 items-end gap-3 border-b border-gray-100 px-2 sm:h-28">
                                {[48, 72, 58, 90, 68, 100, 78, 86, 65, 95].map(
                                    (height, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 rounded-t-sm bg-green-600/80"
                                            style={{ height: `${height}%` }}
                                        />
                                    ),
                                )}
                            </div>
                            <div className="mt-3 flex justify-between text-[9px] text-gray-400">
                                <span>Model A</span>
                                <span>Model B</span>
                                <span>Model C</span>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3">
                            <Check size={15} className="text-green-700" />
                            <p className="text-[9px] text-green-900 sm:text-[10px]">
                                Your experiments, organized in one place.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xl sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-800">
                    <GitCompareArrows size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-900">
                        Compare experiments
                    </p>
                    <p className="text-[10px] text-gray-500">
                        Understand model performance
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <main className="overflow-hidden bg-[#fcfdfb] text-gray-900">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/model-forge-image.png"
                            alt="ModelForge"
                            width={240}
                            height={96}
                            priority
                            className="h-10 w-auto object-contain sm:h-12"
                        />
                    </Link>
                    <div className="hidden items-center gap-8 md:flex">
                        <Link
                            href="#features"
                            className="text-sm font-medium text-gray-600 transition hover:text-green-800"
                        >
                            Features
                        </Link>
                        <Link
                            href="#workflow"
                            className="text-sm font-medium text-gray-600 transition hover:text-green-800"
                        >
                            How it works
                        </Link>
                        <Link
                            href="#why-modelforge"
                            className="text-sm font-medium text-gray-600 transition hover:text-green-800"
                        >
                            Why ModelForge
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Show when="signed-out">
                            <Link
                                href="/sign-in"
                                className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:inline-flex"
                            >
                                Sign in
                            </Link>
                            <PrimaryButton>Get started</PrimaryButton>
                        </Show>
                        <Show when="signed-in">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
                            >
                                Open dashboard
                                <ArrowRight size={16} />
                            </Link>
                        </Show>
                    </div>
                </nav>
                <div className="border-t border-gray-100 px-5 py-3 md:hidden">
                    <div className="flex items-center justify-center gap-7 text-xs font-medium text-gray-600">
                        <Link href="#features">Features</Link>
                        <Link href="#workflow">How it works</Link>
                        <Link href="#why-modelforge">Why ModelForge</Link>
                    </div>
                </div>
            </header>
            <section className="relative px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:px-12 lg:pb-32">
                <div className="pointer-events-none absolute -right-40 -top-40 h-125 w-125 rounded-full bg-green-100/60 blur-3xl" />
                <div className="pointer-events-none absolute -left-40 bottom-0 h-87.5 w-87.5 rounded-full bg-emerald-50 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <SectionLabel>ML experimentation platform</SectionLabel>
                        <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-gray-950 sm:text-5xl lg:text-[62px]">
                            Build. Experiment.{" "}
                            <span className="text-green-800">Improve.</span>
                        </h1>
                        <p className="mt-7 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
                            Your machine learning workflow, all in one place.
                            Explore datasets, train models, evaluate
                            performance, and keep your experiments organized
                            with ModelForge.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Show when="signed-out">
                                <PrimaryButton>
                                    Start experimenting
                                </PrimaryButton>
                                <Link
                                    href="/sign-in"
                                    className="inline-flex items-center gap-2 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:text-green-800"
                                >
                                    Sign in
                                    <ArrowUpRight size={16} />
                                </Link>
                            </Show>
                            <Show when="signed-in">
                                <PrimaryButton href="/dashboard">
                                    Go to dashboard
                                </PrimaryButton>
                            </Show>
                        </div>
                        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-gray-500">
                            <span className="flex items-center gap-2">
                                <Check size={15} className="text-green-700" />
                                Dataset exploration
                            </span>
                            <span className="flex items-center gap-2">
                                <Check size={15} className="text-green-700" />
                                Model evaluation
                            </span>
                            <span className="flex items-center gap-2">
                                <Check size={15} className="text-green-700" />
                                Experiment tracking
                            </span>
                        </div>
                    </div>
                    <ProductPreview />
                </div>
            </section>
            <section className="border-y border-green-100 bg-green-50/70 px-5 py-7 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-5 text-sm font-medium text-green-950/75">
                    <span className="flex items-center gap-2">
                        <FileSpreadsheet size={18} />
                        CSV dataset support
                    </span>
                    <span className="flex items-center gap-2">
                        <Database size={18} />
                        Dataset exploration
                    </span>
                    <span className="flex items-center gap-2">
                        <Zap size={18} />
                        Model training
                    </span>
                    <span className="flex items-center gap-2">
                        <GitCompareArrows size={18} />
                        Experiment comparison
                    </span>
                </div>
            </section>
            <section
                id="features"
                className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <SectionLabel>The experimentation toolkit</SectionLabel>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Everything you need to{" "}
                            <span className="text-green-800">
                                experiment smarter.
                            </span>
                        </h2>
                        <p className="mt-5 text-base leading-7 text-gray-600">
                            From understanding your data to evaluating your
                            models, bring your machine learning experiments
                            together in one organized workspace.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.number}
                                className="group rounded-2xl border border-gray-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-950/5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-800 transition group-hover:bg-green-800 group-hover:text-white">
                                        <feature.icon size={23} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-300">
                                        {feature.number}
                                    </span>
                                </div>
                                <h3 className="mt-7 text-lg font-bold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-gray-500">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section
                id="workflow"
                className="scroll-mt-24 bg-[#f2f7f2] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="grid items-end gap-8 lg:grid-cols-2">
                        <div>
                            <SectionLabel>
                                A clear experimentation process
                            </SectionLabel>
                            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                                Your ML workflow,{" "}
                                <span className="text-green-800">
                                    made simpler.
                                </span>
                            </h2>
                        </div>
                        <p className="max-w-lg text-base leading-8 text-gray-600 lg:justify-self-end">
                            Follow a structured approach to machine learning.
                            Move from raw datasets to trained models and
                            meaningful experiment comparisons.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                        {workflow.map((step) => (
                            <div key={step.number} className="relative">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-200 bg-white text-green-800 shadow-sm">
                                    <step.icon size={23} />
                                </div>
                                <p className="mt-7 text-xs font-bold tracking-widest text-green-700">
                                    STEP {step.number}
                                </p>
                                <h3 className="mt-2 text-lg font-bold text-gray-950">
                                    {step.title}
                                </h3>
                                <p className="mt-3 max-w-xs text-sm leading-7 text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section
                id="why-modelforge"
                className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <SectionLabel>Why ModelForge?</SectionLabel>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Focus on experiments.{" "}
                            <span className="text-green-800">
                                Not the clutter.
                            </span>
                        </h2>
                        <p className="mt-5 text-base leading-7 text-gray-600">
                            Machine learning involves trying, testing,
                            evaluating, and learning. ModelForge is designed to
                            make that process more organized and easier to
                            understand.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="rounded-2xl border border-gray-200 bg-white p-6"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-800">
                                    <benefit.icon size={21} />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-gray-900">
                                    {benefit.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-gray-500">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="bg-[#f2f7f2] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
                <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                    <div className="order-2 lg:order-1">
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-green-950/5 sm:p-8">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                                <div>
                                    <p className="text-xs font-semibold text-green-800">
                                        EXPERIMENT COMPARISON
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-gray-900">
                                        Compare model performance
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-green-50 p-2.5 text-green-800">
                                    <GitCompareArrows size={20} />
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        name: "Random Forest",
                                        score: "0.91",
                                        width: "91%",
                                    },
                                    {
                                        name: "Gradient Boosting",
                                        score: "0.87",
                                        width: "87%",
                                    },
                                    {
                                        name: "Logistic Regression",
                                        score: "0.78",
                                        width: "78%",
                                    },
                                ].map((model, index) => (
                                    <div
                                        key={model.name}
                                        className="rounded-xl border border-gray-100 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-semibold text-gray-800 sm:text-sm">
                                                {model.name}
                                            </p>
                                            <span className="text-sm font-bold text-green-800">
                                                {model.score}
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full ${
                                                    index === 0
                                                        ? "bg-green-700"
                                                        : "bg-green-500/70"
                                                }`}
                                                style={{
                                                    width: model.width,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-[10px] text-gray-400">
                                Illustrative comparison. Values are sample data,
                                not live model results.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <SectionLabel>Built for experimentation</SectionLabel>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Understand your models.{" "}
                            <span className="text-green-800">
                                Not just their predictions.
                            </span>
                        </h2>
                        <p className="mt-6 text-base leading-8 text-gray-600">
                            Every experiment gives you information. ModelForge
                            helps keep that information organized so you can
                            revisit your runs, evaluate metrics, and make
                            meaningful comparisons.
                        </p>
                        <ul className="mt-8 space-y-4">
                            {[
                                "Keep a record of previous training runs",
                                "Review model evaluation metrics",
                                "Compare experiments side by side",
                                "Manage your saved datasets",
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 text-sm text-gray-700"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
                                        <Check size={13} />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/dashboard"
                            className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-green-800 transition hover:gap-3"
                        >
                            Explore your workspace
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>
            <section className="px-5 pb-24 pt-24 sm:px-8 lg:px-12 lg:pb-28">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl bg-green-950 px-7 py-16 text-center sm:px-12 sm:py-20">
                    <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-45 border-green-800/40" />
                    <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-green-800/30 blur-2xl" />
                    <div className="relative mx-auto max-w-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-800 text-green-100">
                            <Sparkles size={23} />
                        </div>
                        <h2 className="mt-7 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Your next experiment starts here.
                        </h2>
                        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-green-100/70 sm:text-base">
                            Bring your datasets, explore different models, and
                            make your machine learning experimentation workflow
                            more organized with ModelForge.
                        </p>
                        <div className="mt-9 flex flex-wrap justify-center gap-4">
                            <Show when="signed-out">
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-950 transition hover:-translate-y-0.5 hover:bg-green-50"
                                >
                                    Start experimenting
                                    <ArrowRight size={17} />
                                </Link>
                                <Link
                                    href="/sign-in"
                                    className="inline-flex items-center rounded-xl border border-green-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-900"
                                >
                                    Sign in
                                </Link>
                            </Show>
                            <Show when="signed-in">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-950 transition hover:bg-green-50"
                                >
                                    Open dashboard
                                    <ArrowRight size={17} />
                                </Link>
                            </Show>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="border-t border-gray-200 bg-white px-5 py-10 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex flex-col items-center gap-2 sm:items-start">
                        <Link href="/">
                            <Image
                                src="/model-forge-image.png"
                                alt="ModelForge"
                                width={160}
                                height={36}
                                className="h-9 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-xs text-gray-500">
                            Build thoughtfully. Experiment confidently.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-500">
                        <Link
                            href="#features"
                            className="transition hover:text-green-800"
                        >
                            Features
                        </Link>
                        <Link
                            href="#workflow"
                            className="transition hover:text-green-800"
                        >
                            How it works
                        </Link>
                        <Link
                            href="#why-modelforge"
                            className="transition hover:text-green-800"
                        >
                            Why ModelForge
                        </Link>
                        <Show when="signed-out">
                            <Link
                                href="/sign-in"
                                className="transition hover:text-green-800"
                            >
                                Sign in
                            </Link>
                        </Show>
                        <Show when="signed-in">
                            <Link
                                href="/dashboard"
                                className="transition hover:text-green-800"
                            >
                                Dashboard
                            </Link>
                        </Show>
                    </div>
                    <p className="text-xs text-gray-400">
                        © <CurrentYear /> ModelForge
                    </p>
                </div>
            </footer>
        </main>
    );
}
