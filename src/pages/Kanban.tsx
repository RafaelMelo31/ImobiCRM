import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LeadCard {
  id: number;
  name: string;
  property: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  cards: LeadCard[];
}

const initialColumns: Column[] = [
  {
    id: "novo-lead",
    title: "Novo Lead",
    cards: [
      { id: 1, name: "Ana Paula", property: "Apto 2qts Centro", tags: ["Urgente"] },
    ],
  },
  {
    id: "em-atendimento",
    title: "Em Atendimento",
    cards: [
      { id: 2, name: "Carlos Lima", property: "Casa 3qts Jardim", tags: [] },
      { id: 3, name: "Fernanda Dias", property: "Apto 1qt Praia", tags: ["VIP"] },
    ],
  },
  {
    id: "visita-agendada",
    title: "Visita Agendada",
    cards: [
      { id: 4, name: "Roberto Alves", property: "Casa 4qts Cond.", tags: [] },
    ],
  },
  {
    id: "em-negociacao",
    title: "Em Negociação",
    cards: [
      { id: 5, name: "Julia Santos", property: "Cobertura Luxo", tags: ["VIP"] },
    ],
  },
];

function SortableCard({ card }: { card: LeadCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-border/50"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{card.property}</p>

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
  );
}

export default function Kanban() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<LeadCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeColumn = columns.find((col) =>
      col.cards.some((card) => card.id === active.id)
    );
    const card = activeColumn?.cards.find((card) => card.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCardId = active.id;
    const overCardId = over.id;

    // Find source and destination columns
    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === activeCardId)
    );
    const destColumn = columns.find(
      (col) =>
        col.id === overCardId || col.cards.some((card) => card.id === overCardId)
    );

    if (!sourceColumn || !destColumn) {
      setActiveCard(null);
      return;
    }

    const newColumns = columns.map((col) => ({ ...col, cards: [...col.cards] }));

    const sourceColIndex = newColumns.findIndex((col) => col.id === sourceColumn.id);
    const destColIndex = newColumns.findIndex((col) => col.id === destColumn.id);

    const cardToMove = newColumns[sourceColIndex].cards.find(
      (card) => card.id === activeCardId
    );

    if (!cardToMove) {
      setActiveCard(null);
      return;
    }

    // Remove card from source
    newColumns[sourceColIndex].cards = newColumns[sourceColIndex].cards.filter(
      (card) => card.id !== activeCardId
    );

    // Add to destination
    if (destColumn.id === overCardId) {
      // Dropped on column itself (drop zone)
      newColumns[destColIndex].cards.push(cardToMove);
    } else {
      // Dropped on another card
      const overCardIndex = newColumns[destColIndex].cards.findIndex(
        (card) => card.id === overCardId
      );
      newColumns[destColIndex].cards.splice(overCardIndex, 0, cardToMove);
    }

    setColumns(newColumns);
    setActiveCard(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funil de Vendas</h1>
        <p className="text-muted-foreground mt-1">
          Arraste e solte os leads entre as etapas
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {column.cards.length}
                </Badge>
              </div>

              <SortableContext
                items={column.cards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[200px]">
                  {column.cards.map((card) => (
                    <SortableCard key={card.id} card={card} />
                  ))}

                  <Card
                    id={column.id}
                    className="border-dashed border-2 border-muted-foreground/20 bg-transparent hover:border-muted-foreground/40 transition-colors duration-200"
                  >
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                      Solte aqui
                    </CardContent>
                  </Card>
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card className="cursor-move shadow-2xl rotate-3 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {activeCard.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {activeCard.property}
                </p>

                {activeCard.tags.length > 0 && (
                  <div className="flex gap-1">
                    {activeCard.tags.map((tag) => (
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
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
