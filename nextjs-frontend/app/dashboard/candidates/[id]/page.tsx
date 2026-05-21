"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Candidate, VerificationLog } from "@/lib/types";
import toast from "react-hot-toast";
import {
  ArrowLeft, Play, FileText, CheckCircle2, XCircle, Clock, Shield,
  User, Mail, Phone, MapPin, Calendar, CreditCard, Fingerprint, AlertTriangle
} from "lucide-react";
import VerificationReport from "@/components/VerificationReport";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/candidates/${id}`);
      setCandidate(res.data.data);
    } catch {
      toast.error("Candidate not found");
      router.push("/dashboard/candidates");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const startVerification = async () => {
    setVerifying(true);
    try {
      const res = await api.post(`/verifications/${id}/start`);
      setCandidate(prev => prev ? { ...prev, ...res.data.data.candidate, verificationLogs: res.data.data.logs } : null);
      toast.success("Verification completed!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally { setVerifying(false); }
  };

  const statusBadge = (s: string) => {
    return <span className={`badge badge-${s.toLowerCase()} px-3 py-1 text-xs`}>{s}</span>;
  };

  if (loading) return (
    <div className="p-8 space-y-6">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="skeleton h-80 lg:col-span-2" />
        <div className="skeleton h-80" />
      </div>
    </div>
  );

  if (!candidate) return null;

  const aadhaarLog = candidate.verificationLogs?.find(l => l.verificationType === "AADHAAR");
  const panLog = candidate.verificationLogs?.find(l => l.verificationType === "PAN");

  const passedCount = [
    aadhaarLog?.verificationStatus === "VERIFIED",
    panLog?.verificationStatus === "VERIFIED"
  ].filter(Boolean).length;

  const confidenceColor = passedCount === 2 ? "#16a34a" : passedCount === 1 ? "#d97706" : "#dc2626";
  const confidenceText = `${passedCount}/2 verification passed`;

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      {/* 1. Header Alert Banner if check failed or verified */}
      {candidate.status === "FAILED" && (
        <div style={{
          background: "#fff2f2", borderBottom: "1px solid #fca5a5",
          padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#dc2626", fontWeight: "600", fontSize: "13.5px" }}>
            <AlertTriangle size={16} />
            <span>Verification Failed: Review Required</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-outline" style={{ height: "28px", fontSize: "12px", background: "white" }}>Dismiss Alert</button>
            <button className="btn btn-primary" style={{ height: "28px", fontSize: "12px", background: "#dc2626" }} onClick={startVerification} disabled={verifying}>
              {verifying ? "Retrying..." : "Retry All Checks"}
            </button>
          </div>
        </div>
      )}

      {candidate.status === "VERIFIED" && (
        <div style={{
          background: "#f0fdf4", borderBottom: "1px solid #bbf7d0",
          padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#16a34a", fontWeight: "600", fontSize: "13.5px" }}>
            <CheckCircle2 size={16} />
            <span>Verification Successful: Candidate Cleared</span>
          </div>
          <button className="btn btn-outline" style={{ height: "28px", fontSize: "12px", background: "white" }} onClick={() => setShowReport(true)}>
            Download Report
          </button>
        </div>
      )}

      <div style={{ padding: "28px" }}>
        {/* Navigation & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => router.push("/dashboard/candidates")} className="btn btn-outline" style={{ width: "32px", height: "32px", padding: 0 }}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0d1117" }}>{candidate.fullName}</h1>
                {statusBadge(candidate.status)}
              </div>
              <p style={{ fontSize: "12.5px", color: "#8b95a8", marginTop: "2px" }}>
                VP-{candidate.id.slice(-8).toUpperCase()} • Job Candidate
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {candidate.status !== "PENDING" && (
              <button className="btn btn-outline" onClick={() => setShowReport(true)}>
                <FileText size={14} /> Verification Report
              </button>
            )}
            <button className="btn btn-dark" onClick={startVerification} disabled={verifying}>
              {verifying ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full inline-block" />
                  Running Checks...
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  Start Verification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: "grid", gap: "20px" }} className="grid-cols-1 lg:grid-cols-3">
          
          {/* LEFT: Verification Breakdown */}
          <div className="lg:col-span-2 space-y-5">
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#8b95a8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Verification Breakdown
            </h2>

            {/* 1. PAN Card Authenticity Card */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117" }}>PAN Card Authenticity</h3>
                {panLog ? (
                  <span className={`badge badge-${panLog.verificationStatus.toLowerCase()}`}>
                    {panLog.verificationStatus === "VERIFIED" ? "VERIFIED" : "DATA MISMATCH"}
                  </span>
                ) : (
                  <span className="badge badge-pending">NOT RUN</span>
                )}
              </div>

              {panLog && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", border: "1px solid var(--border)", borderRadius: "6px", padding: "12px 14px", background: "#f9fafb" }}>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: "600", color: "#8b95a8", textTransform: "uppercase" }}>Provided Name</p>
                      <p style={{ fontSize: "13.5px", fontWeight: "500", color: "#0d1117" }}>{candidate.fullName}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: "600", color: "#8b95a8", textTransform: "uppercase" }}>Government Record</p>
                      <p style={{
                        fontSize: "13.5px", fontWeight: "600",
                        color: panLog.verificationStatus === "VERIFIED" ? "#16a34a" : "#dc2626"
                      }}>
                        {(panLog.responsePayload as any)?.name || candidate.fullName.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#5a6478", lineHeight: 1.5 }}>
                    {panLog.verificationStatus === "VERIFIED"
                      ? "The provided PAN card successfully matched official NSDL government database records."
                      : "The name on the provided PAN card does not match the official database records. This could be due to a typo or a legal name change."}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-outline" style={{ height: "30px", fontSize: "12px" }}>Manual Override</button>
                    <button className="btn btn-dark" style={{ height: "30px", fontSize: "12px" }}>Request New Upload</button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Aadhaar / Biometric Match Card */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117" }}>UIDAI Aadhaar Verification</h3>
                {aadhaarLog ? (
                  <span className={`badge badge-${aadhaarLog.verificationStatus.toLowerCase()}`}>
                    {aadhaarLog.verificationStatus}
                  </span>
                ) : (
                  <span className="badge badge-pending">NOT RUN</span>
                )}
              </div>

              {aadhaarLog && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ border: "1px solid var(--border)", borderRadius: "6px", padding: "14px", background: "#f9fafb" }}>
                    <p style={{ fontSize: "10.5px", fontWeight: "600", color: "#8b95a8", textTransform: "uppercase", marginBottom: "4px" }}>
                      Identity Match Confidence
                    </p>
                    <p style={{ fontSize: "28px", fontWeight: "700", color: confidenceColor }}>
                      {confidenceText}
                    </p>
                  </div>

                  <div style={{
                    background: aadhaarLog.verificationStatus === "VERIFIED" ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${aadhaarLog.verificationStatus === "VERIFIED" ? "#bbf7d0" : "#fde68a"}`,
                    borderRadius: "6px", padding: "12px 14px"
                  }}>
                    <p style={{ fontSize: "12.5px", color: aadhaarLog.verificationStatus === "VERIFIED" ? "#15803d" : "#b45309", lineHeight: 1.5 }}>
                      <strong>Recommendation:</strong> {aadhaarLog.verificationStatus === "VERIFIED"
                        ? "UIDAI record validated and verified. No further action needed."
                        : "System recommends a live video liveness check. The current selfie quality is too low for a definitive match against the ID document."}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-dark" style={{ height: "30px", fontSize: "12px" }}>Initiate Liveness Check</button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Debug Logs Card */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117", marginBottom: "12px" }}>Debug Logs</h3>
              <div className="terminal">
                {candidate.verificationLogs && candidate.verificationLogs.length > 0 ? (
                  candidate.verificationLogs.map((log: VerificationLog, i) => (
                    <div key={log.id} style={{ marginBottom: "6px" }}>
                      <span style={{ color: "#8b949e" }}>[{new Date(log.verifiedAt).toLocaleDateString()}]</span>{" "}
                      <span style={{ color: "#58a6ff", fontWeight: "600" }}>POST</span>{" "}
                      <span>/v1/identity/{log.verificationType.toLowerCase()} — </span>
                      {log.verificationStatus === "VERIFIED" ? (
                        <span className="log-ok">200 OK (VERIFIED)</span>
                      ) : (
                        <span className="log-err">400 MISMATCH (FAILED)</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span style={{ color: "#8b949e" }}>No API requests captured yet. Click "Start Verification" to initiate verification checks.</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Timeline & Info */}
          <div className="space-y-5">
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#8b95a8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Tracking & Info
            </h2>

            {/* Verification Timeline */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Verification Timeline</h3>
              
              {(!candidate.verificationLogs || candidate.verificationLogs.length === 0) ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Clock size={28} style={{ color: "#c8cfd8", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "13px", color: "#8b95a8" }}>No verifications run yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {candidate.verificationLogs.map((log: VerificationLog, i) => (
                    <div key={log.id} style={{ display: "flex", gap: "12px", position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: log.verificationStatus === "VERIFIED" ? "#16a34a" : "#dc2626",
                          marginTop: "6px", flexShrink: 0
                        }} />
                        {i < (candidate.verificationLogs?.length ?? 0) - 1 && (
                          <div style={{ width: "1.5px", flex: 1, background: "var(--border)", marginTop: "4px" }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#0d1117" }}>
                          {log.verificationType} {log.verificationStatus === "VERIFIED" ? "Cleared" : "Flagged"}
                        </p>
                        <p style={{ fontSize: "11.5px", color: "#8b95a8", marginTop: "2px" }}>
                          {new Date(log.verifiedAt).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Quick Info</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  ["Location", "India"],
                  ["Phone", candidate.phone],
                  ["Priority", "High", "#b45309"],
                ].map(([label, val, col]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ color: "#8b95a8" }}>{label}</span>
                    <span style={{ fontWeight: "500", color: col || "#0d1117" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Details list */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0d1117", marginBottom: "16px" }}>Personal Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Email Address", val: candidate.email, icon: Mail },
                  { label: "Aadhaar Reference", val: candidate.aadhaarNumber, icon: Fingerprint },
                  { label: "PAN Card Reference", val: candidate.panNumber, icon: CreditCard },
                  { label: "Date of Birth", val: new Date(candidate.dob).toLocaleDateString(), icon: Calendar },
                  { label: "Registered Address", val: candidate.address, icon: MapPin },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <item.icon size={15} style={{ color: "#8b95a8", marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: "600", color: "#8b95a8", textTransform: "uppercase" }}>{item.label}</p>
                      <p style={{ fontSize: "13px", color: "#0d1117", fontWeight: "500", wordBreak: "break-all" }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {showReport && (
        <VerificationReport candidate={candidate} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
