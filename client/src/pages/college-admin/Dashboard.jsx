import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Zap, Building2, Users, TrendingUp, LogOut, ChevronRight } from "lucide-react";
import { getCafesApi } from "../../api/cafes";
import { useAuthStore } from "../../store/authStore";
import { logoutApi } from "../../api/auth";
import toast from "react-hot-toast";

export default function CollegeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: cafesData, isLoading } = useQuery({
    queryKey: ["cafes"],
    queryFn: () => getCafesApi().then((r) => r.data),
  });

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate("/login");
    toast.success("Logged out!");
  };

  const cafes = cafesData?.cafes || [];

  return (
    <div className="min-h-screen bg-dark-900 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div>
              <span className="font-display text-xl text-white tracking-wider">QLESS</span>
              <span className="text-white/30 text-xs font-body ml-2">College Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/college/cafes")}
              className="flex items-center gap-1.5 btn-ghost text-sm py-1.5 px-3"
            >
              <Building2 size={14} />
              <span className="hidden sm:inline">Manage Cafes</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 hover:border-danger/40 hover:bg-danger/10 transition-all"
            >
              <LogOut size={15} className="text-white/50" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-brand-gradient rounded-2xl p-6"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-[50px]" />
          <div className="relative">
            <p className="text-white/70 font-body text-sm mb-1">Welcome back 👋</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-1">
              {user?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="text-white/70 font-body text-sm">{user?.college || "College"}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Total Cafes", value: cafes.length, icon: Building2, color: "text-brand-500" },
            { label: "Active", value: cafes.filter((c) => c.isActive).length, icon: TrendingUp, color: "text-success" },
            { label: "Inactive", value: cafes.filter((c) => !c.isActive).length, icon: Users, color: "text-white/40" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card p-4 text-center">
                <Icon size={18} className={`${stat.color} mx-auto mb-2`} />
                <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
                <p className="text-white/40 text-xs font-heading mt-1">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Cafes list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-white text-lg">All Cafes</h2>
            <button
              onClick={() => navigate("/college/cafes")}
              className="text-xs font-heading text-brand-500 hover:text-brand-400 transition-colors"
            >
              Manage →
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-dark-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : cafes.length === 0 ? (
            <div className="card p-8 text-center">
              <Building2 size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 font-body text-sm">No cafes added yet</p>
              <button
                onClick={() => navigate("/college/cafes")}
                className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
              >
                <Zap size={14} fill="white" />
                Add First Cafe
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cafes.map((cafe, i) => (
                <motion.div
                  key={cafe._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🍴
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-heading font-semibold text-sm truncate">
                      {cafe.name}
                    </h3>
                    <p className="text-white/30 text-xs font-body mt-0.5">
                      {cafe.location || "Campus"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${cafe.isActive ? "bg-success/10 text-success" : "bg-white/5 text-white/30"}`}>
                      {cafe.isActive ? "Active" : "Inactive"}
                    </span>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}