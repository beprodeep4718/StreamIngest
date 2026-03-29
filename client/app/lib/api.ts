import type { AnalyticsResponse, UploadResponse } from "./types";

const API_BASE = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1`;

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}

export function createProgressStream(jobId: string): EventSource {
  return new EventSource(`${API_BASE}/progress/${jobId}`);
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE}/analytics/overview`);

  if (!res.ok) {
    throw new Error("Failed to load analytics");
  }

  return res.json();
}
