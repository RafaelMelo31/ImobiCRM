import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import type { Database } from "@/integrations/supabase/types";

type DbLead = Database['public']['Tables']['leads']['Row'];
type DbLeadInsert = Database['public']['Tables']['leads']['Insert'];
type DbLeadUpdate = Database['public']['Tables']['leads']['Update'];

export interface Lead extends DbLead {}

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          brokers:assigned_broker_id (
            id,
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });
};

export const useLeadsWithEvents = () => {
  return useQuery({
    queryKey: ["leads-with-events"],
    queryFn: async () => {
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select(`
          *,
          brokers:assigned_broker_id (
            id,
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });

      if (eventsError) throw eventsError;

      // Combinar leads com eventos
      const leadsWithEvents = leads?.map((lead) => {
        const leadEvents = events?.filter((event) => event.lead_id === lead.id) || [];
        return {
          ...lead,
          events: leadEvents,
          eventsCount: leadEvents.length,
        };
      });

      return leadsWithEvents || [];
    },
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: DbLeadInsert) => {
      const { data, error } = await supabase
        .from("leads")
        .insert([lead])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar lead: " + error.message);
    },
  });
};

export const useCreateBulkLeads = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leads: DbLeadInsert[]) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(leads)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao importar leads: " + error.message);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & DbLeadUpdate) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", variables.id] });
      toast.success("Lead atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar lead: " + error.message);
    },
  });
};

export const useLeadProperties = (leadId: string) => {
  return useQuery({
    queryKey: ["lead-properties", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_properties")
        .select(`
          *,
          properties:property_id (
            id,
            title,
            price,
            address,
            city,
            state,
            status,
            property_type
          )
        `)
        .eq("lead_id", leadId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
  });
};
