import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Users, Target, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useBrokers } from "@/hooks/useBrokers";
import { useProperties } from "@/hooks/useProperties";
import { leadStatusMap, leadOriginMap, formatCurrency } from "@/lib/mappers";

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const { data: leads = [] } = useLeads();
  const { data: brokers = [] } = useBrokers();
  const { data: properties = [] } = useProperties();

  // Calcular dados do funil de vendas
  const salesFunnelData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      novo: 0,
      contato: 0,
      qualificado: 0,
      proposta: 0,
      negociacao: 0,
      fechado: 0,
      perdido: 0,
    };

    leads.forEach((lead) => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });

    const total = leads.length;
    return [
      { name: "Novo Lead", value: statusCounts.novo, conversion: total > 0 ? Math.round((statusCounts.novo / total) * 100) : 0 },
      { name: "Contato", value: statusCounts.contato, conversion: total > 0 ? Math.round((statusCounts.contato / total) * 100) : 0 },
      { name: "Qualificado", value: statusCounts.qualificado, conversion: total > 0 ? Math.round((statusCounts.qualificado / total) * 100) : 0 },
      { name: "Proposta", value: statusCounts.proposta, conversion: total > 0 ? Math.round((statusCounts.proposta / total) * 100) : 0 },
      { name: "Negociação", value: statusCounts.negociacao, conversion: total > 0 ? Math.round((statusCounts.negociacao / total) * 100) : 0 },
      { name: "Fechado", value: statusCounts.fechado, conversion: total > 0 ? Math.round((statusCounts.fechado / total) * 100) : 0 },
    ];
  }, [leads]);

  // Calcular dados de origem
  const sourceData = useMemo(() => {
    const originCounts: Record<string, number> = {};
    
    leads.forEach((lead) => {
      const originLabel = leadOriginMap[lead.origin] || lead.origin;
      originCounts[originLabel] = (originCounts[originLabel] || 0) + 1;
    });

    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--accent))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--destructive))",
    ];

    return Object.entries(originCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [leads]);

  // Ranking de brokers
  const brokerRankingData = useMemo(() => {
    return brokers
      .map((broker) => ({
        name: broker.name,
        deals: broker.closedDeals || 0,
        revenue: 0, // Calcular receita baseada em propriedades vendidas se necessário
      }))
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 5);
  }, [brokers]);

  // Calcular métricas gerais
  const totalLeads = leads.length;
  const totalDeals = leads.filter((l) => l.status === "fechado").length;
  const totalRevenue = properties
    .filter((p) => p.status === "vendido" && p.price)
    .reduce((sum, p) => sum + (p.price || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((totalDeals / totalLeads) * 100) : 0;

  // Dados mensais simplificados (poderia ser expandido para agrupar por mês)
  const monthlyPerformanceData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => {
      // Simulação - em produção, agrupar por mês de criação
      const monthLeads = Math.floor(leads.length / 6);
      const monthDeals = Math.floor(totalDeals / 6);
      const monthRevenue = Math.floor(totalRevenue / 6);
      
      return {
        month,
        leads: monthLeads,
        deals: monthDeals,
        revenue: monthRevenue,
      };
    });
  }, [leads, totalDeals, totalRevenue]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa do desempenho da equipe
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">
                {totalRevenue > 1000000 
                  ? `R$ ${(totalRevenue / 1000000).toFixed(1)}M`
                  : formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Negócios Fechados</p>
              <p className="text-2xl font-bold">{totalDeals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold">{conversionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Desempenho Mensal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Leads"
              />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Negócios"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Origem dos Leads</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Funil de Vendas</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={salesFunnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis dataKey="name" type="category" width={150} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="value" fill="hsl(var(--primary))" name="Leads" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ranking de Corretores</h2>
        <div className="space-y-4">
          {brokerRankingData.map((broker, index) => (
            <div
              key={broker.name}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{broker.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {broker.deals} negócios fechados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success">
                  {broker.revenue > 0 
                    ? broker.revenue > 1000000
                      ? `R$ ${(broker.revenue / 1000000).toFixed(2)}M`
                      : formatCurrency(broker.revenue)
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {broker.revenue > 0 ? "em vendas" : broker.deals > 0 ? "negócios" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
