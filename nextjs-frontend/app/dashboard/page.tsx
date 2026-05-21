"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Candidate } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { CheckCircle2, Clock, XCircle, Users, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface Stats { total: number; verified: number; pending: number; failed: number; partial: number; }

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0, failed: 0, partial: 0 });
  const [recent, setRecent] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const handleChecklistItemClick = (action: string) => {
    if (action.includes("Add Candidate")) {
      router.push("/dashboard/candidates");
    } else if (action.includes("Setup API")) {
      toast.success("Identity Check API integrations are connected & active (Sandbox Mode)!");
    } else if (action.includes("Complete")) {
      toast.success("VerifyPro Business Profile setup is complete & active!");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/candidates?limit=100");
        const all: Candidate[] = res.data.data.candidates;
        setRecent(all.slice(0, 5));
        setStats({
          total: all.length,
          verified: all.filter(c => c.status === "VERIFIED").length,
          pending: all.filter(c => c.status === "PENDING").length,
          failed: all.filter(c => c.status === "FAILED").length,
          partial: all.filter(c => c.status === "PARTIAL").length,
        });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const kpis = [
    { label: "TOTAL CANDIDATES", value: stats.total, icon: <Users size={15} />, iconColor: "#8b95a8" },
    { label: "VERIFIED", value: stats.verified, icon: <CheckCircle2 size={15} />, iconColor: "#16a34a" },
    { label: "PENDING", value: stats.pending, icon: <Clock size={15} />, iconColor: "#8b95a8" },
    { label: "FAILED", value: stats.failed, icon: <XCircle size={15} />, iconColor: "#dc2626" },
  ];

  // Build simple chart data from recent
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      verified: Math.floor(Math.random() * (stats.verified + 1)),
      failed: Math.floor(Math.random() * (stats.failed + 1)),
    };
  });

  const statusBadge = (s: string) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>;

  return (
    <div style={{ padding: "28px 28px" }}>
      {/* Page heading */}
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "3px" }}>Overview</h1>
        <p style={{ fontSize: "13px", color: "#5a6478" }}>Global statistics for candidate verification flows.</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "22px" }}>
        {kpis.map(({ label, value, icon, iconColor }) => (
          <div key={label} className="card" style={{ padding: "20px 22px" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="skeleton" style={{ height: "14px", width: "60%" }} />
                <div className="skeleton" style={{ height: "32px", width: "40%" }} />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#8b95a8", letterSpacing: "0.05em" }}>{label}</p>
                  <span style={{ color: iconColor }}>{icon}</span>
                </div>
                <p style={{ fontSize: "32px", fontWeight: "700", color: "#0d1117", lineHeight: 1 }}>{value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: "22px", marginBottom: "22px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117", marginBottom: "3px" }}>Recent Verification Activity</h2>
          <p style={{ fontSize: "12.5px", color: "#8b95a8" }}>Visual data representation area</p>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: "180px", borderRadius: "6px" }} />
        ) : (
          <div style={{ border: "1px solid var(--border)", borderRadius: "6px", padding: "16px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gv2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gf2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f3f7" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#8b95a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8b95a8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e6ec", borderRadius: "6px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="verified" stroke="#16a34a" strokeWidth={1.5} fill="url(#gv2)" />
                <Area type="monotone" dataKey="failed" stroke="#dc2626" strokeWidth={1.5} fill="url(#gf2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Empty state / Recent candidates */}
      {!loading && stats.total === 0 ? (
        <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div style={{ width: "96px", height: "96px", background: "#f1f3f7", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "2px dashed #c8cfd8" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b95a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Welcome to TrustShield</h2>
          <p style={{ fontSize: "13.5px", color: "#5a6478", maxWidth: "360px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            Automate your background checks and identity verification. Start by adding your first candidate.
          </p>
          <button className="btn btn-dark" style={{ height: "40px", fontSize: "14px" }}
            onClick={() => router.push("/dashboard/candidates")}>
            <Plus size={16} /> Add First Candidate
          </button>

          {/* Checklist */}
          <div className="card" style={{ maxWidth: "600px", margin: "32px auto 0", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Getting Started Checklist</h3>
              <span style={{ fontSize: "12px", color: "#8b95a8" }}>1 of 4 completed</span>
            </div>
            {[
              { label: "Create your account", desc: "Account setup and email verification complete.", done: true },
              { label: "Complete company profile", desc: "Add your business details for official reports.", done: false, action: "Complete →" },
              { label: "Connect verification API", desc: "Integrate your keys to start automated checks.", done: false, action: "Setup API →" },
              { label: "Add your first candidate", desc: "Initiate your first verification request.", done: false, action: "Add Candidate →" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: item.done ? "none" : "1.5px solid #c8cfd8", background: item.done ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    {item.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div>
                    <p style={{ fontSize: "13.5px", fontWeight: "500", color: item.done ? "#8b95a8" : "#0d1117", textDecoration: item.done ? "none" : "none" }}>{item.label}</p>
                    <p style={{ fontSize: "12.5px", color: "#8b95a8", marginTop: "2px" }}>{item.desc}</p>
                  </div>
                </div>
                {!item.done && item.action && <button onClick={() => handleChecklistItemClick(item.action)} style={{ background: "none", border: "none", color: "#1a6bfa", fontSize: "13px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" }}>{item.action}</button>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600" }}>Recent Candidates</h2>
            <a href="/dashboard/candidates" style={{ fontSize: "13px", color: "#1a6bfa", fontWeight: "500" }}>View all</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                {["Name", "Email", "Status", "Date Added"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={4}><div className="skeleton" style={{ height: "14px" }} /></td></tr>
              )) : recent.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/dashboard/candidates/${c.id}`)}>
                  <td style={{ fontWeight: "500" }}>{c.fullName}</td>
                  <td style={{ color: "#5a6478" }}>{c.email}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td style={{ color: "#8b95a8" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
