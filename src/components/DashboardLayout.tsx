import { ReactNode, useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Calendar, UserPlus, Building2, User, Home, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEvents } from "@/hooks/useEvents";
import { useLeads } from "@/hooks/useLeads";
import { useProperties } from "@/hooks/useProperties";
import { useBrokers } from "@/hooks/useBrokers";
import { useOwners } from "@/hooks/useOwners";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateTime } from "@/lib/mappers";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

function HeaderContent() {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: events = [] } = useEvents();
  const { data: leads = [] } = useLeads();
  const { data: properties = [] } = useProperties();
  const { data: brokers = [] } = useBrokers();
  const { data: owners = [] } = useOwners();
  const { data: profile } = useProfile();
  const { signOut, user } = useAuth();
  const { open } = useSidebar();

  // Posicionar dropdown e fechar ao clicar fora
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (searchRef.current && dropdownRef.current && isSearchOpen) {
        const rect = searchRef.current.getBoundingClientRect();
        dropdownRef.current.style.position = "fixed";
        dropdownRef.current.style.top = `${rect.bottom + 8}px`;
        dropdownRef.current.style.left = `${rect.left}px`;
        dropdownRef.current.style.width = `${rect.width}px`;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

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

  // Filtrar resultados da busca
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { leads: [], properties: [], brokers: [], owners: [] };

    const term = searchTerm.toLowerCase();
    
    const filteredLeads = leads.filter((lead) => 
      lead.name.toLowerCase().includes(term) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      lead.phone.includes(term)
    ).slice(0, 5);

    const filteredProperties = properties.filter((property) =>
      property.title?.toLowerCase().includes(term) ||
      property.address?.toLowerCase().includes(term) ||
      property.city?.toLowerCase().includes(term)
    ).slice(0, 5);

    const filteredBrokers = brokers.filter((broker) =>
      broker.name.toLowerCase().includes(term) ||
      broker.email.toLowerCase().includes(term)
    ).slice(0, 5);

    const filteredOwners = owners.filter((owner) =>
      owner.name.toLowerCase().includes(term) ||
      (owner.email && owner.email.toLowerCase().includes(term)) ||
      (owner.phone && owner.phone.includes(term))
    ).slice(0, 5);

    return {
      leads: filteredLeads,
      properties: filteredProperties,
      brokers: filteredBrokers,
      owners: filteredOwners,
    };
  }, [searchTerm, leads, properties, brokers, owners]);

  const hasResults = 
    searchResults.leads.length > 0 ||
    searchResults.properties.length > 0 ||
    searchResults.brokers.length > 0 ||
    searchResults.owners.length > 0;

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
          
          <div className="relative max-w-md flex-1 min-w-0" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Buscar leads, imóveis, corretores..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary w-full cursor-text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim()) {
                  setIsSearchOpen(true);
                } else {
                  setIsSearchOpen(false);
                }
              }}
              onFocus={() => {
                if (searchTerm.trim()) {
                  setIsSearchOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
            />
            {isSearchOpen && createPortal(
              <div 
                ref={dropdownRef}
                className="bg-popover border rounded-md shadow-lg z-[100] max-h-[400px] overflow-hidden"
              >
                <Command shouldFilter={false}>
                  <CommandList className="max-h-[400px]">
                    {!searchTerm.trim() ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Digite para buscar...
                      </div>
                    ) : !hasResults ? (
                      <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
                    ) : (
                      <>
                        {searchResults.leads.length > 0 && (
                          <CommandGroup heading="Leads">
                            {searchResults.leads.map((lead) => (
                              <CommandItem
                                key={lead.id}
                                onSelect={() => {
                                  navigate(`/leads/${lead.id}`);
                                  setIsSearchOpen(false);
                                  setSearchTerm("");
                                }}
                                className="cursor-pointer"
                              >
                                <User className="mr-2 h-4 w-4" />
                                <div className="flex flex-col">
                                  <span>{lead.name}</span>
                                  {lead.email && (
                                    <span className="text-xs text-muted-foreground">{lead.email}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        {searchResults.properties.length > 0 && (
                          <CommandGroup heading="Imóveis">
                            {searchResults.properties.map((property) => (
                              <CommandItem
                                key={property.id}
                                onSelect={() => {
                                  navigate(`/properties/${property.id}`);
                                  setIsSearchOpen(false);
                                  setSearchTerm("");
                                }}
                                className="cursor-pointer"
                              >
                                <Home className="mr-2 h-4 w-4" />
                                <div className="flex flex-col">
                                  <span>{property.title || property.address}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {property.city}, {property.state}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        {searchResults.brokers.length > 0 && (
                          <CommandGroup heading="Corretores">
                            {searchResults.brokers.map((broker) => (
                              <CommandItem
                                key={broker.id}
                                onSelect={() => {
                                  navigate("/brokers");
                                  setIsSearchOpen(false);
                                  setSearchTerm("");
                                }}
                                className="cursor-pointer"
                              >
                                <User className="mr-2 h-4 w-4" />
                                <div className="flex flex-col">
                                  <span>{broker.name}</span>
                                  <span className="text-xs text-muted-foreground">{broker.email}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        {searchResults.owners.length > 0 && (
                          <CommandGroup heading="Proprietários">
                            {searchResults.owners.map((owner) => (
                              <CommandItem
                                key={owner.id}
                                onSelect={() => {
                                  navigate(`/owners/${owner.id}`);
                                  setIsSearchOpen(false);
                                  setSearchTerm("");
                                }}
                                className="cursor-pointer"
                              >
                                <Building2 className="mr-2 h-4 w-4" />
                                <div className="flex flex-col">
                                  <span>{owner.name}</span>
                                  {owner.email && (
                                    <span className="text-xs text-muted-foreground">{owner.email}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </>
                    )}
                  </CommandList>
                </Command>
              </div>,
              document.body
            )}
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
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto p-2 hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Usuário"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-medium">
                    {profile?.name 
                      ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : "U"
                    }
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.name || "Usuário"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "Carregando..."}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
