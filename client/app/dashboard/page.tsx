"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { fetchAnalytics } from "../lib/api";
import type { AnalyticsResponse } from "../lib/types";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Analytics request failed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();

    const interval = setInterval(fetchAnalyticsData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  return (
    <>
      <div className="noise" />
      <div className="glow-orb" />

      <div className="page">
        <Header />

        <div className="hero">
          <h1>
            Analytics<br />
            <span>Dashboard.</span>
          </h1>
          <p>Monitor your CSV processing pipeline in real-time.</p>
        </div>

        {analytics ? (
          <AnalyticsDashboard
            analytics={analytics}
            isLoading={isLoading}
            onRefresh={fetchAnalyticsData}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-muted)" }}>Loading analytics...</p>
          </div>
        )}
      </div>
    </>
  );
}
