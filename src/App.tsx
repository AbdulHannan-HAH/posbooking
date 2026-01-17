import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import PoolDashboard from "./pages/pool/PoolDashboard";
import PoolBookings from "./pages/pool/PoolBookings";
import NewPoolBooking from "./pages/pool/NewPoolBooking";
import ViewPoolBooking from "./pages/pool/ViewPoolBooking";
import PoolReports from "./pages/pool/PoolReports";
import ConferenceDashboard from "./pages/conference/ConferenceDashboard";
import HotelDashboard from "./pages/hotel/HotelDashboard";
import UsersPage from "./pages/users/UsersPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              
              {/* Pool Routes */}
              <Route path="/pool" element={<PoolDashboard />} />
              <Route path="/pool/bookings" element={<PoolBookings />} />
              <Route path="/pool/bookings/new" element={<NewPoolBooking />} />
              <Route path="/pool/bookings/:id" element={<ViewPoolBooking />} />
              <Route path="/pool/reports" element={<PoolReports />} />
              
              {/* Conference Routes */}
              <Route path="/conference" element={<ConferenceDashboard />} />
              <Route path="/conference/bookings" element={<ConferenceDashboard />} />
              <Route path="/conference/invoices" element={<ConferenceDashboard />} />
              
              {/* Hotel Routes */}
              <Route path="/hotel" element={<HotelDashboard />} />
              <Route path="/hotel/rooms" element={<HotelDashboard />} />
              <Route path="/hotel/reservations" element={<HotelDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/users" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
