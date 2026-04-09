import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X, UtensilsCrossed, Zap, Pencil } from "lucide-react";
import { getMenuApi } from "../../api/cafes";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import api from "../../api/axios";

const EMPTY_FORM = { name: "", price: "", category: "", description: "", isAvailable: true };
const CATEGORIES = ["Breakfast", "Lunch", "Snacks", "Beverages", "Dinner", "Desserts"];

export default function MenuManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const cafeId = user?.cafeId?._id || user?.cafeId;
  console.log("cafeId:", cafeId, "user:", user);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["menu", cafeId],
    queryFn: () => getMenuApi(cafeId).then((r) => r.data),
    enabled: !!cafeId,
  });

  const { mutate: saveItem, isPending } = useMutation({
    mutationFn: (data) =>
      editItem
        ? api.put(`/menu/item/${editItem._id}`, data)
        : api.post(`/menu/${cafeId}`, data),
    onSuccess: () => {
      toast.success(editItem ? "Item updated!" : "Item added!");
      queryClient.invalidateQueries(["menu", cafeId]);
      setShowForm(false);
      setEditItem(null);
      setForm(EMPTY_FORM);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save item");
    },
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: (id) => api.delete(`/menu/item/${id}`),
    onSuccess: () => {
      toast.success("Item deleted!");
      queryClient.invalidateQueries(["menu", cafeId]);
    },
    onError: () => toast.error("Failed to delete item"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Name and price required");
    saveItem({ ...form, price: parseFloat(form.price) });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category || "",
      description: item.description || "",
      isAvailable: item.isAvailable ?? true,
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const items = data?.items || [];
  const categories = [...new Set(items.map((i) => i.category || "Other"))];

  return (
    <div className="min-h-screen bg-dark-900 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/cafe/dashboard")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">Menu Management</h1>
          <button onClick={openAdd} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5">
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Add/Edit form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-white">
                  {editItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditItem(null); setForm(EMPTY_FORM); }}
                  className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Veg Burger"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`py-1 px-3 rounded-lg text-xs font-heading border transition-all ${
                          form.category === cat
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "border-white/10 text-white/40 hover:border-white/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
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

                {/* <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      form.isAvailable ? "bg-brand-500" : "bg-dark-700 border border-white/10"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.isAvailable ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                  <span className="text-white/60 text-sm font-body">Available</span>
                </div> */}

<div className="flex items-center gap-3">
  <button
    type="button"
    onClick={() =>
      setForm({ ...form, isAvailable: !form.isAvailable })
    }
    className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out ${
      form.isAvailable
        ? "bg-brand-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"
        : "bg-dark-700 border border-white/10"
    }`}
  >
    <span
      className={`absolute top-1/2 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out -translate-y-1/2 ${
        form.isAvailable
          ? "translate-x-5 scale-105"
          : "translate-x-0 scale-100"
      }`}
    />
  </button>

  <span className="text-white/60 text-sm font-body">
    Available
  </span>
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
                      {editItem ? "Update Item" : "Add Item"}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu items */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-dark-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center">
            <UtensilsCrossed size={36} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 font-body text-sm">No menu items yet</p>
            <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <Plus size={14} />
              Add First Item
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-white/40 text-xs font-heading uppercase tracking-widest mb-3">{cat}</h3>
              <div className="space-y-2">
                {items
                  .filter((i) => (i.category || "Other") === cat)
                  .map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`card p-4 flex items-center gap-4 ${!item.isAvailable ? "opacity-50" : ""}`}
                    >
                      <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        🍴
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-heading font-semibold text-sm truncate">{item.name}</p>
                          {!item.isAvailable && (
                            <span className="badge bg-white/5 text-white/30 text-xs">Unavailable</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-white/30 text-xs font-body truncate">{item.description}</p>
                        )}
                        <p className="text-brand-500 font-heading font-bold text-sm mt-0.5">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-7 h-7 rounded-lg bg-dark-700 border border-white/10 flex items-center justify-center hover:border-brand-500/40 transition-all"
                        >
                          <Pencil size={12} className="text-white/50" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this item?")) deleteItem(item._id);
                          }}
                          className="w-7 h-7 rounded-lg bg-dark-700 border border-white/10 flex items-center justify-center hover:border-danger/40 hover:bg-danger/10 transition-all"
                        >
                          <X size={12} className="text-white/50 hover:text-danger" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}