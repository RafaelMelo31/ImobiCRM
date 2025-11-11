import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadProfile from "./pages/LeadProfile";
import Kanban from "./pages/Kanban";
import Properties from "./pages/Properties";
import Brokers from "./pages/Brokers";
import Owners from "./pages/Owners";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/leads"
            element={
              <DashboardLayout>
                <Leads />
              </DashboardLayout>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <DashboardLayout>
                <LeadProfile />
              </DashboardLayout>
            }
          />
          <Route
            path="/kanban"
            element={
              <DashboardLayout>
                <Kanban />
              </DashboardLayout>
            }
          />
          <Route
            path="/properties"
            element={
              <DashboardLayout>
                <Properties />
              </DashboardLayout>
            }
          />
          <Route
            path="/brokers"
            element={
              <DashboardLayout>
                <Brokers />
              </DashboardLayout>
            }
          />
          <Route
            path="/owners"
            element={
              <DashboardLayout>
                <Owners />
              </DashboardLayout>
            }
          />
          <Route
            path="/calendar"
            element={
              <DashboardLayout>
                <Calendar />
              </DashboardLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
