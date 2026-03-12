import { Card, CardContent } from "@/components/ui/card";

export const SkeletonCard = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-32 skeleton rounded"></div>
              <div className="h-4 w-16 skeleton rounded"></div>
            </div>
            <div className="h-4 w-24 skeleton rounded"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 skeleton rounded"></div>
            <div className="h-4 w-20 skeleton rounded"></div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-4 w-12 skeleton rounded"></div>
            <div className="h-4 w-16 skeleton rounded"></div>
            <div className="h-4 w-20 skeleton rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;