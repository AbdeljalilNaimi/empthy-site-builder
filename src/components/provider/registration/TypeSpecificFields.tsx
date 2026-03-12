import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Droplet, AlertTriangle, Package, Truck, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ProviderFormData, 
  BLOOD_TYPES,
  STOCK_STATUS_LABELS,
  IMAGING_TYPES,
  EQUIPMENT_CATEGORIES,
  getTypeSpecificFields
} from './types';

interface TypeSpecificFieldsProps {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
}

export function TypeSpecificFields({ formData, updateFormData }: TypeSpecificFieldsProps) {
  const config = getTypeSpecificFields(formData.providerType);
  
  if (Object.keys(config).length === 0) {
    return null;
  }

  const toggleArrayItem = (field: keyof ProviderFormData, item: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateFormData({ [field]: updated });
  };

  return (
    <div className="space-y-6">
      {/* Blood Cabin Specific Fields */}
      {config.showBloodTypes && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <Droplet className="h-5 w-5" />
              Groupes Sanguins Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {BLOOD_TYPES.map((type) => (
                <div
                  key={type}
                  className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-full border-2 cursor-pointer transition-all font-bold",
                    (formData.bloodTypes || []).includes(type)
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-border hover:border-red-300"
                  )}
                  onClick={() => toggleArrayItem('bloodTypes', type)}
                >
                  {type}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Status */}
      {config.showStockStatus && (
        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Statut du Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(STOCK_STATUS_LABELS).map(([key, value]) => (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                    formData.stockStatus === key
                      ? key === 'critical' ? "border-destructive bg-destructive/10" :
                        key === 'low' ? "border-orange-500 bg-orange-500/10" :
                        key === 'high' ? "border-green-500 bg-green-500/10" :
                        "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => updateFormData({ stockStatus: key as ProviderFormData['stockStatus'] })}
                >
                  <span className="font-medium">{value.fr}</span>
                  <span className="text-xs text-muted-foreground" dir="rtl">{value.ar}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <Label className="font-medium text-destructive">Besoin Urgent de Dons</Label>
                <p className="text-sm text-muted-foreground">Activer l'alerte d'urgence</p>
              </div>
              <Switch
                checked={formData.urgentNeed || false}
                onCheckedChange={(checked) => updateFormData({ urgentNeed: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radiology Center Specific Fields */}
      {config.showImagingTypes && (
        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Camera className="h-5 w-5" />
              Types d'Imagerie Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {IMAGING_TYPES.map((type) => (
                <div
                  key={type}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    (formData.imagingTypes || []).includes(type)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('imagingTypes', type)}
                >
                  <Checkbox
                    checked={(formData.imagingTypes || []).includes(type)}
                    onCheckedChange={() => toggleArrayItem('imagingTypes', type)}
                  />
                  <Label className="text-sm cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Equipment Specific Fields */}
      {config.showProductCategories && (
        <Card className="border-purple-200 dark:border-purple-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Package className="h-5 w-5" />
              Catégories de Produits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    (formData.productCategories || []).includes(cat)
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('productCategories', cat)}
                >
                  <Checkbox
                    checked={(formData.productCategories || []).includes(cat)}
                    onCheckedChange={() => toggleArrayItem('productCategories', cat)}
                  />
                  <Label className="text-sm cursor-pointer">{cat}</Label>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <Label className="font-medium">Location Disponible</Label>
                  <p className="text-sm text-muted-foreground">Proposer la location</p>
                </div>
                <Switch
                  checked={formData.rentalAvailable || false}
                  onCheckedChange={(checked) => updateFormData({ rentalAvailable: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Livraison</Label>
                    <p className="text-sm text-muted-foreground">Service de livraison</p>
                  </div>
                </div>
                <Switch
                  checked={formData.deliveryAvailable || false}
                  onCheckedChange={(checked) => updateFormData({ deliveryAvailable: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
