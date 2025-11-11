import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, Target } from "lucide-react";

const stats = [
  {
    title: "Leads Ativos",
    value: "12",
    change: "+3 esta semana",
    icon: Users,
    color: "text-primary",
  },
  {
    title: "Taxa de Conversão",
    value: "8%",
    change: "+2% vs mês passado",
    icon: TrendingUp,
    color: "text-success",
  },
  {
    title: "Visitas Agendadas",
    value: "5",
    change: "Esta semana",
    icon: Calendar,
    color: "text-info",
  },
  {
    title: "Meta do Mês",
    value: "60%",
    change: "3 de 5 vendas",
    icon: Target,
    color: "text-warning",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta! Aqui está um resumo da sua semana.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-lift border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Minhas Tarefas Hoje</CardTitle>
            <CardDescription>Você tem 4 tarefas pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: "Ligar para João Silva", time: "10:00" },
                { task: "Follow-up Maria Santos", time: "14:30" },
                { task: "Visita - Apto Bairro X", time: "16:00" },
                { task: "Enviar proposta Cliente Z", time: "17:00" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                >
                  <span className="text-sm">{item.task}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>Funil Pessoal</CardTitle>
            <CardDescription>Distribuição dos seus leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stage: "Novo Lead", count: 3, color: "bg-muted" },
                { stage: "Em Atendimento", count: 5, color: "bg-info" },
                { stage: "Visita Agendada", count: 2, color: "bg-warning" },
                { stage: "Em Negociação", count: 2, color: "bg-success" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.stage}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.count / 12) * 100}%` }}
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
