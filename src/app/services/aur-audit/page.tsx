"use client";

import { Layout } from "@/components/Layout";
import { store } from "@/store/store";
import { aurAuditStore, FilterType } from "@/store/AurAuditStore";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { ContentPageHeader } from "@/components/ContentPageHeader";
import Link from "next/link";

const filterOptions = [
  { key: "scanned", label: "Scanned" },
  { key: "black", label: "Black" },
  { key: "red", label: "Red" },
  { key: "yellow", label: "Yellow" },
] as const;

const Page = observer(() => {
  const { packages, filter, search, hasMore, isLoading, error, setFilter, setSearch, nextPage, prevPage, canGoPrev, refresh } = aurAuditStore;
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d${hours % 24}h`;
  };

  useEffect(() => {
    refresh();
  }, [filter, refresh]);

  useEffect(() => {
    const names = search.split(",").map(s => s.trim()).filter(Boolean);
    if (names.length > 0) {
      aurAuditStore.fetchByNames(names);
    } else {
      refresh();
    }
  }, [search, refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!aurAuditStore.cursor) refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scanned": return "bg-green-500/20 text-green-300";
      case "scanning": return "bg-yellow-500/20 text-yellow-300";
      case "error": return "bg-red-500/20 text-red-300";
      default: return "bg-white/10 text-subtitle";
    }
  };

  const filteredPackages = packages;

  return (
    <div className="space-y-6">
      <ContentPageHeader
        title="AUR Audit"
        subtitle="Security scan results for AUR packages"
        filterOptions={filterOptions.map(o => ({ ...o, label: store.t(o.label) }))}
        filterKey={filter}
        onFilterChange={(key) => setFilter(key as FilterType)}
        sortByLatest={false}
        onSortToggle={() => { }}
        hideSortButton={true}
      />

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-subtitle">
            <div>⚫ <strong>{store.t("Black")}:</strong> {store.t("Confirmed malicious")}</div>
            <div>🔴 <strong>{store.t("Red")}:</strong> {store.t("Suspicious indicators")}</div>
            <div>🟡 <strong>{store.t("Yellow")}:</strong> {store.t("Likely minor issues")}</div>
          </div>
          <Link
            href="/services/aur-audit/docs"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span>API Docs</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={searchInput.includes(",") ? store.t("Search by names (comma-separated)...") : store.t("Search by name or comma-separated list...")}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-subtitle placeholder-subtitle/40 focus:outline-none focus:border-highlight/50 transition-colors"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 rounded-lg border border-red-500/30 p-4">
          <p className="text-subtitle text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.guid}
            className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 h-40 overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a
                    href={pkg.aurUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-highlight font-medium truncate hover:underline"
                  >
                    {pkg.packageName || "Unknown"}
                  </a>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(pkg.status)}`}>
                    {store.t(pkg.status)}
                  </span>
                  {pkg.version && (
                    <span className="text-subtitle text-sm min-w-0 hidden md:inline-block max-w-[150px] truncate" title={pkg.version}>{pkg.version}</span>
                  )}
                </div>
                <p className="text-subtitle text-sm mt-1">{pkg.description}</p>
              </div>
              <span className="text-subtitle text-sm whitespace-nowrap" title={new Date(pkg.pubDateTs).toISOString()}>
                {formatTimeAgo(pkg.pubDateTs)}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {pkg.blackFlags.length > 0 && (
                <div>
                  <p className="text-subtitle text-sm font-medium mb-1">
                    ⚫ {store.t("Black Flags")} ({pkg.blackFlags.length}):
                  </p>
                  <ul className="text-subtitle text-sm space-y-0.5">
                    {pkg.blackFlags.map((flag, i) => (
                      <li key={i}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.redFlags.length > 0 && (
                <div>
                  <p className="text-subtitle text-sm font-medium mb-1">
                    🔴 {store.t("Red Flags")} ({pkg.redFlags.length}):
                  </p>
                  <ul className="text-subtitle text-sm space-y-0.5">
                    {pkg.redFlags.map((flag, i) => (
                      <li key={i}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.yellowFlags.length > 0 && (
                <div>
                  <p className="text-subtitle text-sm font-medium mb-1">
                    🟡 {store.t("Yellow Flags")} ({pkg.yellowFlags.length}):
                  </p>
                  <ul className="text-subtitle text-sm space-y-0.5">
                    {pkg.yellowFlags.map((flag, i) => (
                      <li key={i}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.blackFlags.length === 0 && pkg.redFlags.length === 0 && pkg.yellowFlags.length === 0 && (
                <p className="text-subtitle text-sm text-green-300">{store.t("No issues detected")}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && packages.length === 0 && !error && (
        <div className="bg-white/4 rounded-xl backdrop-blur-md p-12 border border-white/10 text-center w-full">
          <p className="text-subtitle">{store.t("No packages found")}</p>
        </div>
      )}

      {isLoading && <div className="text-subtitle text-center py-4">{store.t("Loading...")}</div>}

      {(!isLoading || packages.length > 0) && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { window.scrollTo({ top: 0 }); prevPage(); }}
            disabled={!canGoPrev() || isLoading}
            className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${!canGoPrev() || isLoading ? "bg-white/10 text-subtitle opacity-50 cursor-not-allowed" : "bg-highlight text-white hover:bg-highlight/80"}`}
          >
            ◀ {store.t("Previous")}
          </button>
          <button
            onClick={() => { window.scrollTo({ top: 0 }); nextPage(); }}
            disabled={!hasMore || isLoading}
            className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${!hasMore || isLoading ? "bg-white/10 text-subtitle opacity-50 cursor-not-allowed" : "bg-highlight text-white hover:bg-highlight/80"}`}
          >
            {store.t("Next")} ▶
          </button>
        </div>
      )}
    </div>
  );
});

export default function AurAuditPage() {
  return (
    <Layout>
      <Page />
    </Layout>
  );
}
