const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function authorizedRequest(getToken, path, options = {}) {
    const token = await getToken();
    if (!token) {
        throw new Error("Authentication required. Please sign in again.");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "Request failed. Please try again.");
    }

    return data;
}

export async function listDatasets(getToken) {
    const data = await authorizedRequest(getToken, "/api/datasets");
    return data.datasets || [];
}

export function getDataset(getToken, datasetId) {
    return authorizedRequest(getToken, `/api/datasets/${datasetId}`);
}

export function deleteDataset(getToken, datasetId) {
    return authorizedRequest(getToken, `/api/datasets/${datasetId}`, {
        method: "DELETE",
    });
}

export async function listExperiments(getToken) {
    const data = await authorizedRequest(getToken, "/api/experiments");
    return data.experiments || [];
}

export function getExperiment(getToken, experimentId) {
    return authorizedRequest(getToken, `/api/experiments/${experimentId}`);
}

export function deleteExperiment(getToken, experimentId) {
    return authorizedRequest(getToken, `/api/experiments/${experimentId}`, {
        method: "DELETE",
    });
}

export function trainModel(getToken, fields) {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return authorizedRequest(getToken, "/api/models/train", {
        method: "POST",
        body: formData,
    });
}
