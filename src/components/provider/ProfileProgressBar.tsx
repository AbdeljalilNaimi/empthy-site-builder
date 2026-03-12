import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfileField {
  key: string;
  label: string;
  completed: boolean;
  required: boolean;
}

interface ProfileProgressBarProps {
  fields: ProfileField[];
  className?: string;
}

export function ProfileProgressBar({ fields, className }: ProfileProgressBarProps) {
  const requiredFields = fields.filter(f => f.required);
  const completedRequired = requiredFields.filter(f => f.completed).length;
  const completedOptional = fields.filter(f => !f.required && f.completed).length;
  const totalOptional = fields.filter(f => !f.required).length;
  
  const requiredProgress = requiredFields.length > 0 
    ? (completedRequired / requiredFields.length) * 100 
    : 100;
  
  const overallProgress = fields.length > 0 
    ? (fields.filter(f => f.completed).length / fields.length) * 100 
    : 0;

  const isComplete = requiredProgress === 100;

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Progression du profil</CardTitle>
          <span className={cn(
            "text-2xl font-bold",
            isComplete ? "text-green-500" : "text-primary"
          )}>
            {Math.round(overallProgress)}%
          </span>
        </div>
        <CardDescription>
          {isComplete 
            ? "✅ Votre profil est complet ! Vous pouvez demander la vérification."
            : "Complétez votre profil pour obtenir le badge vérifié"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={overallProgress} className="h-3" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Champs obligatoires ({completedRequired}/{requiredFields.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {requiredFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2 text-sm">
                {field.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                )}
                <span className={cn(
                  field.completed ? "text-muted-foreground line-through" : ""
                )}>
                  {field.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {totalOptional > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">
              Champs optionnels ({completedOptional}/{totalOptional})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {fields.filter(f => !f.required).map((field) => (
                <div key={field.key} className="flex items-center gap-2 text-sm">
                  {field.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn(
                    field.completed ? "text-muted-foreground" : ""
                  )}>
                    {field.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function calculateProfileCompletion(profile: {
  name?: string;
  type?: string;
  specialty?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  schedule?: string;
  photos?: string[];
  license?: string;
  languages?: string[];
  accessible?: boolean;
  emergency?: boolean;
}): ProfileField[] {
  return [
    { key: 'name', label: 'Nom', completed: !!profile.name, required: true },
    { key: 'type', label: 'Type', completed: !!profile.type, required: true },
    { key: 'email', label: 'Email', completed: !!profile.email, required: true },
    { key: 'phone', label: 'Téléphone', completed: !!profile.phone, required: true },
    { key: 'address', label: 'Adresse', completed: !!profile.address, required: true },
    { key: 'description', label: 'Description', completed: !!profile.description, required: true },
    { key: 'schedule', label: 'Horaires', completed: !!profile.schedule, required: true },
    { key: 'license', label: 'Licence', completed: !!profile.license, required: true },
    { key: 'specialty', label: 'Spécialité', completed: !!profile.specialty, required: false },
    { key: 'photos', label: 'Photos', completed: (profile.photos?.length || 0) > 0, required: false },
    { key: 'languages', label: 'Langues', completed: (profile.languages?.length || 0) > 0, required: false },
    { key: 'accessibility', label: 'Accessibilité', completed: profile.accessible !== undefined, required: false },
  ];
}
