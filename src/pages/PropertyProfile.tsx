import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  ArrowLeft,
  Building2,
  MapPin,
  Edit2,
  User,
  Calendar
} from "lucide-react";
import { useProperty, useUpdateProperty } from "@/hooks/useProperties";
import { useOwners } from "@/hooks/useOwners";
import { propertyStatusMap, propertyTypeMap, formatCurrency, formatDate } from "@/lib/mappers";
import { toast } from "sonner";

export default function PropertyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estados do formulário de edição
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

  // Buscar dados do imóvel
  const { data: property, isLoading: isLoadingProperty } = useProperty(id || "");
  const { data: owners = [], isLoading: ownersLoading } = useOwners();
  const updateProperty = useUpdateProperty();

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

  // Inicializar estados quando o imóvel carregar
  useEffect(() => {
    if (property) {
      setTitle(property.title || "");
      setDescription(property.description || "");
      setPropertyType(property.property_type || "apartamento");
      setStatus(property.status || "disponivel");
      setPrice(property.price ? property.price.toString() : "");
      setAddress(property.address || "");
      setCity(property.city || "");
      setState(property.state || "");
      setZipCode(property.zip_code || "");
      setBedrooms(property.bedrooms ? property.bedrooms.toString() : "");
      setBathrooms(property.bathrooms ? property.bathrooms.toString() : "");
      setArea(property.area ? property.area.toString() : "");
      setOwnerId(property.owner_id || "none");
    }
  }, [property]);

  const formatPriceInput = (value: string) => {
    // Remove tudo exceto dígitos, vírgula e ponto
    // Permite múltiplas vírgulas e pontos para flexibilidade
    return value.replace(/[^\d,.]/g, "");
  };

  const parsePriceValue = (priceStr: string): number | null => {
    if (!priceStr.trim()) return null;
    
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
  };

  // Função de salvamento do formulário completo
  const handleUpdateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id || !title.trim() || !address.trim() || !city.trim() || !state.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const priceValue = parsePriceValue(price);
      
      if (price.trim() && priceValue === null) {
        toast.error("Preço deve ser um valor numérico válido");
        return;
      }

      await updateProperty.mutateAsync({
        id,
        updates: {
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
        },
      });

      toast.success("Imóvel atualizado com sucesso!");
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar imóvel");
      console.error(error);
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando imóvel...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Imóvel não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/properties")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
            <Badge
              variant={
                property.status === "disponivel"
                  ? "default"
                  : property.status === "reservado"
                  ? "secondary"
                  : "outline"
              }
            >
              {propertyStatusMap[property.status] || property.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {propertyTypeMap[property.property_type] || property.property_type} • {property.city}, {property.state}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          {property.owners && (
            <>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                E-mail
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Imóvel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Título</Label>
              <p className="text-sm font-medium">{property.title}</p>
            </div>
            
            {property.description && (
              <div>
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground">Preço</Label>
              <p className="text-sm font-medium">
                {property.price ? formatCurrency(property.price) : "Preço sob consulta"}
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="text-sm font-medium">
                {propertyStatusMap[property.status] || property.status}
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <p className="text-sm font-medium">
                {propertyTypeMap[property.property_type] || property.property_type}
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Detalhes</Label>
              <div className="text-sm space-y-1">
                {property.bedrooms && <p>{property.bedrooms} quartos</p>}
                {property.bathrooms && <p>{property.bathrooms} banheiros</p>}
                {property.area && <p>{property.area}m²</p>}
                {!property.bedrooms && !property.bathrooms && !property.area && (
                  <p className="text-muted-foreground">Não informado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localização e Proprietário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <p className="text-sm font-medium">{property.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Cidade</Label>
                <p className="text-sm font-medium">{property.city}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <p className="text-sm font-medium">{property.state}</p>
              </div>
            </div>
            {property.zip_code && (
              <div>
                <Label className="text-xs text-muted-foreground">CEP</Label>
                <p className="text-sm font-medium">{property.zip_code}</p>
              </div>
            )}

            {property.owners && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Proprietário</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/owners/${property.owners.id}`)}
                  >
                    Ver perfil
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{property.owners.name}</p>
                  {property.owners.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{property.owners.email}</span>
                    </div>
                  )}
                  {property.owners.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{property.owners.phone}</span>
                    </div>
                  )}
                  {property.owners.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{property.owners.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {property.photos && property.photos.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground mb-2 block">Fotos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {property.photos.map((photo, index) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="note">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="note">Nova Nota</TabsTrigger>
              <TabsTrigger value="info">Informações Adicionais</TabsTrigger>
            </TabsList>

            <TabsContent value="note" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Adicionar Nota</Label>
                <Textarea 
                  placeholder="Digite sua nota aqui..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={() => {
                  toast.success("Funcionalidade de notas em desenvolvimento");
                  setNewNote("");
                }} 
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Salvar Nota
              </Button>
            </TabsContent>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Data de Cadastro</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(property.created_at)}
                </p>
              </div>
              {property.updated_at && property.updated_at !== property.created_at && (
                <div className="space-y-2">
                  <Label>Última Atualização</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(property.updated_at)}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Imóvel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProperty} className="space-y-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Apartamento 2 quartos"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Tipo *</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do imóvel..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    placeholder="Ex: 350.000,00 ou 350000,00 ou 350000.50"
                    value={price}
                    onChange={(e) => setPrice(formatPriceInput(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Endereço</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  placeholder="Rua, número"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="SP"
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
            </div>

            {/* Características */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Características</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="0"
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
                    placeholder="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    placeholder="0"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Proprietário */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Proprietário</h3>
              <div className="space-y-2">
                <Label>Selecione o proprietário</Label>
                <Select
                  value={ownerId}
                  onValueChange={setOwnerId}
                  disabled={ownersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={ownersLoading ? "Carregando..." : "Selecione um proprietário"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem proprietário</SelectItem>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateProperty.isPending}
            >
              {updateProperty.isPending ? "Atualizando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

