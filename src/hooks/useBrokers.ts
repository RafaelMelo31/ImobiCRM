import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DbBroker = Database['public']['Tables']['brokers']['Row'];
type DbBrokerInsert = Database['public']['Tables']['brokers']['Insert'];

export interface Broker extends DbBroker {}

export const useBrokers = () => {
  return useQuery({
    queryKey: ["brokers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brokers")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Broker[];
    },
  });
};

export const useCreateBroker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (broker: DbBrokerInsert) => {
      const { data, error } = await supabase
        .from("brokers")
        .insert([broker])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
      toast.success("Corretor adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar corretor: " + error.message);
    },
  });
};
