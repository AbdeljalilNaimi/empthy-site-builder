import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save, Loader2, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_TEMPLATES = [
  'Veuillez apporter votre carnet de santé et résultats d\'analyses',
  'À jeun requis — ne pas manger 8h avant',
  'Rendez-vous confirmé, présentez-vous 10 minutes avant',
];

interface NoteTemplatesEditorProps {
  providerId: string;
  initialTemplates?: string[];
}

export function NoteTemplatesEditor({ providerId, initialTemplates }: NoteTemplatesEditorProps) {
  const [templates, setTemplates] = useState<string[]>(
    initialTemplates && initialTemplates.length > 0 ? initialTemplates : DEFAULT_TEMPLATES
  );
  const [newTemplate, setNewTemplate] = useState('');
  const [saving, setSaving] = useState(false);

  const addTemplate = () => {
    const trimmed = newTemplate.trim();
    if (!trimmed || templates.includes(trimmed)) return;
    setTemplates([...templates, trimmed]);
    setNewTemplate('');
  };

  const removeTemplate = (idx: number) => {
    setTemplates(templates.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'providers', providerId), {
        noteTemplates: templates,
      });
      toast.success('Modèles de réponse enregistrés');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          Modèles de réponse rapide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Ces modèles apparaîtront comme boutons lors de l'ajout de notes à un rendez-vous.
        </p>

        <div className="space-y-2">
          {templates.map((tpl, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm flex-1 truncate">{tpl}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeTemplate(idx)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newTemplate}
            onChange={(e) => setNewTemplate(e.target.value)}
            placeholder="Nouveau modèle..."
            className="text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addTemplate()}
          />
          <Button variant="outline" size="icon" onClick={addTemplate} disabled={!newTemplate.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}
