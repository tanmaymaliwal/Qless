import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, QrCode, CheckCircle, XCircle, Zap } from "lucide-react";
import { scanOrderApi } from "../../api/orders";
import toast from "react-hot-toast";

export default function Scanner() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { mutate: scanOrder, isPending } = useMutation({
    mutationFn: scanOrderApi,
    onSuccess: (res) => {
      setLastResult({ success: true, order: res.data.order });
      setOrderId("");
      toast.success("Order verified!");
    },
    onError: (err) => {
      setLastResult({ success: false, message: err.response?.data?.message || "Invalid order" });
      setOrderId("");
      toast.error(err.response?.data?.message || "Scan failed");
    },
  });

  const handleScan = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return toast.error("Enter or scan an order ID");
    scanOrder({ qrToken: orderId.trim() });
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/cafe/dashboard")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">QR Scanner</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Scanner UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 text-center"
        >
          {/* QR viewfinder */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 bg-dark-700 rounded-2xl flex items-center justify-center">
              <QrCode size={64} className="text-white/10" />
            </div>
            {/* Corner brackets */}
            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
              <div
                key={i}
                className={`absolute w-8 h-8 border-brand-500 ${pos} ${
                  i === 0 ? "border-t-2 border-l-2 rounded-tl-xl" :
                  i === 1 ? "border-t-2 border-r-2 rounded-tr-xl" :
                  i === 2 ? "border-b-2 border-l-2 rounded-bl-xl" :
                  "border-b-2 border-r-2 rounded-br-xl"
                }`}
              />
            ))}
            {/* Scanning line */}
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-brand-500/60 blur-sm"
              animate={{ top: ["20%", "80%", "20%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <p className="text-white/40 font-body text-sm mb-6">
            Point camera at student's QR code or enter order ID manually
          </p>

          {/* Manual input */}
          <form onSubmit={handleScan} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Scan QR or enter QR Token"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="input text-sm text-center tracking-widest"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={15} fill="white" />
                  Verify Order
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`card p-5 border ${
                lastResult.success
                  ? "border-success/30 bg-success/5"
                  : "border-danger/30 bg-danger/5"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {lastResult.success ? (
                  <CheckCircle size={24} className="text-success flex-shrink-0" />
                ) : (
                  <XCircle size={24} className="text-danger flex-shrink-0" />
                )}
                <h3 className={`font-heading font-bold text-lg ${
                  lastResult.success ? "text-success" : "text-danger"
                }`}>
                  {lastResult.success ? "Order Verified!" : "Invalid Order"}
                </h3>
              </div>

              {lastResult.success && lastResult.order && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm font-body">Student</span>
                    <span className="text-white font-heading font-semibold text-sm">
                      {lastResult.order.user?.name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm font-body">Order ID</span>
                    <span className="text-white font-mono text-xs">
                      #{lastResult.order._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm font-body">Total</span>
                    <span className="text-brand-500 font-heading font-bold text-sm">
                      ₹{lastResult.order.totalAmount}
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
                    {lastResult.order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-white/40 text-xs font-body">
                          {item.quantity}× {item.menuItem?.name}
                        </span>
                        <span className="text-white/40 text-xs">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!lastResult.success && (
                <p className="text-danger/70 text-sm font-body">{lastResult.message}</p>
              )}

              <button
                onClick={() => setLastResult(null)}
                className="btn-ghost w-full mt-4 text-sm"
              >
                Scan Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}