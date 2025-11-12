import { useState, useMemo } from "react";
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
import { useLeads, useUpdateLead } from "@/hooks/useLeads";
import { leadStatusMap } from "@/lib/mappers";
import { useNavigate } from "react-router-dom";

interface LeadCard {
  id: string;
  name: string;
  property: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  status: string;
  cards: LeadCard[];
}

const columnsConfig: Column[] = [
  { id: "novo-lead", title: "Novo Lead", status: "novo", cards: [] },
  { id: "em-atendimento", title: "Em Atendimento", status: "contato", cards: [] },
  { id: "visita-agendada", title: "Visita Agendada", status: "proposta", cards: [] },
  { id: "em-negociacao", title: "Em Negociação", status: "negociacao", cards: [] },
];

function SortableCard({ card }: { card: LeadCard }) {
  const navigate = useNavigate();
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
      onClick={() => navigate(`/leads/${card.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {card.property && (
          <p className="text-xs text-muted-foreground">{card.property}</p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {card.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <button 
            className="p-1 hover:bg-muted rounded transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${card.id}`);
            }}
          >
            <Phone className="h-3 w-3 text-muted-foreground" />
          </button>
          <button 
            className="p-1 hover:bg-muted rounded transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Mail className="h-3 w-3 text-muted-foreground" />
          </button>
          <button 
            className="p-1 hover:bg-muted rounded transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Calendar className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Kanban() {
  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const [activeCard, setActiveCard] = useState<LeadCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Organizar leads por status
  const columns = useMemo(() => {
    const cols = columnsConfig.map((col) => ({
      ...col,
      cards: leads
        .filter((lead) => lead.status === col.status)
        .map((lead) => ({
          id: lead.id,
          name: lead.name,
          property: lead.budget ? `Orçamento: R$ ${lead.budget.toLocaleString("pt-BR")}` : "Sem orçamento",
          tags: lead.tags || [],
        })),
    }));
    return cols;
  }, [leads]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeColumn = columns.find((col) =>
      col.cards.some((card) => card.id === active.id)
    );
    const card = activeColumn?.cards.find((card) => card.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCardId = active.id as string;
    let overColumnId = over.id as string;

    // Se o over.id não for uma coluna, procurar em qual coluna o card foi solto
    let destColumn = columns.find((col) => col.id === overColumnId);
    
    // Se não encontrou, pode ser que foi solto em um card, então procurar a coluna que contém esse card
    if (!destColumn) {
      destColumn = columns.find((col) => 
        col.cards.some((card) => card.id === overColumnId)
      );
    }

    // Se ainda não encontrou, procurar pela coluna que contém o card ativo (source)
    if (!destColumn) {
      const sourceColumn = columns.find((col) =>
        col.cards.some((card) => card.id === activeCardId)
      );
      // Se não encontrou coluna de destino, usar a de origem (não mudou)
      if (!sourceColumn) {
        setActiveCard(null);
        return;
      }
      setActiveCard(null);
      return;
    }

    // Verificar se o status realmente mudou
    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === activeCardId)
    );

    if (sourceColumn && sourceColumn.status === destColumn.status) {
      setActiveCard(null);
      return;
    }

    // Atualizar status do lead no banco
    try {
      await updateLead.mutateAsync({
        id: activeCardId,
        updates: {
          status: destColumn.status as any,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar status do lead:", error);
    }

    setActiveCard(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

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

              <div 
                id={column.id}
                className="space-y-3 min-h-[200px]"
              >
                <SortableContext
                  items={column.cards.map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {column.cards.map((card) => (
                    <SortableCard key={card.id} card={card} />
                  ))}
                </SortableContext>

                {column.cards.length === 0 && (
                  <Card className="border-dashed border-2 border-muted-foreground/20 bg-transparent min-h-[100px] flex items-center justify-center">
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                      Solte aqui
                    </CardContent>
                  </Card>
                )}
              </div>
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
