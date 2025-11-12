import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Calendar, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/hooks/useEvents";
import { useLeads } from "@/hooks/useLeads";
import { formatDateTime } from "@/lib/mappers";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

function HeaderContent() {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { data: events = [] } = useEvents();
  const { data: leads = [] } = useLeads();
  const { open } = useSidebar();

  // Buscar eventos próximos (próximas 24 horas)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const upcomingEvents = events.filter((event) => {
    const startTime = new Date(event.start_time);
    return startTime >= now && startTime <= tomorrow;
  });

  // Buscar leads novos (últimas 24 horas)
  const recentLeads = leads.filter((lead) => {
    const createdAt = new Date(lead.created_at);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return createdAt >= dayAgo;
  });

  // Combinar notificações
  const notifications = [
    ...upcomingEvents.map((event) => ({
      id: event.id,
      type: "event" as const,
      title: event.title,
      message: `Evento agendado: ${formatDateTime(event.start_time)}`,
      time: event.start_time,
      link: event.lead_id ? `/leads/${event.lead_id}` : "/calendar",
      icon: Calendar,
    })),
    ...recentLeads.slice(0, 5).map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      title: "Novo Lead",
      message: `${lead.name} foi adicionado`,
      time: lead.created_at,
      link: `/leads/${lead.id}`,
      icon: UserPlus,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const unreadCount = notifications.length;

  // Calcular a posição left baseado no estado da sidebar
  // Sidebar expandida: w-60 (240px), colapsada: w-14 (56px) - valores do AppSidebar.tsx
  const sidebarWidth = open ? 240 : 56;

  return (
    <header 
      className="h-16 border-b border-border bg-card fixed top-0 z-50 backdrop-blur-sm bg-card/95 transition-all duration-300 ease-in-out"
      style={{ 
        left: `${sidebarWidth}px`,
        right: 0,
        width: `calc(100% - ${sidebarWidth}px)`
      }}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4 max-w-full overflow-hidden">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <SidebarTrigger className="hover:bg-muted transition-colors duration-200 shrink-0" />
          
          <div className="relative max-w-md flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar leads, imóveis..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notificações</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount}</Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            navigate(notification.link);
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDateTime(notification.time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          <ThemeToggle />
          
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
            RC
          </div>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <HeaderContent />
          
          <main className="flex-1 p-6 bg-background mt-16 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
