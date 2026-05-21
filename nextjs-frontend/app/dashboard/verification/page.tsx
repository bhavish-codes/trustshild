"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Candidate, VerificationLog } from "@/lib/types";
import { Search, Eye, Shield, CheckCircle2, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function VerificationViewPage() {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/candidates?limit=100");
        const all: Candidate[] = res.data.data.candidates;
        const allLogs: VerificationLog[] = [];
        all.forEach(c => {
          if (c.verificationLogs) {
            c.verificationLogs.forEach(l => {
              allLogs.push({
                ...l,
                candidateName: c.fullName,
                candidateEmail: c.email,
              } as any);
            });
          }
        });
        // Sort newest first
        allLogs.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
        setLogs(allLogs);
      } catch {
        toast.error("Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredLogs = logs.filter(l => {
    const str = `${l.verificationType} ${l.verificationStatus} ${(l as any).candidateName || ""}`.toLowerCase();
    return str.includes(search.toLowerCase());
  });

  const statusBadge = (s: string) => {
    return <span className={`badge badge-${s.toLowerCase()} text-xs`}>{s}</span>;
  };

  return (
    <div style={{ padding: "28px" }}>
      {/* Header */}
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "3px" }}>Verification Log Viewer</h1>
        <p style={{ fontSize: "13px", color: "#5a6478" }}>Real-time transaction log of all verification API events.</p>
      </div>

      {/* Search Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8b95a8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by type, status, or candidate..."
            className="field-input" style={{ paddingLeft: "32px" }} />
        </div>
      </div>

      {/* Logs Card */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "20px" }} className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "16px" }} />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {["Candidate", "Verification Type", "Status", "Timestamp", "Payload Preview"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "#8b95a8" }}>
                    No logs found. Run a check to generate real-time events.
                  </td>
                </tr>
              ) : filteredLogs.map((log: any) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontWeight: "500", color: "#0d1117" }}>{log.candidateName}</div>
                    <div style={{ fontSize: "12px", color: "#8b95a8" }}>{log.candidateEmail}</div>
                  </td>
                  <td style={{ fontWeight: "600", fontSize: "12.5px" }}>{log.verificationType}</td>
                  <td>{statusBadge(log.verificationStatus)}</td>
                  <td style={{ color: "#8b95a8", fontSize: "12.5px" }}>{new Date(log.verifiedAt).toLocaleString()}</td>
                  <td>
                    <details style={{ cursor: "pointer" }}>
                      <summary style={{ fontSize: "12px", color: "#1a6bfa", fontWeight: "500" }}>View Details</summary>
                      <pre className="mt-2 p-3 rounded text-xs font-mono" style={{ background: "#0d1117", color: "#3fb950", maxHeight: "150px", overflow: "auto" }}>
                        {JSON.stringify(log.responsePayload, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
