import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties, useCreateProperty } from "@/hooks/useProperties";
import { useOwners, useCreateOwner } from "@/hooks/useOwners";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

const statusLabels: Record<string, string> = {
  "disponivel": "Disponível",
  "reservado": "Reservado",
  "vendido": "Vendido",
  "alugado": "Alugado"
};

const propertyStatusOptions = [
  { label: "Disponível", value: "disponivel" },
  { label: "Reservado", value: "reservado" },
  { label: "Vendido", value: "vendido" },
  { label: "Alugado", value: "alugado" },
];

const propertyTypeOptions = [
  { label: "Apartamento", value: "apartamento" },
  { label: "Casa", value: "casa" },
  { label: "Terreno", value: "terreno" },
  { label: "Comercial", value: "comercial" },
  { label: "Rural", value: "rural" },
  { label: "Outro", value: "outro" },
];

export default function Properties() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: properties, isLoading } = useProperties();
  
  // Estados dos Filtros Avançados
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterMinBedrooms, setFilterMinBedrooms] = useState("");
  const [filterMinBathrooms, setFilterMinBathrooms] = useState("");
  const [filterMinArea, setFilterMinArea] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  
  // Estados do Dialog de adicionar imóvel
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [status, setStatus] = useState("disponivel");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [ownerId, setOwnerId] = useState("none");

  const createProperty = useCreateProperty();
  const { data: owners = [], isLoading: ownersLoading } = useOwners();
  const createOwner = useCreateOwner();
  
  // Estados do Dialog de adicionar proprietário
  const [isOwnerDialogOpen, setIsOwnerDialogOpen] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerCpfCnpj, setOwnerCpfCnpj] = useState("");
  const [ownerCity, setOwnerCity] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");

  // Funções auxiliares para formatação e parsing de preço
  const formatPriceInput = (value: string) => {
    // Remove tudo exceto dígitos, vírgula e ponto
    // Permite múltiplas vírgulas e pontos para flexibilidade
    return value.replace(/[^\d,.]/g, "");
  };

  const parsePriceValue = (priceStr: string): number | null => {
    if (!priceStr.trim()) return null;
    
    try {
      // Remove espaços e caracteres não numéricos exceto vírgula e ponto
      let cleaned = priceStr.trim().replace(/[^\d,.]/g, "");
      
      // Encontra a última vírgula e o último ponto
      const lastCommaIndex = cleaned.lastIndexOf(",");
      const lastDotIndex = cleaned.lastIndexOf(".");
      
      if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
        // Tem ambos vírgula e ponto
        // Determina qual é o separador decimal (o que vem por último geralmente)
        if (lastCommaIndex > lastDotIndex) {
          // Vírgula vem por último: formato BR (ex: 1.234,56 ou 900.000,00)
          // Remove todos os pontos (separadores de milhares) e substitui vírgula por ponto
          const beforeComma = cleaned.substring(0, lastCommaIndex);
          const afterComma = cleaned.substring(lastCommaIndex + 1);
          
          // Detecta padrão como "900.00,00" (3 dígitos, ponto, dois zeros, vírgula, dois zeros)
          // Nesse caso, o usuário provavelmente quer 900.000,00 (adiciona zeros)
          const patternMatch = beforeComma.match(/^(\d{1,3})\.00$/);
          let digitsBeforeComma = beforeComma.replace(/\./g, "");
          
          if (patternMatch) {
            // Padrão "900.00" -> interpreta como "900000" (adiciona zeros)
            const baseDigits = patternMatch[1]; // "900"
            digitsBeforeComma = baseDigits + "000"; // "900000"
          }
          
          cleaned = digitsBeforeComma + "." + afterComma;
        } else {
          // Ponto vem por último: formato US (ex: 1,234.56)
          // Remove todas as vírgulas (separadores de milhares)
          cleaned = cleaned.replace(/,/g, "");
        }
      } else if (lastCommaIndex !== -1) {
        // Só tem vírgula
        const afterComma = cleaned.substring(lastCommaIndex + 1);
        if (afterComma.length <= 2) {
          // 2 ou menos dígitos após vírgula = formato BR (decimal)
          cleaned = cleaned.replace(",", ".");
        } else {
          // Mais de 2 dígitos = provavelmente separador de milhares, remove
          cleaned = cleaned.replace(/,/g, "");
        }
      } else if (lastDotIndex !== -1) {
        // Só tem ponto
        const afterDot = cleaned.substring(lastDotIndex + 1);
        if (afterDot.length <= 2) {
          // 2 ou menos dígitos após ponto = formato US (decimal), mantém
          // Não precisa fazer nada
        } else {
          // Mais de 2 dígitos = provavelmente separador de milhares, remove
          cleaned = cleaned.replace(/\./g, "");
        }
      }
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    } catch (error) {
      return null;
    }
  };

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return properties.filter(property => {
      // Filtro de busca por texto
      const matchesSearch = 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Filtro por tipo
      if (filterType !== "all" && property.property_type !== filterType) {
        return false;
      }
      
      // Filtro por status
      if (filterStatus !== "all" && property.status !== filterStatus) {
        return false;
      }
      
      // Filtro por preço mínimo
      if (filterMinPrice.trim()) {
        const minPrice = parsePriceValue(filterMinPrice);
        if (minPrice !== null && (!property.price || property.price < minPrice)) {
          return false;
        }
      }
      
      // Filtro por preço máximo
      if (filterMaxPrice.trim()) {
        const maxPrice = parsePriceValue(filterMaxPrice);
        if (maxPrice !== null && (!property.price || property.price > maxPrice)) {
          return false;
        }
      }
      
      // Filtro por quartos mínimo
      if (filterMinBedrooms.trim()) {
        const minBedrooms = parseInt(filterMinBedrooms);
        if (!isNaN(minBedrooms) && (!property.bedrooms || property.bedrooms < minBedrooms)) {
          return false;
        }
      }
      
      // Filtro por banheiros mínimo
      if (filterMinBathrooms.trim()) {
        const minBathrooms = parseInt(filterMinBathrooms);
        if (!isNaN(minBathrooms) && (!property.bathrooms || property.bathrooms < minBathrooms)) {
          return false;
        }
      }
      
      // Filtro por área mínima
      if (filterMinArea.trim()) {
        const minArea = parseFloat(filterMinArea.replace(",", "."));
        if (!isNaN(minArea) && (!property.area || property.area < minArea)) {
          return false;
        }
      }
      
      // Filtro por cidade
      if (filterCity.trim() && !property.city.toLowerCase().includes(filterCity.toLowerCase())) {
        return false;
      }
      
      // Filtro por estado
      if (filterState.trim() && !property.state.toLowerCase().includes(filterState.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [properties, searchTerm, filterType, filterStatus, filterMinPrice, filterMaxPrice, filterMinBedrooms, filterMinBathrooms, filterMinArea, filterCity, filterState]);

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim() || !address.trim() || !city.trim() || !state.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const priceValue = parsePriceValue(price);
      
      if (price.trim() && priceValue === null) {
        toast.error("Preço deve ser um valor numérico válido");
        return;
      }

      await createProperty.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        property_type: propertyType as any,
        status: status as any,
        price: priceValue,
        address: address.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zip_code: zipCode.trim() || null,
        bedrooms: bedrooms.trim() ? (parseInt(bedrooms.trim()) || null) : null,
        bathrooms: bathrooms.trim() ? (parseInt(bathrooms.trim()) || null) : null,
        area: area.trim() ? (parseFloat(area.trim().replace(",", ".")) || null) : null,
        owner_id: ownerId && ownerId !== "none" ? ownerId : null,
      });

      toast.success("Imóvel cadastrado com sucesso!");
      setIsDialogOpen(false);
      // Limpar formulário
      setTitle("");
      setDescription("");
      setPropertyType("apartamento");
      setStatus("disponivel");
      setPrice("");
      setAddress("");
      setCity("");
      setState("");
      setZipCode("");
      setBedrooms("");
      setBathrooms("");
      setArea("");
      setOwnerId("none");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar imóvel");
      console.error(error);
    }
  };

  const handleAddOwner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const newOwner = await createOwner.mutateAsync({
        name: ownerName.trim(),
        email: ownerEmail.trim() || null,
        phone: ownerPhone.trim(),
        cpf_cnpj: ownerCpfCnpj.trim() || null,
        address: ownerCity.trim() || null,
        status: "ativo" as const,
        notes: ownerNotes.trim() || null,
      });

      // Selecionar o novo proprietário automaticamente
      setOwnerId(newOwner.id);
      setIsOwnerDialogOpen(false);
      
      // Limpar formulário
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPhone("");
      setOwnerCpfCnpj("");
      setOwnerCity("");
      setOwnerNotes("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar proprietário");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imóveis</h1>
          <p className="text-muted-foreground mt-1">Catálogo completo de imóveis</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Imóvel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Imóvel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Apartamento 2 quartos no centro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o imóvel..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Tipo de Imóvel *</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  placeholder="Ex: 350.000,00 ou 350000,00 ou 350000.50"
                  value={price}
                  onChange={(e) => setPrice(formatPriceInput(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  placeholder="Ex: Rua das Flores, 123"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="Ex: SP"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="Ex: 2"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="Ex: 2"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    placeholder="Ex: 85.5"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Proprietário</Label>
                <div className="flex gap-2">
                  <Select
                    value={ownerId === "new" ? "none" : ownerId}
                    onValueChange={(value) => {
                      if (value === "new") {
                        setIsOwnerDialogOpen(true);
                        // Não alterar o ownerId aqui, manter o valor anterior
                      } else {
                        setOwnerId(value === "none" ? "none" : value);
                      }
                    }}
                    disabled={ownersLoading}
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={ownersLoading ? "Carregando..." : "Selecione um proprietário"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não atribuído</SelectItem>
                      {owners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-primary font-medium">
                        + Adicionar Novo Proprietário
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createProperty.isPending}
              >
                {createProperty.isPending ? "Cadastrando..." : "Cadastrar Imóvel"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Adicionar Novo Proprietário */}
        <Dialog open={isOwnerDialogOpen} onOpenChange={setIsOwnerDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Proprietário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddOwner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome Completo *</Label>
                <Input 
                  id="ownerName" 
                  placeholder="Ex: João Silva" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="joao@email.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Telefone *</Label>
                <Input
                  id="ownerPhone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerCpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="ownerCpfCnpj"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={ownerCpfCnpj}
                  onChange={(e) => setOwnerCpfCnpj(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerCity">Endereço/Cidade</Label>
                <Input 
                  id="ownerCity" 
                  placeholder="São Paulo" 
                  value={ownerCity}
                  onChange={(e) => setOwnerCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerNotes">Observações</Label>
                <Textarea
                  id="ownerNotes"
                  placeholder="Informações adicionais..."
                  rows={3}
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createOwner.isPending}
              >
                {createOwner.isPending ? "Adicionando..." : "Adicionar Proprietário"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por endereço, cidade..."
                className="pl-10 bg-muted/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filtros Avançados</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterType">Tipo de Imóvel</Label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {propertyTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filterStatus">Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {propertyStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterMinPrice">Preço Mínimo</Label>
                      <Input
                        id="filterMinPrice"
                        placeholder="Ex: 200.000,00"
                        value={filterMinPrice}
                        onChange={(e) => setFilterMinPrice(formatPriceInput(e.target.value))}
                        className="bg-background text-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filterMaxPrice">Preço Máximo</Label>
                      <Input
                        id="filterMaxPrice"
                        placeholder="Ex: 500.000,00"
                        value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(formatPriceInput(e.target.value))}
                        className="bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterMinBedrooms">Quartos (mínimo)</Label>
                      <Input
                        id="filterMinBedrooms"
                        type="number"
                        placeholder="Ex: 2"
                        value={filterMinBedrooms}
                        onChange={(e) => setFilterMinBedrooms(e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filterMinBathrooms">Banheiros (mínimo)</Label>
                      <Input
                        id="filterMinBathrooms"
                        type="number"
                        placeholder="Ex: 2"
                        value={filterMinBathrooms}
                        onChange={(e) => setFilterMinBathrooms(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filterMinArea">Área Mínima (m²)</Label>
                    <Input
                      id="filterMinArea"
                      placeholder="Ex: 80"
                      value={filterMinArea}
                      onChange={(e) => setFilterMinArea(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterCity">Cidade</Label>
                      <Input
                        id="filterCity"
                        placeholder="Ex: São Paulo"
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filterState">Estado</Label>
                      <Input
                        id="filterState"
                        placeholder="Ex: SP"
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setFilterType("all");
                        setFilterStatus("all");
                        setFilterMinPrice("");
                        setFilterMaxPrice("");
                        setFilterMinBedrooms("");
                        setFilterMinBathrooms("");
                        setFilterMinArea("");
                        setFilterCity("");
                        setFilterState("");
                      }}
                    >
                      Limpar Filtros
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setIsFiltersDialogOpen(false)}
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum imóvel encontrado
          </div>
        ) : (
          filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover-lift border-border/50 cursor-pointer group"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className={`absolute top-3 right-3 ${
                    property.status === "disponivel"
                      ? "bg-success/90 text-white"
                      : "bg-warning/90 text-white"
                  }`}
                >
                  {statusLabels[property.status] || property.status}
                </Badge>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {property.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{property.area ? `${property.area}m²` : '-'}</span>
                  <span>{property.bedrooms ? `${property.bedrooms} qts` : '-'}</span>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <p className="text-2xl font-bold text-primary">
                    {property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Sob consulta'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
