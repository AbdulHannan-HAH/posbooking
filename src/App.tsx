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
import ProtectedRoute from "./components/ProtectedRoute";
import PoolSettings from "./pages/pool/PoolSettings";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes with Layout */}
            <Route element={<DashboardLayout />}>
              {/* Admin Dashboard - Only accessible by admin */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pool/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PoolSettings />
                </ProtectedRoute>
              } />

              {/* Pool Routes - Accessible by admin and pool_staff */}
              <Route path="/pool" element={
                <ProtectedRoute allowedRoles={['admin', 'pool_staff']}>
                  <PoolDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pool/bookings" element={
                <ProtectedRoute allowedRoles={['admin', 'pool_staff']}>
                  <PoolBookings />
                </ProtectedRoute>
              } />
              <Route path="/pool/bookings/new" element={
                <ProtectedRoute allowedRoles={['admin', 'pool_staff']}>
                  <NewPoolBooking />
                </ProtectedRoute>
              } />
              <Route path="/pool/bookings/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'pool_staff']}>
                  <ViewPoolBooking />
                </ProtectedRoute>
              } />
              <Route path="/pool/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'pool_staff']}>
                  <PoolReports />
                </ProtectedRoute>
              } />

              {/* Conference Routes - Accessible by admin and conference_staff */}
              <Route path="/conference" element={
                <ProtectedRoute allowedRoles={['admin', 'conference_staff']}>
                  <ConferenceDashboard />
                </ProtectedRoute>
              } />

              {/* Hotel Routes - Accessible by admin and hotel_staff */}
              <Route path="/hotel" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <HotelDashboard />
                </ProtectedRoute>
              } />

              {/* Admin Only Routes */}
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
            </Route>


            // Add to protected routes
            <Route path="/pool/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PoolSettings />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;