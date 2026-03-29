import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X, Building2, Zap, MapPin, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", code: "", address: "", plan: "starter" };
const PLANS = ["starter", "growth", "enterprise"];

export default function SuperColleges() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["super-colleges"],
    queryFn: () => api.get("/super/colleges").then((r) => r.data),
  });

  const { mutate: createCollege, isPending } = useMutation({
    mutationFn: (data) => api.post("/super/colleges", data),
    onSuccess: () => {
      toast.success("College created!");
      queryClient.invalidateQueries(["super-colleges"]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create college");
    },
  });

  const { mutate: toggleCollege } = useMutation({
    mutationFn: (id) => api.put(`/super/colleges/${id}/toggle`),
    onSuccess: () => {
      toast.success("College status updated!");
      queryClient.invalidateQueries(["super-colleges"]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return toast.error("Name and code required");
    createCollege(form);
  };

  const colleges = data?.colleges || [];

  return (
    <div className="min-h-screen bg-dark-900 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/super/dashboard")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">Colleges</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-white">Add New College</h2>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                      College Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bennett University"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                      College Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BU"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Noida, India"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                    Plan
                  </label>
                  <div className="flex gap-2">
                    {PLANS.map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setForm({ ...form, plan })}
                        className={`py-1.5 px-3 rounded-xl text-xs font-heading font-semibold border transition-all capitalize ${
                          form.plan === plan
                            ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                            : "border-white/10 text-white/40 hover:border-white/20"
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
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
                      <Zap size={14} fill="white" />
                      Create College
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Colleges list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-dark-700 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="card p-10 text-center">
            <Building2 size={36} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 font-body text-sm">No colleges yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
            >
              <Plus size={14} />
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
                className="card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-heading font-semibold truncate">{college.name}</h3>
                      <span className="badge bg-brand-500/10 text-brand-500 text-xs">{college.code}</span>
                      <span className={`badge capitalize ${
                        college.plan === "enterprise" ? "bg-warning/10 text-warning" :
                        college.plan === "growth" ? "bg-info/10 text-info" :
                        "bg-white/5 text-white/40"
                      }`}>{college.plan}</span>
                    </div>
                    {college.address && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-white/30" />
                        <p className="text-white/30 text-xs font-body">{college.address}</p>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-white/20 text-xs font-mono">
                        Invite: {college.inviteCode}
                      </p>
                      <p className="text-white/20 text-xs">
                        Expires: {new Date(college.inviteCodeExpiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCollege(college._id)}
                    className="flex-shrink-0"
                  >
                    {college.isActive ? (
                      <ToggleRight size={28} className="text-success" />
                    ) : (
                      <ToggleLeft size={28} className="text-white/20" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}