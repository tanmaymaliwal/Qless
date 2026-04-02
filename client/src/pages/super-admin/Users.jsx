import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X, User, Mail, Phone, Zap, Search, ToggleLeft, ToggleRight, Building } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", role: "college_admin", collegeCode: "", cafeId: "" };
const ROLES = ["college_admin", "cafe_admin", "student"];

const ROLE_COLORS = {
  super_admin:   "bg-brand-500/10 text-brand-500",
  college_admin: "bg-warning/10 text-warning",
  cafe_admin:    "bg-info/10 text-info",
  student:       "bg-success/10 text-success",
};

export default function SuperUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["super-users"],
    queryFn: () => api.get("/super/users").then((r) => r.data),
  });

  const { data: collegesData } = useQuery({
    queryKey: ["super-colleges"],
    queryFn: () => api.get("/super/colleges").then((r) => r.data),
  });

  const { data: cafesData } = useQuery({
    queryKey: ["super-cafes"],
    queryFn: () => api.get("/super/cafes").then((r) => r.data),
  });

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: (data) => api.post("/super/users", data),
    onSuccess: () => {
      toast.success("User created!");
      queryClient.invalidateQueries(["super-users"]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create user");
    },
  });

  const { mutate: toggleUser , isPending: isToggling } = useMutation({
    mutationFn: (id) => api.put(`/super/users/${id}/toggle`),
    onSuccess: () => {
      toast.success("User status updated!");
      queryClient.invalidateQueries(["super-users"]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Fill all required fields");
    createUser(form);
  };

  const users = data?.users || [];
  const colleges = collegesData?.colleges || [];
  const cafes = cafesData?.cafes || [];

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

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
          <h1 className="font-heading font-bold text-white text-lg">Users</h1>
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
                <h2 className="font-heading font-bold text-white">Create User</h2>
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
                    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input pl-9 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input pl-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      placeholder="email@college.edu"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 chars, upper+lower+number"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">Role</label>
                  <div className="flex gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={`py-1.5 px-3 rounded-xl text-xs font-heading font-semibold border transition-all ${
                          form.role === role
                            ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                            : "border-white/10 text-white/40 hover:border-white/20"
                        }`}
                      >
                        {role === "college_admin" ? "College Admin" : role === "cafe_admin" ? "Cafe Admin" : "Student"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">College</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <select
                      value={form.collegeCode}
                      onChange={(e) => setForm({ ...form, collegeCode: e.target.value })}
                      className="input pl-9 text-sm appearance-none"
                    >
                      <option value="">Select college</option>
                      {colleges.map((c) => (
                        <option key={c._id} value={c.code}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {form.role === "cafe_admin" && (
  <div>
    <label className="text-white/60 text-xs font-heading uppercase tracking-wider mb-1.5 block">
      Assign Cafe
    </label>
    <select
      value={form.cafeId}
      onChange={(e) => setForm({ ...form, cafeId: e.target.value })}
      className="input text-sm appearance-none"
    >
      <option value="">Select cafe</option>
      {cafes
        .filter((c) => form.collegeCode === "" || c.college?.code === form.collegeCode)
        .map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
    </select>
  </div>
)}
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
                      Create User
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input text-sm w-36 appearance-none"
          >
            <option value="all">All Roles</option>
            <option value="college_admin">College Admin</option>
            <option value="cafe_admin">Cafe Admin</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* Users list */}
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
            <User size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 font-body text-sm">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user, i) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-heading font-semibold text-sm truncate">{user.name}</p>
                    <span className={`badge text-xs ${ROLE_COLORS[user.role] || "bg-white/5 text-white/40"}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs font-body mt-0.5">{user.email}</p>
                  {user.college && (
                    <p className="text-white/20 text-xs font-body mt-0.5">{user.college?.name || "—"}</p>
                  )}
                </div>
               
                <button
                  onClick={() => toggleCollege(user._id)}
                  className="flex-shrink-0 disabled:opacity-50"
                  disabled={false}
                >
                  {user.isActive ? (
                    <ToggleRight size={28} className="text-success" />
                  ) : (
                    <ToggleLeft size={28} className="text-white/20" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}