import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminProducts from "./pages/Admin/Products";
import AdminOrders from "./pages/Admin/Orders";
import ModuleUnavailable from "./pages/Admin/ModuleUnavailable";
import AdminNotifications from "./pages/Admin/Notifications";
import AdminAnalytics from "./pages/Admin/Analytics";
import AdminAuditLogs from "./pages/Admin/AuditLogs";
import AdminSettings from "./pages/Admin/Settings";
import AdminSecurity from "./pages/Admin/Security";
import AdminSellers from "./pages/Admin/Sellers";
import AdminMessages from "./pages/Admin/Messages";
import AdminSupport from "./pages/Admin/Support";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Admin Layout - PROTÉGÉ */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/sellers" element={<AdminSellers />} />
            <Route path="/messages" element={<AdminMessages />} />
            <Route path="/support" element={<AdminSupport />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/stats" element={<AdminAnalytics />} />
            <Route path="/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/security" element={<AdminSecurity />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route
              path="/finance"
              element={
                <ModuleUnavailable
                  title="Finances"
                  description="Transactions, paiements vendeurs et remboursements."
                  requiredContract="API des transactions, validation des paiements, remboursements et retraits vendeurs."
                />
              }
            />
          </Route>

          {/* Auth - PUBLIC */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}