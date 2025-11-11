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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Phone, Mail, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: number;
  city: string;
  lastContact: string;
  status: "active" | "inactive";
}

const mockOwners: Owner[] = [
  {
    id: "1",
    name: "Roberto Almeida",
    email: "roberto@email.com",
    phone: "(11) 98765-1111",
    properties: 3,
    city: "São Paulo",
    lastContact: "2024-01-10",
    status: "active",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 98765-2222",
    properties: 1,
    city: "Campinas",
    lastContact: "2024-01-08",
    status: "active",
  },
  {
    id: "3",
    name: "José Ferreira",
    email: "jose@email.com",
    phone: "(11) 98765-3333",
    properties: 5,
    city: "Santos",
    lastContact: "2023-12-20",
    status: "inactive",
  },
  {
    id: "4",
    name: "Patricia Lima",
    email: "patricia@email.com",
    phone: "(11) 98765-4444",
    properties: 2,
    city: "São Paulo",
    lastContact: "2024-01-12",
    status: "active",
  },
];

export default function Owners() {
  const [owners, setOwners] = useState<Owner[]>(mockOwners);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredOwners = owners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOwner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Proprietário adicionado com sucesso!");
    setIsDialogOpen(false);
  };

  const totalProperties = owners.reduce((sum, o) => sum + o.properties, 0);
  const activeOwners = owners.filter((o) => o.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proprietários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os proprietários de imóveis
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Proprietário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Proprietário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddOwner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Ex: João Silva" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
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
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="São Paulo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                Adicionar Proprietário
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Proprietários</p>
              <p className="text-2xl font-bold">{owners.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Building2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Imóveis</p>
              <p className="text-2xl font-bold">{totalProperties}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proprietários Ativos</p>
              <p className="text-2xl font-bold">{activeOwners}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou cidade..."
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
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Imóveis</TableHead>
                <TableHead>Último Contato</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.map((owner) => (
                <TableRow key={owner.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <span className="font-medium">{owner.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{owner.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{owner.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{owner.properties}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {new Date(owner.lastContact).toLocaleDateString("pt-BR")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={owner.status === "active" ? "default" : "secondary"}
                    >
                      {owner.status === "active" ? "Ativo" : "Inativo"}
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
