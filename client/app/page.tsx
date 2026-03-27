"use client";

import Link from "next/link";
import Header from "./components/Header";

export default function Home() {
  return (
    <>
      <div className="noise" />
      <div className="glow-orb" />

      <div className="page">
        <Header />

        <div className="hero">
          <h1>
            CSV Processing<br />
            <span>Made Simple.</span>
          </h1>
          <p>Validate, parse, and analyze CSV files at scale with Parsr.</p>
        </div>

        <div className="landing-grid">
          <Link href="/upload" className="landing-card upload-card">
            <div className="card-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M16 4v16M9 11l7-7 7 7M6 24h20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>Upload & Process</h2>
            <p>
              Drop your CSV file and let Parsr handle the validation and
              processing with live progress tracking.
            </p>
          </Link>

          <Link href="/dashboard" className="landing-card dashboard-card">
            <div className="card-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M4 20h7v8H4zM14 12h7v16h-7zM24 6h7v22h-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>View Analytics</h2>
            <p>
              Explore real-time insights about user distribution, processing
              trends, and quality metrics.
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}