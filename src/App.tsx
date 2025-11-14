import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadProfile from "./pages/LeadProfile";
import Kanban from "./pages/Kanban";
import Properties from "./pages/Properties";
import PropertyProfile from "./pages/PropertyProfile";
import Brokers from "./pages/Brokers";
import Owners from "./pages/Owners";
import OwnerProfile from "./pages/OwnerProfile";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ThemeProvider>
          <Sonner />
          <AuthProvider>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Leads />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LeadProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kanban"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Kanban />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Properties />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PropertyProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/brokers"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Brokers />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owners"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Owners />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owners/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <OwnerProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Calendar />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
