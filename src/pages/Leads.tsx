import { useState, useMemo } from "react";
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
  X,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLeads, useCreateLead } from "@/hooks/useLeads";
import { useBrokers } from "@/hooks/useBrokers";
import { getLeadStatusFromLabel, getLeadOriginFromLabel } from "@/lib/mappers";
import { toast } from "sonner";

const statusOptions = ["Todos", "novo", "contatado", "qualificado", "visita_agendada", "proposta_enviada", "negociacao", "fechado", "perdido"];
const originOptions = ["Todas", "site", "indicacao", "facebook", "instagram", "google", "whatsapp", "outro"];

// Opções para o formulário de adicionar lead
const statusOptionsForm = ["Novo Lead", "Em Atendimento", "Qualificado", "Visita Agendada", "Em Negociação", "Venda", "Perdido"];
const originOptionsForm = ["Site", "Indicação", "Facebook Ads", "Instagram", "Google Ads", "WhatsApp", "E-mail", "Evento", "Outro"];
const statusLabels: Record<string, string> = {
  "novo": "Novo Lead",
  "contatado": "Contatado",
  "qualificado": "Qualificado",
  "visita_agendada": "Visita Agendada",
  "proposta_enviada": "Proposta Enviada",
  "negociacao": "Negociação",
  "fechado": "Fechado",
  "perdido": "Perdido"
};
const originLabels: Record<string, string> = {
  "site": "Site",
  "indicacao": "Indicação",
  "facebook": "Facebook",
  "instagram": "Instagram",
  "google": "Google",
  "whatsapp": "WhatsApp",
  "outro": "Outro"
};

export default function Leads() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todas");
  const [brokerFilter, setBrokerFilter] = useState("Todos");
  
  // Estados do Dialog de adicionar lead
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Novo Lead");
  const [origin, setOrigin] = useState("Site");
  const [brokerId, setBrokerId] = useState("");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const { data: leads, isLoading } = useLeads();
  const { data: brokers } = useBrokers();
  const createLead = useCreateLead();

  const brokerMap = useMemo(() => {
    if (!brokers) return {};
    return brokers.reduce((acc, broker) => {
      acc[broker.id] = broker.name;
      return acc;
    }, {} as Record<string, string>);
  }, [brokers]);

  const brokerOptions = useMemo(() => {
    if (!brokers) return ["Todos"];
    return ["Todos", ...brokers.map(b => b.id)];
  }, [brokers]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "Todos" || lead.status === statusFilter;
      const matchesOrigin = originFilter === "Todas" || lead.origin === originFilter;
      const matchesBroker = brokerFilter === "Todos" || lead.assigned_broker_id === brokerFilter;

      return matchesSearch && matchesStatus && matchesOrigin && matchesBroker;
    });
  }, [leads, searchTerm, statusFilter, originFilter, brokerFilter]);

  const hasActiveFilters = statusFilter !== "Todos" || originFilter !== "Todas" || brokerFilter !== "Todos";

  const clearFilters = () => {
    setStatusFilter("Todos");
    setOriginFilter("Todas");
    setBrokerFilter("Todos");
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "novo": "bg-info/10 text-info",
      "contatado": "bg-primary/10 text-primary",
      "qualificado": "bg-accent/10 text-accent",
      "visita_agendada": "bg-warning/10 text-warning",
      "proposta_enviada": "bg-warning/10 text-warning",
      "negociacao": "bg-warning/10 text-warning",
      "fechado": "bg-success/10 text-success",
      "perdido": "bg-destructive/10 text-destructive",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    try {
      const budgetValue = budget.trim() 
        ? parseFloat(budget.trim().replace(/[^\d,.-]/g, "").replace(",", "."))
        : null;
      
      if (budget.trim() && (isNaN(budgetValue!) || budgetValue! <= 0)) {
        toast.error("Orçamento deve ser um valor numérico válido");
        return;
      }

      const tagsArray = tags.trim() 
        ? tags.split(",").map(t => t.trim()).filter(t => t)
        : null;

      await createLead.mutateAsync({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim(),
        status: getLeadStatusFromLabel(status) as any,
        origin: getLeadOriginFromLabel(origin) as any,
        assigned_broker_id: brokerId && brokerId !== "none" ? brokerId : null,
        budget: budgetValue && !isNaN(budgetValue) ? budgetValue : null,
        tags: tagsArray && tagsArray.length > 0 ? tagsArray : null,
        notes: notes.trim() || null,
      });

      toast.success("Lead adicionado com sucesso!");
      setIsDialogOpen(false);
      // Limpar formulário
      setName("");
      setEmail("");
      setPhone("");
      setStatus("Novo Lead");
      setOrigin("Site");
      setBrokerId("");
      setBudget("");
      setTags("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar lead");
      console.error(error);
    }
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddLead} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptionsForm.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origem *</Label>
                    <Select value={origin} onValueChange={setOrigin}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {originOptionsForm.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="broker">Corretor Responsável</Label>
                    <Select
                      value={brokerId || "none"}
                      onValueChange={(value) => setBrokerId(value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um corretor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não atribuído</SelectItem>
                        {brokers?.map((broker) => (
                          <SelectItem key={broker.id} value={broker.id}>
                            {broker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Orçamento</Label>
                    <Input
                      id="budget"
                      placeholder="Ex: 350.000,00"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    placeholder="Ex: urgente, apartamento, centro"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informações adicionais..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createLead.isPending}
                >
                  {createLead.isPending ? "Adicionando..." : "Adicionar Lead"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                  {brokerOptions.map((brokerId) => (
                    <SelectItem key={brokerId} value={brokerId}>
                      {brokerId === "Todos" ? "Todos" : brokerMap[brokerId] || brokerId}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
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
                      <div className="text-sm">{lead.email || '-'}</div>
                      <div className="text-xs text-muted-foreground">{lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(lead.status)}>
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{originLabels[lead.origin] || lead.origin}</TableCell>
                  <TableCell className="text-sm">{lead.assigned_broker_id ? brokerMap[lead.assigned_broker_id] || '-' : '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
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
