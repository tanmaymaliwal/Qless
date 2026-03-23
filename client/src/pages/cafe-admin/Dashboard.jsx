import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, UtensilsCrossed, QrCode, LogOut, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import { getMyOrdersApi, scanOrderApi } from "../../api/orders";
import { useAuthStore } from "../../store/authStore";
import { logoutApi } from "../../api/auth";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "text-warning",   bg: "bg-warning/10",   icon: Clock },
  preparing: { label: "Preparing", color: "text-brand-500", bg: "bg-brand-500/10", icon: Loader },
  ready:     { label: "Ready",     color: "text-success",   bg: "bg-success/10",   icon: CheckCircle },
  completed: { label: "Completed", color: "text-white/40",  bg: "bg-white/5",      icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-danger",    bg: "bg-danger/10",    icon: XCircle },
};

const NEXT_STATUS = {
  pending:   "preparing",
  preparing: "ready",
  ready:     "completed",
};

export default function CafeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cafe-orders"],
    queryFn: () => getMyOrdersApi().then((r) => r.data),
    refetchInterval: 20000,
  });

  const { mutate: updateOrder } = useMutation({
    mutationFn: ({ orderId, status }) => scanOrderApi({ orderId, status }),
    onSuccess: () => {
      toast.success("Order updated!");
      queryClient.invalidateQueries(["cafe-orders"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate("/login");
    toast.success("Logged out!");
  };

  const orders = data?.orders || [];
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "completed");

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
              <span className="text-white/30 text-xs font-body ml-2">Cafe Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/cafe/scanner")}
              className="flex items-center gap-1.5 btn-ghost text-sm py-1.5 px-3"
            >
              <QrCode size={14} />
              <span className="hidden sm:inline">Scanner</span>
            </button>
            <button
              onClick={() => navigate("/cafe/menu")}
              className="flex items-center gap-1.5 btn-ghost text-sm py-1.5 px-3"
            >
              <UtensilsCrossed size={14} />
              <span className="hidden sm:inline">Menu</span>
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
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Active", value: activeOrders.length, color: "text-brand-500", bg: "bg-brand-500/10" },
            { label: "Completed", value: completedOrders.length, color: "text-success", bg: "bg-success/10" },
            { label: "Total", value: orders.length, color: "text-white", bg: "bg-white/5" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="text-white/40 text-xs font-heading mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Active orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-white text-lg">Active Orders</h2>
            <button
              onClick={() => refetch()}
              className="text-xs font-heading text-brand-500 hover:text-brand-400 transition-colors"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-dark-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle size={32} className="text-success/30 mx-auto mb-3" />
              <p className="text-white/40 font-body text-sm">No active orders right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order, i) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                const nextStatus = NEXT_STATUS[order.status];
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-heading font-semibold text-sm">
                          {order.user?.name || "Student"}
                        </p>
                        <p className="text-white/30 text-xs font-body mt-0.5">
                          #{order._id?.slice(-6).toUpperCase()} · {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <span className={`badge ${status.bg} ${status.color} flex items-center gap-1`}>
                        <StatusIcon size={11} className={order.status === "preparing" ? "animate-spin" : ""} />
                        {status.label}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-white/60 text-xs font-body">
                            {item.quantity}× {item.menuItem?.name || "Item"}
                          </span>
                          <span className="text-white/40 text-xs">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-brand-500 font-heading font-bold text-sm">
                        ₹{order.totalAmount}
                      </span>
                      {nextStatus && (
                        <button
                          onClick={() => updateOrder({ orderId: order._id, status: nextStatus })}
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                          <Zap size={12} fill="white" />
                          Mark {STATUS_CONFIG[nextStatus]?.label}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="font-heading font-bold text-white/50 text-sm uppercase tracking-widest mb-3">
              Completed Today
            </h2>
            <div className="space-y-2">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="card p-3 flex items-center justify-between opacity-50">
                  <div>
                    <p className="text-white font-heading text-sm">{order.user?.name || "Student"}</p>
                    <p className="text-white/30 text-xs">#{order._id?.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className="text-white/40 font-heading text-sm">₹{order.totalAmount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}