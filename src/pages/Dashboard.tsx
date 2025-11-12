import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, Target } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { leadStatusMap, formatDateTime } from "@/lib/mappers";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { user } = useAuth();

  // Calcular estatísticas
  const activeLeads = leads.filter(
    (lead) => lead.status !== "fechado" && lead.status !== "perdido"
  ).length;
  
  const totalLeads = leads.length;
  const closedLeads = leads.filter((lead) => lead.status === "fechado").length;
  const conversionRate = totalLeads > 0 
    ? Math.round((closedLeads / totalLeads) * 100) 
    : 0;

  // Eventos de hoje
  const todayEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return events
      .filter((event) => {
        const eventDate = new Date(event.start_time);
        return eventDate >= today && eventDate < tomorrow;
      })
      .sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      .slice(0, 4);
  }, [events]);

  // Distribuição de leads por status
  const funnelData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      novo: 0,
      contato: 0,
      proposta: 0,
      negociacao: 0,
    };

    leads.forEach((lead) => {
      if (statusCounts.hasOwnProperty(lead.status)) {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      }
    });

    const maxCount = Math.max(...Object.values(statusCounts), 1);

    return [
      { stage: "Novo Lead", count: statusCounts.novo, color: "bg-blue-500" },
      { stage: "Em Atendimento", count: statusCounts.contato, color: "bg-yellow-500" },
      { stage: "Visita Agendada", count: statusCounts.proposta, color: "bg-purple-500" },
      { stage: "Em Negociação", count: statusCounts.negociacao, color: "bg-green-500" },
    ].map((item) => ({
      ...item,
      percentage: maxCount > 0 ? (item.count / maxCount) * 100 : 0,
    }));
  }, [leads]);

  if (leadsLoading || eventsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta{user?.email ? `, ${user.email.split("@")[0]}` : ""}! Aqui está um resumo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalLeads} total de leads
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {closedLeads} negócios fechados
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {events.length} eventos total
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meta do Mês
            </CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {closedLeads} de {totalLeads} leads
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Eventos de Hoje</CardTitle>
            <CardDescription>
              {todayEvents.length > 0 
                ? `Você tem ${todayEvents.length} evento${todayEvents.length !== 1 ? 's' : ''} hoje`
                : "Nenhum evento agendado para hoje"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => {
                  const eventDate = new Date(event.start_time);
                  const timeString = eventDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <span className="text-sm">{event.title}</span>
                      <span className="text-xs text-muted-foreground">{timeString}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento agendado para hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>Funil de Leads</CardTitle>
            <CardDescription>Distribuição dos seus leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.stage}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
