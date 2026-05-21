"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Candidate } from "@/lib/types";
import toast from "react-hot-toast";
import { X, User, Mail, Phone, Fingerprint, CreditCard, MapPin, Calendar } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^\d{10,}$/, "Phone must be at least 10 digits"),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN format: ABCDE1234F"),
  dob: z.string().min(1, "Date of birth required"),
  address: z.string().min(5, "Address required"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  candidate?: Candidate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CandidateFormModal({ candidate, onClose, onSuccess }: Props) {
  const isEdit = !!candidate;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: candidate ? {
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      aadhaarNumber: candidate.aadhaarNumber,
      panNumber: candidate.panNumber,
      dob: candidate.dob?.split("T")[0] || "",
      address: candidate.address,
    } : {},
  });

  useEffect(() => {
    if (!candidate) {
      reset({
        fullName: "",
        email: "",
        phone: "",
        aadhaarNumber: "",
        panNumber: "",
        dob: "",
        address: "",
      });
    } else {
      reset({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        aadhaarNumber: candidate.aadhaarNumber,
        panNumber: candidate.panNumber,
        dob: candidate.dob?.split("T")[0] || "",
        address: candidate.address,
      });
    }
  }, [candidate, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await api.put(`/candidates/${candidate.id}`, data);
        toast.success("Candidate updated");
      } else {
        await api.post("/candidates", data);
        toast.success("Candidate added successfully");
      }
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Operation failed";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-semibold text-lg text-gray-900">
            {isEdit ? "Edit Candidate Details" : "Add Candidate Information"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Progress or Header indicator */}
          <div className="flex items-center gap-6 mb-2 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">1</span>
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Personal Info</span>
            </div>
            <div className="flex-1 h-px bg-gray-100" />
            <div className="flex items-center gap-2 opacity-50">
              <span className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">2</span>
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Verification Type</span>
            </div>
            <div className="flex-1 h-px bg-gray-100" />
            <div className="flex items-center gap-2 opacity-50">
              <span className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">3</span>
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Documents</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("fullName")} type="text" placeholder="e.g. Jane Doe"
                  className="field-input pl-9"
                  style={errors.fullName ? { borderColor: "#ef4444" } : {}} />
              </div>
              {errors.fullName && <p className="text-xs mt-1 text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="field-label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("email")} type="email" placeholder="jane.doe@example.com"
                  className="field-input pl-9"
                  style={errors.email ? { borderColor: "#ef4444" } : {}} />
              </div>
              {errors.email && <p className="text-xs mt-1 text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("phone")} type="tel" placeholder="+1 (555) 000-0000"
                  className="field-input pl-9"
                  style={errors.phone ? { borderColor: "#ef4444" } : {}} />
              </div>
              {errors.phone && <p className="text-xs mt-1 text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="field-label">Date of Birth</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("dob")} type="date"
                  className="field-input pl-9"
                  style={errors.dob ? { borderColor: "#ef4444" } : {}} />
              </div>
              {errors.dob && <p className="text-xs mt-1 text-red-600">{errors.dob.message}</p>}
            </div>

            <div>
              <label className="field-label">Aadhaar Number (12 digits)</label>
              <div className="relative">
                <Fingerprint size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("aadhaarNumber")} type="text" placeholder="123456789012"
                  className="field-input pl-9"
                  style={errors.aadhaarNumber ? { borderColor: "#ef4444" } : {}} />
              </div>
              {errors.aadhaarNumber && <p className="text-xs mt-1 text-red-600">{errors.aadhaarNumber.message}</p>}
            </div>

            <div>
              <label className="field-label">PAN Number (Format: ABCDE1234F)</label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("panNumber")} type="text" placeholder="ABCDE1234F"
                  className="field-input pl-9"
                  style={errors.panNumber ? { borderColor: "#ef4444" } : {}} />
              </div>
              {errors.panNumber && <p className="text-xs mt-1 text-red-600">{errors.panNumber.message}</p>}
            </div>
          </div>

          <div>
            <label className="field-label">Residential Address</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
              <textarea {...register("address")} rows={3} placeholder="Enter full permanent address..."
                className="field-input pl-9 py-2"
                style={errors.address ? { borderColor: "#ef4444" } : {}} />
            </div>
            {errors.address && <p className="text-xs mt-1 text-red-600">{errors.address.message}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 justify-center py-2.5">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-dark flex-1 justify-center py-2.5">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </span>
              ) : isEdit ? "Save Changes" : "Next Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
