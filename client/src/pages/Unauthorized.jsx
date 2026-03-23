import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldX, Zap } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ShieldX size={48} className="text-danger/50 mx-auto mb-4" />
        <h1 className="font-display text-4xl text-white mb-2">ACCESS DENIED</h1>
        <p className="text-white/40 font-body text-sm mb-6">
          You don't have permission to view this page.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Zap size={15} fill="white" />
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}