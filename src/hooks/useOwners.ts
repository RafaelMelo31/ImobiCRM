import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DbOwner = Database['public']['Tables']['owners']['Row'];
type DbOwnerInsert = Database['public']['Tables']['owners']['Insert'];

export interface Owner extends DbOwner {
  propertiesCount?: number;
}

export const useOwners = () => {
  return useQuery({
    queryKey: ["owners"],
    queryFn: async () => {
      // Buscar todos os proprietários
      const { data: owners, error: ownersError } = await supabase
        .from("owners")
        .select("*")
        .order("name");

      if (ownersError) throw ownersError;
      if (!owners) return [];

      // Buscar contagem de imóveis para cada proprietário
      const ownersWithCount = await Promise.all(
        owners.map(async (owner) => {
          const { count, error: countError } = await supabase
            .from("properties")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", owner.id);

          if (countError) {
            console.error(`Erro ao contar imóveis do proprietário ${owner.id}:`, countError);
            return { ...owner, propertiesCount: 0 };
          }

          return { ...owner, propertiesCount: count || 0 };
        })
      );

      return ownersWithCount as Owner[];
    },
  });
};

export const useOwner = (id: string) => {
  return useQuery({
    queryKey: ["owner", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owners")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Owner;
    },
    enabled: !!id,
  });
};

export const useOwnerProperties = (ownerId: string) => {
  return useQuery({
    queryKey: ["owner-properties", ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!ownerId,
  });
};

export const useCreateOwner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (owner: DbOwnerInsert) => {
      const { data, error } = await supabase
        .from("owners")
        .insert([owner])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      toast.success("Proprietário adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar proprietário: " + error.message);
    },
  });
};

export const useUpdateOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DbOwnerInsert>;
    }) => {
      const { data, error } = await supabase
        .from("owners")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      queryClient.invalidateQueries({ queryKey: ["owner", variables.id] });
    },
  });
};
