import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const ProviderPDFUpload = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user?.uid || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.size > 20 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('Le fichier dépasse 20 MB.');
      return;
    }

    setStatus('uploading');
    setFileName(file.name);
    setErrorMsg('');

    try {
      const { error } = await supabase.storage
        .from('pdfs')
        .upload(`${user.uid}.pdf`, file, {
          upsert: true,
          contentType: 'application/pdf',
        });

      if (error) throw error;
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Erreur lors de l\'upload.');
    }
  }, [user?.uid]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: status === 'uploading',
  });

  const handleRemove = async () => {
    if (!user?.uid) return;
    setStatus('uploading');
    try {
      await supabase.storage.from('pdfs').remove([`${user.uid}.pdf`]);
      setStatus('idle');
      setFileName(null);
    } catch {
      setStatus('error');
      setErrorMsg('Erreur lors de la suppression.');
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document IA (PDF)
        </CardTitle>
        <CardDescription>
          Uploadez un PDF pour que vos patients puissent poser des questions à l'assistant IA basé sur ce document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50',
            status === 'uploading' && 'pointer-events-none opacity-60'
          )}
        >
          <input {...getInputProps()} />
          {status === 'uploading' ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Upload en cours...</p>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium text-green-600">Document uploadé avec succès</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">{errorMsg}</p>
              <p className="text-xs text-muted-foreground">Cliquez ou glissez un nouveau fichier</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez un PDF ou cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-muted-foreground">PDF uniquement, max 20 MB</p>
            </div>
          )}
        </div>

        {status === 'success' && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleRemove} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer le document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderPDFUpload;
