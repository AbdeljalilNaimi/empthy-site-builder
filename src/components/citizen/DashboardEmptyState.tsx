import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const DashboardEmptyState = ({
  icon: Icon,
  title,
  hint,
  ctaLabel,
  ctaHref,
}: DashboardEmptyStateProps) => (
  <Card className="border-dashed border-2">
    <CardContent className="py-16 flex flex-col items-center text-center gap-3">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium">{title}</p>
      {hint && <p className="text-sm text-muted-foreground/70 max-w-xs">{hint}</p>}
      {ctaLabel && ctaHref && (
        <Button asChild variant="outline" className="mt-2">
          <Link to={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </CardContent>
  </Card>
);
