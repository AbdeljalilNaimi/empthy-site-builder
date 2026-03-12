import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/provider/registration/RichTextEditor';
import { RESEARCH_CATEGORIES, uploadArticlePdf } from '@/services/researchService';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ArticleEditorProps {
  initialData?: {
    title: string;
    abstract: string;
    content: string;
    category: string;
    tags: string[];
    doi: string;
    pdf_url: string;
  };
  onSubmit: (data: {
    title: string;
    abstract: string;
    content: string;
    category: string;
    tags: string[];
    doi: string;
    pdf_url: string;
  }) => Promise<void>;
  onCancel: () => void;
  providerId: string;
  isSubmitting: boolean;
}

export function ArticleEditor({ initialData, onSubmit, onCancel, providerId, isSubmitting }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdf_url || '');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handlePdfUpload = async (file: File) => {
    setUploadingPdf(true);
    try {
      const url = await uploadArticlePdf(file, providerId);
      setPdfUrl(url);
    } catch {
      // error handled by caller
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !abstract.trim() || !content.trim() || !category) return;
    await onSubmit({ title, abstract, content, category, tags, doi, pdf_url: pdfUrl });
  };

  const isValid = title.trim() && abstract.trim() && content.trim() && category;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Titre de la publication *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Étude comparative des traitements hypertensifs..."
          maxLength={200}
        />
        <span className="text-[11px] text-muted-foreground">{title.length}/200</span>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Catégorie *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {RESEARCH_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Abstract */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Résumé / Abstract *</Label>
        <Textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Résumé concis de votre publication..."
          rows={4}
          maxLength={1000}
        />
        <span className="text-[11px] text-muted-foreground">{abstract.length}/1000</span>
      </div>

      {/* Content (Rich Text) */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Contenu complet *</Label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Rédigez le contenu complet de votre publication..."
          maxLength={50000}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Mots-clés</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Ajouter un mot-clé..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={tags.length >= 8}>
            Ajouter
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* DOI */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">DOI (optionnel)</Label>
        <Input
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
          placeholder="10.1000/xyz123"
        />
      </div>

      {/* PDF Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Document PDF (optionnel)</Label>
        {pdfUrl ? (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
            <FileText className="h-5 w-5 text-red-600" />
            <span className="text-sm flex-1 truncate">PDF attaché</span>
            <Button variant="ghost" size="sm" onClick={() => setPdfUrl('')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
            {uploadingPdf ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {uploadingPdf ? 'Téléchargement...' : 'Cliquez pour joindre un PDF'}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfUpload(file);
              }}
            />
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? 'Mettre à jour' : 'Soumettre pour validation'}
        </Button>
      </div>
    </div>
  );
}
