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

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          owners:owner_id (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Property & {
        owners?: {
          id: string;
          name: string;
          email: string | null;
          phone: string;
          address: string | null;
        } | null;
      };
    },
    enabled: !!id,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      if (data.owner_id) {
        queryClient.invalidateQueries({ queryKey: ["owner-properties", data.owner_id] });
      }
      toast.success("Imóvel cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao cadastrar imóvel: " + error.message);
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DbPropertyInsert>;
    }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      if (data.owner_id) {
        queryClient.invalidateQueries({ queryKey: ["owner-properties", data.owner_id] });
      }
    },
  });
};
