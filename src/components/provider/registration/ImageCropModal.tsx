import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, RotateCw, Check, X } from 'lucide-react';

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string, croppedFile: File) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropModal({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  circularCrop = true,
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const outputWidth = completedCrop.width * scaleX;
    const outputHeight = completedCrop.height * scaleY;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    // Move the crop origin to the canvas origin (0,0)
    const centerX = outputWidth / 2;
    const centerY = outputHeight / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
      image,
      cropX,
      cropY,
      outputWidth,
      outputHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    ctx.restore();

    // Convert to blob
    return new Promise<{ url: string; file: File }>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const file = new File([blob], 'cropped-logo.jpg', { type: 'image/jpeg' });
          resolve({ url, file });
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, rotate, scale]);

  const handleApply = async () => {
    const result = await getCroppedImg();
    if (result) {
      onCropComplete(result.url, result.file);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recadrer votre logo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          <div className="flex justify-center bg-muted/50 rounded-lg p-4 min-h-[300px]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
              className="max-h-[400px]"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
                className="max-h-[400px] w-auto"
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[scale]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={([value]) => setScale(value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{Math.round(scale * 100)}%</span>
            </div>

            <div className="flex items-center gap-4">
              <RotateCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[rotate]}
                min={0}
                max={360}
                step={1}
                onValueChange={([value]) => setRotate(value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{rotate}°</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleApply}>
            <Check className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}