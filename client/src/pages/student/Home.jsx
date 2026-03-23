import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Zap, Search, MapPin, Clock, ChevronRight, LogOut, Wallet } from "lucide-react";
import { getCafesApi } from "../../api/cafes";
import { getWalletApi } from "../../api/wallet";
import { useAuthStore } from "../../store/authStore";
import { logoutApi } from "../../api/auth";
import toast from "react-hot-toast";

export default function StudentHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: cafesData, isLoading: cafesLoading } = useQuery({
    queryKey: ["cafes"],
    queryFn: () => getCafesApi().then((r) => r.data),
  });

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getWalletApi().then((r) => r.data),
  });

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    logout();
    navigate("/login");
    toast.success("Logged out!");
  };

  const cafes = cafesData?.cafes || [];
  const balance = walletData?.balance || 0;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="font-display text-2xl text-white tracking-wider">QLESS</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/wallet")}
              className="flex items-center gap-1.5 bg-dark-700 border border-white/10 rounded-xl px-3 py-1.5 hover:border-brand-500/40 transition-all"
            >
              <Wallet size={14} className="text-brand-500" />
              <span className="text-white font-heading font-semibold text-sm">₹{balance}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 hover:border-danger/40 hover:bg-danger/10 transition-all"
            >
              <LogOut size={15} className="text-white/50 hover:text-danger" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-brand-gradient rounded-2xl p-5 sm:p-7"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-[50px]" />

          <div className="relative">
            <p className="text-white/70 font-body text-sm mb-1">Good day 👋</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-3">
              {user?.name?.split(" ")[0] || "Student"}
            </h1>
            <p className="text-white/80 font-body text-sm">
              What are you craving today?
            </p>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate("/orders")}
            className="card p-4 flex items-center gap-3 hover:border-brand-500/30 hover:shadow-glow transition-all text-left"
          >
            <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-brand-500" />
            </div>
            <div>
              <p className="text-white font-heading font-semibold text-sm">My Orders</p>
              <p className="text-white/40 text-xs font-body">Track status</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/wallet")}
            className="card p-4 flex items-center gap-3 hover:border-brand-500/30 hover:shadow-glow transition-all text-left"
          >
            <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-brand-500" />
            </div>
            <div>
              <p className="text-white font-heading font-semibold text-sm">Wallet</p>
              <p className="text-white/40 text-xs font-body">₹{balance} left</p>
            </div>
          </button>
        </motion.div>

        {/* Cafes list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-white">Cafes on Campus</h2>
            <span className="text-white/30 text-xs font-body">{cafes.length} available</span>
          </div>

          {cafesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-dark-700 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-dark-700 rounded w-1/2" />
                      <div className="h-3 bg-dark-700 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cafes.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-white/50 font-body text-sm">No cafes available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cafes.map((cafe, i) => (
                <motion.button
                  key={cafe._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => navigate(`/menu/${cafe._id}`)}
                  className="card w-full p-4 flex items-center gap-4 hover:border-brand-500/30 hover:shadow-glow transition-all text-left group"
                >
                  {/* Cafe avatar */}
                  <div className="w-14 h-14 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:bg-brand-500/25 transition-colors">
                    🍴
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-heading font-semibold text-base truncate">
                      {cafe.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-white/30 flex-shrink-0" />
                      <p className="text-white/40 text-xs font-body truncate">
                        {cafe.location || "Campus"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-800/90 backdrop-blur-md border-t border-white/5 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button onClick={() => navigate("/home")} className="flex flex-col items-center gap-1 py-1">
            <div className="w-6 h-6 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-brand-500" fill="currentColor" />
            </div>
            <span className="text-brand-500 text-xs font-heading">Home</span>
          </button>
          <button onClick={() => navigate("/orders")} className="flex flex-col items-center gap-1 py-1">
            <Clock size={20} className="text-white/40" />
            <span className="text-white/40 text-xs font-heading">Orders</span>
          </button>
          <button onClick={() => navigate("/wallet")} className="flex flex-col items-center gap-1 py-1">
            <Wallet size={20} className="text-white/40" />
            <span className="text-white/40 text-xs font-heading">Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}