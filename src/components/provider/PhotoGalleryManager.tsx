import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, Trash2, Star, Image as ImageIcon, GripVertical, 
  Loader2, ZoomIn, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { uploadGalleryImages, deleteProviderImage } from '@/services/providerImageService';

interface PhotoGalleryManagerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
  providerId?: string;
}

export function PhotoGalleryManager({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  className,
  providerId,
}: PhotoGalleryManagerProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      toast({
        title: "Limite atteinte",
        description: `Vous pouvez ajouter maximum ${maxPhotos} photos.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      let newPhotoUrls: string[];
      
      if (providerId) {
        // Upload to cloud storage
        newPhotoUrls = await uploadGalleryImages(providerId, acceptedFiles);
      } else {
        // Fallback to local blob URLs (e.g. during registration preview)
        newPhotoUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      }
      
      onPhotosChange([...photos, ...newPhotoUrls]);
      
      toast({
        title: "Photos ajoutées",
        description: `${acceptedFiles.length} photo(s) ajoutée(s) avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les photos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [photos, onPhotosChange, maxPhotos, toast, providerId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || photos.length >= maxPhotos,
  });

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];
    
    // Try to delete from cloud storage if it's a cloud URL
    if (providerId && photoUrl.includes('provider-images')) {
      try {
        await deleteProviderImage(photoUrl);
      } catch {
        // Non-blocking: continue removing from UI
      }
    }
    
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    toast({ title: "Photo supprimée" });
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    onPhotosChange(newPhotos);
    toast({ title: "Photo principale définie" });
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newPhotos = [...photos];
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    onPhotosChange(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const isEmbedded = className?.includes('border-0') || className?.includes('shadow-none');

  const galleryContent = (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          uploading && "opacity-50 cursor-not-allowed",
          photos.length >= maxPhotos && "opacity-50 cursor-not-allowed",
          !isDragActive && !uploading && photos.length < maxPhotos && "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Upload en cours...</p>
          </div>
        ) : photos.length >= maxPhotos ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">Galerie complète</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? "Déposez les images ici" : "Glissez-déposez ou cliquez"}
            </p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP • Max 5MB</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move",
                index === 0 && "ring-2 ring-primary ring-offset-2",
                draggedIndex === index && "opacity-50 scale-95"
              )}
            >
              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-auto max-h-[80vh] object-contain" />
                  </DialogContent>
                </Dialog>
                
                {index !== 0 && (
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setAsPrimary(index)}>
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                
                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => removePhoto(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {index === 0 && (
                <Badge className="absolute top-2 left-2 bg-primary">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Principale
                </Badge>
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune photo ajoutée</p>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return <div className={className}>{galleryContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Galerie photos
            </CardTitle>
            <CardDescription>
              Ajoutez jusqu'à {maxPhotos} photos
            </CardDescription>
          </div>
          <Badge variant="secondary">{photos.length}/{maxPhotos}</Badge>
        </div>
      </CardHeader>
      <CardContent>{galleryContent}</CardContent>
    </Card>
  );
}
