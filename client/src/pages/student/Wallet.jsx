import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Wallet, Plus, TrendingDown, Zap, Clock } from "lucide-react";
import { getWalletApi, addFundsApi, getExpensesApi } from "../../api/wallet";
import toast from "react-hot-toast";

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function StudentWallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getWalletApi().then((r) => r.data),
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => getExpensesApi().then((r) => r.data),
  });

  const { mutate: addFunds, isPending } = useMutation({
    mutationFn: addFundsApi,
    onSuccess: () => {
      toast.success("Funds added!");
      queryClient.invalidateQueries(["wallet"]);
      queryClient.invalidateQueries(["expenses"]);
      setAmount("");
      setShowAdd(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add funds");
    },
  });

  const handleAddFunds = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return toast.error("Enter a valid amount");
    if (val > 10000) return toast.error("Max ₹10,000 at a time");
    addFunds({ amount: val });
  };

  const balance = walletData?.balance || 0;
  const expenses = expensesData?.expenses || [];

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          <h1 className="font-heading font-bold text-white text-lg">Wallet</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-brand-gradient rounded-2xl p-6"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-[50px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className="text-white/70" />
              <span className="text-white/70 font-body text-sm">Available Balance</span>
            </div>
            {walletLoading ? (
              <div className="h-10 bg-white/20 rounded-xl w-32 animate-pulse" />
            ) : (
              <h2 className="font-display text-5xl text-white tracking-wide">₹{balance}</h2>
            )}
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-heading font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              <Plus size={14} />
              Add Money
            </button>
          </div>
        </motion.div>

        {/* Add funds panel */}
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <h3 className="font-heading font-bold text-white mb-4">Add Funds</h3>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`py-2 rounded-xl text-sm font-heading font-semibold border transition-all ${
                    amount === String(a)
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "border-white/10 text-white/50 hover:border-white/20"
                  }`}
                >
                  ₹{a}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-heading font-bold">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pl-8 text-sm"
              />
            </div>

            <button
              onClick={handleAddFunds}
              disabled={isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={15} />
                  Add ₹{amount || "0"}
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Transaction history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-white">Recent Expenses</h2>
            <TrendingDown size={16} className="text-white/30" />
          </div>

          {expenses.length === 0 ? (
            <div className="card p-8 text-center">
              <Clock size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 font-body text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp, i) => (
                <motion.div
                  key={exp._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-danger/10 rounded-xl flex items-center justify-center">
                      <TrendingDown size={15} className="text-danger" />
                    </div>
                    <div>
                      <p className="text-white font-heading font-semibold text-sm">
                        {exp.cafe?.name || "Order"}
                      </p>
                      <p className="text-white/30 text-xs font-body">
                        {formatTime(exp.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-danger font-heading font-bold text-sm">
                    -₹{exp.totalAmount}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-800/90 backdrop-blur-md border-t border-white/5 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button onClick={() => navigate("/home")} className="flex flex-col items-center gap-1 py-1">
            <Zap size={20} className="text-white/40" />
            <span className="text-white/40 text-xs font-heading">Home</span>
          </button>
          <button onClick={() => navigate("/orders")} className="flex flex-col items-center gap-1 py-1">
            <Clock size={20} className="text-white/40" />
            <span className="text-white/40 text-xs font-heading">Orders</span>
          </button>
          <button onClick={() => navigate("/wallet")} className="flex flex-col items-center gap-1 py-1">
            <div className="w-6 h-6 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Wallet size={14} className="text-brand-500" />
            </div>
            <span className="text-brand-500 text-xs font-heading">Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}