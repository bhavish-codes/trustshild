"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Candidate } from "@/lib/types";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { Calendar, Download, RefreshCw, Layers } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/candidates?limit=100");
        setCandidates(res.data.data.candidates);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = candidates.length;
  const verified = candidates.filter(c => c.status === "VERIFIED").length;
  const failed = candidates.filter(c => c.status === "FAILED").length;
  const partial = candidates.filter(c => c.status === "PARTIAL").length;
  const pending = candidates.filter(c => c.status === "PENDING").length;

  const passRate = total > 0 ? ((verified / (total - pending || 1)) * 100).toFixed(1) : "94.2";

  const kpis = [
    { label: "AVG. TURNAROUND TIME", value: "1.4 Days", sub: "12% improvement", up: true },
    { label: "VERIFICATION PASS RATE", value: `${passRate}%`, sub: "+0.8% vs last month", up: true },
    { label: "ACTIVE REQUESTS", value: String(pending), sub: "Stable volume", up: null },
    { label: "TOTAL SPEND", value: "$12,480", sub: "$2.1k increase", up: true },
  ];

  const trendData = [
    { name: "Jan", total: 42, verified: 38 },
    { name: "Feb", total: 58, verified: 52 },
    { name: "Mar", total: 72, verified: 67 },
    { name: "Apr", total: 64, verified: 58 },
    { name: "May", total: 95, verified: 88 },
  ];

  const passFailData = [
    { name: "Aadhaar", Passed: verified, Failed: failed, Flagged: partial },
    { name: "PAN", Passed: Math.max(0, verified - 1), Failed: Math.max(0, failed + 1), Flagged: partial },
  ];

  const typeData = [
    { name: "Aadhaar ID Verification", value: 65, color: "#1a6bfa" },
    { name: "PAN Document Match", value: 35, color: "#6366f1" },
  ];

  return (
    <div style={{ padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "3px" }}>Analytics Dashboard</h1>
          <p style={{ fontSize: "13px", color: "#5a6478" }}>Performance metrics and verification trend analysis.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-outline" style={{ height: "34px" }}>
            <Download size={14} /> Download Full Export
          </button>
          <button className="btn btn-dark" style={{ height: "34px" }}>Schedule Report</button>
        </div>
      </div>

      {/* Date filter bar */}
      <div className="card" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#5a6478" }}>
          <span style={{ textTransform: "uppercase", fontWeight: "600", fontSize: "10.5px", color: "#8b95a8" }}>Date Range:</span>
          <input type="date" defaultValue="2024-01-01" className="field-input" style={{ width: "130px", height: "30px" }} />
          <span>to</span>
          <input type="date" defaultValue="2024-10-31" className="field-input" style={{ width: "130px", height: "30px" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#5a6478" }}>
          <span style={{ textTransform: "uppercase", fontWeight: "600", fontSize: "10.5px", color: "#8b95a8" }}>Entity:</span>
          <select className="field-input" style={{ width: "160px", height: "30px" }}>
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Operations</option>
            <option>Human Resources</option>
          </select>
        </div>

        <button className="btn btn-primary" style={{ height: "30px", padding: "0 12px", fontSize: "12.5px" }}>
          Update View
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "22px" }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: "10.5px", fontWeight: "600", color: "#8b95a8", letterSpacing: "0.03em", marginBottom: "8px" }}>{kpi.label}</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0d1117" }}>{kpi.value}</p>
            {kpi.sub && (
              <p style={{ fontSize: "12px", marginTop: "4px", color: kpi.up ? "#16a34a" : kpi.up === false ? "#dc2626" : "#5a6478" }}>
                {kpi.up ? "▲ " : kpi.up === false ? "▼ " : ""}
                {kpi.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 lg:grid-cols-2">
        {/* Trend Area Chart */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "13.5px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Verification Volume Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid stroke="#f1f3f7" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#1a6bfa" fill="#eef3ff" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pass vs Fail Rates */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "13.5px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Pass vs. Fail Rates</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={passFailData}>
              <CartesianGrid stroke="#f1f3f7" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Passed" fill="#16a34a" stackId="a" />
              <Bar dataKey="Failed" fill="#dc2626" stackId="a" />
              <Bar dataKey="Flagged" fill="#d97706" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnaround Time Histogram */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "13.5px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Turnaround Time Distribution</h3>
          <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: "6px", border: "1px dashed var(--border)" }}>
            <span style={{ fontSize: "13px", color: "#8b95a8" }}>Histogram: Count vs. Completion Days</span>
          </div>
        </div>

        {/* Verification Type Breakdown */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "13.5px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Verification Type Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75}>
                {typeData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
