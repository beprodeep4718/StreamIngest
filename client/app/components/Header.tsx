"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 5h12M2 8h8M2 11h5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <Link href="/" className="logo-text" style={{ textDecoration: "none", color: "inherit" }}>
          Parsr
        </Link>
      </div>
      <span className="badge">CSV PROCESSOR</span>
    </header>
  );
}
