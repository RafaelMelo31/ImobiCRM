'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, GripVertical, MessageCircle, Paperclip, Plus, Phone, Mail, Search, Filter, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { useBrokers } from '@/hooks/useBrokers';
import { useEvents } from '@/hooks/useEvents';
import { leadStatusMap } from '@/lib/mappers';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/mappers';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    name: string;
    email?: string;
  };
  tags?: string[];
  dueDate?: string;
  attachments?: number;
  comments?: number;
  budget?: number;
  phone?: string;
  email?: string;
  eventsCount?: number;
}

interface Column {
  id: string;
  title: string;
  status: string;
  tasks: Task[];
  color?: string;
}

const columnsConfig: Column[] = [
  {
    id: 'novo',
    title: 'Novo Lead',
    status: 'novo',
    color: '#8B7355',
  },
  {
    id: 'contato',
    title: 'Em Atendimento',
    status: 'contato',
    color: '#6B8E23',
  },
  {
    id: 'qualificado',
    title: 'Qualificado',
    status: 'qualificado',
    color: '#4682B4',
  },
  {
    id: 'proposta',
    title: 'Visita Agendada',
    status: 'proposta',
    color: '#CD853F',
  },
  {
    id: 'negociacao',
    title: 'Em Negociação',
    status: 'negociacao',
    color: '#9370DB',
  },
  {
    id: 'fechado',
    title: 'Venda',
    status: 'fechado',
    color: '#556B2F',
  },
  {
    id: 'perdido',
    title: 'Perdido',
    status: 'perdido',
    color: '#8B4513',
  },
];

function DroppableColumn({ column, children }: { column: Column; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-white/20 dark:bg-neutral-900/20 backdrop-blur-xl rounded-3xl p-5 border border-border dark:border-neutral-700/50 flex-shrink-0 w-80"
    >
      {children}
    </div>
  );
}

function SortableCard({ task }: { task: Task }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-neutral-100/60 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move transition-all duration-300 border bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-neutral-700/70 hover:shadow-lg"
      onClick={() => navigate(`/leads/${task.id}`)}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
              {task.title}
            </h4>
            <GripVertical className="w-5 h-5 text-neutral-500 dark:text-neutral-400 cursor-move flex-shrink-0" />
          </div>

          {task.description && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.budget && (
            <div className="text-sm font-medium text-primary">
              {formatCurrency(task.budget)}
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  className={`text-xs ${getPriorityColor()} border-neutral-200/50 dark:border-neutral-600/50 backdrop-blur-sm`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/30 dark:border-neutral-700/30">
            <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">{formatDate(task.dueDate)}</span>
                </div>
              )}
              {task.comments !== undefined && task.comments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{task.comments}</span>
                </div>
              )}
              {task.attachments !== undefined && task.attachments > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-xs font-medium">{task.attachments}</span>
                </div>
              )}
              {task.phone && (
                <button
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${task.phone}`);
                  }}
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}
              {task.email && (
                <button
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`mailto:${task.email}`);
                  }}
                >
                  <Mail className="w-4 h-4" />
                </button>
              )}
            </div>

            {task.assignee && (
              <Avatar className="w-8 h-8 ring-2 ring-white/50 dark:ring-neutral-700/50">
                <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                  {task.assignee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KanbanBoard() {
  const { data: leads = [], isLoading } = useLeads();
  const { data: events = [] } = useEvents();
  const { data: brokers = [] } = useBrokers();
  const updateLead = useUpdateLead();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  
  // Estados de pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [brokerFilter, setBrokerFilter] = useState('Todos');
  const [originFilter, setOriginFilter] = useState('Todas');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Opções de filtros
  const originOptions = ['Todas', 'website', 'indicacao', 'redes_sociais', 'telefone', 'email', 'evento', 'outro'];
  const originLabels: Record<string, string> = {
    website: 'Site',
    indicacao: 'Indicação',
    redes_sociais: 'Redes Sociais',
    telefone: 'WhatsApp',
    email: 'E-mail',
    evento: 'Evento',
    outro: 'Outro',
  };

  const brokerOptions = useMemo(() => {
    return ['Todos', ...brokers.map((b) => b.id)];
  }, [brokers]);

  const brokerMap = useMemo(() => {
    return brokers.reduce((acc, broker) => {
      acc[broker.id] = broker.name;
      return acc;
    }, {} as Record<string, string>);
  }, [brokers]);

  // Filtrar leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchTerm === '' ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm));

      const matchesBroker =
        brokerFilter === 'Todos' || lead.assigned_broker_id === brokerFilter;

      const matchesOrigin =
        originFilter === 'Todas' || lead.origin === originFilter;

      return matchesSearch && matchesBroker && matchesOrigin;
    });
  }, [leads, searchTerm, brokerFilter, originFilter]);

  const hasActiveFilters =
    searchTerm !== '' || brokerFilter !== 'Todos' || originFilter !== 'Todas';

  const clearFilters = () => {
    setSearchTerm('');
    setBrokerFilter('Todos');
    setOriginFilter('Todas');
  };

  // Organizar leads em tarefas por coluna
  const columns = useMemo(() => {
    const cols = columnsConfig.map((col) => {
      const columnLeads = filteredLeads.filter((lead) => lead.status === col.status);
      
      const tasks: Task[] = columnLeads.map((lead) => {
        const leadEvents = events.filter((event) => event.lead_id === lead.id);
        
        // Determinar prioridade baseada no status
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (lead.status === 'novo' || lead.status === 'contato') {
          priority = 'high';
        } else if (lead.status === 'negociacao' || lead.status === 'fechado') {
          priority = 'low';
        }

        // Buscar próximo evento como dueDate
        const nextEvent = leadEvents
          .filter((e) => new Date(e.start_time) >= new Date())
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

        // Extrair informações do broker se disponível
        const broker = (lead as any).brokers;
        
        return {
          id: lead.id,
          title: lead.name,
          description: lead.notes || undefined,
          priority,
          assignee: broker
            ? {
                name: broker.name || 'Sem corretor',
                email: broker.email,
              }
            : undefined,
          tags: lead.tags || [],
          dueDate: nextEvent?.start_time,
          attachments: 0, // Pode ser implementado no futuro
          comments: leadEvents.length,
          budget: lead.budget || undefined,
          phone: lead.phone,
          email: lead.email || undefined,
          eventsCount: leadEvents.length,
        };
      });

      return {
        ...col,
        tasks,
      };
    });

    return cols;
  }, [filteredLeads, events]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === active.id)
    );
    const task = activeColumn?.tasks.find((task) => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTaskId = active.id as string;
    let overColumnId = over.id as string;

    // Se o over.id não for uma coluna, procurar em qual coluna o card foi solto
    let destColumn = columns.find((col) => col.id === overColumnId);

    // Se não encontrou, pode ser que foi solto em um card, então procurar a coluna que contém esse card
    if (!destColumn) {
      destColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overColumnId)
      );
    }

    // Se ainda não encontrou, procurar pela coluna que contém o card ativo (source)
    if (!destColumn) {
      setActiveTask(null);
      return;
    }

    // Verificar se o status realmente mudou
    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeTaskId)
    );

    if (sourceColumn && sourceColumn.status === destColumn.status) {
      setActiveTask(null);
      return;
    }

    // Atualizar status do lead no banco
    try {
      await updateLead.mutateAsync({
        id: activeTaskId,
        status: destColumn.status as any,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
    }

    setActiveTask(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground mt-1">
            Arraste e solte para gerenciar seus leads
          </p>
        </div>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filtros</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Corretor</label>
                  <Select value={brokerFilter} onValueChange={setBrokerFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brokerOptions.map((brokerId) => (
                        <SelectItem key={brokerId} value={brokerId}>
                          {brokerId === 'Todos' ? 'Todos' : brokerMap[brokerId] || brokerId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Origem</label>
                  <Select value={originFilter} onValueChange={setOriginFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {originOptions.map((origin) => (
                        <SelectItem key={origin} value={origin}>
                          {origin === 'Todas' ? 'Todas' : originLabels[origin] || origin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex gap-6 overflow-x-auto pb-4 w-full custom-scrollbar"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {column.title}
                  </h3>
                  <Badge className="bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border-neutral-200/50 dark:border-neutral-600/50">
                    {column.tasks.length}
                  </Badge>
                </div>
                <button
                  className="p-1 rounded-full bg-white/30 dark:bg-neutral-800/30 hover:bg-white/50 dark:hover:bg-neutral-700/50 transition-colors"
                  onClick={() => navigate('/leads?new=true')}
                  title="Adicionar novo lead"
                >
                  <Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </button>
              </div>

              <SortableContext
                items={column.tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 min-h-[200px]">
                  {column.tasks.map((task) => (
                    <SortableCard key={task.id} task={task} />
                  ))}

                  {column.tasks.length === 0 && (
                    <Card className="border-dashed border-2 border-neutral-300/50 dark:border-neutral-600/50 bg-transparent min-h-[100px] flex items-center justify-center">
                      <CardContent className="p-4 text-center text-sm text-muted-foreground">
                        Solte aqui
                      </CardContent>
                    </Card>
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className="cursor-move shadow-2xl rotate-3 border-border/50 bg-white/90 dark:bg-neutral-800/90">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                      {activeTask.title}
                    </h4>
                    <GripVertical className="w-5 h-5 text-neutral-500 dark:text-neutral-400 cursor-move flex-shrink-0" />
                  </div>

                  {activeTask.description && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {activeTask.description}
                    </p>
                  )}

                  {activeTask.tags && activeTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeTask.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="text-xs bg-neutral-100/60 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border-neutral-200/50 dark:border-neutral-600/50 backdrop-blur-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
