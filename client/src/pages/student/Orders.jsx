import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader, Zap, ShoppingBag } from "lucide-react";
import { getMyOrdersApi } from "../../api/orders";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "text-warning",  bg: "bg-warning/10",  icon: Clock },
  preparing:  { label: "Preparing",  color: "text-brand-500", bg: "bg-brand-500/10", icon: Loader },
  ready:      { label: "Ready!",     color: "text-success",  bg: "bg-success/10",  icon: CheckCircle },
  completed:  { label: "Completed",  color: "text-white/40", bg: "bg-white/5",     icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "text-danger",   bg: "bg-danger/10",   icon: XCircle },
};

export default function StudentOrders() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrdersApi().then((r) => r.data),
    refetchInterval: 15000, // auto refresh every 15s
  });

  const orders = data?.orders || [];

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">My Orders</h1>
          <button
            onClick={() => refetch()}
            className="text-xs font-heading text-brand-500 hover:text-brand-400 transition-colors px-2"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-dark-700 rounded w-1/3" />
                  <div className="h-4 bg-dark-700 rounded w-1/4" />
                </div>
                <div className="h-3 bg-dark-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-10 text-center mt-10"
          >
            <ShoppingBag size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/50 font-heading font-semibold">No orders yet</p>
            <p className="text-white/30 text-sm font-body mt-1">Go order something delicious!</p>
            <button
              onClick={() => navigate("/home")}
              className="btn-primary mt-5 inline-flex items-center gap-2"
            >
              <Zap size={14} fill="white" />
              Browse Cafes
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-heading font-semibold text-sm">
                        {order.cafe?.name || "Cafe"}
                      </p>
                      <p className="text-white/30 text-xs font-body mt-0.5">
                        {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
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
                        <span className="text-white/40 text-xs font-body">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-white/40 text-xs font-body">
                      #{order._id?.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-brand-500 font-heading font-bold text-sm">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-800/90 backdrop-blur-md border-t border-white/5 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button onClick={() => navigate("/home")} className="flex flex-col items-center gap-1 py-1">
            <Zap size={20} className="text-white/40" />
            <span className="text-white/40 text-xs font-heading">Home</span>
          </button>
          <button onClick={() => navigate("/orders")} className="flex flex-col items-center gap-1 py-1">
            <div className="w-6 h-6 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-brand-500" />
            </div>
            <span className="text-brand-500 text-xs font-heading">Orders</span>
          </button>
          <button onClick={() => navigate("/wallet")} className="flex flex-col items-center gap-1 py-1">
            <ShoppingBag size={20} className="text-white/40" />
            <span className="text-white/40 text-xs font-heading">Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}