import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UtensilsCrossed, MapPin, Search, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SuperCafes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["super-cafes"],
    queryFn: () => api.get("/super/cafes").then((r) => r.data),
  });

  const { mutate: toggleCafe } = useMutation({
    mutationFn: (id) => api.put(`/cafes/${id}/toggle`),
    onSuccess: () => {
      toast.success("Cafe status updated!");
      queryClient.invalidateQueries(["super-cafes"]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const cafes = data?.cafes || [];

  const filtered = cafes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.college?.name?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="font-heading font-bold text-white text-lg">All Cafes</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search cafes or colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Cafes", value: cafes.length, color: "text-white" },
            { label: "Active", value: cafes.filter((c) => c.isActive).length, color: "text-success" },
            { label: "Inactive", value: cafes.filter((c) => !c.isActive).length, color: "text-danger" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="text-white/40 text-xs font-heading mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

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
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center">
            <UtensilsCrossed size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 font-body text-sm">No cafes found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cafe, i) => (
              <motion.div
                key={cafe._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🍴
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-heading font-semibold truncate">{cafe.name}</h3>
                  {cafe.location && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-white/30" />
                      <p className="text-white/30 text-xs font-body truncate">{cafe.location}</p>
                    </div>
                  )}
                  {cafe.college && (
                    <p className="text-white/20 text-xs font-body mt-0.5">
                      🏫 {cafe.college?.name || "—"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${cafe.isActive ? "bg-success/10 text-success" : "bg-white/5 text-white/30"}`}>
                    {cafe.isActive ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => toggleCafe(cafe._id)}>
                    {cafe.isActive ? (
                      <ToggleRight size={24} className="text-success" />
                    ) : (
                      <ToggleLeft size={24} className="text-white/20" />
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