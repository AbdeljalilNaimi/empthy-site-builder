import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, CheckCircle, Clock, XCircle, Upload, FileText, AlertCircle,
  FileSearch, Loader2, CheckCircle2, GraduationCap, Building2, CreditCard,
  Eye, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyDocumentContent } from '@/services/ocrVerificationService';
import type { VerificationResult, OCRProgress } from '@/types/ocr';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface EnhancedVerificationCenterProps {
  providerId: string;
  providerName: string;
  currentStatus: VerificationStatus;
  profileComplete: boolean;
  onStatusChange?: (status: VerificationStatus) => void;
}

interface DocumentSlot {
  id: string;
  label: string;
  description: string;
  required: boolean;
  icon: React.ElementType;
  file: File | null;
  ocrResult: VerificationResult | null;
  ocrProgress: OCRProgress | null;
  isVerifying: boolean;
  preview: string | null;
}

const initialDocumentSlots: Omit<DocumentSlot, 'file' | 'ocrResult' | 'ocrProgress' | 'isVerifying' | 'preview'>[] = [
  {
    id: 'license',
    label: 'Licence Professionnelle',
    description: 'Votre licence ou agrément d\'exercice',
    required: true,
    icon: FileText,
  },
  {
    id: 'id',
    label: 'Pièce d\'Identité',
    description: 'Carte nationale ou passeport',
    required: true,
    icon: CreditCard,
  },
  {
    id: 'commerce',
    label: 'Registre du Commerce',
    description: 'Pour cliniques et établissements',
    required: false,
    icon: Building2,
  },
  {
    id: 'diploma',
    label: 'Diplômes / Certificats',
    description: 'Formations et spécialisations',
    required: false,
    icon: GraduationCap,
  },
];

export function EnhancedVerificationCenter({
  providerId,
  providerName,
  currentStatus,
  profileComplete,
  onStatusChange,
}: EnhancedVerificationCenterProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [documents, setDocuments] = useState<DocumentSlot[]>(
    initialDocumentSlots.map(slot => ({
      ...slot,
      file: null,
      ocrResult: null,
      ocrProgress: null,
      isVerifying: false,
      preview: null,
    }))
  );

  // Extract names for OCR verification
  const nameParts = providerName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const updateDocument = (id: string, updates: Partial<DocumentSlot>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const verifyDocument = useCallback(async (
    file: File,
    slotId: string
  ) => {
    updateDocument(slotId, { isVerifying: true, ocrProgress: null, ocrResult: null });
    
    try {
      const result = await verifyDocumentContent(
        file,
        { fullName: providerName, firstName, lastName },
        (progress) => {
          updateDocument(slotId, { ocrProgress: progress });
        }
      );
      
      updateDocument(slotId, { ocrResult: result, isVerifying: false });
      
      toast({
        title: result.success ? 'Document pré-vérifié ✓' : 'Vérification partielle',
        description: result.success 
          ? 'Les informations correspondent.'
          : `Score: ${Math.round(result.overallScore)}%. Vérification manuelle requise.`,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      updateDocument(slotId, { isVerifying: false });
      toast({
        title: 'Erreur OCR',
        description: 'Impossible de vérifier automatiquement.',
        variant: 'destructive',
      });
    }
  }, [providerName, firstName, lastName, toast]);

  const handleFileChange = useCallback((slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Create preview
    const preview = URL.createObjectURL(file);
    updateDocument(slotId, { file, preview, ocrResult: null });

    // Auto-start OCR for required documents
    const slot = documents.find(d => d.id === slotId);
    if (slot?.required || slotId === 'license' || slotId === 'id') {
      verifyDocument(file, slotId);
    }
  }, [documents, verifyDocument]);

  const removeDocument = (slotId: string) => {
    updateDocument(slotId, { 
      file: null, 
      preview: null, 
      ocrResult: null, 
      ocrProgress: null,
      isVerifying: false 
    });
  };

  const handleSubmit = async () => {
    const requiredDocs = documents.filter(d => d.required);
    const missingRequired = requiredDocs.filter(d => !d.file);
    
    if (missingRequired.length > 0) {
      toast({
        title: "Documents requis manquants",
        description: `Veuillez télécharger: ${missingRequired.map(d => d.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requests = JSON.parse(localStorage.getItem('ch_verification_requests') || '[]');
      requests.push({
        id: Date.now().toString(),
        providerId,
        providerName,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents: documents.reduce((acc, doc) => {
          if (doc.file) {
            acc[doc.id] = {
              fileName: doc.file.name,
              ocrSuccess: doc.ocrResult?.success || false,
              ocrScore: doc.ocrResult?.overallScore || 0,
            };
          }
          return acc;
        }, {} as Record<string, any>),
        additionalNotes,
      });
      localStorage.setItem('ch_verification_requests', JSON.stringify(requests));

      const registrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
      const updated = registrations.map((r: any) => 
        r.id === providerId ? { ...r, verificationStatus: 'pending' } : r
      );
      localStorage.setItem('ch_pending_registrations', JSON.stringify(updated));

      toast({
        title: "Demande envoyée !",
        description: "Notre équipe vérifiera vos documents sous 24-48h.",
      });

      onStatusChange?.('pending');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    none: {
      icon: Shield,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      label: 'Non vérifié',
      description: 'Téléchargez vos documents pour obtenir le badge vérifié'
    },
    pending: {
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'En cours',
      description: 'Votre demande est en cours d\'examen (24-48h)'
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Vérifié',
      description: 'Votre profil est vérifié et certifié'
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Rejeté',
      description: 'Veuillez corriger vos documents et soumettre à nouveau'
    }
  };

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;
  const uploadedCount = documents.filter(d => d.file).length;
  const verifiedCount = documents.filter(d => d.ocrResult?.success).length;

  const renderDocumentSlot = (slot: DocumentSlot) => {
    const SlotIcon = slot.icon;
    
    return (
      <div 
        key={slot.id}
        className={cn(
          "relative border-2 rounded-xl p-4 transition-all",
          slot.file 
            ? slot.ocrResult?.success 
              ? "border-green-500/50 bg-green-500/5" 
              : slot.ocrResult 
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-primary/50 bg-primary/5"
            : "border-dashed hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        {/* Required Badge */}
        {slot.required && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 right-2 text-xs bg-background"
          >
            Requis
          </Badge>
        )}

        {slot.isVerifying ? (
          // Verifying State
          <div className="space-y-3 py-4">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{slot.ocrProgress?.statusText || 'Vérification...'}</p>
              <Progress value={slot.ocrProgress?.progress || 0} className="h-2" />
            </div>
          </div>
        ) : slot.file && slot.preview ? (
          // Uploaded State
          <div className="space-y-3">
            {/* Preview */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
              {slot.file.type === 'application/pdf' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="absolute bottom-2 text-xs text-muted-foreground">PDF</p>
                </div>
              ) : (
                <img 
                  src={slot.preview} 
                  alt={slot.label}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Preview Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2 h-7 w-7"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  {slot.file.type === 'application/pdf' ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p>{slot.file.name}</p>
                    </div>
                  ) : (
                    <img 
                      src={slot.preview} 
                      alt={slot.label}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  )}
                </DialogContent>
              </Dialog>
              
              {/* Remove Button */}
              <Button 
                size="icon" 
                variant="destructive" 
                className="absolute top-2 left-2 h-7 w-7"
                onClick={() => removeDocument(slot.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* File Info & OCR Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium truncate">{slot.file.name}</p>
              
              {slot.ocrResult && (
                <Badge 
                  variant={slot.ocrResult.success ? 'default' : 'outline'}
                  className={cn(
                    slot.ocrResult.success 
                      ? "bg-green-500/10 text-green-600 border-green-500/20" 
                      : "border-amber-500/30 text-amber-600"
                  )}
                >
                  <FileSearch className="h-3 w-3 mr-1" />
                  {slot.ocrResult.success 
                    ? 'Pré-vérifié ✓' 
                    : `Score: ${Math.round(slot.ocrResult.overallScore)}%`
                  }
                </Badge>
              )}
            </div>
          </div>
        ) : (
          // Empty State
          <label 
            htmlFor={`doc-${slot.id}`}
            className="cursor-pointer block text-center py-6 space-y-2"
          >
            <div className={cn(
              "w-12 h-12 mx-auto rounded-full flex items-center justify-center",
              "bg-muted"
            )}>
              <SlotIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">{slot.label}</p>
              <p className="text-xs text-muted-foreground">{slot.description}</p>
            </div>
            <p className="text-xs text-primary">
              <Upload className="h-3 w-3 inline mr-1" />
              Cliquez pour télécharger
            </p>
            <Input
              id={`doc-${slot.id}`}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileChange(slot.id, e)}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      {/* Status Header */}
      <div className={cn("px-6 py-4", config.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-background")}>
              <StatusIcon className={cn("h-6 w-6", config.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{uploadedCount}/4</p>
            <p className="text-xs text-muted-foreground">documents</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Profile Incomplete Warning */}
        {!profileComplete && (currentStatus === 'none' || currentStatus === 'rejected') && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Profil incomplet</p>
              <p className="text-sm text-muted-foreground">
                Complétez votre profil à 100% avant de demander la vérification.
              </p>
            </div>
          </div>
        )}

        {/* Document Slots Grid */}
        {(currentStatus === 'none' || currentStatus === 'rejected') && profileComplete && (
          <>
            {/* OCR Info */}
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <FileSearch className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Vérification automatique par IA</p>
                <p className="text-sm text-muted-foreground">
                  Vos documents sont pré-vérifiés pour accélérer le processus d'approbation.
                </p>
              </div>
            </div>

            {/* 4 Document Slots */}
            <div className="grid grid-cols-2 gap-4">
              {documents.map(renderDocumentSlot)}
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Informations additionnelles pour la vérification..."
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Summary & Submit */}
            {uploadedCount > 0 && (
              <div className={cn(
                "p-4 rounded-lg",
                verifiedCount === uploadedCount 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-primary/5 border border-primary/20"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {verifiedCount}/{uploadedCount} documents pré-vérifiés
                  </span>
                  {verifiedCount === uploadedCount && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Prêt
                    </Badge>
                  )}
                </div>
                <Progress 
                  value={(verifiedCount / Math.max(uploadedCount, 1)) * 100} 
                  className="h-2"
                />
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || documents.some(d => d.isVerifying) || !documents.filter(d => d.required).every(d => d.file)}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : verifiedCount > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Soumettre la demande ({verifiedCount} pré-vérifiés)
                </>
              ) : (
                'Demander la vérification'
              )}
            </Button>
          </>
        )}

        {/* Pending State */}
        {currentStatus === 'pending' && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <p className="font-medium text-sm">Vérification en cours</p>
              <p className="text-sm text-muted-foreground">
                Notre équipe examine vos documents. Vous recevrez une notification.
              </p>
            </div>
          </div>
        )}

        {/* Approved State */}
        {currentStatus === 'approved' && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-sm">Profil vérifié</p>
              <p className="text-sm text-muted-foreground">
                Votre badge de vérification est visible sur votre profil public.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
