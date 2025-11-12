import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  ArrowLeft,
  User,
  MapPin,
  Clock,
  FileText,
  Building2,
  Edit2
} from "lucide-react";
import { useOwner, useOwnerProperties, useUpdateOwner } from "@/hooks/useOwners";
import { useCreateProperty } from "@/hooks/useProperties";
import { ownerStatusMap, formatDate, formatCurrency, propertyStatusMap, propertyTypeMap } from "@/lib/mappers";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OwnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estados do formulário de edição
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [status, setStatus] = useState("ativo");
  
  // Estados para formulário de imóvel
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [propertyStatus, setPropertyStatus] = useState("disponivel");
  const [price, setPrice] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");

  // Buscar dados do proprietário
  const { data: owner, isLoading: isLoadingOwner } = useOwner(id || "");
  const { data: ownerProperties = [] } = useOwnerProperties(id || "");
  const updateOwner = useUpdateOwner();
  const createProperty = useCreateProperty();

  const propertyTypeOptions = [
    { label: "Apartamento", value: "apartamento" },
    { label: "Casa", value: "casa" },
    { label: "Terreno", value: "terreno" },
    { label: "Comercial", value: "comercial" },
    { label: "Rural", value: "rural" },
    { label: "Outro", value: "outro" },
  ];

  const propertyStatusOptions = [
    { label: "Disponível", value: "disponivel" },
    { label: "Reservado", value: "reservado" },
    { label: "Vendido", value: "vendido" },
    { label: "Alugado", value: "alugado" },
  ];

  // Inicializar estados quando o proprietário carregar
  useEffect(() => {
    if (owner) {
      setName(owner.name || "");
      setEmail(owner.email || "");
      setPhone(owner.phone || "");
      setAddress(owner.address || "");
      setCpfCnpj(owner.cpf_cnpj || "");
      setStatus(owner.status || "ativo");
    }
  }, [owner]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    
    try {
      await updateOwner.mutateAsync({
        id,
        updates: {
          notes: owner?.notes ? `${owner.notes}\n\n${new Date().toLocaleString('pt-BR')}: ${newNote}` : `${new Date().toLocaleString('pt-BR')}: ${newNote}`,
        },
      });
      toast.success("Nota adicionada com sucesso!");
      setNewNote("");
    } catch (error) {
      toast.error("Erro ao adicionar nota");
      console.error(error);
    }
  };

  // Função de atualização do proprietário
  const handleUpdateOwner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id || !name.trim() || !phone.trim()) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    try {
      await updateOwner.mutateAsync({
        id,
        updates: {
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          address: address.trim() || null,
          cpf_cnpj: cpfCnpj.trim() || null,
          status: status as any,
        },
      });

      toast.success("Proprietário atualizado com sucesso!");
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar proprietário");
      console.error(error);
    }
  };

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title || !propertyAddress || !city || !state || !id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createProperty.mutateAsync({
        title,
        description: description || null,
        property_type: propertyType as any,
        status: propertyStatus as any,
        price: price ? parseFloat(price.replace(/[^\d,]/g, "").replace(",", ".")) : null,
        address: propertyAddress,
        city,
        state,
        zip_code: zipCode || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        area: area ? parseFloat(area.replace(",", ".")) : null,
        owner_id: id,
        photos: null,
      });

      toast.success("Imóvel cadastrado com sucesso!");
      
      // Limpar formulário
      setTitle("");
      setDescription("");
      setPropertyType("apartamento");
      setPropertyStatus("disponivel");
      setPrice("");
      setPropertyAddress("");
      setCity("");
      setState("");
      setZipCode("");
      setBedrooms("");
      setBathrooms("");
      setArea("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar imóvel");
      console.error(error);
    }
  };

  if (isLoadingOwner) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando proprietário...</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Proprietário não encontrado</p>
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
          onClick={() => navigate("/owners")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{owner.name}</h1>
            <Badge
              variant={owner.status === "ativo" ? "default" : "secondary"}
            >
              {ownerStatusMap[owner.status] || owner.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {ownerProperties.length} {ownerProperties.length === 1 ? 'imóvel' : 'imóveis'} cadastrado{ownerProperties.length !== 1 ? 's' : ''}
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Proprietário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">E-mail</Label>
              <p className="text-sm font-medium">{owner.email || "Não informado"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="text-sm font-medium">{owner.phone}</p>
            </div>
            {owner.address && (
              <div>
                <Label className="text-xs text-muted-foreground">Endereço</Label>
                <p className="text-sm font-medium">{owner.address}</p>
              </div>
            )}
            {owner.cpf_cnpj && (
              <div>
                <Label className="text-xs text-muted-foreground">CPF/CNPJ</Label>
                <p className="text-sm font-medium">{owner.cpf_cnpj}</p>
              </div>
            )}
            {owner.notes && (
              <div>
                <Label className="text-xs text-muted-foreground">Observações</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{owner.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Imóveis do Proprietário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Imóveis ({ownerProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {ownerProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum imóvel cadastrado</p>
              ) : (
                ownerProperties.map((property) => (
                  <div
                    key={property.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{property.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {propertyTypeMap[property.property_type] || property.property_type}
                        </p>
                      </div>
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
                    <div className="space-y-1">
                      {property.price && (
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(property.price)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{property.address}, {property.city} - {property.state}</span>
                      </div>
                      {(property.bedrooms || property.bathrooms || property.area) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          {property.bedrooms && <span>{property.bedrooms} quartos</span>}
                          {property.bathrooms && <span>{property.bathrooms} banheiros</span>}
                          {property.area && <span>{property.area}m²</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
              <TabsTrigger value="property">Adicionar Imóvel</TabsTrigger>
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
              <Button onClick={handleAddNote} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Salvar Nota
              </Button>
            </TabsContent>

            <TabsContent value="property" className="space-y-4 mt-4">
              <form onSubmit={handleAddProperty} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
                      <Select value={propertyStatus} onValueChange={setPropertyStatus}>
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
                        placeholder="Ex: 350.000,00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Localização</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      placeholder="Rua, número"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
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
                        required
                        maxLength={2}
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

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Detalhes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Quartos</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="2"
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
                        placeholder="2"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input
                        id="area"
                        placeholder="80"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createProperty.isPending}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {createProperty.isPending ? "Cadastrando..." : "Cadastrar Imóvel"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proprietário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateOwner} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Endereço completo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="cpfCnpj"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateOwner.isPending}
            >
              {updateOwner.isPending ? "Atualizando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

