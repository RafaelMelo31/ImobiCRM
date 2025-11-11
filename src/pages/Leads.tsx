import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Download, 
  Upload, 
  Search,
  Filter,
  X
} from "lucide-react";

// Mock data
const allLeads = [
  { id: 1, name: "Ana Paula Silva", email: "ana.paula@email.com", phone: "(11) 98765-4321", status: "Em Negociação", origin: "Facebook Ads", broker: "Rafael Costa", date: "2024-01-10" },
  { id: 2, name: "Carlos Lima", email: "carlos.lima@email.com", phone: "(11) 97654-3210", status: "Em Atendimento", origin: "WhatsApp", broker: "Marina Santos", date: "2024-01-12" },
  { id: 3, name: "Fernanda Dias", email: "fernanda.d@email.com", phone: "(11) 96543-2109", status: "Em Atendimento", origin: "Instagram", broker: "Rafael Costa", date: "2024-01-13" },
  { id: 4, name: "Roberto Alves", email: "roberto.alves@email.com", phone: "(11) 95432-1098", status: "Visita Agendada", origin: "Google Ads", broker: "Lucas Mendes", date: "2024-01-14" },
  { id: 5, name: "Julia Santos", email: "julia.santos@email.com", phone: "(11) 94321-0987", status: "Em Negociação", origin: "Indicação", broker: "Marina Santos", date: "2024-01-15" },
  { id: 6, name: "Pedro Costa", email: "pedro.costa@email.com", phone: "(11) 93210-9876", status: "Novo Lead", origin: "Site", broker: "Rafael Costa", date: "2024-01-16" },
  { id: 7, name: "Mariana Souza", email: "mariana.s@email.com", phone: "(11) 92109-8765", status: "Novo Lead", origin: "Facebook Ads", broker: "Lucas Mendes", date: "2024-01-17" },
];

const statusOptions = ["Todos", "Novo Lead", "Em Atendimento", "Visita Agendada", "Em Negociação", "Venda", "Perdido"];
const originOptions = ["Todas", "Facebook Ads", "Instagram", "Google Ads", "WhatsApp", "Site", "Indicação"];
const brokerOptions = ["Todos", "Rafael Costa", "Marina Santos", "Lucas Mendes"];

export default function Leads() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todas");
  const [brokerFilter, setBrokerFilter] = useState("Todos");

  // Aplicar filtros
  const filteredLeads = allLeads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "Todos" || lead.status === statusFilter;
    const matchesOrigin = originFilter === "Todas" || lead.origin === originFilter;
    const matchesBroker = brokerFilter === "Todos" || lead.broker === brokerFilter;

    return matchesSearch && matchesStatus && matchesOrigin && matchesBroker;
  });

  const hasActiveFilters = statusFilter !== "Todos" || originFilter !== "Todas" || brokerFilter !== "Todos";

  const clearFilters = () => {
    setStatusFilter("Todos");
    setOriginFilter("Todas");
    setBrokerFilter("Todos");
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Novo Lead": "bg-blue-500/10 text-blue-500",
      "Em Atendimento": "bg-yellow-500/10 text-yellow-500",
      "Visita Agendada": "bg-purple-500/10 text-purple-500",
      "Em Negociação": "bg-orange-500/10 text-orange-500",
      "Venda": "bg-green-500/10 text-green-500",
      "Perdido": "bg-red-500/10 text-red-500",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Lead
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Origem</label>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map((origin) => (
                    <SelectItem key={origin} value={origin}>
                      {origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Corretor</label>
              <Select value={brokerFilter} onValueChange={setBrokerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brokerOptions.map((broker) => (
                    <SelectItem key={broker} value={broker}>
                      {broker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Corretor</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{lead.email}</div>
                      <div className="text-xs text-muted-foreground">{lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{lead.origin}</TableCell>
                  <TableCell className="text-sm">{lead.broker}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
