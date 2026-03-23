import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X, Building2, Zap, MapPin } from "lucide-react";
import { getCafesApi, createCafeApi } from "../../api/cafes";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", location: "", description: "" };

export default function CollegeCafes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["cafes"],
    queryFn: () => getCafesApi().then((r) => r.data),
  });

  const { mutate: createCafe, isPending } = useMutation({
    mutationFn: createCafeApi,
    onSuccess: () => {
      toast.success("Cafe created!");
      queryClient.invalidateQueries(["cafes"]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create cafe");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Cafe name is required");
    createCafe(form);
  };

  const cafes = data?.cafes || [];

  return (
    <div className="min-h-screen bg-dark-900 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/college/dashboard")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">Manage Cafes</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Add cafe form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-white">Add New Cafe</h2>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                    Cafe Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Canteen"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Block A, Ground Floor"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input text-sm"
                  />
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
                      Create Cafe
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cafes list */}
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
          <div className="card p-10 text-center">
            <Building2 size={36} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 font-body text-sm">No cafes added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
            >
              <Plus size={14} />
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
                  <h3 className="text-white font-heading font-semibold truncate">
                    {cafe.name}
                  </h3>
                  {cafe.location && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-white/30 flex-shrink-0" />
                      <p className="text-white/30 text-xs font-body truncate">{cafe.location}</p>
                    </div>
                  )}
                  {cafe.description && (
                    <p className="text-white/20 text-xs font-body truncate mt-0.5">{cafe.description}</p>
                  )}
                </div>
                <span className={`badge flex-shrink-0 ${
                  cafe.isActive
                    ? "bg-success/10 text-success"
                    : "bg-white/5 text-white/30"
                }`}>
                  {cafe.isActive ? "Active" : "Inactive"}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}