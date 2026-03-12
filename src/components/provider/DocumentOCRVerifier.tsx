import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { verifyDocumentContent } from '@/services/ocrVerificationService';
import type { VerificationData, VerificationResult, OCRProgress } from '@/types/ocr';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DocumentOCRVerifierProps {
  file: File;
  expectedData: VerificationData;
  onVerificationComplete?: (result: VerificationResult) => void;
  autoStart?: boolean;
  showDebug?: boolean;
  compact?: boolean;
}

export function DocumentOCRVerifier({
  file,
  expectedData,
  onVerificationComplete,
  autoStart = false,
  showDebug = false,
  compact = false,
}: DocumentOCRVerifierProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate preview URL
  useState(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  });

  const runVerification = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress({ status: 'starting', progress: 0, statusText: 'Démarrage...' });

    try {
      const verificationResult = await verifyDocumentContent(
        file,
        expectedData,
        (p) => setProgress(p)
      );
      
      setResult(verificationResult);
      onVerificationComplete?.(verificationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification');
    } finally {
      setIsProcessing(false);
    }
  }, [file, expectedData, onVerificationComplete]);

  // Auto-start if requested
  useState(() => {
    if (autoStart && !isProcessing && !result) {
      runVerification();
    }
  });

  const getFieldIcon = (found: boolean) => {
    return found ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const getFieldBadge = (found: boolean) => {
    return found ? (
      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
        OK
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-destructive/10">
        KO
      </Badge>
    );
  };

  const fieldLabels: Record<string, string> = {
    firstName: 'Prénom',
    lastName: 'Nom',
    fullName: 'Nom complet',
    registrationNumber: 'N° Enregistrement',
    date: 'Date',
    facilityName: 'Établissement',
  };

  if (compact && result) {
    return (
      <div className="flex items-center gap-2">
        {result.success ? (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Vérifié par IA
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-500/30 text-amber-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Vérification partielle ({Math.round(result.overallScore)}%)
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-primary" />
          Vérification OCR du document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          {file.type === 'application/pdf' ? (
            <FileText className="h-8 w-8 text-red-500" />
          ) : previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" />
          ) : (
            <ImageIcon className="h-8 w-8 text-blue-500" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1].toUpperCase()}
            </p>
          </div>
        </div>

        {/* Expected Data Preview */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Données à vérifier :</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(expectedData).map(([key, value]) => value && (
              <Badge key={key} variant="outline" className="text-xs">
                {fieldLabels[key] || key}: {value}
              </Badge>
            ))}
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && progress && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{progress.statusText}</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Overall Result */}
            <div 
              className={`p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-700">Identité Validée</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-amber-700">Vérification Partielle</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Score: {Math.round(result.overallScore)}% • 
                Temps: {(result.processingTimeMs / 1000).toFixed(1)}s
              </p>
            </div>

            {/* Field Results */}
            <div className="space-y-2">
              {Object.entries(result.fields).map(([key, field]) => field && (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <div className="flex items-center gap-2">
                    {getFieldIcon(field.found)}
                    <span className="text-sm">{fieldLabels[key] || key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(field.similarity * 100)}%
                    </span>
                    {getFieldBadge(field.found)}
                  </div>
                </div>
              ))}
            </div>

            {/* Debug: Raw Text */}
            {showDebug && (
              <Collapsible open={showRawText} onOpenChange={setShowRawText}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span className="text-xs">Texte extrait (debug)</span>
                    {showRawText ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                    {result.rawText}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* Start Button */}
        {!isProcessing && !result && (
          <Button 
            onClick={runVerification} 
            className="w-full"
            disabled={Object.values(expectedData).filter(Boolean).length === 0}
          >
            <FileSearch className="h-4 w-4 mr-2" />
            Lancer la vérification OCR
          </Button>
        )}

        {/* Retry Button */}
        {result && !result.success && (
          <Button 
            variant="outline" 
            onClick={runVerification} 
            className="w-full"
            disabled={isProcessing}
          >
            <Loader2 className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Réessayer la vérification
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
