"use client";

import { Layout } from "@/components/Layout";
import { store } from "@/store/store";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";

interface PackageResult {
  guid: string;
  packageName: string | null;
  title: string;
  link: string;
  description: string;
  status: "scanned" | "scanning" | "error";
  pubDate: string;
  pubDateTs: number;
  version: string | null;
  analysisOn: number | null;
  aurUrl: string;
  blackFlags: string[];
  redFlags: string[];
  yellowFlags: string[];
}

type FilterType = "scanned" | "red" | "yellow" | "black";

const AURAUDITPage = observer(() => {
  const [packages, setPackages] = useState<PackageResult[]>([]);
  const [filter, setFilter] = useState<FilterType>("scanned");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("https://aur-audit.wtako.net/packages");
      if (filter !== "scanned") {
        url.searchParams.set("filter", filter);
      }
      url.searchParams.set("limit", "20");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setPackages(data.packages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    fetchPackages();
  }, [filter]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPackages();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPackages]);

  const filteredPackages = packages.filter((pkg) =>
    pkg.packageName?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPackages.length / 20);
  const paginatedPackages = filteredPackages.slice((page - 1) * 20, page * 20);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scanned":
        return "bg-green-500/20 text-green-300";
      case "scanning":
        return "bg-yellow-500/20 text-yellow-300";
      case "error":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-white/10 text-subtitle";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl text-highlight font-light">{store.t("AUR Audit")}</h1>
          <p className="text-subtitle mt-1">{store.t("Security scan results for AUR packages")}</p>
        </div>

        {/* Controls */}
        <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {(["scanned", "red", "yellow", "black"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? "bg-highlight text-white"
                    : "bg-white/10 text-subtitle hover:bg-white/20"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={store.t("Search packages...")}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-subtitle placeholder-subtitle/40 focus:outline-none focus:border-highlight/50 transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 rounded-lg border border-red-500/30 p-4">
            <p className="text-subtitle text-red-200">{error}</p>
          </div>
        )}

        {/* Packages list */}
        <div className="space-y-4">
          {paginatedPackages.map((pkg) => (
            <div
              key={pkg.guid}
              className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-highlight font-medium truncate">
                      {pkg.packageName || "Unknown"}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status}
                    </span>
                    {pkg.version && (
                      <span className="text-subtitle text-sm">{pkg.version}</span>
                    )}
                  </div>
                  <p className="text-subtitle text-sm truncate">{pkg.title}</p>
                  <a
                    href={pkg.aurUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-highlight/80 text-sm hover:underline inline-block mt-1"
                  >
                    {pkg.aurUrl}
                  </a>
                </div>
                <span className="text-subtitle text-sm whitespace-nowrap">
                  {new Date(pkg.pubDateTs).toLocaleDateString()}
                </span>
              </div>

              {/* Flags */}
              <div className="mt-4 space-y-2">
                {pkg.blackFlags.length > 0 && (
                  <div>
                    <p className="subtitle text-sm font-medium mb-1">
                      ⚫ Black Flags ({pkg.blackFlags.length}):
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
                      🔴 Red Flags ({pkg.redFlags.length}):
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
                      🟡 Yellow Flags ({pkg.yellowFlags.length}):
                    </p>
                    <ul className="text-subtitle text-sm space-y-0.5">
                      {pkg.yellowFlags.map((flag, i) => (
                        <li key={i}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {pkg.blackFlags.length === 0 &&
                  pkg.redFlags.length === 0 &&
                  pkg.yellowFlags.length === 0 && (
                    <p className="text-subtitle text-sm text-green-300">
                      No issues detected
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-subtitle text-center py-4">
            Loading...
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`cursor-pointer px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                page === 1 ? "bg-white/10 text-subtitle" : "bg-highlight text-white hover:bg-highlight/80"
              }`}
            >
              ◀ Previous
            </button>
            <span className="text-subtitle">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`cursor-pointer px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                page === totalPages ? "bg-white/10 text-subtitle" : "bg-highlight text-white hover:bg-highlight/80"
              }`}
            >
              Next ▶
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && packages.length === 0 && !error && (
          <div className="bg-white/4 rounded-xl backdrop-blur-md p-12 border border-white/10 text-center">
            <p className="text-subtitle">No packages found</p>
          </div>
        )}
      </div>
    </Layout>
  );
});

export default function AurAuditPage() {
  return (
    <Layout>
      <AURAUDITPage />
    </Layout>
  );
}
