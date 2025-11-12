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
import { useEvents, useCreateEvent } from "@/hooks/useEvents";
import { formatDateTime } from "@/lib/mappers";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();

  const selectedEvents = events.filter((event) => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.start_time);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title || !date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const startDateTime = new Date(`${date}T${time || "09:00"}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hora depois

      await createEvent.mutateAsync({
        title,
        description: description || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });

      toast.success("Evento adicionado com sucesso!");
      setIsDialogOpen(false);
      setTitle("");
      setDate("");
      setTime("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar evento");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  // Mapear datas dos eventos para o calendário
  const eventDates = events.map((event) => new Date(event.start_time));

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
                <Input 
                  id="title" 
                  placeholder="Ex: Visita ao imóvel" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do evento..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createEvent.isPending}
              >
                {createEvent.isPending ? "Adicionando..." : "Adicionar Evento"}
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
              hasEvent: eventDates,
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
              selectedEvents.map((event) => {
                const eventDate = new Date(event.start_time);
                const timeString = eventDate.toLocaleTimeString("pt-BR", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                });
                
                return (
                  <Card
                    key={event.id}
                    className="p-4 border bg-primary/10 text-primary border-primary/20"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{timeString}</span>
                      </div>

                      {event.leads && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{event.leads.name}</span>
                        </div>
                      )}

                      {event.properties && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.properties.address}</span>
                        </div>
                      )}

                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
                      )}
                    </div>
                  </Card>
                );
              })
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
            .filter((e) => new Date(e.start_time) >= new Date())
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 5)
            .map((event) => {
              const eventDate = new Date(event.start_time);
              const timeString = eventDate.toLocaleTimeString("pt-BR", { 
                hour: "2-digit", 
                minute: "2-digit" 
              });
              
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {eventDate.getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {eventDate.toLocaleDateString("pt-BR", { month: "short" })}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeString}
                        </div>
                        {event.leads && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.leads.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          {events.filter((e) => new Date(e.start_time) >= new Date()).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum evento futuro agendado
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
