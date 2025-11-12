// Mapeamento de status e origens do banco para labels do frontend

export const leadStatusMap: Record<string, string> = {
  novo: "Novo Lead",
  contato: "Em Atendimento",
  qualificado: "Qualificado",
  proposta: "Visita Agendada",
  negociacao: "Em Negociação",
  fechado: "Venda",
  perdido: "Perdido",
};

export const leadOriginMap: Record<string, string> = {
  website: "Site",
  indicacao: "Indicação",
  redes_sociais: "Facebook Ads",
  telefone: "WhatsApp",
  email: "E-mail",
  evento: "Evento",
  outro: "Outro",
};

export const brokerStatusMap: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  ferias: "Férias",
};

export const ownerStatusMap: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export const propertyStatusMap: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  alugado: "Alugado",
};

export const propertyTypeMap: Record<string, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  terreno: "Terreno",
  comercial: "Comercial",
  rural: "Rural",
  outro: "Outro",
};

// Funções helper para formatar valores
export function formatCurrency(value: number | null): string {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR");
}

// Mapeamento reverso: frontend para banco
export function getLeadStatusFromLabel(label: string): string {
  const reverseMap: Record<string, string> = {
    "Novo Lead": "novo",
    "Em Atendimento": "contato",
    "Qualificado": "qualificado",
    "Visita Agendada": "proposta",
    "Em Negociação": "negociacao",
    "Venda": "fechado",
    "Perdido": "perdido",
  };
  return reverseMap[label] || label.toLowerCase();
}

export function getLeadOriginFromLabel(label: string): string {
  const reverseMap: Record<string, string> = {
    "Site": "website",
    "Indicação": "indicacao",
    "Facebook Ads": "redes_sociais",
    "Instagram": "redes_sociais",
    "Google Ads": "website",
    "WhatsApp": "telefone",
    "E-mail": "email",
    "Evento": "evento",
    "Outro": "outro",
  };
  return reverseMap[label] || "outro";
}

