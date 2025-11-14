import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Save, 
  Edit2,
  Camera,
  Users,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { useEvents } from "@/hooks/useEvents";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/mappers";

export default function Profile() {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { user } = useAuth();
  const { data: leads = [] } = useLeads();
  const { data: events = [] } = useEvents();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

  // Calcular estatísticas do usuário
  const userStats = {
    totalLeads: leads.length,
    activeLeads: leads.filter(
      (lead) => lead.status !== "fechado" && lead.status !== "perdido"
    ).length,
    closedDeals: leads.filter((lead) => lead.status === "fechado").length,
    totalEvents: events.length,
    upcomingEvents: events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return eventDate >= new Date();
    }).length,
  };

  const conversionRate = userStats.totalLeads > 0
    ? Math.round((userStats.closedDeals / userStats.totalLeads) * 100)
    : 0;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim() })
        .eq("id", user.id);

      if (error) throw error;

      // Invalidar a query para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });

      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
    }
    setIsEditing(false);
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-8 w-8" />
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais e visualize suas estatísticas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informações do Perfil */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Informações Pessoais</CardTitle>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Usuário"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-medium">
                    {profile?.name 
                      ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : "U"
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Foto de Perfil
                  </Label>
                  <Button variant="outline" size="sm" className="gap-2" disabled>
                    <Camera className="h-4 w-4" />
                    Alterar Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Em breve você poderá fazer upload de uma foto
                  </p>
                </div>
              </div>

              <Separator />

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile?.name || "Não informado"}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{user?.email || "Não informado"}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado aqui
                </p>
              </div>

              {/* Data de Criação */}
              <div className="space-y-2">
                <Label>Membro desde</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {profile?.created_at 
                      ? formatDateTime(profile.created_at)
                      : "Não informado"
                    }
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
              <CardDescription>
                Suas métricas de desempenho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Leads</p>
                      <p className="text-xl font-bold">{userStats.totalLeads}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Leads Ativos</p>
                      <p className="text-xl font-bold">{userStats.activeLeads}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Award className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Negócios Fechados</p>
                      <p className="text-xl font-bold">{userStats.closedDeals}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-xl font-bold">{conversionRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Calendar className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Eventos</p>
                      <p className="text-xl font-bold">{userStats.totalEvents}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Próximos Eventos</p>
                      <p className="text-xl font-bold">{userStats.upcomingEvents}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

