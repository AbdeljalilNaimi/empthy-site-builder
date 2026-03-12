import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const reportSchema = z.object({
  reason: z.string().min(1, 'Veuillez sélectionner une raison'),
  details: z.string().max(1000, 'Maximum 1000 caractères').optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const REPORT_REASONS = [
  { value: 'false_info', label: 'Informations fausses ou obsolètes' },
  { value: 'fake_profile', label: 'Faux profil / Arnaque' },
  { value: 'inappropriate', label: 'Comportement inapproprié' },
  { value: 'other', label: 'Autre' },
];

interface ReportProviderDialogProps {
  providerId: string;
  reporterId: string;
  tooltipLabel?: string;
}

export const ReportProviderDialog: React.FC<ReportProviderDialogProps> = ({
  providerId,
  reporterId,
  tooltipLabel = 'Signaler ce profil',
}) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: '', details: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ReportFormValues) => {
    const { error } = await supabase.from('provider_reports').insert({
      provider_id: providerId,
      reporter_id: reporterId,
      reason: values.reason,
      details: values.details || null,
    });

    if (error) {
      toast.error("Erreur lors de l'envoi du signalement");
      return;
    }

    toast.success("Signalement envoyé. Notre équipe d'administration va vérifier ce profil.");
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler ce profil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison du signalement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une raison" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REPORT_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Détails (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Veuillez préciser votre signalement..."
                      rows={4}
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Envoyer le signalement
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
