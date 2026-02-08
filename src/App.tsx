// App.tsx
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
import PoolSettings from "./pages/pool/PoolSettings";
import ConferenceDashboard from "./pages/conference/ConferenceDashboard";
import ConferenceBookings from "./pages/conference/ConferenceBookings";
import NewConferenceBooking from "./pages/conference/NewConferenceBooking";
import ViewConferenceBooking from "./pages/conference/ViewConferenceBooking";
import ConferenceReports from "./pages/conference/ConferenceReports";
import ConferenceSettings from "./pages/conference/ConferenceSettings";
import HotelDashboard from "./pages/hotel/HotelDashboard";
import HotelReservations from "./pages/hotel/HotelReservations";
import NewHotelReservation from "./pages/hotel/NewHotelReservation";
import ViewHotelReservation from "./pages/hotel/ViewHotelReservation";
import HotelReports from "./pages/hotel/HotelReports";
import HotelSettings from "./pages/hotel/HotelSettings";
import UsersPage from "./pages/users/UsersPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import HotelRooms from "./pages/hotel/HotelRooms";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
              <Route path="/pool/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PoolSettings />
                </ProtectedRoute>
              } />

              {/* Conference Routes - Accessible by admin and conference_staff */}
              <Route path="/conference" element={
                <ProtectedRoute allowedRoles={['admin', 'conference_staff']}>
                  <ConferenceDashboard />
                </ProtectedRoute>
              } />
              <Route path="/conference/bookings" element={
                <ProtectedRoute allowedRoles={['admin', 'conference_staff']}>
                  <ConferenceBookings />
                </ProtectedRoute>
              } />
              <Route path="/conference/bookings/new" element={
                <ProtectedRoute allowedRoles={['admin', 'conference_staff']}>
                  <NewConferenceBooking />
                </ProtectedRoute>
              } />
              <Route path="/conference/bookings/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'conference_staff']}>
                  <ViewConferenceBooking />
                </ProtectedRoute>
              } />
              <Route path="/conference/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'conference_staff']}>
                  <ConferenceReports />
                </ProtectedRoute>
              } />
              <Route path="/conference/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ConferenceSettings />
                </ProtectedRoute>
              } />

              {/* Hotel Routes - Accessible by admin and hotel_staff */}
              <Route path="/hotel" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <HotelDashboard />
                </ProtectedRoute>
              } />
              <Route path="/hotel/reservations" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <HotelReservations />
                </ProtectedRoute>
              } />
              <Route path="/hotel/reservations/new" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <NewHotelReservation />
                </ProtectedRoute>
              } />
              <Route path="/hotel/reservations/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <ViewHotelReservation />
                </ProtectedRoute>
              } />
              <Route path="/hotel/rooms" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <HotelRooms />
                </ProtectedRoute>
              } />
              <Route path="/hotel/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'hotel_staff']}>
                  <HotelReports />
                </ProtectedRoute>
              } />
              <Route path="/hotel/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <HotelSettings />
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

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;