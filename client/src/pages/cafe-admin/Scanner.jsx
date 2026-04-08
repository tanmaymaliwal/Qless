import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle, Zap, Camera, CameraOff } from "lucide-react";
import { scanOrderApi } from "../../api/orders";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";

export default function Scanner() {
  const navigate = useNavigate();
  const [manualToken, setManualToken] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const { mutate: scanOrder, isPending } = useMutation({
    mutationFn: scanOrderApi,
    onSuccess: (res) => {
      setLastResult({ success: true, order: res.data.order });
      setManualToken("");
      toast.success("Order verified!");
      stopCamera();
    },
    onError: (err) => {
      setLastResult({ success: false, message: err.response?.data?.message || "Invalid order" });
      setManualToken("");
      toast.error(err.response?.data?.message || "Scan failed");
    },
  });

  const processQR = (data) => {
    let qrToken = data.trim();
    try {
      const parsed = JSON.parse(qrToken);
      if (parsed.qrToken) qrToken = parsed.qrToken;
    } catch {
      // use as is
    }
    scanOrder({ qrToken });
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
  };

  const stopCamera = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (cameraActive && scannerRef.current) {
      const html5QrCode = new Html5Qrcode("qr-scanner-container");
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          processQR(decodedText);
        },
        () => {} // ignore errors during scanning
      ).catch((err) => {
        setCameraError("Camera access denied. Please allow camera permission.");
        setCameraActive(false);
      });
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive]);

  const handleManualScan = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return toast.error("Enter QR token");
    processQR(manualToken.trim());
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { stopCamera(); navigate("/cafe/dashboard"); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-brand-500/40 transition-all"
          >
            <ArrowLeft size={16} className="text-white/70" />
          </button>
          <h1 className="font-heading font-bold text-white text-lg">QR Scanner</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Camera scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 text-center"
        >
          {/* Camera view */}
          {cameraActive ? (
            <div className="relative mb-4">
              <div
                id="qr-scanner-container"
                ref={scannerRef}
                className="rounded-2xl overflow-hidden w-full"
              />
              <button
                onClick={stopCamera}
                className="mt-3 flex items-center gap-2 mx-auto text-danger text-sm font-heading border border-danger/30 px-4 py-2 rounded-xl hover:bg-danger/10 transition-all"
              >
                <CameraOff size={14} />
                Stop Camera
              </button>
            </div>
          ) : (
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-dark-700 rounded-2xl flex items-center justify-center">
                <Camera size={48} className="text-white/10" />
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
            </div>
          )}

          {cameraError && (
            <p className="text-danger text-xs font-body mb-3">{cameraError}</p>
          )}

          {!cameraActive && (
            <button
              onClick={startCamera}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              <Camera size={16} />
              Open Camera to Scan
            </button>
          )}

          {/* Manual input */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-white/30 text-xs font-body mb-3">Or enter token manually</p>
            <form onSubmit={handleManualScan} className="space-y-3">
              <input
                type="text"
                placeholder="Enter 8-digit order code"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="input text-sm text-center"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isPending}
                className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={14} />
                    Verify Manually
                  </>
                )}
              </button>
            </form>
          </div>
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
                      {lastResult.order.student?.name || "—"}
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
                          {item.quantity}× {item.name}
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