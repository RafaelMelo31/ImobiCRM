import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProperties } from "@/hooks/useProperties";
import { useState, useMemo } from "react";

const statusLabels: Record<string, string> = {
  "disponivel": "Disponível",
  "reservado": "Reservado",
  "vendido": "Vendido",
  "alugado": "Alugado"
};

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: properties, isLoading } = useProperties();

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    return properties.filter(property =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [properties, searchTerm]);

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
                placeholder="Buscar por endereço, cidade..."
                className="pl-10 bg-muted/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum imóvel encontrado
          </div>
        ) : (
          filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover-lift border-border/50 cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className={`absolute top-3 right-3 ${
                    property.status === "disponivel"
                      ? "bg-success/90 text-white"
                      : "bg-warning/90 text-white"
                  }`}
                >
                  {statusLabels[property.status] || property.status}
                </Badge>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {property.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{property.area ? `${property.area}m²` : '-'}</span>
                  <span>{property.bedrooms ? `${property.bedrooms} qts` : '-'}</span>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <p className="text-2xl font-bold text-primary">
                    {property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Sob consulta'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
