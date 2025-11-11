import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const properties = [
  {
    id: 1,
    title: "Apartamento 2 Quartos - Centro",
    price: "R$ 450.000",
    area: "85m²",
    rooms: "2 qts",
    status: "Disponível",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
  },
  {
    id: 2,
    title: "Casa 3 Quartos - Jardim América",
    price: "R$ 680.000",
    area: "150m²",
    rooms: "3 qts",
    status: "Disponível",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
  },
  {
    id: 3,
    title: "Cobertura Duplex - Vista Mar",
    price: "R$ 1.200.000",
    area: "220m²",
    rooms: "4 qts",
    status: "Reservado",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
  },
];

export default function Properties() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imóveis</h1>
          <p className="text-muted-foreground mt-1">Catálogo completo de imóveis</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Cadastrar Imóvel
        </Button>
      </div>

      <Card className="border-border/50">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por endereço, código..."
                className="pl-10 bg-muted/30"
              />
            </div>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover-lift border-border/50 cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <Badge
                variant="secondary"
                className={`absolute top-3 right-3 ${
                  property.status === "Disponível"
                    ? "bg-success/90 text-white"
                    : "bg-warning/90 text-white"
                }`}
              >
                {property.status}
              </Badge>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg line-clamp-1">
                {property.title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{property.area}</span>
                <span>{property.rooms}</span>
              </div>
              
              <div className="pt-2 border-t border-border/50">
                <p className="text-2xl font-bold text-primary">{property.price}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
