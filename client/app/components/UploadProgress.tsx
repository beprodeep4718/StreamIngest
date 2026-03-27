"use client";

import type { ProgressData, UploadStatus } from "../lib/types";

type UploadProgressProps = {
  jobId: string;
  status: UploadStatus;
  progress: ProgressData;
};

export default function UploadProgress({
  jobId,
  status,
  progress,
}: UploadProgressProps) {
  const validRate =
    progress.total > 0
      ? Math.round((progress.valid / progress.total) * 100)
      : 0;

  const invalidRate =
    progress.total > 0
      ? Math.round((progress.invalid / progress.total) * 100)
      : 0;

  return (
    <>
      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">Live Output</span>
        <div className="divider-line" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Job Execution</span>
          <span className={`status-pill ${status}`}>
            <span
              className={`status-dot ${
                status === "processing" ? "pulse" : ""
              }`}
            />
            {status}
          </span>
        </div>

        <div className="panel-body">
          {/* Job ID */}
          <div className="job-row">
            <span className="job-label">Job ID</span>
            <span className="job-id">{jobId}</span>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Processed</div>
              <div className="stat-value">
                {progress.processed.toLocaleString()}
              </div>
              <div className="stat-sub">
                of {progress.total.toLocaleString()} rows
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Rows</div>
              <div className="stat-value">
                {progress.total.toLocaleString()}
              </div>
              <div className="stat-sub">detected in file</div>
            </div>
            <div className="stat-card highlight-green">
              <div className="stat-label">Valid</div>
              <div className="stat-value">
                {progress.valid.toLocaleString()}
              </div>
              <div className="stat-sub">{validRate}% pass rate</div>
            </div>
            <div className="stat-card highlight-red">
              <div className="stat-label">Invalid</div>
              <div className="stat-value">
                {progress.invalid.toLocaleString()}
              </div>
              <div className="stat-sub">{invalidRate}% fail rate</div>
            </div>
          </div>

          {/* Main progress bar */}
          <div className="progress-section">
            <div className="progress-meta">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-pct">{progress.percentage}%</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${
                  status === "processing" ? "animating" : ""
                } ${status === "completed" ? "done" : ""}`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="progress-counts">
              <span>{progress.processed.toLocaleString()} rows processed</span>
              <span>
                {(progress.total - progress.processed).toLocaleString()}{" "}
                remaining
              </span>
            </div>
          </div>

          {/* Valid/Invalid split bar */}
          {progress.processed > 0 && (
            <>
              <div className="split-track">
                <div
                  className="split-valid"
                  style={{ width: `${validRate}%` }}
                />
                <div
                  className="split-invalid"
                  style={{ width: `${invalidRate}%` }}
                />
              </div>
              <div className="split-labels">
                <span style={{ color: "var(--green)" }}>
                  ▪ {validRate}% valid
                </span>
                <span style={{ color: "var(--red)" }}>
                  {invalidRate}% invalid ▪
                </span>
              </div>
            </>
          )}

          {/* Completion banners */}
          {status === "completed" && (
            <div className="completion-banner success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M5 8l2.5 2.5L11 5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Processing complete — all rows validated.
            </div>
          )}

          {status === "failed" && (
            <div className="completion-banner error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M8 5v3.5M8 11h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Job failed — please try again.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
