import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const leads = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 98765-4321",
    status: "Em Atendimento",
    origin: "Facebook Ads",
    date: "10/11/2025",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 97654-3210",
    status: "Visita Agendada",
    origin: "WhatsApp",
    date: "09/11/2025",
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "(11) 96543-2109",
    status: "Novo Lead",
    origin: "Google Ads",
    date: "11/11/2025",
  },
];

const statusColors: Record<string, string> = {
  "Novo Lead": "bg-muted text-muted-foreground",
  "Em Atendimento": "bg-info/10 text-info",
  "Visita Agendada": "bg-warning/10 text-warning",
  "Em Negociação": "bg-success/10 text-success",
};

export default function Leads() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os seus contatos</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Lead
        </Button>
      </div>

      <Card className="border-border/50">
        <div className="p-4 border-b border-border/50 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-10 bg-muted/30"
              />
            </div>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors duration-200"
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{lead.email}</div>
                    <div className="text-xs text-muted-foreground">{lead.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[lead.status]}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.origin}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.date}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
