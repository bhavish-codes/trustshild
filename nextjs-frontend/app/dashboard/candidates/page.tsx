"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Candidate } from "@/lib/types";
import toast from "react-hot-toast";
import CandidateFormModal from "@/components/CandidateFormModal";
import { Plus, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

const STATUSES = ["ALL", "PENDING", "VERIFIED", "PARTIAL", "FAILED"];

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "10" });
      if (debouncedSearch) p.append("search", debouncedSearch);
      if (status !== "ALL") p.append("status", status);
      const res = await api.get(`/candidates?${p}`);
      setCandidates(res.data.data.candidates);
      setTotalPages(res.data.data.pagination.totalPages || 1);
      setTotal(res.data.data.pagination.total);
    } catch { toast.error("Failed to load candidates"); }
    finally { setLoading(false); }
  }, [debouncedSearch, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} and all their verification records?`)) return;
    try { await api.delete(`/candidates/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const statusBadge = (s: string) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>;

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "3px" }}>Candidates</h1>
          <p style={{ fontSize: "13px", color: "#5a6478" }}>{total} total records</p>
        </div>
        <button className="btn btn-dark" onClick={() => { setEditCandidate(null); setShowForm(true); }}>
          <Plus size={15} /> Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "220px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8b95a8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, PAN..."
            className="field-input" style={{ paddingLeft: "32px" }} />
        </div>
        <div style={{ position: "relative" }}>
          <Filter size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8b95a8" }} />
          <select value={status} onChange={e => setStatus(e.target.value)} className="field-input"
            style={{ paddingLeft: "30px", paddingRight: "30px", minWidth: "150px", cursor: "pointer", appearance: "none" }}>
            {STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "20px" }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
                {[200, 180, 100, 100, 80, 80].map((w, j) => (
                  <div key={j} className="skeleton" style={{ height: "16px", width: `${w}px` }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {["Full Name", "Email / Phone", "Aadhaar", "PAN", "Status", "Added", "Actions"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#8b95a8" }}>
                    No candidates found.{" "}
                    <button onClick={() => setShowForm(true)} style={{ color: "#1a6bfa", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }}>
                      Add one now →
                    </button>
                  </td>
                </tr>
              ) : candidates.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/dashboard/candidates/${c.id}`} style={{ fontWeight: "500", color: "#0d1117" }}
                      className="hover:text-blue-600" onMouseEnter={e => (e.currentTarget.style.color = "#1a6bfa")} onMouseLeave={e => (e.currentTarget.style.color = "#0d1117")}>
                      {c.fullName}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontSize: "13.5px" }}>{c.email}</div>
                    <div style={{ fontSize: "12px", color: "#8b95a8" }}>{c.phone}</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "12.5px", color: "#5a6478" }}>{c.aadhaarNumber}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "12.5px", color: "#5a6478" }}>{c.panNumber}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td style={{ color: "#8b95a8", fontSize: "12.5px" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-outline" style={{ height: "28px", padding: "0 10px", fontSize: "12px" }}
                        onClick={() => router.push(`/dashboard/candidates/${c.id}`)}>View</button>
                      <button className="btn btn-ghost" style={{ height: "28px", padding: "0 10px", fontSize: "12px" }}
                        onClick={() => { setEditCandidate(c); setShowForm(true); }}>Edit</button>
                      <button onClick={() => handleDelete(c.id, c.fullName)}
                        style={{ height: "28px", padding: "0 10px", fontSize: "12px", background: "none", border: "none", cursor: "pointer", color: "#dc2626", borderRadius: "5px" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "12.5px", color: "#8b95a8" }}>Page {page} of {totalPages}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn btn-outline" style={{ height: "30px", padding: "0 10px", fontSize: "12.5px" }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button className="btn btn-outline" style={{ height: "30px", padding: "0 10px", fontSize: "12.5px" }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <CandidateFormModal candidate={editCandidate} onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}
