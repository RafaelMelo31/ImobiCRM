import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Kanban from "./pages/Kanban";
import Properties from "./pages/Properties";
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
            path="/owners"
            element={
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold">Proprietários</h2>
                  <p className="text-muted-foreground mt-2">Em desenvolvimento</p>
                </div>
              </DashboardLayout>
            }
          />
          <Route
            path="/calendar"
            element={
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold">Agenda</h2>
                  <p className="text-muted-foreground mt-2">Em desenvolvimento</p>
                </div>
              </DashboardLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold">Relatórios</h2>
                  <p className="text-muted-foreground mt-2">Em desenvolvimento</p>
                </div>
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
