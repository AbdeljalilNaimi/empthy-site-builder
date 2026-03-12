import React from 'react';
import { X, Stethoscope, Pill, Building, FlaskConical, Star, Check, Accessibility, CreditCard, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '@/pages/SearchPage';
import { COMMON_EQUIPMENT_BRANDS } from '@/components/provider/registration/types';

interface AdvancedFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  showFilters: boolean;
}

export const AdvancedFilters = ({ filters, setFilters, showFilters }: AdvancedFiltersProps) => {
  const categories = [
    { id: 'doctors', label: 'General Doctors', icon: Stethoscope },
    { id: 'specialists', label: 'Specialists', icon: Stethoscope },
    { id: 'pharmacies', label: 'Pharmacies', icon: Pill },
    { id: 'laboratories', label: 'Laboratories', icon: FlaskConical },
    { id: 'clinics', label: 'Clinics', icon: Building }
  ];

  const availabilityOptions = [
    { value: 'any', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'now', label: 'Open now' }
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    updateFilter('categories', newCategories);
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      location: '',
      radius: 25,
      availability: 'any',
      minRating: 0,
      verifiedOnly: false,
      emergencyServices: false,
      wheelchairAccessible: false,
      insuranceAccepted: false,
      priceRange: [0, 500],
      equipmentBrands: [],
      cnasOnly: false
    });
  };

  const activeFiltersCount = 
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.emergencyServices ? 1 : 0) +
    (filters.wheelchairAccessible ? 1 : 0) +
    (filters.insuranceAccepted ? 1 : 0) +
    (filters.availability !== 'any' ? 1 : 0) +
    (filters.equipmentBrands.length > 0 ? 1 : 0) +
    (filters.cnasOnly ? 1 : 0);

  if (!showFilters) return null;

  return (
    <div className="w-80 border-r bg-muted/20 h-screen overflow-y-auto">
      <Card className="m-4 shadow-none border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="justify-start p-0 h-auto">
              Clear all filters
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Categories */}
          <div>
            <Label className="text-sm font-medium">Service Categories</Label>
            <div className="mt-2 space-y-2">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label
                      htmlFor={category.id}
                      className="flex items-center gap-2 cursor-pointer font-normal"
                    >
                      <IconComponent size={16} className="text-primary" />
                      {category.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Distance */}
          <div>
            <Label className="text-sm font-medium">Location & Distance</Label>
            <div className="mt-2 space-y-3">
              <Input
                placeholder="Enter city or postal code"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Radius</span>
                  <span>{filters.radius}km</span>
                </div>
                <Slider
                  value={[filters.radius]}
                  onValueChange={(value) => updateFilter('radius', value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <Label className="text-sm font-medium">Availability</Label>
            <RadioGroup
              value={filters.availability}
              onValueChange={(value) => updateFilter('availability', value)}
              className="mt-2"
            >
              {availabilityOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Rating Filter */}
          <div>
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', rating === filters.minRating ? 0 : rating)}
                  className="p-1"
                >
                  <Star
                    size={20}
                    className={rating <= filters.minRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any rating'}
              </span>
            </div>
          </div>

          {/* Special Options */}
          <div>
            <Label className="text-sm font-medium">Special Options</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
                />
                <Label htmlFor="verified" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Check size={16} className="text-green-500" />
                  Verified providers only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergency"
                  checked={filters.emergencyServices}
                  onCheckedChange={(checked) => updateFilter('emergencyServices', checked)}
                />
                <Label htmlFor="emergency" className="cursor-pointer font-normal">
                  Emergency services available
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wheelchair"
                  checked={filters.wheelchairAccessible}
                  onCheckedChange={(checked) => updateFilter('wheelchairAccessible', checked)}
                />
                <Label htmlFor="wheelchair" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Accessibility size={16} className="text-primary" />
                  Wheelchair accessible
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={filters.insuranceAccepted}
                  onCheckedChange={(checked) => updateFilter('insuranceAccepted', checked)}
                />
                <Label htmlFor="insurance" className="flex items-center gap-2 cursor-pointer font-normal">
                  <CreditCard size={16} className="text-primary" />
                  Insurance accepted
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cnas"
                  checked={filters.cnasOnly}
                  onCheckedChange={(checked) => updateFilter('cnasOnly', checked)}
                />
                <Label htmlFor="cnas" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Badge variant="secondary" className="text-xs">CNAS</Badge>
                  Équipement remboursable uniquement
                </Label>
              </div>
            </div>
          </div>

          {/* Equipment Brand Filter */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Wrench size={16} className="text-primary" />
              Marques d'équipement
            </Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COMMON_EQUIPMENT_BRANDS.map(brand => (
                <Badge
                  key={brand}
                  variant={filters.equipmentBrands.includes(brand) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    const newBrands = filters.equipmentBrands.includes(brand)
                      ? filters.equipmentBrands.filter(b => b !== brand)
                      : [...filters.equipmentBrands, brand];
                    updateFilter('equipmentBrands', newBrands);
                  }}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium">Consultation Price Range</Label>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-2">
                <span>{filters.priceRange[0]} DA</span>
                <span>{filters.priceRange[1]} DA</span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={500}
                min={0}
                step={25}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};