import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Minus, ShoppingCart, Zap, X } from "lucide-react";
import { getMenuApi } from "../../api/cafes";
import { placeOrderApi } from "../../api/orders";
import { getWalletApi } from "../../api/wallet";
import toast from "react-hot-toast";

export default function StudentMenu() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);

  const { data: menuData, isLoading } = useQuery({
    queryKey: ["menu", cafeId],
    queryFn: () => getMenuApi(cafeId).then((r) => r.data),
  });

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getWalletApi().then((r) => r.data),
  });

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: placeOrderApi,
    onSuccess: () => {
      toast.success("Order placed! 🎉");
      navigate("/orders");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Order failed");
    },
  });

  const items = menuData?.items || [];
  const balance = walletData?.balance || 0;

  const addToCart = (item) => {
    setCart((prev) => ({ ...prev, [item._id]: (prev[item._id] || 0) + 1 }));
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[item._id] > 1) updated[item._id]--;
      else delete updated[item._id];
      return updated;
    });
  };

  const cartItems = items.filter((i) => cart[i._id]);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * cart[i._id], 0);

  const handleOrder = () => {
    if (cartItems.length === 0) return toast.error("Cart is empty");
    if (cartTotal > balance) return toast.error("Insufficient wallet balance");
    placeOrder({
      cafeId,
      items: cartItems.map((i) => ({ menuItem: i._id, quantity: cart[i._id] })),
    });
  };

  // Group by category
  const categories = [...new Set(items.map((i) => i.category || "Other"))];

  return (
    <div className="min-h-screen bg-dark-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">Menu</h1>
          <button
            onClick={() => setShowCart(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ShoppingCart size={16} className="text-white/70" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 rounded-full text-white text-xs flex items-center justify-center font-heading font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-dark-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-700 rounded w-1/2" />
                    <div className="h-3 bg-dark-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-white/50 font-body text-sm">No items on menu yet</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              <h2 className="font-heading font-bold text-white/60 text-xs uppercase tracking-widest mb-3">
                {cat}
              </h2>
              <div className="space-y-3">
                {items
                  .filter((i) => (i.category || "Other") === cat)
                  .map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="card p-4 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        🍴
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-heading font-semibold text-sm truncate">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-white/30 text-xs font-body truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <p className="text-brand-500 font-heading font-bold text-sm mt-1">
                          ₹{item.price}
                        </p>
                      </div>
                      {/* Add/Remove */}
                      {cart[item._id] ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => removeFromCart(item)}
                            className="w-7 h-7 rounded-lg bg-dark-700 border border-white/10 flex items-center justify-center hover:border-brand-500/40 transition-all"
                          >
                            <Minus size={12} className="text-white" />
                          </button>
                          <span className="text-white font-heading font-bold text-sm w-4 text-center">
                            {cart[item._id]}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center hover:bg-brand-600 transition-all shadow-glow"
                          >
                            <Plus size={12} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center hover:bg-brand-500 transition-all group"
                        >
                          <Plus size={14} className="text-brand-500 group-hover:text-white" />
                        </button>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating cart button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-4 right-4 max-w-sm mx-auto"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full btn-primary flex items-center justify-between px-5 py-3.5 shadow-glow"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} />
                <span>{cartCount} items</span>
              </div>
              <span className="font-bold">₹{cartTotal} →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/60 z-20"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/10 rounded-t-3xl z-30 p-5 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-white text-xl">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 rounded-xl bg-dark-700 flex items-center justify-center"
                >
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="text-center text-white/40 font-body py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-heading font-semibold text-sm">{item.name}</p>
                          <p className="text-white/40 text-xs">₹{item.price} × {cart[item._id]}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(item)}
                            className="w-6 h-6 rounded-lg bg-dark-700 flex items-center justify-center">
                            <Minus size={11} className="text-white" />
                          </button>
                          <span className="text-white font-bold text-sm w-4 text-center">{cart[item._id]}</span>
                          <button onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
                            <Plus size={11} className="text-white" />
                          </button>
                        </div>
                        <p className="text-brand-500 font-heading font-bold text-sm ml-4 w-14 text-right">
                          ₹{item.price * cart[item._id]}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-5">
                    <div className="flex justify-between mb-1">
                      <span className="text-white/50 font-body text-sm">Total</span>
                      <span className="text-white font-heading font-bold">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 font-body text-sm">Wallet balance</span>
                      <span className={`font-heading font-bold text-sm ${balance >= cartTotal ? "text-success" : "text-danger"}`}>
                        ₹{balance}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleOrder}
                    disabled={isPending || cartTotal > balance}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap size={16} fill="white" />
                        Place Order · ₹{cartTotal}
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}