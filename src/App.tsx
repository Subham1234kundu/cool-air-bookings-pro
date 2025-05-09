
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./hooks/useAuth";
import { useEffect } from "react";
import { ensureServiceImagesBucket } from "./services/supabase/storage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ServicesPage from "./pages/ServicesPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const AppContent = () => {
  useEffect(() => {
    // Initialize storage bucket for service images
    ensureServiceImagesBucket().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
