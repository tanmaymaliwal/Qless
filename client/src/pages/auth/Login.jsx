import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      console.log("SUCCESS:", res.data);
      login(res.data.user, res.data.token,res.data.refreshToken);
      console.log("Login response:", res.data);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      if (role === "student")       navigate("/home");
      if (role === "cafe_admin")    navigate("/cafe/dashboard");
      if (role === "college_admin") navigate("/college/dashboard");
      if (role === "super_admin")   navigate("/super/dashboard");
    },
    onError: (err) => {
      console.log("ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("SUBMITTING:", form);
    if (!form.email || !form.password) return toast.error("Fill all fields");
    mutate(form);
  };
  return (
    <div
      className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-brand-500/15 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bg-brand-700/15 rounded-full blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[40%] right-[10%] w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] bg-brand-600/10 rounded-full blur-[60px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Floating food emojis — hidden on very small screens */}
      {["🍔", "🍕", "☕", "🍜", "🧃", "🍱"].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-xl sm:text-2xl select-none pointer-events-none opacity-20 hidden sm:block"
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* 3D rotating rings */}
      <motion.div
        className="absolute top-[15%] right-[15%] w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-brand-500/20 pointer-events-none hidden sm:block"
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[10%] w-10 h-10 sm:w-16 sm:h-16 rounded-full border border-brand-500/20 pointer-events-none hidden sm:block"
        animate={{ rotateX: -360, rotateY: 180 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-glow">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display text-3xl sm:text-4xl text-white tracking-wider">QLESS</span>
          </div>
          <p className="text-white/40 font-body text-xs sm:text-sm">Skip the queue. Order smart.</p>
        </div>

        {/* Card */}
        <div className="card p-5 sm:p-8">
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-white mb-1">Welcome back</h1>
          <p className="text-white/40 text-xs sm:text-sm font-body mb-5 sm:mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                Password
              </label>
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
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
            
              type="submit"
              disabled={isPending}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={15} fill="white" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-xs sm:text-sm font-body mt-5 sm:mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-500 hover:text-brand-400 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}