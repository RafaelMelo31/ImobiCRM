import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DbProperty = Database['public']['Tables']['properties']['Row'];
type DbPropertyInsert = Database['public']['Tables']['properties']['Insert'];

export interface Property extends DbProperty {}

export const useProperties = () => {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (property: DbPropertyInsert) => {
      const { data, error } = await supabase
        .from("properties")
        .insert([property])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Imóvel cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao cadastrar imóvel: " + error.message);
    },
  });
};
