"use client";

import type { AnalyticsResponse } from "../lib/types";

type AnalyticsDashboardProps = {
  analytics: AnalyticsResponse;
  isLoading: boolean;
  onRefresh: () => void;
};

export default function AnalyticsDashboard({
  analytics,
  isLoading,
  onRefresh,
}: AnalyticsDashboardProps) {
  const totalSessions =
    analytics.status.processing +
    analytics.status.completed +
    analytics.status.failed;

  const completionRate =
    totalSessions > 0
      ? Math.round((analytics.status.completed / totalSessions) * 100)
      : 0;

  const failureRate =
    totalSessions > 0
      ? Math.round((analytics.status.failed / totalSessions) * 100)
      : 0;

  const maxTrendUploads =
    analytics.trends.length > 0
      ? Math.max(...analytics.trends.map((point) => point.uploads), 1)
      : 1;

  const recentTrends = analytics.trends.slice(-7);

  return (
    <section className="analytics-panel">
      <div className="analytics-header-row">
        <div>
          <h2 className="analytics-title">Pipeline Health</h2>
          <p className="analytics-subtitle">
            Live metrics from processed CSV sessions
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="analytics-kpis">
        <article className="kpi-card">
          <p className="kpi-label">Total Users</p>
          <p className="kpi-value">{analytics.totalUsers.toLocaleString()}</p>
        </article>

        <article className="kpi-card">
          <p className="kpi-label">Upload Sessions</p>
          <p className="kpi-value">{totalSessions.toLocaleString()}</p>
        </article>

        <article className="kpi-card">
          <p className="kpi-label">Completion Rate</p>
          <p className="kpi-value">{completionRate}%</p>
        </article>

        <article className="kpi-card kpi-danger">
          <p className="kpi-label">Failure Rate</p>
          <p className="kpi-value">{failureRate}%</p>
        </article>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card">
          <h3>Session Status</h3>
          <div className="status-breakdown">
            <div className="status-item">
              <span>Processing</span>
              <strong>
                {analytics.status.processing.toLocaleString()}
              </strong>
            </div>
            <div className="status-item">
              <span>Completed</span>
              <strong>{analytics.status.completed.toLocaleString()}</strong>
            </div>
            <div className="status-item">
              <span>Failed</span>
              <strong>{analytics.status.failed.toLocaleString()}</strong>
            </div>
          </div>
        </article>

        <article className="analytics-card">
          <h3>Upload Trend (Last 7 Days)</h3>
          <div className="trend-list">
            {recentTrends.length === 0 && (
              <p className="empty-copy">No upload history yet.</p>
            )}
            {recentTrends.map((point) => (
              <div key={point._id} className="trend-item">
                <span>{point._id}</span>
                <div className="trend-track">
                  <div
                    className="trend-fill"
                    style={{
                      width: `${Math.round(
                        (point.uploads / maxTrendUploads) * 100
                      )}%`,
                    }}
                  />
                </div>
                <strong>{point.uploads}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card">
          <h3>Age Distribution</h3>
          <div className="list-table">
            {analytics.ageDistribution.map((bucket) => (
              <div key={String(bucket._id)} className="list-row">
                <span>{bucket._id}</span>
                <strong>{bucket.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card">
          <h3>Top Email Domains</h3>
          <div className="list-table">
            {analytics.domains.length === 0 && (
              <p className="empty-copy">No domain data yet.</p>
            )}
            {analytics.domains.map((domain) => (
              <div key={domain._id} className="list-row">
                <span>{domain._id}</span>
                <strong>{domain.count}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
