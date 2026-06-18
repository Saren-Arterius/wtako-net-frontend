"use client";

import { Layout } from "@/components/Layout";
import { observer } from "mobx-react-lite";
import Link from "next/link";

const Page = observer(() => {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/services/aur-audit"
          className="inline-flex items-center gap-2 text-subtitle hover:text-highlight transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to AUR Audit
        </Link>
        <h1 className="text-3xl text-highlight font-light">AUR Audit API</h1>
        <p className="text-subtitle mt-1">HTTP API for querying AUR package security-audit results</p>
      </div>

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
        <h2 className="text-xl text-highlight font-medium">Base URL</h2>
        <code className="block bg-black/30 rounded-lg p-4 text-sm text-green-300">
          https://aur-audit.wtako.net
        </code>
        <p className="text-subtitle text-sm">All responses are JSON. No authentication required.</p>
      </div>

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
        <h2 className="text-xl text-highlight font-medium">GET /packages</h2>
        <p className="text-subtitle">Paginated feed of audit results, newest first.</p>

        <div>
          <h3 className="text-sm font-medium text-highlight mb-2">Query Parameters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 font-medium">Parameter</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-subtitle">
                <tr>
                  <td className="py-2"><code className="text-orange-300">filter</code></td>
                  <td>string</td>
                  <td>scanned, red, yellow, or black</td>
                </tr>
                <tr>
                  <td className="py-2"><code className="text-orange-300">before</code></td>
                  <td>number</td>
                  <td>Cursor from previous response's nextCursor</td>
                </tr>
                <tr>
                  <td className="py-2"><code className="text-orange-300">limit</code></td>
                  <td>number</td>
                  <td>Page size (default: 100, max: 500)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-highlight mb-2">Response</h3>
          <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-green-300">{`{
  "packages": [
    {
      "guid": "abc123...",
      "packageName": "example-package",
      "title": "Example Package 1.0.0",
      "link": "https://aur.archlinux.org/packages/example-package",
      "description": "An example package",
      "status": "scanned",
      "pubDate": "Thu, 01 Jan 2026 00:00:00 GMT",
      "pubDateTs": 1735689600000,
      "version": "1.0.0",
      "analysisOn": 1735689700000,
      "aurUrl": "https://aur.archlinux.org/packages/example-package",
      "blackFlags": [],
      "redFlags": ["Obfuscation detected in PKGBUILD"],
      "yellowFlags": ["Network download detected"]
    }
  ],
  "nextCursor": 12345
}`}</code>
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-medium text-highlight mb-2">Examples</h3>
          <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm text-subtitle">
            <code>{`# Latest 100 results
curl 'https://aur-audit.wtako.net/packages'

# RED-flagged packages, 50 per page
curl 'https://aur-audit.wtako.net/packages?filter=red&limit=50'

# Next page
curl 'https://aur-audit.wtako.net/packages?before=12345'`}</code>
          </pre>
        </div>
      </div>

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
        <h2 className="text-xl text-highlight font-medium">GET /package-analysis</h2>
        <p className="text-subtitle">Fetch the latest analysis for specific packages by name.</p>

        <div>
          <h3 className="text-sm font-medium text-highlight mb-2">Query Parameters</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 font-medium">Parameter</th>
                <th className="text-left py-2 font-medium">Required</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-subtitle">
              <tr>
                <td className="py-2"><code className="text-orange-300">names</code></td>
                <td>Yes</td>
                <td>Comma-separated package names (max 200)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-sm font-medium text-highlight mb-2">Response</h3>
          <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-green-300">{`{
  "packages": {
    "codex-native-git": { /* PackageResult */ },
    "seanime": { /* PackageResult */ },
    "unknown-pkg": null
  }
}`}</code>
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-medium text-highlight mb-2">Examples</h3>
          <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm text-subtitle">
            <code>{`# Single package
curl 'https://aur-audit.wtako.net/package-analysis?names=codex-native-git'

# Multiple packages
curl 'https://aur-audit.wtako.net/package-analysis?names=codex-native-git,seanime'`}</code>
          </pre>
        </div>
      </div>

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
        <h2 className="text-xl text-highlight font-medium">PackageResult Schema</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 font-medium">Field</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-subtitle">
              <tr>
                <td className="py-2"><code className="text-orange-300">guid</code></td>
                <td>string</td>
                <td>Internal record ID</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">packageName</code></td>
                <td>string | null</td>
                <td>AUR package base name</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">status</code></td>
                <td>string</td>
                <td>scanned, scanning, or error</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">pubDateTs</code></td>
                <td>number</td>
                <td>Unix timestamp (milliseconds)</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">version</code></td>
                <td>string | null</td>
                <td>Analyzed package version</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">aurUrl</code></td>
                <td>string</td>
                <td>Canonical AUR page URL</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">blackFlags</code></td>
                <td>string[]</td>
                <td>Confirmed malicious findings</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">redFlags</code></td>
                <td>string[]</td>
                <td>High-risk findings</td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-orange-300">yellowFlags</code></td>
                <td>string[]</td>
                <td>Potential concerns</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 space-y-4">
        <h2 className="text-xl text-highlight font-medium">GET /health</h2>
        <p className="text-subtitle">Liveness probe.</p>
        <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm">
          <code className="text-green-300">{`{
  "status": "ok",
  "timestamp": 1718500000000
}`}</code>
        </pre>
      </div>
    </div>
  );
});

export default function AurAuditDocsPage() {
  return (
    <Layout>
      <Page />
    </Layout>
  );
}
