import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Zap, Building2, Users, UtensilsCrossed, LogOut, ChevronRight, ShoppingBag } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { logoutApi } from "../../api/auth";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SuperDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { data: collegesData, isLoading: collegesLoading } = useQuery({
    queryKey: ["super-colleges"],
    queryFn: () => api.get("/super/colleges").then((r) => r.data),
  });

  const { data: usersData } = useQuery({
    queryKey: ["super-users"],
    queryFn: () => api.get("/super/users").then((r) => r.data),
  });

  const { data: cafesData } = useQuery({
    queryKey: ["super-cafes"],
    queryFn: () => api.get("/super/cafes").then((r) => r.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["super-orders"],
    queryFn: () => api.get("/super/orders").then((r) => r.data),
  });

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate("/login");
    toast.success("Logged out!");
  };

  const colleges = collegesData?.colleges || [];
  const users = usersData?.users || [];
  const cafes = cafesData?.cafes || [];
  const orders = ordersData?.orders || [];

  return (
    <div className="min-h-screen bg-dark-900 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div>
              <span className="font-display text-xl text-white tracking-wider">QLESS</span>
              <span className="text-brand-500 text-xs font-heading ml-2 border border-brand-500/30 px-1.5 py-0.5 rounded-md">SUPER ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/super/colleges")} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5">
              <Building2 size={14} />
              <span className="hidden sm:inline">Colleges</span>
            </button>
            <button onClick={() => navigate("/super/users")} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5">
              <Users size={14} />
              <span className="hidden sm:inline">Users</span>
            </button>
            <button onClick={() => navigate("/super/cafes")} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5">
              <UtensilsCrossed size={14} />
              <span className="hidden sm:inline">Cafes</span>
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

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-brand-gradient rounded-2xl p-6"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]" />
          <div className="relative">
            <p className="text-white/70 font-body text-sm mb-1">Platform Overview 🚀</p>
            <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-2">QLESS ADMIN</h1>
            <p className="text-white/70 font-body text-sm">Manage the entire platform from here</p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Colleges", value: colleges.length, icon: Building2, color: "text-brand-500", bg: "bg-brand-500/10", path: "/super/colleges" },
            { label: "Users", value: users.length, icon: Users, color: "text-info", bg: "bg-info/10", path: "/super/users" },
            { label: "Cafes", value: cafes.length, icon: UtensilsCrossed, color: "text-success", bg: "bg-success/10", path: "/super/cafes" },
            { label: "Orders", value: orders.length, icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10", path: "/super/dashboard" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.button
                key={stat.label}
                onClick={() => navigate(stat.path)}
                whileHover={{ scale: 1.02 }}
                className="card p-5 text-left hover:border-white/10 transition-all"
              >
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={stat.color} />
                </div>
                <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
                <p className="text-white/40 text-xs font-heading mt-1">{stat.label}</p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Colleges list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-white text-lg">All Colleges</h2>
            <button
              onClick={() => navigate("/super/colleges")}
              className="text-xs font-heading text-brand-500 hover:text-brand-400 transition-colors"
            >
              Manage →
            </button>
          </div>

          {collegesLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-dark-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="card p-8 text-center">
              <Building2 size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 font-body text-sm">No colleges yet</p>
              <button
                onClick={() => navigate("/super/colleges")}
                className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
              >
                <Zap size={14} fill="white" />
                Add First College
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {colleges.map((college, i) => (
                <motion.div
                  key={college._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-heading font-semibold truncate">{college.name}</h3>
                    <p className="text-white/30 text-xs font-body mt-0.5">Code: {college.code} · {college.plan} plan</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${college.isActive ? "bg-success/10 text-success" : "bg-white/5 text-white/30"}`}>
                      {college.isActive ? "Active" : "Inactive"}
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