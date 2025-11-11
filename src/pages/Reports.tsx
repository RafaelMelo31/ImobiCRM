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
import { useState } from "react";

const salesFunnelData = [
  { name: "Novo Lead", value: 45, conversion: 100 },
  { name: "Contato Inicial", value: 38, conversion: 84 },
  { name: "Qualificado", value: 28, conversion: 62 },
  { name: "Visita Agendada", value: 22, conversion: 49 },
  { name: "Proposta", value: 15, conversion: 33 },
  { name: "Negociação", value: 10, conversion: 22 },
  { name: "Fechado", value: 8, conversion: 18 },
];

const monthlyPerformanceData = [
  { month: "Jul", leads: 42, deals: 8, revenue: 850000 },
  { month: "Ago", leads: 38, deals: 6, revenue: 720000 },
  { month: "Set", leads: 51, deals: 10, revenue: 1100000 },
  { month: "Out", leads: 48, deals: 9, revenue: 950000 },
  { month: "Nov", leads: 55, deals: 12, revenue: 1250000 },
  { month: "Dez", leads: 62, deals: 15, revenue: 1580000 },
];

const sourceData = [
  { name: "Site", value: 35, color: "hsl(var(--primary))" },
  { name: "Indicação", value: 28, color: "hsl(var(--accent))" },
  { name: "Redes Sociais", value: 22, color: "hsl(var(--success))" },
  { name: "Portais", value: 15, color: "hsl(var(--warning))" },
];

const brokerRankingData = [
  { name: "Ana Costa", deals: 15, revenue: 1850000 },
  { name: "Carlos Silva", deals: 12, revenue: 1520000 },
  { name: "Pedro Martins", deals: 10, revenue: 1280000 },
  { name: "Julia Oliveira", deals: 8, revenue: 950000 },
];

export default function Reports() {
  const [period, setPeriod] = useState("monthly");

  const totalRevenue = monthlyPerformanceData.reduce((sum, d) => sum + d.revenue, 0);
  const totalDeals = monthlyPerformanceData.reduce((sum, d) => sum + d.deals, 0);
  const totalLeads = monthlyPerformanceData.reduce((sum, d) => sum + d.leads, 0);
  const conversionRate = Math.round((totalDeals / totalLeads) * 100);

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
                R$ {(totalRevenue / 1000000).toFixed(1)}M
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
                  R$ {(broker.revenue / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-muted-foreground">em vendas</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
