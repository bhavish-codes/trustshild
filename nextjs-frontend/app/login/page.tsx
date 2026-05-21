"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const quickFill = () => {
    setValue("email", "admin@test.com");
    setValue("password", "password123");
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email: data.email, password: data.password });
      const { token, user } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", justifyContent: "center" }}>
          <div style={{ width: "32px", height: "32px", background: "#1a6bfa", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#0d1117", letterSpacing: "-0.3px" }}>TrustShield</span>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0d1117", marginBottom: "4px" }}>Sign in</h1>
          <p style={{ fontSize: "13.5px", color: "#5a6478", marginBottom: "24px" }}>
            Access the background verification platform
          </p>

          {/* Demo credentials banner */}
          <div style={{ background: "#eef3ff", border: "1px solid #c7d9fd", borderRadius: "6px", padding: "10px 14px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#1a6bfa", marginBottom: "1px" }}>Demo credentials</p>
              <p style={{ fontSize: "12px", color: "#3b72f5" }}>admin@test.com / password123</p>
            </div>
            <button type="button" onClick={quickFill}
              style={{ background: "#1a6bfa", color: "white", border: "none", borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
              Quick Fill
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="field-label">Email address</label>
              <input {...register("email")} type="email" placeholder="you@company.com" className="field-input"
                style={errors.email ? { borderColor: "#dc2626" } : {}} />
              {errors.email && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px" }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position: "relative" }}>
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className="field-input" style={{ paddingRight: "40px", ...(errors.password ? { borderColor: "#dc2626" } : {}) }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8b95a8", display: "flex" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px" }}>{errors.password.message}</p>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input {...register("rememberMe")} type="checkbox" id="remember"
                style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#1a6bfa" }} />
              <label htmlFor="remember" style={{ fontSize: "13px", color: "#5a6478", cursor: "pointer" }}>Remember me</label>
            </div>

            <button type="submit" className="btn btn-dark" disabled={isLoading}
              style={{ width: "100%", height: "38px", fontSize: "14px", marginTop: "4px" }}>
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#8b95a8" }}>
          Secured by enterprise-grade encryption
        </p>
      </div>
    </div>
  );
}
