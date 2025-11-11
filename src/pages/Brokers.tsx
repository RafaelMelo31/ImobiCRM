import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Mail, Phone, TrendingUp, Users, Award } from "lucide-react";
import { toast } from "sonner";

interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeLeads: number;
  closedDeals: number;
  conversionRate: number;
  status: "active" | "inactive";
}

const mockBrokers: Broker[] = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos@imobicrm.com",
    phone: "(11) 98765-4321",
    activeLeads: 23,
    closedDeals: 12,
    conversionRate: 34,
    status: "active",
  },
  {
    id: "2",
    name: "Ana Costa",
    email: "ana@imobicrm.com",
    phone: "(11) 98765-4322",
    activeLeads: 18,
    closedDeals: 15,
    conversionRate: 45,
    status: "active",
  },
  {
    id: "3",
    name: "Pedro Martins",
    email: "pedro@imobicrm.com",
    phone: "(11) 98765-4323",
    activeLeads: 31,
    closedDeals: 8,
    conversionRate: 28,
    status: "active",
  },
  {
    id: "4",
    name: "Julia Oliveira",
    email: "julia@imobicrm.com",
    phone: "(11) 98765-4324",
    activeLeads: 15,
    closedDeals: 10,
    conversionRate: 40,
    status: "inactive",
  },
];

export default function Brokers() {
  const [brokers, setBrokers] = useState<Broker[]>(mockBrokers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredBrokers = brokers.filter((broker) =>
    broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBroker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Corretor adicionado com sucesso!");
    setIsDialogOpen(false);
  };

  const totalActiveLeads = brokers.reduce((sum, b) => sum + b.activeLeads, 0);
  const totalClosedDeals = brokers.reduce((sum, b) => sum + b.closedDeals, 0);
  const avgConversion = Math.round(
    brokers.reduce((sum, b) => sum + b.conversionRate, 0) / brokers.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Corretores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua equipe de corretores
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Corretor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Corretor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBroker} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Ex: João Silva" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@imobicrm.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Adicionar Corretor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leads Ativos</p>
              <p className="text-2xl font-bold">{totalActiveLeads}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Negócios Fechados</p>
              <p className="text-2xl font-bold">{totalClosedDeals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold">{avgConversion}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Corretor</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Leads Ativos</TableHead>
                <TableHead>Negócios Fechados</TableHead>
                <TableHead>Conversão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrokers.map((broker) => (
                <TableRow key={broker.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {broker.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{broker.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{broker.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{broker.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{broker.activeLeads}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-success">{broker.closedDeals}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${broker.conversionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{broker.conversionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={broker.status === "active" ? "default" : "secondary"}
                    >
                      {broker.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
