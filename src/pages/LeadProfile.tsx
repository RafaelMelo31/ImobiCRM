import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus
} from "lucide-react";

// Mock data - substituir por dados reais do backend
const mockLead = {
  id: 1,
  name: "Ana Paula Silva",
  email: "ana.paula@email.com",
  phone: "(11) 98765-4321",
  cpf: "123.456.789-00",
  status: "Em Negociação",
  origin: "Facebook Ads",
  broker: "Rafael Costa",
  tags: ["VIP", "Urgente"],
  interestedProperties: [
    { id: 1, title: "Apto 2qts Centro", price: "R$ 450.000" },
    { id: 2, title: "Casa 3qts Jardim", price: "R$ 680.000" }
  ],
  timeline: [
    {
      id: 1,
      type: "note",
      title: "Nota adicionada",
      description: "Cliente prefere imóveis próximos ao metrô. Budget até R$ 500k.",
      user: "Rafael Costa",
      date: "2024-01-15 14:30"
    },
    {
      id: 2,
      type: "status",
      title: "Status alterado",
      description: "De 'Visita Agendada' para 'Em Negociação'",
      user: "Sistema",
      date: "2024-01-15 10:00"
    },
    {
      id: 3,
      type: "call",
      title: "Ligação realizada",
      description: "Duração: 15min. Cliente demonstrou interesse em visitar mais imóveis.",
      user: "Rafael Costa",
      date: "2024-01-14 16:45"
    },
    {
      id: 4,
      type: "email",
      title: "E-mail enviado",
      description: "Template: 'Novos Imóveis Disponíveis'",
      user: "Sistema",
      date: "2024-01-14 09:00"
    },
    {
      id: 5,
      type: "created",
      title: "Lead criado",
      description: "Origem: Facebook Ads - Campanha Janeiro 2024",
      user: "Sistema",
      date: "2024-01-10 10:30"
    }
  ]
};

const getTimelineIcon = (type: string) => {
  switch (type) {
    case "note": return <FileText className="h-4 w-4" />;
    case "call": return <Phone className="h-4 w-4" />;
    case "email": return <Mail className="h-4 w-4" />;
    case "status": return <Clock className="h-4 w-4" />;
    default: return <Plus className="h-4 w-4" />;
  }
};

export default function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    // Adicionar nota ao backend
    console.log("Adicionar nota:", newNote);
    setNewNote("");
  };

  const handleScheduleTask = () => {
    if (!taskTitle.trim() || !taskDate) return;
    // Agendar tarefa no backend
    console.log("Agendar tarefa:", taskTitle, taskDate);
    setTaskTitle("");
    setTaskDate("");
  };

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
            <h1 className="text-3xl font-bold tracking-tight">{mockLead.name}</h1>
            {mockLead.tags.map((tag) => (
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
            {mockLead.status} • {mockLead.broker}
          </p>
        </div>
        <div className="flex gap-2">
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
              <p className="text-sm font-medium">{mockLead.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="text-sm font-medium">{mockLead.phone}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CPF</Label>
              <p className="text-sm font-medium">{mockLead.cpf}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Origem</Label>
              <p className="text-sm font-medium">{mockLead.origin}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Corretor Responsável</Label>
              <p className="text-sm font-medium">{mockLead.broker}</p>
            </div>

            <div className="pt-4 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Imóveis de Interesse
              </Label>
              <div className="space-y-2">
                {mockLead.interestedProperties.map((property) => (
                  <div 
                    key={property.id}
                    className="p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.price}</p>
                  </div>
                ))}
              </div>
            </div>
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
              {mockLead.timeline.map((event, index) => (
                <div key={event.id} className="relative pl-8 pb-4">
                  {/* Linha vertical */}
                  {index !== mockLead.timeline.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-px bg-border" />
                  )}
                  
                  {/* Ícone */}
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    {getTimelineIcon(event.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{event.title}</h4>
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground">por {event.user}</p>
                  </div>
                </div>
              ))}
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
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input 
                  type="datetime-local"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                />
              </div>
              <Button onClick={handleScheduleTask} className="w-full">
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
    </div>
  );
}
