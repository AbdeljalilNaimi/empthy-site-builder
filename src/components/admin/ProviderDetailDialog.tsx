import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, XCircle, ChevronDown, MapPin, Phone, Mail, 
  Globe, Building2, Stethoscope, Image, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CityHealthProvider } from '@/data/providers';

interface ProviderDetailDialogProps {
  provider: CityHealthProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  isProcessing?: boolean;
}

function FieldRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">
        {value || <span className="text-muted-foreground/50 italic">Non renseigné</span>}
      </span>
    </div>
  );
}

function StepSection({ 
  step, title, icon: Icon, children, defaultOpen = false 
}: { 
  step: number; 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center text-xs">
              {step}
            </Badge>
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 py-2 space-y-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function calculateProfileScore(provider: CityHealthProvider): number {
  let score = 0;
  const total = 10;
  if (provider.type) score++;
  if (provider.email || provider.phone) score++;
  if (provider.name) score++;
  if (provider.facilityNameAr) score++;
  if (provider.phone) score++;
  if (provider.address) score++;
  if (provider.city) score++;
  if (provider.lat && provider.lng) score++;
  if (provider.services && provider.services.length > 0) score++;
  if (provider.image || provider.description) score++;
  return Math.round((score / total) * 100);
}

export function ProviderDetailDialog({
  provider,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isProcessing = false,
}: ProviderDetailDialogProps) {
  if (!provider) return null;

  const score = calculateProfileScore(provider);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du prestataire</DialogTitle>
          <DialogDescription>
            {provider.name} — Score de profil : {score}%
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <StepSection step={1} title="Identité" icon={Building2} defaultOpen>
            <FieldRow label="Type" value={provider.type} />
            <FieldRow label="Email" value={provider.email} />
          </StepSection>

          <StepSection step={2} title="Informations de base" icon={Mail}>
            <FieldRow label="Nom (FR)" value={provider.facilityNameFr || provider.name} />
            <FieldRow label="Nom (AR)" value={provider.facilityNameAr} />
            <FieldRow label="Téléphone" value={provider.phone} />
            <FieldRow label="Spécialité" value={provider.specialty} />
            <FieldRow label="Contact" value={provider.contactPersonName} />
          </StepSection>

          <StepSection step={3} title="Localisation" icon={MapPin}>
            <FieldRow label="Adresse" value={provider.address} />
            <FieldRow label="Ville" value={provider.city} />
            <FieldRow 
              label="Coordonnées" 
              value={provider.lat && provider.lng ? `${provider.lat.toFixed(4)}, ${provider.lng.toFixed(4)}` : undefined} 
            />
          </StepSection>

          <StepSection step={4} title="Services & Langues" icon={Stethoscope}>
            <div className="py-1.5">
              <span className="text-sm text-muted-foreground">Services</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.services && provider.services.length > 0 ? (
                  provider.services.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground/50 italic">Non renseigné</span>
                )}
              </div>
            </div>
            <div className="py-1.5">
              <span className="text-sm text-muted-foreground">Langues</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.languages && provider.languages.length > 0 ? (
                  provider.languages.map((l, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{l}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground/50 italic">Non renseigné</span>
                )}
              </div>
            </div>
          </StepSection>

          <StepSection step={5} title="Médias" icon={Image}>
            <FieldRow label="Image" value={provider.image ? '✓ Présente' : undefined} />
            {provider.image && (
              <div className="py-2">
                <img src={provider.image} alt="Image" className="h-16 w-16 rounded-lg object-cover border" />
              </div>
            )}
            <FieldRow label="Description" value={provider.description ? `${provider.description.slice(0, 80)}...` : undefined} />
          </StepSection>

          <StepSection step={6} title="Récapitulatif" icon={Globe}>
            <FieldRow label="Score de profil" value={`${score}%`} />
            <FieldRow label="Visible au public" value={provider.isPublic ? 'Oui' : 'Non'} />
            <FieldRow label="Statut vérification" value={provider.verificationStatus || 'pending'} />
          </StepSection>
        </div>

        <Separator />

        <DialogFooter>
          <Button
            className="flex-1"
            onClick={() => onApprove(provider.id)}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Approuver
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onReject(provider.id)}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
            Rejeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
