"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import DropZone from "../components/DropZone";
import UploadProgress from "../components/UploadProgress";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { uploadFile, createProgressStream, fetchAnalytics } from "../lib/api";
import type { ProgressData, UploadStatus, AnalyticsResponse } from "../lib/types";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const [progress, setProgress] = useState<ProgressData>({
    processed: 0,
    total: 0,
    valid: 0,
    invalid: 0,
    percentage: 0,
  });

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Analytics request failed", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const { jobId: newJobId } = await uploadFile(file);
      setJobId(newJobId);
      setStatus("processing");
      setProgress({
        processed: 0,
        total: 0,
        valid: 0,
        invalid: 0,
        percentage: 0,
      });
    } catch (err) {
      console.error("Upload failed", err);
      setStatus("failed");
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (status === "completed") {
      fetchAnalyticsData();
    }
  }, [status, fetchAnalyticsData]);

  useEffect(() => {
    if (!jobId) return;

    const eventSource = createProgressStream(jobId);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "completed") {
        setStatus("completed");
        setProgress((prev) => ({ ...prev, ...data }));
        return;
      }

      if (data.type === "failed") {
        setStatus("failed");
        setProgress((prev) => ({ ...prev, ...data }));
        return;
      }

      setStatus("processing");
      setProgress((prev) => ({ ...prev, ...data }));
    };

    eventSource.onerror = () => {
      console.error("Unexpected SSE disconnect");
      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId]);

  return (
    <>
      <div className="noise" />
      <div className="glow-orb" />

      <div className="page">
        <Header />

        <div className="hero">
          <h1>
            Process CSVs<br />
            <span>at scale.</span>
          </h1>
          <p>Upload your file and watch validation happen live.</p>
        </div>

        <DropZone file={file} onFileSelect={setFile} />

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2v8M5 5l3-3 3 3M3 12h10"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Begin Processing
        </button>

        {jobId && (
          <UploadProgress jobId={jobId} status={status} progress={progress} />
        )}

        <div className="divider analytics-divider">
          <div className="divider-line" />
          <span className="divider-text">Analytics Dashboard</span>
          <div className="divider-line" />
        </div>

        {analytics && (
          <AnalyticsDashboard
            analytics={analytics}
            isLoading={analyticsLoading}
            onRefresh={fetchAnalyticsData}
          />
        )}
      </div>
    </>
  );
}
