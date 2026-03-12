import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LocationPicker } from '@/components/provider/LocationPicker';
import { offerInputSchema, type OfferInput } from '@/services/provide/provideService';
import { PROVIDE_CATEGORIES } from '@/types/provide';
import { Loader2, ImagePlus, X, Apple, Pill, Wrench, Car, Package } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';
import type { ProvideCategory } from '@/types/provide';

const categoryIcons: Record<ProvideCategory, LucideIcon> = {
  food: Apple,
  medicine: Pill,
  tools: Wrench,
  transport: Car,
  other: Package,
};

interface OfferFormProps {
  defaultValues?: Partial<OfferInput>;
  onSubmit: (data: OfferInput, imageFile?: File) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const OfferForm = ({ defaultValues, onSubmit, isSubmitting, submitLabel }: OfferFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferInput>({
    resolver: zodResolver(offerInputSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      contactMethod: 'phone',
      contactValue: '',
      location: { lat: 35.1833, lng: -0.6333 },
      ...defaultValues,
    },
  });

  const contactMethod = watch('contactMethod');
  const location = watch('location');

  const contactLabels: Record<string, string> = {
    phone: t('offers', 'formContactPhone'),
    email: t('offers', 'formContactEmail'),
    in_app: t('offers', 'formContactApp'),
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const handleFormSubmit = (data: OfferInput) => {
    onSubmit(data, imageFile || undefined);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>{t('offers', 'formPhoto')}</Label>
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={imagePreview} alt={t('offers', 'formPhoto')} className="w-full h-48 object-cover" />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 rtl:right-auto rtl:left-2 h-8 w-8"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 cursor-pointer transition-colors">
            <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{t('offers', 'formDropImage')}</span>
            <span className="text-xs text-muted-foreground mt-1">{t('offers', 'formImageHint')}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t('offers', 'formTitle')}</Label>
        <Input id="title" placeholder={t('offers', 'formTitlePlaceholder')} {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('offers', 'formDescription')}</Label>
        <Textarea id="description" placeholder={t('offers', 'formDescPlaceholder')} rows={4} {...register('description')} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{t('offers', 'formCategory')}</Label>
        <Select
          value={watch('category')}
          onValueChange={(v) => setValue('category', v as OfferInput['category'], { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDE_CATEGORIES.map((c) => {
              const Icon = categoryIcons[c.value];
              return (
                <SelectItem key={c.value} value={c.value}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {t('offers', c.labelKey as any)}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      {/* Contact method */}
      <div className="space-y-2">
        <Label>{t('offers', 'formContactMethod')}</Label>
        <RadioGroup
          value={contactMethod}
          onValueChange={(v) => setValue('contactMethod', v as OfferInput['contactMethod'], { shouldValidate: true })}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="phone" id="cm-phone" />
            <Label htmlFor="cm-phone" className="font-normal cursor-pointer">{t('offers', 'formPhone')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="email" id="cm-email" />
            <Label htmlFor="cm-email" className="font-normal cursor-pointer">{t('offers', 'formEmail')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="in_app" id="cm-app" />
            <Label htmlFor="cm-app" className="font-normal cursor-pointer">{t('offers', 'formInApp')}</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Contact value */}
      <div className="space-y-2">
        <Label htmlFor="contactValue">{contactLabels[contactMethod]}</Label>
        <Input id="contactValue" {...register('contactValue')} />
        {errors.contactValue && <p className="text-sm text-destructive">{errors.contactValue.message}</p>}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>{t('offers', 'formLocation')}</Label>
        <Input
          placeholder={t('offers', 'formLocationPlaceholder')}
          value={location.label || ''}
          onChange={(e) =>
            setValue('location', { ...location, label: e.target.value }, { shouldValidate: true })
          }
          className="mb-2"
        />
        <div className="h-[300px] rounded-lg overflow-hidden border">
          <LocationPicker
            lat={location.lat}
            lng={location.lng}
            onLocationChange={(lat, lng) =>
              setValue('location', { ...location, lat, lng }, { shouldValidate: true })
            }
          />
        </div>
        {errors.location && <p className="text-sm text-destructive">{t('offers', 'formLocationError')}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />}
        {submitLabel || t('offers', 'formPublish')}
      </Button>
    </form>
  );
};
