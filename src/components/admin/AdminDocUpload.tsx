import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const BUCKET = 'pdfs';
const FILE_NAME = 'official_documentation.pdf';

export function AdminDocUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [hasExisting, setHasExisting] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkExisting = useCallback(async () => {
    setChecking(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FILE_NAME}`, { method: 'HEAD' });
      setHasExisting(resp.ok);
    } catch {
      setHasExisting(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkExisting(); }, [checkExisting]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés.');
      return;
    }

    setState('uploading');
    try {
      const { error } = await supabase.storage.from(BUCKET).upload(FILE_NAME, file, { upsert: true });
      if (error) throw error;
      setState('success');
      setHasExisting(true);
      toast.success('Documentation officielle mise à jour avec succès.');
    } catch (err: any) {
      setState('error');
      toast.error(err?.message || 'Erreur lors de l\'upload.');
    }
  }, []);

  const handleDelete = async () => {
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([FILE_NAME]);
      if (error) throw error;
      setHasExisting(false);
      setState('idle');
      toast.success('Document supprimé.');
    } catch {
      toast.error('Impossible de supprimer le document.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: state === 'uploading',
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Mettre à jour la Documentation Officielle de l'IA
        </CardTitle>
        <CardDescription>
          Uploadez le PDF de documentation qui sera utilisé par l'assistant IA sur la page Documentation publique.
          Le fichier sera automatiquement écrasé à chaque nouvel upload.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checking ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Vérification du document existant…
          </div>
        ) : hasExisting && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">official_documentation.pdf</span>
              <span className="text-muted-foreground">— en ligne</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            state === 'uploading' && 'pointer-events-none opacity-60'
          )}
        >
          <input {...getInputProps()} />
          {state === 'uploading' ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Upload en cours…</p>
            </div>
          ) : state === 'error' ? (
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">Échec de l'upload. Réessayez.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? 'Déposez le PDF ici' : 'Glissez-déposez un PDF ou cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-muted-foreground/70">PDF uniquement • Le fichier précédent sera remplacé</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
