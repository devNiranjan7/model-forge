"use client";

import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function DatasetUploader({ onUploadSuccess }) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    function validateFile(selectedFile) {
        setError("");
        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
            setFile(null);
            setError("Please choose a CSV file.");
            return;
        }

        if (selectedFile.size === 0) {
            setFile(null);
            setError("This file is empty. Please choose another CSV file.");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setFile(null);
            setError(
                "The file exceeds the 10 MB limit. Please choose a smaller file.",
            );
            return;
        }

        setFile(selectedFile);
    }

    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            validateFile(selectedFile);
        }
        event.target.value = "";
    }

    function handleDrop(event) {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files?.[0];
        if (!droppedFile) {
            return;
        }
        if (event.dataTransfer.files.length > 1) {
            setFile(null);
            setError("Please select one CSV file at a time.");
            return;
        }
        validateFile(droppedFile);
    }

    function clearFile() {
        setFile(null);
        setError("");
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    async function handleUpload() {
        if (!file || isUploading) {
            return;
        }
        setIsUploading(true);
        setError("");
        setUploadResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(
                "http://127.0.0.1:8000/api/datasets/upload",
                { method: "POST", body: formData },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.detail || "Upload failed. Please try again.",
                );
            }
            setUploadResult(data);
            onUploadSuccess(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while uploading.",
            );
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Choose a CSV dataset"
            />
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed px-5 py-10 text-center transition sm:py-14 ${isDragging ? "border-(--primary) bg-(--mint)" : "border-(--accent) bg-background"}`}
            >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--mint) text-2xl">
                    ↑
                </span>
                <h3 className="mt-5 text-lg font-semibold">
                    {file ? "Your dataset is ready" : "Your data starts here"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
                    {file
                        ? "Your file passed the initial checks. Server-side validation will happen when you upload it."
                        : "Choose a CSV dataset or drag and drop it here to get started."}
                </p>
                <p className="mt-4 text-xs text-(--muted)">
                    CSV files · Maximum size 10 MB
                </p>
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 rounded-xl bg-(--forest) px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
                >
                    {file ? "Choose another file" : "Choose CSV file"}
                </button>
                {file && (
                    <div className="mx-auto mt-5 flex max-w-md items-center justify-between gap-3 rounded-xl border border-(--border) bg-white p-4 text-left">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {file.name}
                            </p>
                            <p className="mt-1 text-xs text-(--muted)">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={clearFile}
                            className="shrink-0 rounded-lg px-3 py-2 text-sm text-(--primary) hover:bg-background"
                            aria-label="Remove selected file"
                        >
                            Remove
                        </button>
                    </div>
                )}
                {file && (
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="mt-4 rounded-xl bg-(--primary) px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isUploading
                            ? "Analyzing dataset..."
                            : "Upload and analyze"}
                    </button>
                )}
            </div>
            {uploadResult && (
                <div
                    role="status"
                    className="mt-4 rounded-xl border border-(--border) bg-(--mint) p-4"
                >
                    <p className="font-medium text-(--forest)">
                        Dataset analyzed successfully!
                    </p>
                    <p className="mt-1 text-sm text-(--forest)">
                        {uploadResult.filename} — {uploadResult.rows} rows and{" "}
                        {uploadResult.columns} columns.
                    </p>
                </div>
            )}
            {error && (
                <div
                    role="alert"
                    className="mt-4 flex items-start gap-3 rounded-xl border border-(--rose)/50 bg-[#f6e7e5] p-4 text-sm text-(--forest)"
                >
                    <span aria-hidden="true">!</span>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
