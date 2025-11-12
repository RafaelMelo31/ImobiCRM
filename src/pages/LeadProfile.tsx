import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  ArrowLeft,
  User,
  MapPin,
  Clock,
  FileText,
  Send,
  Plus,
  Edit2
} from "lucide-react";
import { useLead, useLeadProperties, useUpdateLead } from "@/hooks/useLeads";
import { useBrokers } from "@/hooks/useBrokers";
import { useEvents } from "@/hooks/useEvents";
import { leadStatusMap, leadOriginMap, formatCurrency, formatDateTime, getLeadStatusFromLabel, getLeadOriginFromLabel } from "@/lib/mappers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusOptionsForm = ["Novo Lead", "Em Atendimento", "Visita Agendada", "Em Negociação", "Venda", "Perdido"];
const originOptionsForm = ["Facebook Ads", "Instagram", "Google Ads", "WhatsApp", "Site", "Indicação", "Outro"];

export default function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estados do formulário de edição
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Novo Lead");
  const [origin, setOrigin] = useState("Site");
  const [brokerId, setBrokerId] = useState("");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState("");

  // Buscar dados do lead
  const { data: lead, isLoading: isLoadingLead } = useLead(id || "");
  const { data: leadProperties = [] } = useLeadProperties(id || "");
  const { data: events = [] } = useEvents();
  const { data: brokers = [], isLoading: brokersLoading } = useBrokers();
  const updateLead = useUpdateLead();

  // Filtrar eventos relacionados ao lead
  const leadEvents = events.filter((e) => e.lead_id === id);

  // Inicializar estados quando o lead carregar
  useEffect(() => {
    if (lead) {
      setName(lead.name || "");
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setStatus(leadStatusMap[lead.status] || "Novo Lead");
      setOrigin(leadOriginMap[lead.origin] || "Site");
      setBrokerId(lead.assigned_broker_id || "");
      setBudget(lead.budget ? lead.budget.toString() : "");
      setTags(lead.tags ? lead.tags.join(", ") : "");
    }
  }, [lead]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    
    try {
      await updateLead.mutateAsync({
        id,
        updates: {
          notes: lead?.notes ? `${lead.notes}\n\n${new Date().toLocaleString('pt-BR')}: ${newNote}` : `${new Date().toLocaleString('pt-BR')}: ${newNote}`,
        },
      });
      toast.success("Nota adicionada com sucesso!");
      setNewNote("");
    } catch (error) {
      toast.error("Erro ao adicionar nota");
      console.error(error);
    }
  };

  const handleScheduleTask = async () => {
    if (!taskTitle.trim() || !taskDate || !id) return;
    
    try {
      const startDateTime = new Date(`${taskDate}T${taskTime || "09:00"}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hora depois

      const { error } = await supabase.from("events").insert({
        title: taskTitle,
        description: `Tarefa relacionada ao lead ${lead?.name}`,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        lead_id: id,
      });

      if (error) throw error;

      toast.success("Tarefa agendada com sucesso!");
      setTaskTitle("");
      setTaskDate("");
      setTaskTime("");
    } catch (error) {
      toast.error("Erro ao agendar tarefa");
      console.error(error);
    }
  };

  // Função de atualização do lead
  const handleUpdateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id || !name.trim() || !phone.trim()) {
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

      await updateLead.mutateAsync({
        id,
        updates: {
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          status: getLeadStatusFromLabel(status) as any,
          origin: getLeadOriginFromLabel(origin) as any,
          assigned_broker_id: brokerId && brokerId !== "none" ? brokerId : null,
          budget: budgetValue && !isNaN(budgetValue) ? budgetValue : null,
          tags: tagsArray && tagsArray.length > 0 ? tagsArray : null,
        },
      });

      toast.success("Lead atualizado com sucesso!");
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar lead");
      console.error(error);
    }
  };

  if (isLoadingLead) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Lead não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/leads")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
            {lead.tags && lead.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="bg-primary/10 text-primary"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground">
            {leadStatusMap[lead.status] || lead.status} • {lead.brokers?.name || "Não atribuído"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Ligar
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            E-mail
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Lead */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">E-mail</Label>
              <p className="text-sm font-medium">{lead.email || "Não informado"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="text-sm font-medium">{lead.phone}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Orçamento</Label>
              <p className="text-sm font-medium">{lead.budget ? formatCurrency(lead.budget) : "Não informado"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Origem</Label>
              <p className="text-sm font-medium">{leadOriginMap[lead.origin] || lead.origin}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="text-sm font-medium">{leadStatusMap[lead.status] || lead.status}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Corretor Responsável</Label>
              <p className="text-sm font-medium">{lead.brokers?.name || "Não atribuído"}</p>
            </div>
            {lead.tags && lead.tags.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {lead.notes && (
              <div>
                <Label className="text-xs text-muted-foreground">Observações</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}

            {leadProperties.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Imóveis de Interesse
                </Label>
                <div className="space-y-2">
                  {leadProperties.map((lp: any) => (
                    <div 
                      key={lp.id}
                      className="p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium">{lp.properties?.title || "Imóvel"}</p>
                      <p className="text-xs text-muted-foreground">
                        {lp.properties?.price ? formatCurrency(lp.properties.price) : "Preço não informado"}
                      </p>
                      {lp.properties?.address && (
                        <p className="text-xs text-muted-foreground">{lp.properties.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {leadEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado</p>
              ) : (
                leadEvents
                  .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                  .map((event, index) => (
                    <div key={event.id} className="relative pl-8 pb-4">
                      {/* Linha vertical */}
                      {index !== leadEvents.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-0 w-px bg-border" />
                      )}
                      
                      {/* Ícone */}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>

                      {/* Conteúdo */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">{event.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(event.start_time)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        {event.brokers && (
                          <p className="text-xs text-muted-foreground">
                            Corretor: {event.brokers.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              )}
              {/* Evento de criação do lead */}
              <div className="relative pl-8 pb-4">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Lead criado</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(lead.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Origem: {leadOriginMap[lead.origin] || lead.origin}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="note">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="note">Nova Nota</TabsTrigger>
              <TabsTrigger value="task">Agendar Tarefa</TabsTrigger>
              <TabsTrigger value="visit">Agendar Visita</TabsTrigger>
              <TabsTrigger value="email">Enviar E-mail</TabsTrigger>
            </TabsList>

            <TabsContent value="note" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Adicionar Nota</Label>
                <Textarea 
                  placeholder="Digite sua nota aqui..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleAddNote} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Salvar Nota
              </Button>
            </TabsContent>

            <TabsContent value="task" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Título da Tarefa</Label>
                <Input 
                  placeholder="Ex: Ligar para o cliente"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input 
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleScheduleTask} className="w-full" disabled={!taskTitle || !taskDate}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Tarefa
              </Button>
            </TabsContent>

            <TabsContent value="visit" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Funcionalidade de agendamento de visitas em desenvolvimento.
              </p>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Funcionalidade de envio de e-mail em desenvolvimento.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateLead} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
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
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="broker">Corretor Responsável</Label>
                <Select
                  value={brokerId || "none"}
                  onValueChange={(value) => setBrokerId(value === "none" ? "" : value)}
                  disabled={brokersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={brokersLoading ? "Carregando..." : "Selecione um corretor"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não atribuído</SelectItem>
                    {brokers.map((broker) => (
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

            <Button
              type="submit"
              className="w-full"
              disabled={updateLead.isPending}
            >
              {updateLead.isPending ? "Atualizando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
