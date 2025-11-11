import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MapPin, User } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "visit" | "meeting" | "call" | "other";
  location?: string;
  client?: string;
  notes?: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Visita - Apartamento Jardins",
    date: new Date(2024, 0, 15),
    time: "10:00",
    type: "visit",
    location: "Rua Augusta, 1500",
    client: "Maria Silva",
  },
  {
    id: "2",
    title: "Reunião com Cliente",
    date: new Date(2024, 0, 15),
    time: "14:30",
    type: "meeting",
    client: "João Santos",
  },
  {
    id: "3",
    title: "Ligação de Follow-up",
    date: new Date(2024, 0, 16),
    time: "09:00",
    type: "call",
    client: "Ana Costa",
  },
  {
    id: "4",
    title: "Visita - Casa Morumbi",
    date: new Date(2024, 0, 17),
    time: "11:00",
    type: "visit",
    location: "Av. Morumbi, 2000",
    client: "Pedro Lima",
  },
];

const eventTypeColors = {
  visit: "bg-primary/10 text-primary border-primary/20",
  meeting: "bg-accent/10 text-accent border-accent/20",
  call: "bg-success/10 text-success border-success/20",
  other: "bg-muted text-muted-foreground border-border",
};

const eventTypeLabels = {
  visit: "Visita",
  meeting: "Reunião",
  call: "Ligação",
  other: "Outro",
};

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedEvents = events.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Evento adicionado com sucesso!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus compromissos e visitas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Ex: Visita ao imóvel" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" type="time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select defaultValue="visit">
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visit">Visita</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="call">Ligação</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Input id="client" placeholder="Nome do cliente" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input id="location" placeholder="Endereço ou local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas sobre o evento..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                Adicionar Evento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-lg border-0"
            modifiers={{
              hasEvent: events.map((e) => e.date),
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/10 font-bold",
            }}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Selecione uma data"}
          </h2>

          <div className="space-y-3">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <Card
                  key={event.id}
                  className={`p-4 border ${eventTypeColors[event.type]}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {eventTypeLabels[event.type]}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>

                    {event.client && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{event.client}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum evento agendado para esta data</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
        <div className="space-y-3">
          {events
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {event.date.getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {event.date.toLocaleDateString("pt-BR", { month: "short" })}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      {event.client && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.client}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{eventTypeLabels[event.type]}</Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
