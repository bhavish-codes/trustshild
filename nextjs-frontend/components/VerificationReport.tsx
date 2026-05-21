"use client";
import { useRef } from "react";
import type { Candidate } from "@/lib/types";
import { X, Printer, Shield, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Props {
  candidate: Candidate;
  onClose: () => void;
}

export default function VerificationReport({ candidate, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const aadhaarLog = candidate.verificationLogs?.find(l => l.verificationType === "AADHAAR");
  const panLog = candidate.verificationLogs?.find(l => l.verificationType === "PAN");

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Background Verification Report — ${candidate.fullName}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; }
          .report-header { text-align: center; border-bottom: 3px solid #4f8ef7; padding-bottom: 24px; margin-bottom: 32px; }
          .report-header h1 { font-size: 22px; font-weight: 800; color: #1a1a2e; letter-spacing: 2px; margin-bottom: 6px; }
          .report-header p { font-size: 12px; color: #666; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4f8ef7; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
          .field { }
          .field-label { font-size: 10px; font-weight: 600; color: #999; text-transform: uppercase; margin-bottom: 3px; }
          .field-value { font-size: 13px; color: #1a1a2e; font-weight: 500; }
          .status-box { padding: 16px 20px; border-radius: 8px; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
          .status-verified { background: #f0fdf4; border: 1px solid #86efac; }
          .status-failed { background: #fef2f2; border: 1px solid #fca5a5; }
          .status-partial { background: #fffbeb; border: 1px solid #fcd34d; }
          .status-label { font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .status-verified .status-label { color: #15803d; }
          .status-failed .status-label { color: #dc2626; }
          .status-partial .status-label { color: #d97706; }
          .overall-seal { margin-top: 32px; text-align: center; padding: 24px; border-radius: 12px; border: 3px dashed; }
          .seal-verified { border-color: #10b981; background: #f0fdf4; }
          .seal-failed { border-color: #ef4444; background: #fef2f2; }
          .seal-partial { border-color: #f59e0b; background: #fffbeb; }
          .seal-text { font-size: 24px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; }
          .seal-verified .seal-text { color: #10b981; }
          .seal-failed .seal-text { color: #ef4444; }
          .seal-partial .seal-text { color: #f59e0b; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .signature-line { border-top: 1px solid #999; width: 160px; margin-top: 40px; padding-top: 6px; text-align: center; font-size: 10px; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const sealClass = {
    VERIFIED: "seal-verified", FAILED: "seal-failed", PARTIAL: "seal-partial", PENDING: "seal-partial"
  }[candidate.status] || "seal-partial";

  const logStatus = (log?: typeof aadhaarLog) => {
    if (!log) return "NOT_RUN";
    return log.verificationStatus;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ boxShadow: "0 30px 100px rgba(0,0,0,0.6)" }}>
        {/* Actions header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: "#4f8ef7" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Background Verification Certificate</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn-primary py-2">
              <Printer size={15} /> Print / Save PDF
            </button>
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
          </div>
        </div>

        {/* Scrollable report preview */}
        <div className="overflow-y-auto flex-1 p-6">
          <div ref={printRef} style={{ background: "white", color: "#1a1a2e", borderRadius: "12px", padding: "40px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            {/* Report Header */}
            <div className="report-header" style={{ textAlign: "center", borderBottom: "3px solid #4f8ef7", paddingBottom: "24px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#4f8ef7,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={22} color="white" />
                </div>
                <div>
                  <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "2px", color: "#1a1a2e", margin: 0 }}>TRUSTSHIELD</h1>
                  <p style={{ fontSize: "11px", color: "#666", letterSpacing: "3px", margin: 0 }}>BACKGROUND VERIFICATION REPORT</p>
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "24px", fontSize: "11px", color: "#999" }}>
                <span>Generated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                <span>Report ID: TS-{candidate.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            {/* Candidate Info */}
            <div style={{ marginBottom: "28px" }}>
              <p className="section-title" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#4f8ef7", marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid #e5e7eb" }}>Candidate Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  ["Full Name", candidate.fullName],
                  ["Email Address", candidate.email],
                  ["Phone Number", candidate.phone],
                  ["Date of Birth", new Date(candidate.dob).toLocaleDateString("en-IN")],
                  ["Aadhaar Number", candidate.aadhaarNumber],
                  ["PAN Number", candidate.panNumber],
                  ["Address", candidate.address],
                  ["Verified By", user?.name || "TrustShield Platform"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: "3px" }}>{label}</p>
                    <p style={{ fontSize: "13px", color: "#1a1a2e", fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Results */}
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#4f8ef7", marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid #e5e7eb" }}>Verification Results</p>
              {[
                { label: "Aadhaar Verification (UIDAI)", log: aadhaarLog },
                { label: "PAN Verification (NSDL)", log: panLog },
              ].map(({ label, log }) => {
                const s = logStatus(log);
                const isV = s === "VERIFIED";
                const isFail = s === "FAILED";
                return (
                  <div key={label} style={{
                    padding: "14px 18px", borderRadius: "8px", marginBottom: "10px",
                    background: isV ? "#f0fdf4" : isFail ? "#fef2f2" : "#fffbeb",
                    border: `1px solid ${isV ? "#86efac" : isFail ? "#fca5a5" : "#fcd34d"}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e" }}>{label}</p>
                      <span style={{ fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: isV ? "#15803d" : isFail ? "#dc2626" : "#d97706" }}>{s}</span>
                    </div>
                    {log && (
                      <p style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                        {(log.responsePayload as any)?.message || ""}
                        {log && ` • ${new Date(log.verifiedAt).toLocaleString()}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall Seal */}
            <div style={{
              textAlign: "center", padding: "28px", borderRadius: "12px",
              border: `3px dashed ${candidate.status === "VERIFIED" ? "#10b981" : candidate.status === "FAILED" ? "#ef4444" : "#f59e0b"}`,
              background: candidate.status === "VERIFIED" ? "#f0fdf4" : candidate.status === "FAILED" ? "#fef2f2" : "#fffbeb",
              marginBottom: "28px",
            }}>
              <p style={{ fontSize: "11px", color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "2px" }}>Overall Verification Status</p>
              <p style={{
                fontSize: "32px", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase",
                color: candidate.status === "VERIFIED" ? "#10b981" : candidate.status === "FAILED" ? "#ef4444" : "#f59e0b",
              }}>{candidate.status}</p>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
              <div style={{ fontSize: "11px", color: "#999" }}>
                <p>This is a computer-generated document.</p>
                <p>TrustShield Background Verification Platform</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #999", paddingTop: "6px", width: "160px", fontSize: "10px", color: "#666" }}>
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
