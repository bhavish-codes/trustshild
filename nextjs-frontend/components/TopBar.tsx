"use client";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Search } from "lucide-react";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/candidates": "Candidates",
  "/dashboard/verification": "Verification View",
  "/dashboard/reports": "Reports & Analytics",
};

export default function TopBar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Build breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = BREADCRUMBS[path] || (seg.length === 24 ? "Details" : seg.charAt(0).toUpperCase() + seg.slice(1));
    return { label, path };
  });

  return (
    <header style={{
      height: "52px",
      background: "white",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      position: "sticky",
      top: 0,
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#5a6478" }}>
        <span style={{ fontWeight: "500", color: "#5a6478" }}>TrustShield</span>
        {crumbs.map((c, i) => (
          <span key={c.path} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#c8cfd8" }}>/</span>
            <span style={{ color: i === crumbs.length - 1 ? "#0d1117" : "#5a6478", fontWeight: i === crumbs.length - 1 ? "500" : "400" }}>
              {c.label}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8b95a8" }} />
          <input placeholder="Search candidates, reports, or IDs..."
            style={{
              width: "240px", height: "32px", paddingLeft: "32px", paddingRight: "12px",
              border: "1px solid var(--border)", borderRadius: "6px",
              fontSize: "13px", color: "#0d1117", background: "#f7f8fa", outline: "none",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#1a6bfa"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,250,0.08)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#f7f8fa"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Quick Action */}
        <button className="btn btn-primary" style={{ height: "32px", fontSize: "13px" }}>Quick Action</button>

        {/* Avatar */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "linear-gradient(135deg, #1a6bfa, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: "13px", fontWeight: "700", flexShrink: 0, cursor: "pointer",
        }}>
          {user?.name?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
