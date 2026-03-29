import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/layout/ProtectedRoute";

//Super admin 
import SuperDashboard from "./pages/super-admin/Dashboard";
import SuperColleges from "./pages/super-admin/Colleges";
import SuperUsers from "./pages/super-admin/Users";
import SuperCafes from "./pages/super-admin/Cafes";
// Auth pages
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student pages
import StudentHome   from "./pages/student/Home";
import StudentMenu   from "./pages/student/Menu";
import StudentOrders from "./pages/student/Orders";
import StudentWallet from "./pages/student/Wallet";

// Cafe Admin pages
import CafeDashboard from "./pages/cafe-admin/Dashboard";
import CafeMenu      from "./pages/cafe-admin/MenuManagement";
import CafeScanner   from "./pages/cafe-admin/Scanner";

// College Admin pages
import CollegeDashboard from "./pages/college-admin/Dashboard";
import CollegeCafes     from "./pages/college-admin/Cafes";

// Misc
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1e1e",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <Routes>
          {/* super admin */}
          {/* Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route path="/super/dashboard" element={<SuperDashboard />} />
            <Route path="/super/colleges" element={<SuperColleges />} />
            <Route path="/super/users"    element={<SuperUsers />} />
            <Route path="/super/cafes"    element={<SuperCafes />} />
          </Route>
          {/* Public */}
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/"             element={<Navigate to="/login" replace />} />

          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/home"             element={<StudentHome />} />
            <Route path="/menu/:cafeId"     element={<StudentMenu />} />
            <Route path="/orders"           element={<StudentOrders />} />
            <Route path="/wallet"           element={<StudentWallet />} />
          </Route>

          {/* Cafe Admin */}
          <Route element={<ProtectedRoute allowedRoles={["cafe_admin"]} />}>
            <Route path="/cafe/dashboard"   element={<CafeDashboard />} />
            <Route path="/cafe/menu"        element={<CafeMenu />} />
            <Route path="/cafe/scanner"     element={<CafeScanner />} />
          </Route>

          {/* College Admin */}
          <Route element={<ProtectedRoute allowedRoles={["college_admin"]} />}>
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/cafes"     element={<CollegeCafes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}