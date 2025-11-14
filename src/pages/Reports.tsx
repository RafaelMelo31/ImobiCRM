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
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Extensão de tipo para autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
      .map((broker) => {
        // Calcular negócios fechados para este corretor
        const closedDeals = leads.filter(
          (lead) => 
            lead.assigned_broker_id !== null && 
            lead.assigned_broker_id === broker.id && 
            lead.status === "fechado"
        ).length;

        return {
          name: broker.name,
          deals: closedDeals,
          revenue: 0, // Calcular receita baseada em propriedades vendidas se necessário
        };
      })
      .filter((broker) => broker.deals > 0) // Filtrar apenas corretores com negócios fechados
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 5);
  }, [brokers, leads]);

  // Calcular métricas gerais
  const totalLeads = leads.length;
  const totalDeals = leads.filter((l) => l.status === "fechado").length;
  const totalRevenue = useMemo(() => {
    return properties
      .filter((p) => p.status === "vendido" && p.price != null)
      .reduce((sum, p) => {
        // Garantir que o preço seja convertido para número
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
  }, [properties]);
  const conversionRate = totalLeads > 0 ? Math.round((totalDeals / totalLeads) * 100) : 0;

  // Dados mensais agrupados por mês real
  const monthlyPerformanceData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Determinar quantos meses mostrar baseado no período selecionado
    let monthsToShow = 6; // padrão: últimos 6 meses
    if (period === "weekly") monthsToShow = 1;
    else if (period === "monthly") monthsToShow = 6;
    else if (period === "quarterly") monthsToShow = 12;
    else if (period === "yearly") monthsToShow = 12;
    
    // Criar array de meses para exibir
    const monthsArray: Array<{ month: string; monthIndex: number; year: number }> = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      monthsArray.push({
        month: months[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
      });
    }
    
    // Agrupar leads por mês
    const leadsByMonth: Record<string, number> = {};
    leads.forEach((lead) => {
      if (lead.created_at) {
        const leadDate = new Date(lead.created_at);
        const monthKey = `${leadDate.getFullYear()}-${leadDate.getMonth()}`;
        leadsByMonth[monthKey] = (leadsByMonth[monthKey] || 0) + 1;
      }
    });
    
    // Agrupar negócios fechados por mês (baseado na data de criação do lead)
    const dealsByMonth: Record<string, number> = {};
    leads
      .filter((lead) => lead.status === "fechado")
      .forEach((lead) => {
        if (lead.created_at) {
          const leadDate = new Date(lead.created_at);
          const monthKey = `${leadDate.getFullYear()}-${leadDate.getMonth()}`;
          dealsByMonth[monthKey] = (dealsByMonth[monthKey] || 0) + 1;
        }
      });
    
    // Agrupar receita por mês (baseado na data de atualização quando status é vendido)
    const revenueByMonth: Record<string, number> = {};
    properties
      .filter((property) => property.status === "vendido" && property.price != null)
      .forEach((property) => {
        if (property.updated_at) {
          const propertyDate = new Date(property.updated_at);
          const monthKey = `${propertyDate.getFullYear()}-${propertyDate.getMonth()}`;
          // Garantir que o preço seja convertido para número
          const price = typeof property.price === 'string' ? parseFloat(property.price) : (property.price || 0);
          const validPrice = isNaN(price) ? 0 : price;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + validPrice;
        }
      });
    
    // Mapear para o formato do gráfico
    return monthsArray.map(({ month, monthIndex, year }) => {
      const monthKey = `${year}-${monthIndex}`;
      // Mostrar ano apenas se não for o ano atual ou se houver múltiplos anos
      const showYear = year !== currentYear || monthsArray.some(m => m.year !== year);
      return {
        month: showYear ? `${month} ${year}` : month,
        leads: leadsByMonth[monthKey] || 0,
        deals: dealsByMonth[monthKey] || 0,
        revenue: revenueByMonth[monthKey] || 0,
      };
    });
  }, [leads, properties, period]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      
      // Configurações do PDF
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      // Título
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Desempenho", margin, yPos);
      yPos += 10;
      
      // Data de geração
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;
      doc.text(`Gerado em: ${dateStr}`, margin, yPos);
      yPos += 15;
      
      // Período selecionado
      const periodLabels: Record<string, string> = {
        weekly: "Semanal",
        monthly: "Mensal",
        quarterly: "Trimestral",
        yearly: "Anual"
      };
      doc.text(`Período: ${periodLabels[period] || "Mensal"}`, margin, yPos);
      yPos += 10;
      
      // Métricas principais
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Métricas Principais", margin, yPos);
      yPos += 8;
      
      const metrics = [
        ["Receita Total", totalRevenue > 1000000 
          ? `R$ ${(totalRevenue / 1000000).toFixed(1)}M`
          : formatCurrency(totalRevenue)],
        ["Negócios Fechados", totalDeals.toString()],
        ["Total de Leads", totalLeads.toString()],
        ["Taxa de Conversão", `${conversionRate}%`]
      ];
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      metrics.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, margin + 5, yPos);
        yPos += 7;
      });
      yPos += 5;
      
      // Funil de Vendas
      if (salesFunnelData.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Funil de Vendas", margin, yPos);
        yPos += 8;
        
        const funnelTableData = salesFunnelData.map(item => [
          item.name,
          item.value.toString(),
          `${item.conversion}%`
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [["Etapa", "Quantidade", "Taxa de Conversão"]],
          body: funnelTableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Origem dos Leads
      if (sourceData.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Origem dos Leads", margin, yPos);
        yPos += 8;
        
        const totalOriginLeads = sourceData.reduce((sum, item) => sum + item.value, 0);
        const originTableData = sourceData.map(item => [
          item.name,
          item.value.toString(),
          `${((item.value / totalOriginLeads) * 100).toFixed(1)}%`
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [["Origem", "Quantidade", "Percentual"]],
          body: originTableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Desempenho Mensal
      if (monthlyPerformanceData.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Desempenho Mensal", margin, yPos);
        yPos += 8;
        
        const monthlyTableData = monthlyPerformanceData.map(item => [
          item.month,
          item.leads.toString(),
          item.deals.toString(),
          formatCurrency(item.revenue)
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [["Mês", "Leads", "Negócios", "Receita"]],
          body: monthlyTableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Ranking de Corretores
      if (brokerRankingData.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Ranking de Corretores", margin, yPos);
        yPos += 8;
        
        const brokerTableData = brokerRankingData.map((broker, index) => [
          `${index + 1}º`,
          broker.name,
          broker.deals.toString(),
          broker.revenue > 0 
            ? broker.revenue > 1000000
              ? `R$ ${(broker.revenue / 1000000).toFixed(2)}M`
              : formatCurrency(broker.revenue)
            : "N/A"
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [["Posição", "Nome", "Negócios", "Receita"]],
          body: brokerTableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });
      }
      
      // Salvar PDF
      const fileName = `Relatorio_${dateStr.replace(/\//g, "-").replace(/:/g, "-").replace(/\s/g, "_")}.pdf`;
      doc.save(fileName);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF. Verifique o console para mais detalhes.");
    }
  };

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
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
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
        {brokerRankingData.length > 0 ? (
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
                      {broker.deals} {broker.deals === 1 ? "negócio fechado" : "negócios fechados"}
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
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Nenhum corretor com negócios fechados no período selecionado.
          </p>
        )}
      </Card>
    </div>
  );
}
