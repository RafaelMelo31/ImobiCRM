import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar, 
  Save, 
  Edit2,
  Camera,
  Check,
  X,
  Shield,
  Clock
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/mappers";

export default function Profile() {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

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
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysSinceJoined = () => {
    if (!profile?.created_at) return null;
    const created = new Date(profile.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceJoined = getDaysSinceJoined();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border border-primary/20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Grande */}
            <div className="relative group">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background shadow-xl">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Usuário"} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-4xl font-bold">
                  {getInitials(profile?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/90 hover:bg-background"
                  disabled
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Informações do Header */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {profile?.name || "Usuário"}
                    </h1>
                    {profile && (
                      <Badge variant="secondary" className="gap-1.5">
                        <Shield className="h-3 w-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user?.email || "Não informado"}</span>
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 shrink-0"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile?.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {formatDateTime(profile.created_at)}</span>
                  </div>
                )}
                {daysSinceJoined && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{daysSinceJoined} {daysSinceJoined === 1 ? 'dia' : 'dias'} na plataforma</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Informações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Gerencie suas informações de perfil
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Nome Completo
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-11"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium">{profile?.name || "Não informado"}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email
              </Label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-transparent">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.email || "Não informado"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O email não pode ser alterado aqui. Entre em contato com o suporte para alterações.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Data de Criação */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Informações da Conta
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-transparent">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Criação</p>
                    <p className="text-sm font-medium">
                      {profile?.created_at 
                        ? formatDateTime(profile.created_at)
                        : "Não informado"
                      }
                    </p>
                  </div>
                </div>
                {profile?.updated_at && profile.updated_at !== profile.created_at && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-transparent">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Última Atualização</p>
                      <p className="text-sm font-medium">
                        {formatDateTime(profile.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-3 pt-2">
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
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
