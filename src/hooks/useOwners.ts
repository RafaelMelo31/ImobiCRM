import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DbOwner = Database['public']['Tables']['owners']['Row'];
type DbOwnerInsert = Database['public']['Tables']['owners']['Insert'];

export interface Owner extends DbOwner {}

export const useOwners = () => {
  return useQuery({
    queryKey: ["owners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owners")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Owner[];
    },
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
