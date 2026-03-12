import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, XCircle, Eye, FileText, Download, Search, User,
  FileSearch, CheckCircle2, AlertCircle, ChevronDown, Sparkles, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  VerificationRequest,
  OCRResult,
  subscribeToVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest
} from '@/services/verificationService';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/auditLogService';

// OCR Badge Component
function OCRBadge({ ocr, compact = false }: { ocr: OCRResult | null | undefined; compact?: boolean }) {
  if (!ocr) return null;
  
  if (compact) {
    return (
      <Badge 
        variant="outline"
        className={cn(
          "text-xs",
          ocr.success 
            ? "bg-green-500/10 text-green-600 border-green-500/30" 
            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
        )}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        {ocr.success ? 'IA ✓' : `${Math.round(ocr.score)}%`}
      </Badge>
    );
  }
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-md text-xs",
      ocr.success 
        ? "bg-green-500/10 text-green-600" 
        : "bg-amber-500/10 text-amber-600"
    )}>
      <FileSearch className="h-3 w-3" />
      <span>
        {ocr.success ? 'Pré-vérifié par IA' : `Score: ${Math.round(ocr.score)}%`}
      </span>
    </div>
  );
}

// OCR Details Panel
function OCRDetailsPanel({ ocr, title }: { ocr: OCRResult; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const fieldLabels: Record<string, string> = {
    firstName: 'Prénom',
    lastName: 'Nom',
    fullName: 'Nom complet',
    registrationNumber: 'N° Enregistrement',
    date: 'Date',
    facilityName: 'Établissement',
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "border rounded-lg overflow-hidden",
        ocr.success ? "border-green-500/30" : "border-amber-500/30"
      )}>
        <CollapsibleTrigger asChild>
          <button className={cn(
            "w-full flex items-center justify-between p-3 text-left transition-colors",
            ocr.success ? "bg-green-500/5 hover:bg-green-500/10" : "bg-amber-500/5 hover:bg-amber-500/10"
          )}>
            <div className="flex items-center gap-2">
              {ocr.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm font-medium">{title}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  ocr.success 
                    ? "bg-green-500/10 text-green-600 border-green-500/30" 
                    : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {ocr.success ? 'Pré-vérifié' : `${Math.round(ocr.score)}%`}
              </Badge>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 border-t space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Score global de confiance</span>
              <span className="font-medium">{Math.round(ocr.score)}%</span>
            </div>
            <Progress 
              value={ocr.score} 
              className={cn(
                "h-2",
                ocr.success ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
              )} 
            />
            
            <div className="mt-3 space-y-1">
              {Object.entries(ocr.fields).map(([key, field]) => field && (
                <div key={key} className="flex items-center justify-between py-1 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {field.found ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                    <span className="text-xs">{fieldLabels[key] || key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      "{field.expectedValue}"
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        field.found ? "text-green-600" : "text-destructive"
                      )}
                    >
                      {Math.round(field.similarity * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function VerificationQueue() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToVerificationRequests((data) => {
      setRequests(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: VerificationRequest) => {
    setIsProcessing(true);
    try {
      await approveVerificationRequest(request.id, request.providerId);
      
      // Audit log (non-blocking)
      try {
        await logAdminAction(
          user?.uid || 'unknown',
          user?.email || 'unknown',
          'provider_approved',
          request.providerId,
          'provider',
          { providerName: request.providerName, requestId: request.id }
        );
      } catch (e) {
        console.warn('Audit log failed:', e);
      }

      toast({
        title: "Profil approuvé",
        description: `${request.providerName} a été vérifié avec succès.`,
      });
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le profil. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (request: VerificationRequest) => {
    if (!reviewNotes) {
      toast({
        title: "Notes requises",
        description: "Veuillez ajouter une raison de rejet.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectVerificationRequest(request.id, request.providerId, reviewNotes);
      
      // Audit log (non-blocking)
      try {
        await logAdminAction(
          user?.uid || 'unknown',
          user?.email || 'unknown',
          'provider_rejected',
          request.providerId,
          'provider',
          { providerName: request.providerName, requestId: request.id },
          reviewNotes
        );
      } catch (e) {
        console.warn('Audit log failed:', e);
      }

      toast({
        title: "Profil rejeté",
        description: `${request.providerName} a été notifié du rejet.`,
        variant: "destructive"
      });
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le profil. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const preVerifiedCount = requests.filter(r => 
    r.status === 'pending' && r.documents.licenseOCR?.success
  ).length;

  // Check if a request has any OCR data
  const hasOCRData = (request: VerificationRequest) => 
    request.documents.licenseOCR || request.documents.idOCR;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>File d'attente de vérification</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente</span>
                {preVerifiedCount > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {preVerifiedCount} pré-vérifié{preVerifiedCount > 1 ? 's' : ''} par IA
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune demande de vérification</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professionnel</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Vérification IA</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className={cn(
                    request.documents.licenseOCR?.success && request.status === 'pending' && 
                    "bg-green-500/5"
                  )}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{request.providerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.documents.license && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Licence
                          </Badge>
                        )}
                        {request.documents.id && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            ID
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasOCRData(request) ? (
                        <div className="flex items-center gap-1">
                          {request.documents.licenseOCR && (
                            <OCRBadge ocr={request.documents.licenseOCR} compact />
                          )}
                          {request.documents.idOCR && (
                            <OCRBadge ocr={request.documents.idOCR} compact />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(request.submittedAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'approved' ? 'default' : 'destructive'
                        }
                      >
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleApprove(request)}
                              disabled={isProcessing}
                              className={cn(
                                request.documents.licenseOCR?.success && 
                                "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => setSelectedRequest(request)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Examiner la demande</DialogTitle>
            <DialogDescription>
              {selectedRequest?.providerName}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* OCR Pre-verification Summary */}
              {hasOCRData(selectedRequest) && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  selectedRequest.documents.licenseOCR?.success 
                    ? "bg-green-500/5 border-green-500/30" 
                    : "bg-amber-500/5 border-amber-500/30"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className={cn(
                      "h-4 w-4",
                      selectedRequest.documents.licenseOCR?.success 
                        ? "text-green-500" 
                        : "text-amber-500"
                    )} />
                    <span className="font-medium text-sm">
                      {selectedRequest.documents.licenseOCR?.success 
                        ? 'Documents pré-vérifiés par IA - Validation recommandée' 
                        : 'Vérification manuelle recommandée'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedRequest.documents.licenseOCR?.success 
                      ? 'L\'analyse OCR a confirmé la correspondance des informations sur les documents.'
                      : 'L\'analyse OCR n\'a pas pu confirmer toutes les informations. Veuillez vérifier manuellement.'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Documents soumis</h4>
                
                {/* License with OCR details */}
                {selectedRequest.documents.license && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Licence professionnelle</span>
                        {selectedRequest.documents.licenseOCR && (
                          <OCRBadge ocr={selectedRequest.documents.licenseOCR} compact />
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                    {selectedRequest.documents.licenseOCR && (
                      <OCRDetailsPanel 
                        ocr={selectedRequest.documents.licenseOCR} 
                        title="Résultats OCR - Licence" 
                      />
                    )}
                  </div>
                )}
                
                {/* ID with OCR details */}
                {selectedRequest.documents.id && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Pièce d'identité</span>
                        {selectedRequest.documents.idOCR && (
                          <OCRBadge ocr={selectedRequest.documents.idOCR} compact />
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                    {selectedRequest.documents.idOCR && (
                      <OCRDetailsPanel 
                        ocr={selectedRequest.documents.idOCR} 
                        title="Résultats OCR - ID" 
                      />
                    )}
                  </div>
                )}
              </div>

              {selectedRequest.documents.additionalNotes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes du demandeur</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedRequest.documents.additionalNotes}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes de révision (pour rejet)</h4>
                  <Textarea
                    placeholder="Raison du rejet..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    className={cn(
                      "flex-1",
                      selectedRequest.documents.licenseOCR?.success && 
                      "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {selectedRequest.documents.licenseOCR?.success 
                      ? 'Approuver (Recommandé)' 
                      : 'Approuver'}
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedRequest)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Rejeter
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes de révision</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedRequest.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
