import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Zap, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export default function SuperLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      if (res.data.user.role !== "super_admin") {
        toast.error("Access denied — not a super admin account");
        return;
      }
      login(res.data.user, res.data.token, res.data.refreshToken);
      toast.success("Welcome, Super Admin!");
      navigate("/super/dashboard");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill all fields");
    mutate(form);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-brand-700/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto"
      >
        {/* Logo */}
        <div className="text-center mb-8">
  <div className="inline-flex items-center gap-2">
    <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-glow">
      <Zap size={20} className="text-white" fill="white" />
    </div>
    <span className="font-display text-4xl text-white tracking-wider">
      QLESS
    </span>
  </div>


</div>

        {/* Card */}
        <div className="card p-6">
          <h1 className="font-heading font-bold text-xl text-white mb-1">Restricted Access</h1>
          <p className="text-white/40 text-xs font-body mb-5">This portal is for authorized person only</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="admin@qless.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={15} />
                  Access Portal
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs font-body mt-4">
          Unauthorized access is strictly prohibited
        </p>
      </motion.div>
    </div>
  );
}