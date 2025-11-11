import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar } from "lucide-react";

const columns = [
  {
    title: "Novo Lead",
    count: 3,
    cards: [
      { id: 1, name: "Ana Paula", property: "Apto 2qts Centro", tags: ["Urgente"] },
    ],
  },
  {
    title: "Em Atendimento",
    count: 5,
    cards: [
      { id: 2, name: "Carlos Lima", property: "Casa 3qts Jardim", tags: [] },
      { id: 3, name: "Fernanda Dias", property: "Apto 1qt Praia", tags: ["VIP"] },
    ],
  },
  {
    title: "Visita Agendada",
    count: 2,
    cards: [
      { id: 4, name: "Roberto Alves", property: "Casa 4qts Cond.", tags: [] },
    ],
  },
  {
    title: "Em Negociação",
    count: 2,
    cards: [
      { id: 5, name: "Julia Santos", property: "Cobertura Luxo", tags: ["VIP"] },
    ],
  },
];

export default function Kanban() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funil de Vendas</h1>
        <p className="text-muted-foreground mt-1">
          Arraste e solte os leads entre as etapas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.count}
              </Badge>
            </div>

            <div className="space-y-3">
              {column.cards.map((card) => (
                <Card
                  key={card.id}
                  className="cursor-move hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-border/50"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {card.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {card.property}
                    </p>
                    
                    {card.tags.length > 0 && (
                      <div className="flex gap-1">
                        {card.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-destructive/10 text-destructive"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <button className="p-1 hover:bg-muted rounded transition-colors duration-200">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded transition-colors duration-200">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded transition-colors duration-200">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed border-2 border-muted-foreground/20 bg-transparent hover:border-muted-foreground/40 transition-colors duration-200 cursor-pointer">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  Solte aqui
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
