import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SearchErrorProps {
  error: Error;
  onRetry: () => void;
}

export const SearchError = ({ error, onRetry }: SearchErrorProps) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Unable to load providers</h3>
          <p className="text-muted-foreground mb-4">
            We encountered an error while fetching healthcare providers. Please try again.
          </p>
          <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw size={16} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
